-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		10/05/2023
-- Design Name:		Debounce module for input signals - "or" operation
-- Module Name:		HIGH_DEBOUNCE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: Release for Warehouse_V2
--
-- Revision V4.00.00 - Module renaming and change to reset and sampling
-- Additional Comments: Renaming of module to follow V4.00.00 conventions.
--                      (IO_DEBOUNCE.vhd -> HIGH_DEBOUNCE.vhd)
--						Change from synchronous to asynchronous reset.
--                      Modification to the sampling process.
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief Debounce module for physical switches
--! @details
--! The module contains a shift register of length "g_stages" that samples the
--! input data at a rate of "g_clk_factor" if a logic high is presented on the
--! input port. The module shifts the stored data at a rate set by g_clk_factor 
--! and outputs a logic high if a '1' remains in the shift register. 
--! (equivalent to "or" operation)
entity HIGH_DEBOUNCE is
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
end entity HIGH_DEBOUNCE;




--! General architecture
architecture BH of HIGH_DEBOUNCE is

    --****INTERNAL SIGNALS****
    signal shift_reg    :   std_logic_vector(g_stages-1 downto 0);
    signal clk_counter  :   natural range 0 to g_clk_factor;


begin

    --****OUTPUT MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    p_io_stable <= '0' when(shift_reg = (shift_reg'range => '0')) else '1'; 
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
            --wirte a '1' at the end of the shift register if a '1' is presented
            if(p_io_raw = '1') then
                shift_reg(0) <= '1';
            end if;

        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;