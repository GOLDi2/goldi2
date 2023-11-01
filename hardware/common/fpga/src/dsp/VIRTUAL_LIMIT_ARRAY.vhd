-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Simulated position limit sensors for incremental encoders 
-- Module Name:		VIRTUAL_LIMIT_ARRAY
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_DATA_TYPES.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: -  
--
-- Revision V4.00.00 - Modifications signal names and reset type
-- Additional Comments: Change from synchronous to asynchronous reset.
--                      Changes to the module's generic and port signals to
--                      follow V4.00.00 naming convention.
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Custom packages
library work;
use work.GOLDI_DATA_TYPES.all;




--! @brief Position detection processing unit for incremental encoders with margins
--! @details
--! The "virtual_limit_array" is data processing module that uses the signals 
--! produced by and incremental encoder to detect and flag the possition of an 
--! object. The module uses an internal accumulator to store the relative position
--! of the incremental encoder and compares it with a set of ranges provided through
--!  the generic paramter "g_sensor_limits". If the encoder finds itself inside that
--! range the possition flag is asserted at the "p_sensor_data" port corresponding 
--! with the range's index in the "sensor_limit_array" vector. Additionaly a border 
--! margin defined through the "g_border_margin" parameter is used to flag the 
--! approach of the encoder to the sensor limits. The "p_flag_neg" is asserted if the
--! possition is calculated to be smaller that the (min + g_border_margin) value. The
--! "p_flag_pos" is asserted if the possition is calculated to be larger that the 
--! (max - g_border_margin) value.
--!
--! The module responds to the rising and falling edges of the "p_channel_a"
--! port and uses the "p_channel_b" to deremine the movement direction. 
--! 
--! The "sensor_limit_array" is a custom structure defined in the GOLDI_DATA_TYPES
--! package that contains custom structures used for the GOLDi project. The ranges
--! are defined using two values [(center),(range)]. The (center) value 
--! indicates the mid point of the range (arithmetic average) the (range) value
--! indicates the inclussive distance from the center point in the positive and
--! negative directions.
--!
--! [(min) <---------------------   (center)    --------------------> (max)]
--!
--! [(center-range) <------------   (center)    -----------> (center+range)]
--!
--! [(min) ---> (min+border_margin)          (max-border_margin) <--- (max)]
--! 
--!
--! ***Latency: 2cyc***
entity VIRTUAL_LIMIT_ARRAY is
    generic(
        g_invert            :   boolean := false;                                   --! Select positive direction [false -> CCW | true -> CC]
        g_number_sensors    :   integer := 3;                                       --! Number of detection intervals
        g_border_margin     :   integer := 5;                                       --! Border margin width
        g_sensor_limits     :   sensor_limit_array := ((100,20),(200,20),(300,20))  --! Detection intervals (center, width)
    );
    port(
        --General
        clk                 : in    std_logic;                                      --! System clock
        rst                 : in    std_logic;                                      --! Asynchronous reset
        --Incremental encoder interface
        p_channel_a         : in    std_logic;                                      --! Encoder Channel_a input
        p_channel_b         : in    std_logic;                                      --! Encoder Channel_b input
        --Sensor outputs
        p_sensor_data       : out   std_logic_vector(g_number_sensors-1 downto 0);  --! Range detection flags
        p_flag_neg          : out   std_logic_vector(g_number_sensors-1 downto 0);  --! Negative border margin flags
        p_flag_pos          : out   std_logic_vector(g_number_sensors-1 downto 0)   --! Positive border margin flags
    );
end entity VIRTUAL_LIMIT_ARRAY;




--! General architecture
architecture RTL of VIRTUAL_LIMIT_ARRAY is

    --****INTERNAL SIGNLAS****
    --Data buffers
    signal enc_signal_a     :   std_logic_vector(1 downto 0);
    signal enc_signal_b     :   std_logic;
    --Counter
    signal enc_counter      :   integer;    


begin

    --****DECODER****
    -----------------------------------------------------------------------------------------------
    SIGNAL_DECODER : process(clk,rst)
    begin
        if(rst = '1') then
            enc_counter  <= 0;
            enc_signal_a <= (others => '0');
            enc_signal_b <= '0';

        elsif(rising_edge(clk)) then
            --Buffer signals to detect rising and falling edges
            enc_signal_a <= enc_signal_a(0) & p_channel_a;
            enc_signal_b <= p_channel_b;

            case enc_signal_a is
                when "01" =>
                    if(enc_signal_b = '1'    and g_invert = false) then
                        enc_counter <= enc_counter + 1;
                    elsif(enc_signal_b = '1' and g_invert = true)  then
                        enc_counter <= enc_counter - 1;
                    elsif(enc_signal_b = '0' and g_invert = false) then
                        enc_counter <= enc_counter - 1;
                    elsif(enc_signal_b = '0' and g_invert = true)  then
                        enc_counter <= enc_counter + 1;
                    else null;
                    end if;

                when "10" =>
                    if(enc_signal_b = '1'    and g_invert = false) then
                        enc_counter <= enc_counter - 1;
                    elsif(enc_signal_b = '1' and g_invert = true)  then
                        enc_counter <= enc_counter + 1;
                    elsif(enc_signal_b = '0' and g_invert = false) then
                        enc_counter <= enc_counter + 1;
                    elsif(enc_signal_b = '0' and g_invert = true)  then
                        enc_counter <= enc_counter - 1;
                    else null;
                    end if;

                when others => null;
            end case;
        
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****SENSORS****
    -----------------------------------------------------------------------------------------------
    SENSOR_ARRAY : for i in 0 to g_number_sensors-1 generate
        p_sensor_data(i) <= '1' when(enc_counter >= (g_sensor_limits(i)(1) - g_sensor_limits(i)(0))  and 
                                     enc_counter <= (g_sensor_limits(i)(1) + g_sensor_limits(i)(0))) else
                            '0';
        p_flag_neg(i)    <= '1' when(enc_counter < (g_sensor_limits(i)(1) - g_sensor_limits(i)(0) + g_border_margin)) else
                            '0';
        p_flag_pos(i)    <= '1' when(enc_counter > (g_sensor_limits(i)(1) + g_sensor_limits(i)(0) - g_border_margin)) else
                            '0';
    end generate; 
    -----------------------------------------------------------------------------------------------


end RTL;