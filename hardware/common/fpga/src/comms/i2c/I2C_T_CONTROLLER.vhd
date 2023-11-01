-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		Inter IC BUS interface - transmission shift register 
-- Module Name:		I2C_T_CONTROLLER
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




--! @brief I2C shift-register structure / I2C transmitter
--! @details
--! The module acts as a shift-register that transmits the paralle data
--! on the "p_t_data" port after the module has been enabled. The module shifts 
--! data to the "p_i2c_sda_o" port after the "p_i2c_scl" signal has been driven 
--! low. The module hold for the ACK/NACK condition on the "p_i2c_sda_i" port 
--! after 8th data bit has been transmitted and flags either a valid or error 
--! transmission. To reset the module the enb signal must be driven low for a 
--! clock cycle.
--!
--! ***Latency: 1cyc***
entity I2C_T_CONTROLLER is
    port(
        --General
        clk         : in    std_logic;                      --! System clock
        rst         : in    std_logic;                      --! Asynchronous reset
        enb         : in    std_logic;                      --! Enable module
        --Control interface
        p_t_data    : in    std_logic_vector(7 downto 0);   --! Parallel data to be transmitted
        p_t_valid   : out   std_logic;                      --! Transmission valid (ACK)
        p_t_error   : out   std_logic;                      --! Trnasmission error (NACK)
        --I2C interface
        p_i2c_scl   : in    std_logic;                      --! I2C serial clock input
        p_i2c_sda_i : in    std_logic;                      --! I2C serial data input
        p_i2c_sda_o : out   std_logic                       --! I2C serial data output
    );
end entity I2C_T_CONTROLLER;




--! General architecture
architecture RTL of I2C_T_CONTROLLER is

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
    BIT_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            p_t_valid       <= '0';
            p_t_error       <= '0';
            i2c_cyc_counter <= (others => '0');
            
        elsif(rising_edge(clk)) then
            if(enb /= '1') then 
                p_t_valid       <= '0';
                p_t_error       <= '0';
                i2c_cyc_counter <= (others => '0');
            
            elsif(p_i2c_scl = '1' and i2c_scl_old = '0' and i2c_cyc_counter(3) = '0') then
                p_t_valid       <= '0';
                p_t_error       <= '0';
                i2c_cyc_counter <= i2c_cyc_counter + 1;
            
            elsif(p_i2c_scl = '1' and i2c_scl_old = '0' and i2c_cyc_counter(3) = '1') then
                --Detect ACK or NACK bit 
                if(p_i2c_sda_i = '0') then
                    p_t_valid <= '1';
                    p_t_error <= '0';
                else
                    p_t_error <= '0';
                    p_t_error <= '1';
                end if;

            else null;
            end if;
        end if;
    end process;


    DATA_SHIFTING : process(clk,rst)
    begin
        if(rst = '1') then
            p_i2c_sda_o <= '0';
        elsif(rising_edge(clk)) then
            if(enb /= '1') then
                p_i2c_sda_o <= '0';
            elsif(p_i2c_scl = '0' and i2c_cyc_counter(3) = '0') then
                p_i2c_sda_o <= p_t_data(7-to_integer(i2c_cyc_counter));
            elsif(p_i2c_scl = '0' and i2c_cyc_counter(3) = '1') then
                p_i2c_sda_o <= '1';
            else null;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;