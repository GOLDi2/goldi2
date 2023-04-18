-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		High-bay warehouse sensor array
-- Module Name:		SENSOR_ARRAY
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> REGISTER_TABLE.vhd
--                  -> VIRTUAL_SENSOR.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
-- 
-- Revision V2.00.00 - First release
-- Additional Comments:
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief
--! @details
--!
entity SENSOR_ARRAY is
    generic(
        ADDRESS         :   natural := 1;
        ENC_X_INVERT    :   boolean := false;
        ENC_Z_INVERT    :   boolean := false
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --BUS slave interface
        sys_bus_i       : in    sbus_in;
        sys_bus_o       : out   sbus_out;
        --Mechanical limit swiches
        lim_x_neg       : in    io_i;
        lim_x_pos       : in    io_i;
        lim_y_neg       : in    io_i;
        lim_y_pos       : in    io_i;
        lim_z_neg       : in    io_i;
        lim_z_pos       : in    io_i;
        --Encoder signals
        enc_x_a         : in    io_i;
        enc_x_b         : in    io_i;
        enc_z_a         : in    io_i;
        enc_z_b         : in    io_i
    );
end entity SENSOR_ARRAY;




--! General architecture
architecture RTL of SENSOR_ARRAY is

    --****INTERNAL SIGNALS****
    --Virtual sensor numbers
    constant vsens_x        :   natural := 5;
    constant vsens_z        :   natural := 5;
    --Virtual sensor limits
    type sensor_limit is array(1 downto 0) of natural;
    type sensor_limit_array is array(natural range <>) of sensor_limit;
    
    constant lim_x_sensors  :   sensor_limit_array(vsens_x-1 downto 0) :=
        (
            0 => (1,0),
            1 => (1,0),
            2 => (1,0),
            3 => (1,0),
            4 => (1,0)
        );
    constant lim_z_sensors  :   sensor_limit_array(vsens_z-1 downto 0) :=
        (
            0 => (1,0),
            1 => (1,0),
            2 => (1,0),
            3 => (1,0),
            4 => (1,0)
        );
    --Data buffers
    signal enc_x_a_buff     :   std_logic_vector(1 downto 0);
    signal enc_x_b_buff     :   std_logic;
    signal enc_z_a_buff     :   std_logic_vector(1 downto 0);
    signal enc_z_b_buff     :   std_logic;
    --Counters
    signal enc_x_counter    :   integer range 0 to 2**16 := 0;
    signal enc_z_counter    :   integer range 0 to 2**16 := 0;
    --Sensor signals
    signal sensors          :   std_logic_vector(20 downto 0);


begin

    --****X AXIS VIRTUAL SENSORS****
    -----------------------------------------------------------------------------------------------
    X_DECODER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                enc_x_counter <= 0;
            else
                --Buffer signals to detect rising and falling
                enc_x_a_buff <= enc_x_a_buff(0) & enc_x_a.dat;
                enc_x_b_buff <= enc_x_b.dat;

                case enc_x_a_buff is
                    when "01" =>
                        if(enc_x_b_buff = '1' and ENC_X_INVERT = false) then
                            enc_x_counter <= enc_x_counter + 1;
                        elsif(enc_x_b_buff = '1' and ENC_X_INVERT = true) then
                            enc_x_counter <= enc_x_counter - 1;
                        elsif(enc_x_b_buff = '0' and ENC_X_INVERT = false) then
                            enc_x_counter <= enc_x_counter - 1;
                        elsif(enc_x_b_buff = '0' and ENC_X_INVERT = true) then
                            enc_x_counter <= enc_x_counter + 1;
                        else null; 
                        end if;
                    
                    when "10" =>
                        if(enc_x_b_buff = '1' and ENC_X_INVERT = false) then
                            enc_x_counter <= enc_x_counter - 1;
                        elsif(enc_x_b_buff = '1' and ENC_X_INVERT = true) then
                            enc_x_counter <= enc_x_counter + 1;
                        elsif(enc_x_b_buff = '0' and ENC_X_INVERT = false) then
                            enc_x_counter <= enc_x_counter + 1;
                        elsif(enc_x_b_buff = '0' and ENC_X_INVERT = true) then
                            enc_x_counter <= enc_x_counter - 1;
                        else null;
                        end if;
                    
                    when others => null;
                end case;

            end if;
        end if;
    end process;




    -----------------------------------------------------------------------------------------------


end RTL;