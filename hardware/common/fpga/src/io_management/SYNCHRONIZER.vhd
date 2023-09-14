-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Double FF syncronization chain
-- Module Name:		SYNCHRONIZER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
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



--! @brief Multiple flip flop chain to avoid metastability issues
--! @details
--! Module takes an asynchronous input and uses a chain of multiple flip flops
--! to avoid metastability in case of violation of setup or hold time constrains.
--! The module outputs a signal synchronized with the system clock
entity SYNCHRONIZER is
	generic (
		g_stages	: natural := 2			--! Chain length
	);
	port (
		clk			: in	std_logic;		--! System clock
		rst			: in	std_logic;		--! Synchronous reset
		p_io_i		: in	std_logic;		--! Asynchonous input signal
		p_io_sync	: out 	std_logic		--! Synchronous output signal
	);
end entity SYNCHRONIZER;




--! General architecture 
architecture RTL of SYNCHRONIZER is
	--****INTERNAL SIGNALS****
	signal sync_reg	: std_logic_vector(g_stages-1 downto 0);

begin	
	
	SYNCHRONIZATION : process(clk, rst) is
	begin
		if(rst = '1') then
			sync_reg <= (others => '0');
		
		elsif(rising_edge(clk)) then
			sync_reg <= sync_reg(g_stages-2 downto 0) & p_io_i;
		
		end if;
	end process;
	
	p_io_sync <= sync_reg(g_stages-1);
	
end RTL;