-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Incremental encoder dsp testbench
-- Module Name:		ENCODER_SMODULE_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GODLI_IO_STANDARD.vhd
--					-> ENCODER_SMODULE.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V4.00.00 - Module renaming and refactoring
-- Additional Comments: Module renamed to follow V4.00.00 naming convention.
--						(INC_ENCODER_TB.vhd -> ENCODER_SMODULE_TB.vhd)
--						Changes to the DUT entity and the port signal names.
--						Use of env library to stop simulation.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation flow control and assertions
library std;
use std.standard.all;
use std.env.all;
--! Use custom library
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality Testbench
entity ENCODER_SMODULE_TB is
end entity ENCODER_SMODULE_TB;




--! Simulation architecture
architecture TB of ENCODER_SMODULE_TB is

	--****DUT****
	component ENCODER_SMODULE
		generic(
			g_address	:	natural;
			g_index_rst	:	boolean;
			g_invert	:	boolean
		);
		port(
			clk			: in	std_logic;
			rst			: in	std_logic;
			sys_bus_i	: in	sbus_in;
			sys_bus_o	: out	sbus_out;
			p_channel_a	: in	io_i;
			p_channel_b	: in	io_i;
			p_channel_i	: in	io_i
		);
	end component;
	
	
	--****INTERNAL SIGNALS****
	--Simulation timing
	constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	signal sys_bus_i		:	sbus_in  := gnd_sbus_i;
	signal sys_bus_o_1		:	sbus_out := gnd_sbus_o;
	signal sys_bus_o_2		:	sbus_out := gnd_sbus_o;
	signal channel_a_1		:	io_i := gnd_io_i;
	signal channel_b_1		:	io_i := gnd_io_i;
	signal channel_i_1		:	io_i := gnd_io_i;
	signal channel_a_2		:	io_i := gnd_io_i;
	signal channel_b_2		:	io_i := gnd_io_i;
	signal channel_i_2		:	io_i := gnd_io_i; 
	
begin

	--****COMPONENTS****
	-----------------------------------------------------------------------------------------------
	DUT_1 : ENCODER_SMODULE
	generic map(
		g_address 	=> 1,
		g_index_rst	=> false,
		g_invert	=> false
	)
	port map(
		clk			=> clock,
		rst			=> reset,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o_1,
		p_channel_a	=> channel_a_1,
		p_channel_b	=> channel_b_1,
		p_channel_i	=> channel_i_1
	);
	
	DUT_2 : ENCODER_SMODULE
	generic map(
		g_address	=> 3,
		g_index_rst	=> true,
		g_invert	=> true
	)
	port map(
		clk			=> clock,
		rst			=> reset,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o_2,
		p_channel_a	=> channel_a_2,
		p_channel_b	=> channel_b_2,
		p_channel_i	=> channel_i_2
	);
	-----------------------------------------------------------------------------------------------


	
	--****SIMULATION TIMING****
	-----------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 10 ns, '0' after 20 ns;
	-----------------------------------------------------------------------------------------------


	
	--****TEST****
	-----------------------------------------------------------------------------------------------
	TEST : process
	--Timing
		variable init_hold			:	time :=	5*clk_period/2;
		variable assert_hold		:	time := 3*clk_period/2;
		variable post_hold			:	time := 1*clk_period/2;
	begin
	
		--**Initial Setup**
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
		

		--**End simulation**
		wait for 50 ns;
        report "ENCODER_SMODULE_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;
		
	end process;
	-----------------------------------------------------------------------------------------------

	
end TB;