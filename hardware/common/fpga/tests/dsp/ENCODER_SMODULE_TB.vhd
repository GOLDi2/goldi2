-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Incremental encoder dsp testbench
-- Module Name:		INC_ENCODER_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GODLI_IO_STANDARD.vhd
--					-> REGISTER_TABLE.vhd
--					-> INC_ENCODER.vhd
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
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality Testbench
entity INC_ENCODER_TB is
end entity INC_ENCODER_TB;




--! Simulation architecture
architecture TB of INC_ENCODER_TB is

	--****DUT****
	component INC_ENCODER
		generic(
			ADDRESS		:	natural;
			INDEX_RST	:	boolean;
			INVERT		:	boolean
		);
		port(
			clk			: in	std_logic;
			rst			: in	std_logic;
			sys_bus_i	: in	sbus_in;
			sys_bus_o	: out	sbus_out;
			channel_a	: in	io_i;
			channel_b	: in	io_i;
			channel_i	: in	io_i
		);
	end component;
	
	
	--****INTERNAL SIGNALS****
	--Simulation timing
	constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	signal sys_bus_i		:	sbus_in;
	signal sys_bus_o_1		:	sbus_out;
	signal sys_bus_o_2		:	sbus_out;
	signal channel_a_1		:	io_i;
	signal channel_b_1		:	io_i;
	signal channel_i_1		:	io_i;
	signal channel_a_2		:	io_i;
	signal channel_b_2		:	io_i;
	signal channel_i_2		:	io_i; 
	
