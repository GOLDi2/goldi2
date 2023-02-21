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

	--CUT
	component DC_MOTOR_DRIVER
		generic(
			ADDRESS			:	natural := 1;
			CLK_FACTOR		:	natural := 1
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
	
	
	--Intermeidate signals
	--Simulation timing
	constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic;
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	signal sys_bus_i		:	sbus_in;
	signal sys_bus_o		:	sbus_out;
	signal DC_enb			:	io_o;
	signal DC_out_1			:	io_o;
	signal DC_out_2			:	io_o;
	
	
begin

	DUT : DC_MOTOR_DRIVER
	port map(
		clk			=> clock,
		rst			=> reset,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o,
		DC_enb		=> DC_enb,
		DC_out_1	=> DC_out_1,
		DC_out_2	=> DC_out_2
	);
	
	
	--Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '0' after 0 ns, '1' after 5 ns, '0' after 15 ns;
	
	
	TEST : process
		--Timing
		variable init_hold			:	time :=	5*clk_period/2;
		variable assert_hold		:	time := 5*clk_period/2;
		variable post_hold			:	time := clk_period/2;
	begin
		--Preset bus
		sys_bus_i <= gnd_sbus_i;
		wait for init_hold;
		

		--Test reset values
		assert(DC_enb.dat = '0')
			report "line(106): Test reset - expecting DC_enb.dat = '0'" severity error;
		assert(DC_out_1.dat = '0')
			report "line(108): Test reset - expecting DC_out_1.dat = '0'" severity error;
		assert(DC_out_2.dat = '0')
			report "line(110): Test reset - expecting DC_out_2.dat = '0'" severity error;
			

		wait for 5*clk_period;
		
		
		--Test pwm=0
		sys_bus_i.we  <= '1';
		sys_bus_i.adr <= std_logic_vector(to_unsigned(2,7));
		sys_bus_i.dat <= x"00";
		wait for clk_period;
		sys_bus_i.adr <= std_logic_vector(to_unsigned(1,7));
		sys_bus_i.dat <= x"01";
		wait for clk_period;
		sys_bus_i <= gnd_sbus_i;
		
		wait for assert_hold;
		for i in 1 to 255 loop
			assert(DC_enb.dat = '0')
				report "line(130): Test PWM=0 - expecting DC_enb.dat = '0'" severity error;
			assert(DC_out_1.dat = '1')
				report "line(132): Test PWM=0 - expecting DC_out_1.dat = '1'" severity error;
			assert(DC_out_2.dat = '0')
				report "line(134): Test PWM=0 - expecting DC_out_2.dat = '0'" severity error;
			wait for clk_period;
		end loop;
		wait for post_hold;
		
		
		wait for 5*clk_period;
		
		
		--Test pwm=FF
		sys_bus_i.we  <= '1';
		sys_bus_i.adr <= std_logic_vector(to_unsigned(2,7));
		sys_bus_i.dat <= x"FF";
		wait for clk_period;
		sys_bus_i.adr <= std_logic_vector(to_unsigned(1,7));
		sys_bus_i.dat <= x"02";
		wait for clk_period;
		sys_bus_i <= gnd_sbus_i;


		wait for assert_hold;
		for i in 1 to 255 loop
			assert(DC_enb.dat = '1')
				report "line(157): Test PWM=FF - expecting DC_enb.dat = '1'" severity error;
			assert(DC_out_1.dat = '0')
				report "line(159): Test PWM=FF - expecting DC_out_1.dat = '0'" severity error;
			assert(DC_out_2.dat = '1')
				report "line(161): Test PWM=FF - expecting DC_out_2.dat = '1'" severity error;
			wait for clk_period;
		end loop;

		
		wait for 5*clk_period;
		
		
		--Test pwm=0F
		sys_bus_i.we  <= '1';
		sys_bus_i.adr <= std_logic_vector(to_unsigned(2,7));
		sys_bus_i.dat <= x"7F";
		wait for clk_period;
		sys_bus_i.adr <= std_logic_vector(to_unsigned(1,7));
		sys_bus_i.dat <= x"02";
		wait for clk_period;
		sys_bus_i 	  <= gnd_sbus_i;

		wait for assert_hold;
		for i in 1 to 255 loop
			if(i<=127) then
				assert(DC_enb.dat = '1')
					report "line(183): Test PWM=0F - expecting DC_enb.dat = '1'" & integer'image(i) severity error;
				assert(DC_out_1.dat = '0')
					report "line(185): Test PWM=0F - expecting DC_out_1.dat = '0'" severity error;
				assert(DC_out_2.dat = '1')
					report "line(187): Test PWM=0F - expecting DC_out_2.dat = '1'" severity error;
				wait for clk_period;
			else
				assert(DC_enb.dat = '0')
					report "line(191): Test PWM=0F - expecting DC_enb.dat = '0'" & integer'image(i) severity error;
				assert(DC_out_1.dat = '0')
					report "line(193): Test PWM=0F - expecting DC_out_1.dat = '0'" severity error;
				assert(DC_out_2.dat = '1')
					report "line(195): Test PWM=0F - expecting DC_out_2.dat = '1'" severity error;
				wait for clk_period;
			end if;			
		end loop;
		wait for post_hold;
		
		
		wait for 5*clk_period;
		
		
		--Test error case [both pos and neg enabled]
		sys_bus_i.we  <= '1';
		sys_bus_i.adr <= std_logic_vector(to_unsigned(1,7));
		sys_bus_i.dat <= x"03";
		wait for clk_period;
		sys_bus_i <= gnd_sbus_i;
		
		wait for assert_hold;
		assert(DC_enb.dat = '0')
			report "line(214): Test error case - expecting DC_enb.dat = '0'" severity error;
		assert(DC_out_1.dat = '1')
			report "line(216): Test error case - expecting DC_out_1.dat = '1'" severity error;
		assert(DC_out_2.dat = '1')
			report "line(218): Test error case - expecting DC_out_2.dat = '1'" severity error;
		wait for post_hold;
		
		

		--End simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	
	
end TB;