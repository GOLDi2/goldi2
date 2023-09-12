-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		H-Bridge Driver Testbench
-- Module Name:		HBRIDGE_SMODULE_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Quartus Prime Lite 21.1, Lattice Diamond 3.12
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> HBRIDGE_SMODULE.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V4.00.00 - Module renaming and refactoring
-- Additional Comments: Module renamed to follow V4.00.00 naming convention.
--						(DC_MOTOR_DRIVER_TB.vhd -> HBRIDGE_SMODULE_TB.vhd)
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
entity HBRIDGE_SMODULE_TB is
end entity HBRIDGE_SMODULE_TB;




--! Simulation architecture
architecture TB of HBRIDGE_SMODULE_TB is

	--****DUT****
	component HBRIDGE_SMODULE
		generic(
			g_address		:	natural;
			g_clk_factor	:	natural
		);
		port(
			clk				: in	std_logic;
			rst				: in	std_logic;
			sys_bus_i		: in	sbus_in;
			sys_bus_o		: out	sbus_out;
			p_hb_enb		: out 	io_o;
			p_hb_out_1		: out	io_o;
			p_hb_out_2		: out 	io_o
		);
	end component;
	
	
	--****INTERNAL SIGNALS****
	--Simulation timing
	constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
	constant clk_factor 	:	natural  := 10;
	signal sys_bus_i		:	sbus_in  := gnd_sbus_i;
	signal sys_bus_o		:	sbus_out := gnd_sbus_o;
	signal p_hb_enb			:	io_o := low_io_o;
	signal p_hb_out_1		:	io_o := low_io_o;
	signal p_hb_out_2		:	io_o := low_io_o;
	
	
