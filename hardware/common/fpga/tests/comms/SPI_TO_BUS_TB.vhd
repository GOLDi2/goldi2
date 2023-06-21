-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
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
--
-- Revision V3.00.01 - Extension of testbench
-- Additional Comments: Modificatio of testbench to adapt to multipele
--						vector sizes.
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
	
	--****DUT****
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


	--****INTERNAL SIGNALS****
	--Simulation timing 
	constant clk_period		:	time := 10 ns;
	constant sclk_period	:	time := 40 ns;
	signal clock			:	std_logic := '0';
	signal reset			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	signal ce				:	std_logic;
	signal sclk				:	std_logic;
	signal mosi				:	std_logic;
	signal miso				:	std_logic;
	signal master_bus_o		:	mbus_out;
	signal master_bus_i		:	mbus_in;
	--Simulation data
	signal mosi_buff_conf	:	std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
	signal mosi_buff_dat	:	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
	signal miso_buff		:	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
	
	
begin

	--****COMPONENT****
	-----------------------------------------------------------------------------------------------
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
		variable assert_hold	:	time := clk_period/2;
		variable post_hold		:	time := clk_period/2;
	begin
		--Initial setup
		ce			 	<= '0';
		sclk 		 	<= '0';
		mosi 			<= '0';
		master_bus_i 	<= gnd_mbus_i;
		mosi_buff_conf 	<= (others => '0');
		mosi_buff_dat   <= (others => '0');
		miso_buff		<= (others => '0'); 
		wait for init_hold;
		
		
		--**Test idle state**
		wait for assert_hold;
		assert(miso = '0')
			report "ID01: Test reset - expecting miso = '0'" severity error;
		assert(master_bus_o = gnd_mbus_o)
			report "ID02: Test reset - expecting master_bus_o = ('0',x00,x00)" severity error;
		wait for post_hold;


		--**Test communication - address byte**
		ce 				 <= '1';
		mosi_buff_conf   <= "1" & std_logic_vector(to_unsigned(15,BUS_ADDRESS_WIDTH));
		master_bus_i.dat <= std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH));
		
		for i in 0 to BUS_ADDRESS_WIDTH loop
			wait for sclk_period/2;
			mosi <= mosi_buff_conf(BUS_ADDRESS_WIDTH-i);
			sclk <= '1';
			wait for sclk_period/2;
			sclk <= '0';
		end loop;
		
		wait for assert_hold;
		assert(master_bus_o.we = '0')
			report "ID03: Test address byte - expecting master_bus_o.we = '0'" severity error;
		assert(master_bus_o.adr = std_logic_vector(to_unsigned(15,BUS_ADDRESS_WIDTH)))
			report "ID04: Test address byte - expecting master_bus_o.adr = x0F" severity error;
		assert(master_bus_o.dat = std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH)))
			report "ID05: Test address byte - expecting master_bus_o.dat = x00" severity error;
		wait for post_hold;

		
		--Test communication - first data byte
		mosi_buff_dat <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
		for i in 0 to SYSTEM_DATA_WIDTH-1 loop
			wait for sclk_period/2;
			mosi <= mosi_buff_dat(SYSTEM_DATA_WIDTH-1-i);
			miso_buff(SYSTEM_DATA_WIDTH-1-i) <= miso;
			sclk <= '1';
			wait for sclk_period/2;
			sclk <= '0';
		end loop;
		
		wait for assert_hold;
		assert(master_bus_o.we = '1')
			report "ID06: Test first data byte - expecting master_bus_o.we = '1'" severity error;
		assert(master_bus_o.adr = std_logic_vector(to_unsigned(15,BUS_ADDRESS_WIDTH)))
			report "ID07: Test first data byte - expecting master_bus_o.adr = x0F" severity error;
		assert(master_bus_o.dat = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
			report "ID08: Test first data byte - expecting master_bus_o.dat = x0F" severity error;
		assert(miso_buff = std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)))
			report "ID09: Test first data byte - expecting miso_buff = xF0" severity error;
		wait for post_hold;


		--Test communication - second data byte
		master_bus_i.dat <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
		mosi_buff_dat 	 <= std_logic_vector(to_unsigned(14,SYSTEM_DATA_WIDTH));
		for i in 0 to 7 loop
			wait for sclk_period/2;
			mosi <= mosi_buff_dat(SYSTEM_DATA_WIDTH-1-i);
			miso_buff(SYSTEM_DATA_WIDTH-1-i) <= miso;
			sclk <= '1';
			wait for sclk_period/2;
			sclk <= '0';
		end loop;
		
		wait for assert_hold;
		assert(master_bus_o.we = '1')
			report "ID10: Test second data byte - expecting master_bus_o.we = '1'" severity error;
		assert(master_bus_o.adr = std_logic_vector(to_unsigned(14,BUS_ADDRESS_WIDTH)))
			report "ID11: Test second data byte - expecting master_bus_o.adr = x0E" severity error;
		assert(master_bus_o.dat = std_logic_vector(to_unsigned(14,SYSTEM_DATA_WIDTH)))
			report "ID12: Test second data byte - expecting master_bus_o.dat = x0E" severity error;
		assert(miso_buff = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
			report "ID13 Test second data byte - expecting miso_buff = x0E" severity error;
		wait for post_hold;
		
		
		--Test disabled
		ce <= '0';
		wait for 3*clk_period/2;
		assert(master_bus_o.we = '0')
			report "ID14: Test disabled - expecting master_bus_o.we = '0'" severity error;
		assert(master_bus_o.adr = std_logic_vector(to_unsigned(0,BUS_ADDRESS_WIDTH)))
			report "ID15: Test first data byte - expecting master_bus_o.adr = x00" severity error;
		assert(master_bus_o.dat = std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH)))
			report "ID16: Test first data byte - expecting master_bus_o.dat = x00" severity error;
		wait for post_hold;
		

		--Finish simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	-----------------------------------------------------------------------------------------------
	

end TB;