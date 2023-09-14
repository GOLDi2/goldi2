-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		10/05/2023
-- Design Name:		Debounce module for input signals - "and" operation
-- Module Name:		LOW_DEBOUNCE
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
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief Debounce module for physical switches
--! @details
--! The module contains a shift register of length "g_stages" that samples the
--! input data at a rate of "g_clk_factor" if a logic high is presented on the
--! input port. The module shifts the stored data at a rate set by g_clk_factor 
--! and outputs a logic low if a '0' remains in the shift register. 
--! (equivalent to "and" operation)
entity LOW_DEBOUNCE is
    generic(
        g_stages        :   natural := 4;       --! Number of flip-flops in shift register
        g_clk_factor    :   natural := 12000    --! Shift rate
    );
    port(
        --General
        clk             : in    std_logic;      --! System clock
        rst             : in    std_logic;      --! Synchronous rest
        --Data
        p_io_raw        : in    std_logic;      --! Input data
        p_io_stable     : out   std_logic       --! Output data
    );
end entity LOW_DEBOUNCE;




--! General architecture
architecture BH of LOW_DEBOUNCE is

    --****INTERNAL SIGNALS****
    signal shift_reg    :   std_logic_vector(g_stages-1 downto 0);
    signal clk_counter  :   natural range 0 to g_clk_factor;


begin

    --****OUTPUT MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    p_io_stable <= '1' when(shift_reg = (shift_reg'range => '1')) else '0'; 
    -----------------------------------------------------------------------------------------------



    --****DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
        elsif(rising_edge(clk)) then
            if(shift_reg = (shift_reg'range => '0')) then
                clk_counter <= 0;
            elsif(clk_counter = g_clk_factor-1) then
                clk_counter <= 0;
            else
                clk_counter <= clk_counter + 1;
            end if;
        end if;
    end process;


    SHIFT_REG_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            shift_reg <= (others => '0');
        elsif(rising_edge(clk)) then
            --Shift data and append a '0' to clear register
            if(clk_counter = g_clk_factor-1) then
                shift_reg <= shift_reg(g_stages-2 downto 0) & '0';
            end if;
            
            shift_reg(0) <= p_io_raw;

        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;



