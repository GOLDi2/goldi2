-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Communication testbench
-- Module Name:		COMMS_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> SPI_TO_BUS.vhd
--					-> REGISTER_TABLE.vhd
--					-> GOLDI_COMM_STANDARD.vhd
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
	
	component REGISTER_TABLE
		generic(
			BASE_ADDRESS		:	natural := 1;
			NUMBER_REGISTERS	:	natural := 2;
			REG_DEFAULT_VALUES	:	data_word_vector := (x"00",x"00")
		);
		port(
			clk				: in	std_logic;
			rst				: in	std_logic;
			sys_bus_i		: in	sbus_in;
			sys_bus_o		: out	sbus_out;
			reg_data_in		: in	data_word_vector(NUMBER_REGISTERS-1 downto 0);
			reg_data_out	: out	data_word_vector(NUMBER_REGISTERS-1 downto 0);
			reg_data_stb	: out	std_logic_vector(NUMBER_REGISTERS-1 downto 0)
		);
	end component;
	
	
	--Signals
	--Simulation timing 
	constant clk_period		:	time := 10 ns;
	constant sclk_period	:	time := 40 ns;
	constant data_in_assign	:	std_logic_vector(15 downto 0) := x"0003";
	signal clock			:	std_logic := '0';
	signal reset			:	std_logic;
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	--Spi to bus
	signal ce				:	std_logic;
	signal sclk				:	std_logic;
	signal mosi				:	std_logic;
	signal miso				:	std_logic;
	signal sys_bus_i		:	sbus_in;
	signal sys_bus_o_vector	:	sbus_o_vector(1 downto 0);
	--reg table
	signal reg_data_in		:	data_word_vector(1 downto 0);
	signal reg_data_out_1	:	data_word_vector(1 downto 0);
	signal reg_data_out_2	:	data_word_vector(1 downto 0);
	--Simulation data
	signal mosi_buff		:	std_logic_vector(7 downto 0);
	signal miso_buff		:	std_logic_vector(7 downto 0);
	

begin

	DUT_COMM : SPI_TO_BUS
	port map(
		clk				=> clock,
		rst				=> reset,
		ce				=> ce,
		sclk			=> sclk,
		mosi			=> mosi,
		miso			=> miso,
		master_bus_o	=> sys_bus_i,
		master_bus_i	=> reduceBusVector(sys_bus_o_vector)
	);
	
	DUT_MEMORY_1 : REGISTER_TABLE
	generic map(
		BASE_ADDRESS 		=> 4,
		NUMBER_REGISTERS 	=> 2,
		REG_DEFAULT_VALUES 	=> (x"00",x"00")
	)
	port map(
		clk				=> clock,
		rst				=> reset,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o_vector(0),
		reg_data_in		=> reg_data_in,
		reg_data_out	=> reg_data_out_1,
		reg_data_stb	=> open
	);


	DUT_MEMORY_2 : REGISTER_TABLE
	generic map(
		BASE_ADDRESS 		=> 2,
		NUMBER_REGISTERS 	=> 2,
		REG_DEFAULT_VALUES 	=> (x"00",x"00")
	)
	port map(
		clk				=> clock,
		rst				=> reset,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o_vector(1),
		reg_data_in		=> assignMemory(data_in_assign),
		reg_data_out	=> reg_data_out_2,
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
		reg_data_in <= (x"05",x"04");
		wait for init_hold;
		
		
		--Test registers
		ce <= '1';
		for i in 5 downto 3  loop
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
			
			if(i<5) then
				wait for clk_period/2;
				assert(miso_buff = std_logic_vector(to_unsigned(i+1,8)))
					report "line(183): Test register comms - expecting miso_buff = " & integer'image(i) severity error;
				wait for clk_period/2;
			end if;
		end loop;
		
		
		--Finish simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
		
	end process;
	
	
end TB;