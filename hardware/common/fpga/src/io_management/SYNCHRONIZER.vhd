-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Double FF syncronization chain
-- Module Name:		SYNCHRONIZER
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;



--! @brief Multiple flip flop chain to avoid metastability
--! @details
--! Module takes an asynchronous input and uses a 
--! chain of multiple flip flops to avoid metastability
--! in case of violation of setup or hold time constrains.
--! The module outputs a synchronous (clk) signal
entity SYNCHRONIZER is
	generic (
		STAGES 	: natural := 2			--! Chain length
	);
	port (
		clk		: in	std_logic;		--! System clock
		rst		: in	std_logic;		--! Synchronous reset
		io_i	: in	std_logic;		--! Asynchonous input signal
		io_sync	: out 	std_logic		--! Synchronous output signal
	);
end entity SYNCHRONIZER;




--! General architecture 
architecture RTL of SYNCHRONIZER is
	--Intermediate Signals
	signal sync_reg	: std_logic_vector(STAGES-1 downto 0);

begin	
	
	SYNCHRONIZATION : process(clk, rst) is
	begin
		if(rst = '1') then
			sync_reg <= (others => '0');
		
		elsif(rising_edge(clk)) then
			sync_reg <= sync_reg(STAGES-2 downto 0) & io_i;
		
		end if;
	end process;
	
	io_sync <= sync_reg(STAGES-1);
	
end RTL;