-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Electromagnet driver - H-Bridge L293DD Testbench
-- Module Name:		EMAGNET_DRIVER_AP1_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_DATA_TYPES.vhd
--					-> EMAGNET_DRIVER_AP1.vhd
--					-> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
use std.standard.all;
--! Use custom library
use work.GOLDI_DATA_TYPES.all;




--! Functionality Testbench
entity EMAGNET_DRIVER_AP1_TB is
end entity EMAGNET_DRIVER_AP1_TB;




--! Simulation architecture
architecture TB of EMAGNET_DRIVER_AP1_TB is

	--CUT
	component EMAGNET_DRIVER_AP1
		generic(
			ADDRESS		:	natural := 1
		);
		port(
			clk			: in	std_logic;
			rst			: in	std_logic;
			sys_bus_i	: in	bus_in;
			sys_bus_o	: out	bus_out;
			EM_enb		: out	io_o;
			EM_out_1	: out	io_o
		);
	end component;
	
	
	--Intermediate signals
	--Simulation timing
	constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic;
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	signal sys_bus_i		:	bus_in;
	signal sys_bus_o		:	bus_out;
	signal EM_enb			:	io_o;
	signal EM_out_1			:	io_o;

	
begin

	DUT : EMAGNET_DRIVER_AP1
	port map(
		clk			=> clock,
		rst			=> reset,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o,
		EM_enb		=> EM_enb,
		EM_out_1	=> EM_out_1
	);
	
	
	--Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 0 ns, '0' after 15 ns;
	
	
	TEST : process
		--Timing
		variable init_hold			:	time :=	5*clk_period/2;
		variable assert_hold		:	time := 3*clk_period/2;
		variable post_hold			:	time := clk_period/2;
	begin
		--Preset bus
		sys_bus_i.we  <= '0';
		sys_bus_i.adr <= (others => '0');
		sys_bus_i.dat <= (others => '0');
		--Wait for initial setup
		wait for init_hold;
		
		
		--Test reset
		assert(EM_enb.dat = '0')
			report "line(105): Test reset - expecting EM_enb.dat = '0'" severity error;
		assert(EM_out_1.dat = '0')
			report "line(107): Test reset - expecting EM_out_1.dat = '0'" severity error;
			
			
		wait for 5*clk_period;
		
		
		--Test enable off
		sys_bus_i.we  <= '1';
		sys_bus_i.adr <= std_logic_vector(to_unsigned(1,7));
		sys_bus_i.dat <= x"80";
		wait for assert_hold;
		assert(EM_enb.dat = '0')
			report "line(119): Test enable and magnet off - expecting EM_enb.dat = '0'" severity error;
		assert(EM_out_1.dat = '0')
			report "line(121): Test enable and magnet off - expecting EM_out_1.dat = '0'" severity error;
		wait for post_hold;
		
		
		wait for 5*clk_period;
		
		
		--Test enable on
		sys_bus_i.we  <= '1';
		sys_bus_i.adr <= std_logic_vector(to_unsigned(1,7));
		sys_bus_i.dat <= x"81";
		wait for assert_hold;
		assert(EM_enb.dat = '1')
			report "line(134): Test enable and magnet off - expecting EM_enb.dat = '1'" severity error;
		assert(EM_out_1.dat = '1')
			report "line(136): Test enable and magnet off - expecting EM_out_1.dat = '1'" severity error;
		wait for post_hold;
		
		
		
		--End simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	
	
end TB;