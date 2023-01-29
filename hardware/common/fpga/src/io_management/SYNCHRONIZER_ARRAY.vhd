-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Double FF syncronization chain array
-- Module Name:		SYNCHRONIZER_ARRAY
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> SYNCHRONIZER.vhd
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
entity SYNCHRONIZER_ARRAY is
	generic(
		ARRAY_WIDTH	:	natural := 10;								--! Signal bitsize
		STAGES		:	natural := 2								--! Chain length
	);
	port(
		clk		: in	std_logic;									--! System clock
		rst		: in	std_logic;									--! Synchronous reset
		io_i	: in	std_logic_vector(ARRAY_WIDTH-1 downto 0);	--! Asynchronous input signal
		io_sync	: out	std_logic_vector(ARRAY_WIDTH-1 downto 0)	--! Synchronous output signal
	);
end entity SYNCHRONIZER_ARRAY;




--! General architecture
architecture RTL of SYNCHRONIZER_ARRAY is
	--Component
	component SYNCHRONIZER 
		generic (
			STAGES 	: natural 		
		);
		port (
			clk		: in	std_logic;
			rst		: in	std_logic;
			io_i		: in	std_logic;
			io_sync	: out std_logic
		);
	end component;
	
begin
	
	SYNC_ARRAY	:	for i in 0 to ARRAY_WIDTH-1 generate
		SYNC_CHAIN : SYNCHRONIZER
		generic map(
			STAGES	=> STAGES
		)
		port map(
			clk		=> clk,
			rst		=> rst,
			io_i		=> io_i(i),
			io_sync	=> io_sync(i)
		);
	end generate;
	
end architecture;