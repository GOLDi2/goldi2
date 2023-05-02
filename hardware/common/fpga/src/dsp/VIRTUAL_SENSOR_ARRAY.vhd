-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Simulated position sensor for incremental encoders 
-- Module Name:		VIRTUAL_SENSOR_ARRAY
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
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_DATA_TYPES.all;




--! @brief
--! @details
--!
--! **Latency: 2cyc**
entity VIRTUAL_SENSOR_ARRAY is
    generic(
        INVERT          :   boolean := false;
        NUMBER_SENSORS  :   natural := 3;
        SENSOR_LIMITS   :   sensor_limit_array := ((0,0),(0,0),(0,0))
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --Incremental encoder interface
        enc_channel_a   : in    std_logic;
        enc_channel_b   : in    std_logic;
        --Sensor outputs
        sensor_data_out : out   std_logic_vector(NUMBER_SENSORS-1 downto 0)
    );
end entity VIRTUAL_SENSOR_ARRAY;




--! General architecture
architecture RTL of VIRTUAL_SENSOR_ARRAY is

    --****INTERNAL SIGNLAS****
    --Data buffers
    signal sensor_data_buff :   std_logic_vector(NUMBER_SENSORS-1 downto 0);
    signal enc_signal_a     :   std_logic_vector(1 downto 0);
    signal enc_signal_b     :   std_logic;
    --Counter
    signal enc_counter      :   integer;    


begin

    --****DECODER****
    -----------------------------------------------------------------------------------------------
    SIGNAL_DECODER : process(clk)
    begin
        if(rising_edge(clk)) then
            --Reset encoder
            if(rst = '1') then
                enc_counter <= 0;
            else
                --Buffer signals to detect rising and falling edges
                enc_signal_a <= enc_signal_a(0) & enc_channel_a;
                enc_signal_b <= enc_channel_b;

                case enc_signal_a is
                    when "01" =>
                        if(enc_signal_b = '1'    and INVERT = false) then
                            enc_counter <= enc_counter + 1;
                        elsif(enc_signal_b = '1' and INVERT = true)  then
                            enc_counter <= enc_counter - 1;
                        elsif(enc_signal_b = '0' and INVERT = false) then
                            enc_counter <= enc_counter - 1;
                        elsif(enc_signal_b = '0' and INVERT = true)  then
                            enc_counter <= enc_counter + 1;
                        else null;
                        end if;

                    when "10" =>
                        if(enc_signal_b = '1'    and INVERT = false) then
                            enc_counter <= enc_counter - 1;
                        elsif(enc_signal_b = '1' and INVERT = true)  then
                            enc_counter <= enc_counter + 1;
                        elsif(enc_signal_b = '0' and INVERT = false) then
                            enc_counter <= enc_counter + 1;
                        elsif(enc_signal_b = '0' and INVERT = true)  then
                            enc_counter <= enc_counter - 1;
                        else null;
                        end if;

                    when others => null;
                end case;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****SENSORS****
    -----------------------------------------------------------------------------------------------
    SENSOR_ARRAY : for i in NUMBER_SENSORS-1 downto 0 generate
        sensor_data_buff(i) <=  '1' when(enc_counter >= SENSOR_LIMITS(i)(0) and 
                                         enc_counter <= SENSOR_LIMITS(i)(1)) else
                                '0';
    end generate; 
    sensor_data_out <= sensor_data_buff;
    -----------------------------------------------------------------------------------------------


end RTL;