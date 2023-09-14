-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Double FF syncronization chain array
-- Module Name:		SYNCHRONIZER_ARRAY
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> SYNCHRONIZER.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V4.00.00 - Modification to the entity signal names
-- Additional Comments: Changes to the generic and port signal names
--						to follow with the naming convention implemented
--						in V4.00.00.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;



--! @brief Multiple flip flop chain to avoid metastability
--! @details
--! Module takes an asynchronous input and uses a chain of multiple flip flops
--! to avoid metastability issues in case of violation of setup or hold time 
--! constrains. The module outputs a signal synchronized with the system clock.
entity SYNCHRONIZER_ARRAY is
	generic(
		g_array_width	:	natural := 10;									--! Signal bitsize
		g_stages		:	natural := 2									--! Chain length
	);
	port(
		clk				: in	std_logic;									--! System clock
		rst				: in	std_logic;									--! Synchronous reset
		p_io_i			: in	std_logic_vector(g_array_width-1 downto 0);	--! Asynchronous input signal
		p_io_sync		: out	std_logic_vector(g_array_width-1 downto 0)	--! Synchronous output signal
	);
end entity SYNCHRONIZER_ARRAY;




--! General architecture
architecture RTL of SYNCHRONIZER_ARRAY is
begin
	
	SYNC_ARRAY	:	for i in 0 to g_array_width-1 generate
		SYNC_CHAIN : entity work.SYNCHRONIZER
		generic map(
			g_stages	=> g_stages
		)
		port map(
			clk			=> clk,
			rst			=> rst,
			p_io_i		=> p_io_i(i),
			p_io_sync	=> p_io_sync(i)
		);
	end generate;
	
end architecture;