begin

	--****COMPONENTS****
	-----------------------------------------------------------------------------------------------
	DUT_1 : INC_ENCODER
	generic map(
		ADDRESS 	=> 1,
		INDEX_RST	=> false,
		INVERT		=> false
	)
	port map(
		clk			=> clock,
		rst			=> reset,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o_1,
		channel_a	=> channel_a_1,
		channel_b	=> channel_b_1,
		channel_i	=> channel_i_1
	);
	
	DUT_2 : INC_ENCODER
	generic map(
		ADDRESS		=> 3,
		INDEX_RST	=> true,
		INVERT		=> true
	)
	port map(
		clk			=> clock,
		rst			=> reset,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o_2,
		channel_a	=> channel_a_2,
		channel_b	=> channel_b_2,
		channel_i	=> channel_i_2
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
	
		--Preset signals
		sys_bus_i   <= gnd_sbus_i;
		channel_a_1 <= gnd_io_i;
		channel_b_1 <= gnd_io_i;
		channel_i_1 <= gnd_io_i;
		channel_a_2 <= gnd_io_i;
		channel_b_2 <= gnd_io_i;
		channel_i_2 <= gnd_io_i;
		--Wait for initial setup
		wait for init_hold;
		
		
		--**DUT 1**
		--**Test reset conditions**
		sys_bus_i <= readBus(1);
		wait for assert_hold;
		assert(sys_bus_o_1.dat = x"00")
			report "ID01: Test reset DUT_1 - expecting sys_bus_o_1.dat = x00" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(2);
		wait for assert_hold;
		assert(sys_bus_o_1.dat = x"00")
			report "ID02: Test reset DUT_1 - expecting sys_bus_o_1.dat = x00" severity error;
		wait for post_hold;
		sys_bus_i <= gnd_sbus_i;
		
		
		wait for 5*clk_period;
		
		
		--**Test signal processing**
		--Test positive movement
		channel_a_1.dat <= '0';
		channel_a_2.dat <= '0';
		channel_b_1.dat <= '1';
		channel_b_2.dat <= '1'; 
		wait for clk_period;
		--Simulate impulses in CCW direction
		for j in 0 to 4 loop
			channel_a_1.dat <= not channel_a_1.dat;
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2*clk_period;
			channel_b_1.dat <= not channel_b_1.dat;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2*clk_period;
			channel_a_1.dat <= not channel_a_1.dat;
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2*clk_period;
			channel_b_1.dat <= not channel_b_1.dat;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2*clk_period;
		end loop;	
		--Read data
		sys_bus_i <= readBus(1);
		wait for assert_hold;
		assert(sys_bus_o_1.dat = x"0A")
			report "ID03: Test DUT_1 CCW operation - expecting sys_bus_o_1.dat = x0A" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(2);
		wait for assert_hold;
		assert(sys_bus_o_1.dat = x"00")
			report "ID04: Test DUT_1 CCW operation - expecting sys_bus_o_1.dat = x00" severity error;
		wait for post_hold;


		wait for 5*clk_period;
		

		--Test negative movement
		channel_a_1.dat <= '0';
		channel_b_1.dat <= '0';
		channel_a_2.dat <= '0';
		channel_b_2.dat <= '0';
		wait for clk_period;
		--Simulate impulses in CW direction
		for j in 0 to 4 loop
			channel_a_1.dat <= not channel_a_1.dat;
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2*clk_period;
			channel_b_1.dat <= not channel_b_1.dat;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2*clk_period;
			channel_a_1.dat <= not channel_a_1.dat;
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2*clk_period;
			channel_b_1.dat <= not channel_b_1.dat;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2*clk_period;
		end loop;
		--Read data
		sys_bus_i <= readBus(1);
		wait for assert_hold;
		assert(sys_bus_o_1.dat = x"00")
			report "ID05: Test DUT_1 CW operation - expecting sys_bus_o_1.dat = x00" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(2);
		wait for assert_hold;
		assert(sys_bus_o_1.dat = x"00")
			report "ID06: Test DUT_1 CW operation - expecting sys_bus_o_1.dat = x00" severity error;
		wait for post_hold;

		

		wait for 5*clk_period;



		--**DUT 2**
		--**Test reset conditions**
		sys_bus_i <= readBus(3);
		wait for assert_hold;
		assert(sys_bus_o_2.dat = x"00")
			report "ID07: Test reset DUT_1 - expecting sys_bus_o_2.dat = x00" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(4);
		wait for assert_hold;
		assert(sys_bus_o_2.dat = x"00")
			report "ID08: Test reset DUT_1 - expecting sys_bus_o_2.dat = x00" severity error;
		wait for post_hold;
		sys_bus_i <= gnd_sbus_i;
		
		
		wait for 5*clk_period;
		
		
		--**Test signal processing**
		--Enable DUT_2 
		channel_i_2.dat <= '1';
		wait for clk_period;


		--Test positive movement
		channel_b_2.dat <= '0';
		channel_a_2.dat <= '0';
		--Simulate impulses in CCW direction
		for j in 0 to 4 loop
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2*clk_period;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2*clk_period;
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2*clk_period;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2*clk_period;
		end loop;
		--Read data
		sys_bus_i <= readBus(3);
		wait for assert_hold;
		assert(sys_bus_o_2.dat = x"0A")
			report "ID09: Test DUT_2 CCW operation - expecting sys_bus_o_2.dat = x0A" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(4);
		wait for assert_hold;
		assert(sys_bus_o_2.dat = x"00")
			report "ID10: Test DUT_2 CCW operation - expecting sys_bus_o_2.dat = x00" severity error;
		wait for post_hold;
		

		wait for 5*clk_period;


		--Test negative movement
		channel_a_2.dat <= '0';
		channel_b_2.dat <= '1';
		wait for clk_period;
		--Simulate impulses in CW direction
		for j in 0 to 4 loop
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2*clk_period;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2*clk_period;
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2*clk_period;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2*clk_period;
		end loop;	
		--Read data
		sys_bus_i <= readBus(3);
		wait for assert_hold;
		assert(sys_bus_o_2.dat = x"00")
			report "ID11: Test DUT_2 CW operation - expecting sys_bus_o_2.dat = x00" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(4);
		wait for assert_hold;
		assert(sys_bus_o_2.dat = x"00")
			report "ID12: Test DUT_2 CW operation - expecting sys_bus_o_2.dat = x00" severity error;
		wait for post_hold;
		

		--End simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	-----------------------------------------------------------------------------------------------

	
end TB;