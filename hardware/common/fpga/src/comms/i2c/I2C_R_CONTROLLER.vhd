-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		Inter IC BUS interface - reciver shift register 
-- Module Name:		I2C_R_CONTROLLER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief I2C shift register structure / I2C reciever
--! @detials
--! The module acts as a shift-register that registers the incomming data
--! on the "p_i2c_sda_i" port after a rising edge on the "p_i2c_scl" signal
--! has been detected. The module generates the ACK condition after the 
--! 8th data bit has been recived.
--! To reset the module the enb signal must be driven low for a clock cycle.
--!
--! ***Latency: 1cyc***
entity I2C_R_CONTROLLER is
    port(
        --General
        clk         : in    std_logic;                      --! System clock
        rst         : in    std_logic;                      --! Asynchronous reset
        enb         : in    std_logic;                      --! Enable module 
        --Control interface
        p_t_data    : out   std_logic_vector(7 downto 0);   --! Shift register data
        p_t_valid   : out   std_logic;                      --! Shift register data valid
        --I2C interface
        p_i2c_scl   : in    std_logic;                      --! I2C serial clock input
        p_i2c_sda_i : in    std_logic;                      --! I2C serial data input
        p_i2c_sda_o : out   std_logic                       --! I2C serial data output
    );
end entity I2C_R_CONTROLLER;




--! General architecture
architecture RTL of I2C_R_CONTROLLER is

    --****INTERNAL SIGNALS****
    --Buffers
    signal i2c_scl_old      :   std_logic;
    --Counters
    signal i2c_cyc_counter  :   unsigned(3 downto 0);

begin

    --****CLOCK REGISTER***
    -----------------------------------------------------------------------------------------------
    CLK_REG : process(clk,rst)
    begin
        if(rst = '1') then
            i2c_scl_old <= '0';
        elsif(rising_edge(clk)) then
            i2c_scl_old <= p_i2c_scl;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****DATA CONTROL****
    -----------------------------------------------------------------------------------------------
    DATA_SHIFTING : process(clk,rst)
    begin
        if(rst = '1') then
            p_t_data        <= (others => '0');
            p_t_valid       <= '0';
            i2c_cyc_counter <= (others => '0');

        elsif(rising_edge(clk)) then
            if(enb /= '1') then
                p_t_data        <= (others => '0');
                p_t_valid       <= '0';
                i2c_cyc_counter <= (others => '0');

            elsif(p_i2c_scl = '1' and i2c_scl_old = '0' and i2c_cyc_counter(3) = '0') then
                p_t_data(7-to_integer(i2c_cyc_counter)) <= p_i2c_sda_i;
                p_t_valid       <= '0';
                i2c_cyc_counter <= i2c_cyc_counter + 1;

            elsif(p_i2c_scl = '1' and i2c_scl_old = '0' and i2c_cyc_counter(3) = '1') then
                p_t_valid <= '1';
            
            else null;
            end if;
        end if;
    end process;


    OUTPUT_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            p_i2c_sda_o <= '1';
        elsif(rising_edge(clk)) then
            if(i2c_cyc_counter(3) = '0') then
                p_i2c_sda_o <= '1';
            elsif(i2c_cyc_counter(3) = '1' and p_i2c_scl = '0') then
                p_i2c_sda_o <= '0';
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;