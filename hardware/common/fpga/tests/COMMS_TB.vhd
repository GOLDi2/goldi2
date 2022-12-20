-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Communication testbench
-- Module Name:		COMMS_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> SPI_TO_BUS.vhd
--					-> REGISTER_TABLE.vhd
--					-> GOLDI_BUS_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.01 - File Created
-- Additional Comments: First commit
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for synthesis
use std.standard.all;
--! Use custom library
use work.GOLDI_COMM_STANDARD.all;




--Functionality Testbench
entity COMMS_TB is
end entity COMMS_TB;



--Simulation architecture
architecture TB of COMMS_TB is

	--CUT
	component SPI_TO_BUS
		port(
			clk			: in	std_logic;
			rst			: in	std_logic;
			ce			: in	std_logic;
			sclk		: in	std_logic;
			mosi		: in	std_logic;
			miso		: out	std_logic;
			sys_bus_i	: out	bus_in;
			sys_bus_o	: in	bus_out
		);
	end component;
	
	component REGISTER_TABLE
		generic(
			BASE_ADDRESS		:	natural := 1;
			NUMBER_REGISTERS	:	natural := 2;
			REG_DEFAULT_VALUES	:	data_word_vector := (x"00",x"00")
		);
		port(
			clk				: in	std_logic;
			rst				: in	std_logic;
			sys_bus_i		: in	bus_in;
			sys_bus_o		: out	bus_out;
			reg_data_in		: in	data_word_vector(NUMBER_REGISTERS-1 downto 0);
			reg_data_out	: out	data_word_vector(NUMBER_REGISTERS-1 downto 0);
			reg_data_stb	: out	std_logic_vector(NUMBER_REGISTERS-1 downto 0)
		);
	end component;
	
	
	--Signals
	--Simulation timing 
	constant clk_period		:	time := 10 ns;
	constant sclk_period	:	time := 40 ns;
	signal clock			:	std_logic := '0';
	signal reset			:	std_logic;
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	--Spi to bus
	signal ce				:	std_logic;
	signal sclk				:	std_logic;
	signal mosi				:	std_logic;
	signal miso				:	std_logic;
	signal sys_bus_i		:	bus_in;
	signal sys_bus_o		:	bus_out;
	--reg table
	signal reg_data_in		:	data_word_vector(1 downto 0);
	--Simulation data
	signal mosi_buff		:	std_logic_vector(7 downto 0);
	signal miso_buff		:	std_logic_vector(7 downto 0);
	

begin

	DUT_COMM : SPI_TO_BUS
	port map(
		clk			=> clock,
		rst			=> reset,
		ce			=> ce,
		sclk		=> sclk,
		mosi		=> mosi,
		miso		=> miso,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o
	);
	
	DUT_MEMORY : REGISTER_TABLE
	port map(
		clk				=> clock,
		rst				=> reset,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o,
		reg_data_in		=> reg_data_in,
		reg_data_out	=> open,
		reg_data_stb	=> open
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
		--Initial setup
		ce <= '0';
		sclk <= '0';
		reg_data_in <= (x"03",x"02");
		wait for init_hold;
		
		
		--Test registers
		ce <= '1';
		for i in 1 to 3 loop
			mosi_buff <= std_logic_vector(to_unsigned(i,8));
			wait for clk_period;
			
			for j in 0 to 7 loop
				wait for sclk_period/2;
				mosi <= mosi_buff(7-j);
				miso_buff(7-j) <= miso;
				sclk <= '1';
				wait for sclk_period/2;
				sclk <= '0';
			end loop;
			
			if(i>1) then
				wait for clk_period/2;
				assert(miso_buff = std_logic_vector(to_unsigned(i,8)))
					report "line(161): Test register comms - expecting miso_buff = " & integer'image(i) severity error;
				wait for clk_period/2;
			end if;
		end loop;
		
		
		--Finish simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
		
	end process;
	
	
end TB;