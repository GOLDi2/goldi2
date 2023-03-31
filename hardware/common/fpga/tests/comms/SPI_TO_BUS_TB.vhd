-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		SPI to BUS converter testbench
-- Module Name:		SPI_TO_BUS_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> SPI_TO_BUS.vhd
--					-> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom communication library
use work.GOLDI_COMM_STANDARD.all;
--! Use assert library for simulation
use std.standard.all;




--! Functionality si0mulation
entity SPI_TO_BUS_TB is
end entity SPI_TO_BUS_TB;




--! Simulation architecture
architecture TB of SPI_TO_BUS_TB is
	
	--CUT
	component SPI_TO_BUS
		port(
			clk				: in	std_logic;
			rst				: in	std_logic;
			ce				: in	std_logic;
			sclk			: in	std_logic;
			mosi			: in	std_logic;
			miso			: out	std_logic;
			master_bus_o	: out	mbus_out;
			master_bus_i	: in	mbus_in
		);
	end component;


	--Signlas
	--Simulation timing 
	constant clk_period		:	time := 10 ns;
	constant sclk_period	:	time := 40 ns;
	signal clock			:	std_logic := '0';
	signal reset			:	std_logic;
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	signal ce				:	std_logic;
	signal sclk				:	std_logic;
	signal mosi				:	std_logic;
	signal miso				:	std_logic;
	signal master_bus_o		:	mbus_out;
	signal master_bus_i		:	mbus_in;
	--Simulation data
	signal mosi_buff		:	std_logic_vector(7 downto 0);
	signal miso_buff		:	std_logic_vector(7 downto 0);
	
	
begin

	DUT : SPI_TO_BUS
	port map(
		clk				=> clock,
		rst				=> reset,
		ce				=> ce,
		sclk			=> sclk,
		mosi			=> mosi,
		miso			=> miso,
		master_bus_o	=> master_bus_o,
		master_bus_i	=> master_bus_i
	);
	
	
	--Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 0 ns, '0' after 15 ns;
	
	
	TEST : process
		--Timing
		variable init_hold		:	time := 5*clk_period/2; 
		variable assert_hold	:	time := clk_period/2;
		variable post_hold		:	time := 1*clk_period/2;
	begin
		--Initial setup
		ce <= '0';
		sclk <= '0';
		wait for init_hold;
		
		
		--Test communication - address byte
		ce <= '1';
		mosi_buff <= x"8F";
		master_bus_i.dat <= x"FF";
		for i in 0 to 7 loop
			wait for sclk_period/2;
			mosi <= mosi_buff(7-i);
			miso_buff(7-i) <= miso;
			sclk <= '1';
			wait for sclk_period/2;
			sclk <= '0';
		end loop;
		
		wait for assert_hold;
		assert(master_bus_o.we = '0')
			report "line(122): Test address byte - expecting master_bus_o.we = '0'" severity error;
		assert(master_bus_o.adr = "0001111")
			report "line(124): Test address byte - expecting master_bus_o.adr = x0F" severity error;
		assert(master_bus_o.dat = x"00")
			report "line(126): Test address byte - expecting master_bus_o.dat = x00" severity error;
		assert(miso_buff = x"00")
			report "line(128): Test address byte - expecting miso_buff = x00" severity error;
		wait for post_hold;

		
		--Test communication - first data byte
		mosi_buff <= x"F0";
		for i in 0 to 7 loop
			wait for sclk_period/2;
			mosi <= mosi_buff(7-i);
			miso_buff(7-i) <= miso;
			sclk <= '1';
			wait for sclk_period/2;
			sclk <= '0';
		end loop;
		
		wait for assert_hold;
		assert(master_bus_o.we = '1')
			report "line(145): Test first data byte - expecting master_bus_o.we = '1'" severity error;
		assert(master_bus_o.adr = "0001111")
			report "line(147): Test first data byte - expecting master_bus_o.adr = x0F" severity error;
		assert(master_bus_o.dat = x"F0")
			report "line(149): Test first data byte - expecting master_bus_o.dat = xF0" severity error;
		assert(miso_buff = x"FF")
			report "line(151): Test first data byte - expecting miso_buff = xFF" severity error;
		wait for post_hold;


		--Test communication - second data byte
		master_bus_i.dat <= x"00";
		mosi_buff <= x"0F";
		for i in 0 to 7 loop
			wait for sclk_period/2;
			mosi <= mosi_buff(7-i);
			miso_buff(7-i) <= miso;
			sclk <= '1';
			wait for sclk_period/2;
			sclk <= '0';
		end loop;
		
		wait for assert_hold;
		assert(master_bus_o.we = '1')
			report "line(169): Test second data byte - expecting master_bus_o.we = '1'" severity error;
		assert(master_bus_o.adr = "0010000")
			report "line(171): Test second data byte - expecting master_bus_o.adr = x10" severity error;
		assert(master_bus_o.dat = x"0F")
			report "line(173): Test second data byte - expecting master_bus_o.dat = x0F" severity error;
		assert(miso_buff = x"00")
			report "line(175): Test second data byte - expecting miso_buff = x00" severity error;
		wait for post_hold;
		
		
		--Test disabled
		ce <= '0';
		wait for 3*clk_period/2;
		assert(master_bus_o.we = '0')
			report "line(183): Test disabled - expecting master_bus_o.we = '0'" severity error;
		assert(master_bus_o.adr = "0000000")
			report "line(185): Test first data byte - expecting master_bus_o.adr = x00" severity error;
		assert(master_bus_o.dat = x"00")
			report "line(187): Test first data byte - expecting master_bus_o.dat = x00" severity error;
		wait for post_hold;
		
		--Finish simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	
	
end TB;