begin

	--****COMPONENT****
	-----------------------------------------------------------------------------------------------
	DUT : HBRIDGE_SMODULE
	generic map(
		g_address		=> 1,
		g_clk_factor 	=> clk_factor
	)
	port map(
		clk				=> clock,
		rst				=> reset,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o,
		p_hb_enb		=> p_hb_enb,
		p_hb_out_1		=> p_hb_out_1,
		p_hb_out_2		=> p_hb_out_2
	);
	-----------------------------------------------------------------------------------------------
	


	--****SIMULATION TIMING****
	-----------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 10 ns, '0' after 30 ns;
	-----------------------------------------------------------------------------------------------
	
	

	--****TEST****
	-----------------------------------------------------------------------------------------------
	TEST : process
		--Timing
		variable init_hold			:	time :=	5*clk_period/2;
		variable assert_hold		:	time := 5*clk_period/2;
		variable post_hold			:	time := 1*clk_period/2;
	begin
		--**Initial setup**
		wait for init_hold;
		

		--**Test reset values**
		wait for assert_hold;
		assert(p_hb_enb.dat = '0')
			report "ID01: Test reset - expecting p_hb_enb = '0'" severity error;
		assert(p_hb_out_1.dat = '0')
			report "ID02: Test reset - expecting p_hb_out_1 = '0'" severity error;
		assert(p_hb_out_2.dat = '0')
			report "ID03: Test reset - expecting p_hb_out_2 = '0'" severity error;
		wait for post_hold;

		
		wait for 5*clk_period;
		
		
		--**Test PWM=0 and positive direction**
		sys_bus_i <= writeBus(2,0);
		wait for clk_period;
		sys_bus_i <= writeBus(1,2);
		wait for clk_period;
		sys_bus_i <= gnd_sbus_i;
		
		wait for assert_hold;
		for i in 1 to 255 loop
			assert(p_hb_enb.dat = '0')
				report "ID04: Test PWM=0 - expecting p_hb_enb = '0' [" & integer'image(i) & "]"
				severity error;
			assert(p_hb_out_1.dat = '1')
				report "ID05: Test PWM=0 - expecting p_hb_out_1 = '1' [" & integer'image(i) & "]"
				severity error;
			assert(p_hb_out_2.dat = '0')
				report "ID06: Test PWM=0 - expecting p_hb_out_2 = '0' [" & integer'image(i) & "]"
				severity error;
			wait for clk_factor*clk_period;
		end loop;
		wait for post_hold;
		
		
		wait for 5*clk_period;
		
		
		--**Test pwm=FF and negative direction**
		sys_bus_i <= writeBus(2,255);
		wait for clk_period;
		sys_bus_i <= writeBus(1,1);
		wait for clk_period;
		sys_bus_i <= gnd_sbus_i;

		wait for assert_hold;
		for i in 1 to 255 loop
			assert(p_hb_enb.dat = '1')
				report "ID07: Test PWM=FF - expecting p_hb_enb = '1' [" & integer'image(i) & "]"
				severity error;
			assert(p_hb_out_1.dat = '0')
				report "ID08: Test PWM=FF - expecting p_hb_out_1 = '0' [" & integer'image(i) & "]"
				severity error;
			assert(p_hb_out_2.dat = '1')
				report "ID09: Test PWM=FF - expecting p_hb_out_2 = '1' [" & integer'image(i) & "]"
				severity error;
			wait for clk_factor*clk_period;
		end loop;
		wait for post_hold;

		
		wait for 5*clk_period;
		
		
		--**Test pwm=0F and positive direction**
		sys_bus_i <= writeBus(2,15);
		wait for clk_period;
		sys_bus_i <= writeBus(1,2);
		wait for clk_period;
		sys_bus_i <= gnd_sbus_i;

		wait for assert_hold;
		for i in 1 to 255 loop
			if(i<=15) then
				assert(p_hb_enb.dat = '1')
					report "ID10: Test PWM=0F - expecting p_hb_enb = '1' [" & integer'image(i) & "]"
					severity error;
				assert(p_hb_out_1.dat = '1')
					report "ID11: Test PWM=0F - expecting p_hb_out_1 = '1' [" & integer'image(i) & "]"
					severity error;
				assert(p_hb_out_2.dat = '0')
					report "ID12: Test PWM=0F - expecting p_hb_out_2 = '0' [" & integer'image(i) & "]"
					severity error;
				wait for clk_factor*clk_period;
			else
				assert(p_hb_enb.dat = '0')
					report "ID13: Test PWM=0F - expecting p_hb_enb = '0' [" & integer'image(i) & "]"
					severity error;
				assert(p_hb_out_1.dat = '1')
					report "ID14: Test PWM=0F - expecting p_hb_out_1 = '1' [" & integer'image(i) & "]"
					severity error;
				assert(p_hb_out_2.dat = '0')
					report "ID15: Test PWM=0F - expecting p_hb_out_2 = '0' [" & integer'image(i) & "]"
					severity error;
				wait for clk_factor*clk_period;
			end if;			
		end loop;
		wait for post_hold;
		
		
		wait for 5*clk_period;
		
		
		--**Test error case [both pos and neg enabled]**
		sys_bus_i <= writeBus(1,3);
		wait for clk_period;
		sys_bus_i <= gnd_sbus_i;
		
		wait for assert_hold;
		for i in 1 to 255 loop
			assert(p_hb_enb.dat = '0')
				report "ID16: Test error case - expecting p_hb_enb = '0' [" & integer'image(i) & "]" 
				severity error;
			assert(p_hb_out_1.dat = '1')
				report "ID17: Test error case - expecting p_hb_out_1 = '1' [" & integer'image(i) & "]" 
				severity error;
			assert(p_hb_out_2.dat = '1')
				report "ID18: Test error case - expecting p_hb_out_2 = '1' [" & integer'image(i) & "]" 
				severity error;
			wait for clk_factor*clk_period;
		end loop;
		wait for post_hold;
		
		

		--**End simulation**
		wait for 50 ns;
        report "HBRIDGE_SMODULE_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;
		
	end process;
	----------------------------------------------------------------------------------------------
	
	
end architecture;