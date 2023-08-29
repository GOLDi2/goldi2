-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Parallel data to BUS standard testbench
-- Module Name:		BUS_CONVERTER_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> BUS_CONVERTER.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit [Test for 8x8 bus structure]
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
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

	--****DUT****
	component BUS_CONVERTER
		port(
			clk				: in	std_logic;
			rst				: in	std_logic;
			ce				: in	std_logic;
			word_valid		: in	std_logic;
			config_word		: in	std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
			data_word_in	: in	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
			data_word_out	: out	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
			master_bus_o	: out	mbus_out;
			master_bus_i	: in	mbus_in
		);
	end component;
	
	
	--****INTERNAL SIGNALS****
	--Simulation timing
	constant clk_period		:	time := 10 ns;
	signal clock			:	std_logic := '0';
	signal reset			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
	signal ce				:	std_logic;
	signal word_valid		:	std_logic;
	signal config_word		:	std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
	signal data_word_in		:	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
	signal data_word_out	:	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
	signal master_bus_o		:	mbus_out;
	signal master_bus_i		:	mbus_in;
	
	
begin

	--****COMPONENTS****
	-----------------------------------------------------------------------------------------------
	DUT : BUS_CONVERTER
	port map(
		clk				=> clock,
		rst				=> reset,
		ce				=> ce,
		word_valid		=> word_valid,
		config_word		=> config_word,
		data_word_in	=> data_word_in,
		data_word_out	=> data_word_out,
		master_bus_o	=> master_bus_o,
		master_bus_i	=> master_bus_i
	);
	-----------------------------------------------------------------------------------------------
	
	

	--****SIMULATION TIMING****
	-----------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 5 ns, '0' after 15 ns;
	-----------------------------------------------------------------------------------------------



	--****TEST****
	-----------------------------------------------------------------------------------------------
	TEST : process
		--Timing
		variable init_hold		:	time := 5*clk_period/2; 
		variable assert_hold	:	time := 3*clk_period/2;
		variable post_hold		:	time := clk_period/2;
	
	begin
		--Preset signals
		ce 			 <= '0';
		word_valid   <= '0';
		config_word  <= (others => '0');
		data_word_in <= (others => '0');
		master_bus_i <= gnd_mbus_i;
		--Wait for initial setup
		wait for init_hold;
		
		
		--**Test reset conditions**
		wait for assert_hold;
		assert(master_bus_o.we  = '0')
			report "ID01: Test reset - expecting master_bus_o.we = '0'" 
			severity error;
		assert(master_bus_o.adr = std_logic_vector(to_unsigned(0,BUS_ADDRESS_WIDTH)))
			report "ID02: Test reset - expecting master_bus_o.adr = x00" 
			severity error;
		assert(master_bus_o.dat = std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH)))
			report "ID03: Test reset - expecting master_bus_o.dat = x00" 
			severity error;
		wait for post_hold;
		
		
		--**Test simple transaction**
		--Configuration word
		ce <= '1';
		wait for 2*clk_period;
		config_word <= "1" & std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH));
		word_valid 	<= '1';
		wait for clk_period;
		config_word <= std_logic_vector(to_unsigned(0,BUS_ADDRESS_WIDTH+1));
		word_valid  <= '0';
		
		wait for clk_period/2;
		assert(master_bus_o.we = '0')
			report "ID04: Test simple transaction - expecting master_bus_o.we = '0'" 
			severity error;
		assert(master_bus_o.adr = std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH)))
			report "ID05: Test simple transaction - expecting master_bus_o.adr = x70" 
			severity error;
		assert(master_bus_o.dat = std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH)))
			report "ID06: Test simple transaction - expecting master_bus_o.dat = x00" 
			severity error;
		wait for clk_period/2;
		
		data_word_in <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
		word_valid 	 <= '1';
		wait for clk_period;
		data_word_in <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
		word_valid 	 <= '0';
		
		wait for clk_period/2;
		assert(master_bus_o.we = '1')
			report "ID07: Test simple transaction - expecting master_bus_o.we = '1'" 
			severity error;
		assert(master_bus_o.adr = std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH)))
			report "ID08: Test simple transaction - expecting master_bus_o.adr = x70" 
			severity error;
		assert(master_bus_o.dat = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
			report "ID09: Test simple transaction - expecting master_bus_o.dat = x0F" 
			severity error;
		wait for clk_period/2;
		
		
		wait for 5*clk_period;
		
		
		--**Test multi-transaction**
		data_word_in <= std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH));
		word_valid 	 <= '1';
		wait for clk_period;
		data_word_in <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
		word_valid 	 <= '0';
		
		wait for clk_period/2;
		assert(master_bus_o.we = '1')
			report "ID10: Test multi transaction - expecting master_bus_o.we = '1'" 
			severity error;
		assert(master_bus_o.adr = std_logic_vector(to_unsigned(239,BUS_ADDRESS_WIDTH)))
			report "ID11: Test multi transaction - expecting master_bus_o.adr = x6F" 
			severity error;
		assert(master_bus_o.dat = std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)))
			report "ID12: Test simple transaction - expecting master_bus_o.dat = xF0" 
			severity error;
		wait for clk_period/2;
		ce <= '0';
		
		
		--End simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	-----------------------------------------------------------------------------------------------
	
end TB;