-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Customizable Register Table Testbench
-- Module Name:		REGISTER_TABLE_TB
-- Project Name:	GOLDIi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> REGISTER_TABLE.vhd
--					-> REGISTER_UNIT.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
--
-- Revision V3.00.02 - Minor corrections to the testbench
-- Additional Comments: -
--
-- Revision V3.01.00 - General improvements to simulation control
-- Additional Comments: Use of env library to stop simulation and
--						generalization of vector sizes to account for
--						changes in the GOLDI_COMM_STANDARD library
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation control and assertions
library std;
use std.standard.all;
use std.env.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! Functionality testbench
entity REGISTER_TABLE_TB is
end entity REGISTER_TABLE_TB;




--! Simulation architecture
architecture TB of REGISTER_TABLE_TB is
	
	--****DUT****
	component REGISTER_TABLE
		generic(
			BASE_ADDRESS		:	integer := 1;
			NUMBER_REGISTERS	:	integer := 3;
			REG_DEFAULT_VALUES	:	data_word_vector := (x"0F",x"F0",x"FF")
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
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
	constant reg_default	:	data_word_vector(2 downto 0) := (
		std_logic_vector(to_unsigned(255,SYSTEM_DATA_WIDTH)),
		std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)),
		std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)));
	signal sys_bus_i		:	sbus_in  := gnd_sbus_i;
	signal sys_bus_o		:	sbus_out := gnd_sbus_o;
	signal data_in			:	data_word_vector(2 downto 0) := (others => (others => '0'));
	signal data_out			:	data_word_vector(2 downto 0) := (others => (others => '0'));
	signal read_stb			:	std_logic_vector(2 downto 0) := (others => '0');
	signal write_stb		:	std_logic_vector(2 downto 0) := (others => '0');
	--Testbench
	signal data_buff		:	std_logic_vector(3*SYSTEM_DATA_WIDTH-1 downto 0) :=
		std_logic_vector(to_unsigned(3,SYSTEM_DATA_WIDTH)) &
		std_logic_vector(to_unsigned(2,SYSTEM_DATA_WIDTH)) &
		std_logic_vector(to_unsigned(1,SYSTEM_DATA_WIDTH));


begin

	--****COMPONENT****
	-----------------------------------------------------------------------------------------------
	DUT : REGISTER_TABLE
	generic map(
		BASE_ADDRESS		=> 1,
		NUMBER_REGISTERS	=> 3,
		REG_DEFAULT_VALUES	=> reg_default
	)
	port map(
		clk				=> clock,
		rst				=> reset,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o,
		data_in			=> data_in,
		data_out		=> data_out,
		read_stb		=> read_stb,
		write_stb 		=> write_stb
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
		variable init_hold			:	time :=	5*clk_period/2;
		variable assert_hold		:	time := 3*clk_period/2;
		variable post_hold			:	time := clk_period/2;
	begin
		--**Initial setup**
		wait for init_hold;
		
		
		--**Test reset conditions**
		wait for assert_hold;
		assert(data_out(0) = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH))) 
			report "ID01: Test reset - expecting data_out(0) = x0F" severity error;
		assert(data_out(1) = std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH))) 
			report "ID02: Test reset - expecting data_out(1) = xF0" severity error;
		assert(data_out(2) = std_logic_vector(to_unsigned(255,SYSTEM_DATA_WIDTH))) 
			report "ID03: Test reset - expecting data_out(2) = xFF" severity error;
		assert(read_stb = (read_stb'range => '0'))
			report "ID04: Test reset - expecting read_stb = 000" severity error;
		assert(write_stb = (write_stb'range => '0'))
			report "ID05: Test reset - expecting write_stb = 000" severity error;
		wait for post_hold;
		
		
		wait for 5*clk_period;
		
		
		--**Test read bus**
		data_in <= setMemory(data_buff);
		wait for clk_period;
		for i in 1 to 3 loop
			sys_bus_i <= readBus(i);
			wait for assert_hold;
			assert(sys_bus_o.dat = std_logic_vector(to_unsigned(i,SYSTEM_DATA_WIDTH))) 
				report "ID06: Test bus read - expecting sys_bus_o.dat = " & integer'image(i) 
				severity error;
			assert(sys_bus_o.val = '1')
				report "ID07: Test bus read - expecting sys_bus_o.val = '1'" 
				severity error;
			assert(read_stb(i-1) = '1')
				report "ID08: Test bus read - expecting read_stb(" & integer'image(i-1) & ") = '1'"
				severity error;
			wait for post_hold;
		end loop;

		
		wait for 5*clk_period;
		
		
		--**Test write bus**
		for i in 1 to 3 loop
			sys_bus_i <= writeBus(i,10);
			wait for assert_hold;
			assert(sys_bus_o.dat = (sys_bus_o.dat'range => '0')) 
				report "ID09: Test bus write - expecting sys_bus_o.dat = x00" 
				severity error;
			assert(data_out(i-1) = std_logic_vector(to_unsigned(10,SYSTEM_DATA_WIDTH))) 
				report "ID10: Test bus write - expecting reg_data_out("& integer'image(i-1)&") = x0F"
				severity error;
			assert(write_stb(i-1) = '1')
				report "ID11: Test bus write - expecting write_stb(" & integer'image(i-1) & ") = '1'"
				severity error;
			wait for post_hold;
		end loop;		
		
		
		--End simulation
		wait for 50 ns;
        report "REGISTER_TABLE_TB - testbench successful";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        --run_sim <= '0';
        --wait;
		
	end process;
	-----------------------------------------------------------------------------------------------

	
end TB;