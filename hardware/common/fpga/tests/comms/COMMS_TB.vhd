-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Communication testbench
-- Module Name:		COMMS_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> SPI_TO_BUS.vhd
--					-> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V0.01.01 - File Created
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
--! Use assert library for synthesis
use std.standard.all;
--! Use custom library
use work.GOLDI_COMM_STANDARD.all;




--! Functionality Testbench
entity COMMS_TB is
end entity COMMS_TB;




--! Simulation architecture
architecture TB of COMMS_TB is

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
	
	component REGISTER_TABLE
		generic(
			BASE_ADDRESS		:	natural := 1;
			NUMBER_REGISTERS	:	natural := 2;
			REG_DEFAULT_VALUES	:	data_word_vector := (x"00",x"00")
		);
		port(
			clk					: in	std_logic;
			rst					: in	std_logic;
			sys_bus_i			: in	sbus_in;
			sys_bus_o			: out	sbus_out;
			data_in				: in	data_word_vector(NUMBER_REGISTERS-1 downto 0);
			data_out			: out	data_word_vector(NUMBER_REGISTERS-1 downto 0);
			read_stb			: out	std_logic_vector(NUMBER_REGISTERS-1 downto 0);
			write_stb			: out	std_logic_vector(NUMBER_REGISTERS-1 downto 0)
		);
	end component;
	
	
	--****INTERNAL SIGNALS****
	--Simulation timing 
	constant clk_period		:	time := 10 ns;
	constant sclk_period	:	time := 40 ns;
	constant data_in_assign	:	std_logic_vector(15 downto 0) := x"0003";
	signal clock			:	std_logic := '0';
	signal reset			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
	--Spi to bus
	signal ce				:	std_logic;
	signal sclk				:	std_logic;
	signal mosi				:	std_logic;
	signal miso				:	std_logic;
	signal sys_bus_i		:	sbus_in;
	signal sys_bus_o		:	sbus_o_vector(1 downto 0);
	--reg table
	signal reg_1_data_in	:	data_word_vector(1 downto 0);
	signal reg_2_data_in	:	data_word_vector(1 downto 0);
	signal reg_1_data_out	:	data_word_vector(1 downto 0);
	signal reg_2_data_out	:	data_word_vector(1 downto 0);

	--Simulation data
	signal mosi_buff_conf	:	std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
	signal mosi_buff_dat	:	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
	signal miso_buff		:	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
	

begin

	--****COMPONENT****
	-----------------------------------------------------------------------------------------------
	DUT_COMM : SPI_TO_BUS
	port map(
		clk				=> clock,
		rst				=> reset,
		ce				=> ce,
		sclk			=> sclk,
		mosi			=> mosi,
		miso			=> miso,
		master_bus_o	=> sys_bus_i,
		master_bus_i	=> reduceBusVector(sys_bus_o)
	);
	
	DUT_MEMORY_1 : REGISTER_TABLE
	generic map(
		BASE_ADDRESS 		=> 2,
		NUMBER_REGISTERS 	=> 2,
		REG_DEFAULT_VALUES 	=> (x"00",x"00")
	)
	port map(
		clk					=> clock,
		rst					=> reset,
		sys_bus_i			=> sys_bus_i,
		sys_bus_o			=> sys_bus_o(0),
		data_in				=> reg_1_data_in,
		data_out			=> reg_1_data_out,
		read_stb			=> open,
		write_stb			=> open
	);


	DUT_MEMORY_2 : REGISTER_TABLE
	generic map(
		BASE_ADDRESS 		=> 4,
		NUMBER_REGISTERS 	=> 2,
		REG_DEFAULT_VALUES 	=> (x"00",x"00")
	)
	port map(
		clk					=> clock,
		rst					=> reset,
		sys_bus_i			=> sys_bus_i,
		sys_bus_o			=> sys_bus_o(1),
		data_in				=> reg_2_data_in,
		data_out			=> reg_2_data_out,
		read_stb			=> open,
		write_stb			=> open
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
		ce <= '0';
		sclk <= '0';
		reg_1_data_in <= (x"05",x"04");
		reg_2_data_in <= setMemory(x"0003");
		miso_buff	  <= (others => '0');
		wait for init_hold;
		
		
		--Test registers
		
		for i in 2 to 5 loop
			mosi_buff_conf <= "1" & std_logic_vector(to_unsigned(i,BUS_ADDRESS_WIDTH));
			mosi_buff_dat  <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
			wait for clk_period;
			
			ce <= '1';
			for j in 0 to BUS_ADDRESS_WIDTH loop
				wait for sclk_period/2;
				mosi <= mosi_buff_conf(BUS_ADDRESS_WIDTH-j);
				sclk <= '1';
				wait for sclk_period/2;
				sclk <= '0';
			end loop;

			for j in 0 to SYSTEM_DATA_WIDTH-1 loop
				wait for sclk_period/2;
				mosi <= mosi_buff_dat(SYSTEM_DATA_WIDTH-1-j);
				miso_buff(SYSTEM_DATA_WIDTH-1-j) <= miso;
				sclk <= '1';
				wait for sclk_period/2;
				sclk <= '0';
			end loop;
			wait for sclk_period/2;
			ce <= '0';

			
			if(i < 4) then
				assert(reg_1_data_out(i-2) = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
					report "ID01: Test communication - expecting data_out = x0F" 
					severity error;
				assert(miso_buff = reg_1_data_in(i-2))
					report "ID02: Test communication - expecting miso = reg_1_data_in(" & integer'image(i-2) & ")"
					severity error;
			else	
				assert(reg_2_data_out(i-4) = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
					report "ID03: Test communication - expecting data_out = x0F"
					severity error;
				assert(miso_buff = reg_2_data_in(i-4))
					report "ID04: Test communication - expecting miso = reg_2_data_in(" & integer'image(i-4) & ")"
					severity error;
			end if;

			wait for 5*clk_period;	
		end loop;
		
		
		--End simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	-----------------------------------------------------------------------------------------------

	
end TB;