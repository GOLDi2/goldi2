-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		10/05/2023
-- Design Name:		Debounce module for input signals 
-- Module Name:		IO_DEBOUNCE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_IO_STANDARD.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: Release for Warehouse_V2
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_IO_STANDARD.all;




--! @brief Debounce module for physical switches
--! @details
--! Module contains a shift register of length STAGES that samples that 
--! registers logic high values presented in the input port. The module 
--! shifts the data a rate set by CLK_FACTOR and outputs a logic high if
--! a '1' remains in the shift chain. ("or" operation)
entity IO_DEBOUNCE is
    generic(
        STAGES      :   natural := 4;       --! Number of flip-flops in shift register
        CLK_FACTOR  :   natural := 12000    --! Shift rate
    );
    port(
        --General
        clk         : in    std_logic;      --! System clock
        rst         : in    std_logic;      --! Synchronous rest
        --Data
        io_raw      : in    std_logic;      --! Input data
        io_stable   : out   std_logic       --! Output data
    );
end entity;




--! General architecture
architecture RTL of IO_DEBOUNCE is

    --****INTERNAL SIGNALS****
    --Buffers
    signal data_chain   :   std_logic_vector(STAGES-1 downto 0);
    --Counter
    signal clk_counter  :   natural range 0 to CLK_FACTOR;


begin

    --****OUTPUT MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    io_stable <= '0' when((data_chain'range => '0') = data_chain) else '1'; 
    -----------------------------------------------------------------------------------------------



    --****DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    COUNTER : process(clk,rst)
    begin
        if(rising_edge(clk)) then
            if(rst = '1' or io_raw = '1') then
                clk_counter <= 0;
            elsif(clk_counter = CLK_FACTOR-1) then
                clk_counter <= 0;
            else
                clk_counter <= clk_counter + 1;
            end if;
        end if;
    end process;


    CHAIN_MANAGEMENT : process(clk,rst)
    begin
        if(rst = '1') then
            data_chain <= (others => '0');
        elsif(rising_edge(clk)) then
            if(io_raw = '1') then
                data_chain(0) <= '1';
            end if;
            
            if(clk_counter = CLK_FACTOR-1) then
                data_chain <= data_chain(STAGES-2 downto 0) & '0';
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end RTL;