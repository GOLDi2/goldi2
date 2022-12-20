-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Parallel data to BUS standard testbench
-- Module Name:		BUS_CONVERTER_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_BUS_STANDARD.vhd
--					-> BUS_CONVERTER.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit [Test for 8x8 bus structure]
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
use std.standard.all;
--! Use custom communication library
use work.GOLDI_COMM_STANDARD.all;




--! Functionality testbench
entity BUS_CONVERTER_TB is
end entity BUS_CONVERTER_TB;




--! Simulation architecture
architecture TB of BUS_CONVERTER_TB is

	--Component
	component BUS_CONVERTER
		port(
			clk				: in	std_logic;
			rst				: in	std_logic;
			ce				: in	std_logic;
			word_valid		: in	std_logic;
			config_word		: in	std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
			data_word_in	: in	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
			data_word_out	: out	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
			sys_bus_i		: out	bus_in;
			sys_bus_o		: in	bus_out
		);
	end component;
	
	
	--Signals
	--Simulation timing
	constant clk_period		:	time := 10 ns;
	signal clock			:	std_logic := '0';
	signal reset			:	std_logic;
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	signal ce				:	std_logic;
	signal word_valid		:	std_logic;
	signal config_word		:	std_logic_vector(7 downto 0);
	signal data_word_in		:	std_logic_vector(7 downto 0);
	signal data_word_out	:	std_logic_vector(7 downto 0);
	signal sys_bus_i		:	bus_in;
	signal sys_bus_o		:	bus_out;
	
	
begin

	DUT : BUS_CONVERTER
	port map(
		clk				=> clock,
		rst				=> reset,
		ce				=> ce,
		word_valid		=> word_valid,
		config_word		=> config_word,
		data_word_in	=> data_word_in,
		data_word_out	=> data_word_out,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o
	);
	
	
	--Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 0 ns, '0' after 15 ns;
	
	
	TEST : process
		--Timing
		variable init_hold		:	time := 5*clk_period/2; 
		--variable assert_hold	:	time := 3*clk_period/2;
		--variable post_hold		:	time := 1*clk_period/2;
	
	begin
		sys_bus_o.dat <= (others => '0');
		--Wait for initial setup
		wait for init_hold;
		
		
		--Test reset conditions
		assert(sys_bus_i.we  = '0')
			report "line(112): Test reset - expecting sys_bus_i.we = '0'" severity error;
		assert(sys_bus_i.adr = std_logic_vector(to_unsigned(0,7)))
			report "line(114): Test reset - expecting sys_bus_i.adr = x00" severity error;
		assert(sys_bus_i.dat = x"00")
			report "line(116): Test reset - expecting sys_bus_i.dat = x00" severity error;
		
		
		wait for 5*clk_period;
		
		
		--Test simple transaction
		--Configuration word
		ce <= '1';
		wait for 2*clk_period;
		config_word <= x"FF";
		word_valid 	<= '1';
		wait for clk_period;
		config_word <= x"00";
		word_valid  <= '0';
		
		wait for clk_period/2;
		assert(sys_bus_i.we = '0')
			report "line(133): Test simple transaction - expecting sys_bus_i.we = '0'" severity error;
		assert(sys_bus_i.adr = "1111111")
			report "line(135): Test simple transaction - expecting sys_bus_i.adr = x7F" severity error;
		assert(sys_bus_i.dat = x"00")
			report "line(137): Test simple transaction - expecting sys_bus_i.dat = x00" severity error;
		wait for clk_period/2;
		
		data_word_in <= x"0F";
		word_valid 	 <= '1';
		wait for clk_period;
		data_word_in <= x"00";
		word_valid 	 <= '0';
		
		wait for clk_period/2;
		assert(sys_bus_i.we = '1')
			report "line(149): Test simple transaction - expecting sys_bus_i.we = '1'" severity error;
		assert(sys_bus_i.adr = "1111111")
			report "line(151): Test simple transaction - expecting sys_bus_i.adr = x7F" severity error;
		assert(sys_bus_i.dat = x"0F")
			report "line(153): Test simple transaction - expecting sys_bus_i.dat = x0F" severity error;
		wait for clk_period/2;
		
		
		wait for 5*clk_period;
		
		
		--Test multi-transaction
		data_word_in <= x"F0";
		word_valid 	 <= '1';
		wait for clk_period;
		data_word_in <= x"00";
		word_valid 	 <= '0';
		
		wait for clk_period/2;
		assert(sys_bus_i.we = '1')
			report "line(169): Test simple transaction - expecting sys_bus_i.we = '1'" severity error;
		assert(sys_bus_i.adr = "0000000")
			report "line(171): Test simple transaction - expecting sys_bus_i.adr = x00" severity error;
		assert(sys_bus_i.dat = x"F0")
			report "line(173): Test simple transaction - expecting sys_bus_i.dat = xF0" severity error;
		wait for clk_period/2;
		ce <= '0';
		
		
		--Finish simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	
	
end TB;