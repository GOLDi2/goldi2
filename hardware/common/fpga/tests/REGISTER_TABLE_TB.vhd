-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Customizable Register Table Testbench
-- Module Name:		REGISTER_TABLE_TB
-- Project Name:	GOLDIi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> REGISTER_TABLE.vhd
--					-> GOLDI_DATA_TYPES.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V0.01.02 - Test simplification
-- Additional Comments: Simplification of test cases due to mayor refactor
--						of DUT.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for synthesis
use std.standard.all;
--! Use custom library
use work.GOLDI_COMM_STANDARD.all;



--! Functionality testbench
entity REGISTER_TABLE_TB is
end entity REGISTER_TABLE_TB;




--! Simulation architecture
architecture TB of REGISTER_TABLE_TB is
	
	--CUT
	component REGISTER_TABLE
		generic(
			BASE_ADDRESS		:	natural := 1;
			NUMBER_REGISTERS	:	natural := 3;
			REG_DEFAULT_VALUES	:	data_word_vector := (x"FF",x"F0",x"0F")
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
	
	
	--Intermeidate signals
	--Simulation timing
	constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic;
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	signal sys_bus_i		:	bus_in;
	signal sys_bus_o		:	bus_out;
	signal reg_data_in		:	data_word_vector(2 downto 0) := (x"03",x"02",x"01");
	signal reg_data_out		:	data_word_vector(2 downto 0);
	signal reg_data_stb		:	std_logic_vector(2 downto 0);
	
	
begin

	DUT : REGISTER_TABLE
	port map(
		clk				=> clock,
		rst				=> reset,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o,
		reg_data_in		=> reg_data_in,
		reg_data_out	=> reg_data_out,
		reg_data_stb	=> reg_data_stb
	);
	
	
	--Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 0 ns, '0' after 15 ns;
	
	
	TEST : process
		--Timing
		variable init_hold			:	time :=	4*clk_period/2;
		variable assert_hold		:	time := 3*clk_period/2;
		variable post_hold			:	time := clk_period/2;
	begin
		--Preset bus
		sys_bus_i.we  <= '0';
		sys_bus_i.adr <= (others => '0');
		sys_bus_i.dat <= (others => '0');
		--Wait for initial setup
		wait for init_hold;
		
		
		--Test reset conditions
		assert(reg_data_out(0) = x"0F") 
			report "line(108): Test reset - expecting reg_data_out(0) = x0F" severity error;
		assert(reg_data_out(1) = x"F0") 
			report "line(110): Test reset - expecting reg_data_out(1) = xF0" severity error;
		assert(reg_data_out(2) = x"FF") 
			report "line(112): Test reset - expecting reg_data_out(2) = xFF" severity error;
		assert(reg_data_stb = "111")
			report "line(114): Test reset - expecting reg_data_stb = 111" severity error;
		wait for post_hold;
		
		
		wait for 5*clk_period;
		
		
		--Test read bus
		for i in 1 to 3 loop
			sys_bus_i.we  <= '0';
			sys_bus_i.adr <= std_logic_vector(to_unsigned(i,7));
			sys_bus_i.dat <= x"FF";
			wait for assert_hold;
			assert(sys_bus_o.dat = std_logic_vector(to_unsigned(i,8))) 
				report "line(128): Test bus read - expecting sys_bus_o.dat =" & integer'image(i) 
				severity error;
			wait for post_hold;
		end loop;

		
		wait for 5*clk_period;
		
		
		--Test write operation
		for i in 1 to 3 loop
			sys_bus_i.we  <= '1';
			sys_bus_i.adr <= std_logic_vector(to_unsigned(i,7));
			sys_bus_i.dat <= x"0F";
			wait for assert_hold;
			assert(sys_bus_o.dat = x"00") 
				report "line(144): Test bus write - expecting sys_bus_o.dat = x00" severity error;
			assert(reg_data_out(i-1) = x"0F") 
				report "line(146): Test bus write - expecting reg_data_out("& integer'image(i-1)&") = x0F"
				severity error;
			wait for post_hold;
		end loop;		
		
		
		--End simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	
	
end TB;

