-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		DC Motor Driver - H-Bridge L293DD Testbench
-- Module Name:		DC_MOTOR_DRIVER_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Quartus Prime Lite 21.1, Lattice Diamond 3.12
--
-- Dependencies:	-> DC_MOTOR_DRIVER.vhd
--					-> GOLDI_DATA_TYPES.vhd
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
entity DC_MOTOR_DRIVER_TB is
end entity DC_MOTOR_DRIVER_TB;




--! Simulation architecture
architecture TB of DC_MOTOR_DRIVER_TB is

	--****DUT****
	component DC_MOTOR_DRIVER
		generic(
			ADDRESS			:	natural := 1;
			CLK_FACTOR		:	natural := 10
		);
		port(
			clk			: in	std_logic;
			rst			: in	std_logic;
			sys_bus_i	: in	sbus_in;
			sys_bus_o	: out	sbus_out;
			DC_enb		: out 	io_o;
			DC_out_1	: out	io_o;
			DC_out_2	: out 	io_o
		);
	end component;
	
	
	--****INTERNAL SIGNALS****
	--Simulation timing
	constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
	constant clk_factor 	:	natural := 10;
	signal sys_bus_i		:	sbus_in;
	signal sys_bus_o		:	sbus_out;
	signal DC_enb			:	io_o;
	signal DC_out_1			:	io_o;
	signal DC_out_2			:	io_o;
	
	
begin

	--****COMPONENT****
	-----------------------------------------------------------------------------------------------
	DUT : DC_MOTOR_DRIVER
	generic map(
		ADDRESS 	=> 1,
		CLK_FACTOR 	=> clk_factor
	)
	port map(
		clk			=> clock,
		rst			=> reset,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o,
		DC_enb		=> DC_enb,
		DC_out_1	=> DC_out_1,
		DC_out_2	=> DC_out_2
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
		variable assert_hold		:	time := 5*clk_period/2;
		variable post_hold			:	time := clk_period/2;
	begin
		--Preset bus
		sys_bus_i <= gnd_sbus_i;
		wait for init_hold;
		

		--**Test reset values**
		wait for assert_hold;
		assert(DC_enb.dat = '0')
			report "ID01: Test reset - expecting DC_enb = '0'" severity error;
		assert(DC_out_1.dat = '0')
			report "ID02: Test reset - expecting DC_out_1 = '0'" severity error;
		assert(DC_out_2.dat = '0')
			report "ID03: Test reset - expecting DC_out_2 = '0'" severity error;
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
			assert(DC_enb.dat = '0')
				report "ID04: Test PWM=0 - expecting DC_enb = '0' [" & integer'image(i) & "]"
				severity error;
			assert(DC_out_1.dat = '1')
				report "ID05: Test PWM=0 - expecting DC_out_1 = '1' [" & integer'image(i) & "]"
				severity error;
			assert(DC_out_2.dat = '0')
				report "ID06: Test PWM=0 - expecting DC_out_2 = '0' [" & integer'image(i) & "]"
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
			assert(DC_enb.dat = '1')
				report "ID07: Test PWM=FF - expecting DC_enb = '1' [" & integer'image(i) & "]"
				severity error;
			assert(DC_out_1.dat = '0')
				report "ID08: Test PWM=FF - expecting DC_out_1 = '0' [" & integer'image(i) & "]"
				severity error;
			assert(DC_out_2.dat = '1')
				report "ID09: Test PWM=FF - expecting DC_out_2 = '1' [" & integer'image(i) & "]"
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
				assert(DC_enb.dat = '1')
					report "ID10: Test PWM=0F - expecting DC_enb = '1' [" & integer'image(i) & "]"
					severity error;
				assert(DC_out_1.dat = '1')
					report "ID11: Test PWM=0F - expecting DC_out_1 = '1' [" & integer'image(i) & "]"
					severity error;
				assert(DC_out_2.dat = '0')
					report "ID12: Test PWM=0F - expecting DC_out_2 = '0' [" & integer'image(i) & "]"
					severity error;
				wait for clk_factor*clk_period;
			else
				assert(DC_enb.dat = '0')
					report "ID13: Test PWM=0F - expecting DC_enb = '0' [" & integer'image(i) & "]"
					severity error;
				assert(DC_out_1.dat = '1')
					report "ID14: Test PWM=0F - expecting DC_out_1 = '1' [" & integer'image(i) & "]"
					severity error;
				assert(DC_out_2.dat = '0')
					report "ID15: Test PWM=0F - expecting DC_out_2 = '0' [" & integer'image(i) & "]"
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
			assert(DC_enb.dat = '0')
				report "ID16: Test error case - expecting DC_enb = '0' [" & integer'image(i) & "]" 
				severity error;
			assert(DC_out_1.dat = '1')
				report "ID17: Test error case - expecting DC_out_1 = '1' [" & integer'image(i) & "]" 
				severity error;
			assert(DC_out_2.dat = '1')
				report "ID18: Test error case - expecting DC_out_2 = '1' [" & integer'image(i) & "]" 
				severity error;
			wait for clk_factor*clk_period;
		end loop;
		wait for post_hold;
		
		

		--End simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	
	
end TB;