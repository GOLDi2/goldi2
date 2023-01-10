-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/01/2022
-- Design Name:		Incremental encoder dsp testbench
-- Module Name:		INC_ENCODER_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_DATA_TYPES.vhd
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

	--CUT
	component INC_ENCODER
		generic(
			ADDRESS		:	natural;
			INDEX_RST	:	boolean
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
	
	
	--Intermediate signals
	--Simulation timing
	constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic;
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	signal sys_bus_i		:	sbus_in;
	signal sys_bus_o_1		:	sbus_out;
	signal sys_bus_o_2		:	sbus_out;
	signal channel_a		:	io_i := gnd_io_i;
	signal channel_b		:	io_i := gnd_io_i;
	signal channel_i		:	io_i := gnd_io_i;
	
	
begin

	DUT_1 : INC_ENCODER
	generic map(
		ADDRESS 	=> 1,
		INDEX_RST	=> false
	)
	port map(
		clk			=> clock,
		rst			=> reset,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o_1,
		channel_a	=> channel_a,
		channel_b	=> channel_b,
		channel_i	=> channel_i
	);
	
	DUT_2 : INC_ENCODER
	generic map(
		ADDRESS		=> 3,
		INDEX_RST	=> true
	)
	port map(
		clk			=> clock,
		rst			=> reset,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o_2,
		channel_a	=> channel_a,
		channel_b	=> channel_b,
		channel_i	=> channel_i
	);
	
	
	--Timing
	clock <= run_sim and (not clock) after clk_period/2;
	
	
	TEST : process
	--Timing
		variable init_hold			:	time :=	4*clk_period/2;
		variable assert_hold		:	time := 3*clk_period/2;
		variable post_hold			:	time := clk_period/2;
	begin
	
		reset <= '1';
		wait for 15 ns;
		reset <= '0';
		
		
		--Preset bus
		sys_bus_i.we  <= '0';
		sys_bus_i.adr <= (others => '0');
		sys_bus_i.dat <= (others => '0');
		--Wait for initial setup
		wait for init_hold;
		
		
		--DUT_1
		--Test reset conditions
		sys_bus_i.we  <= '0';
		sys_bus_i.adr <= std_logic_vector(to_unsigned(1,7));
		wait for assert_hold;
		assert(sys_bus_o_1.dat = x"00")
			report "line(139): Test reset DUT_1 - expecting sys_bus_o.dat = x00" severity error;
		wait for post_hold;
		sys_bus_i.adr <= std_logic_vector(to_unsigned(2,7));
		wait for assert_hold;
		assert(sys_bus_o_1.dat = x"00")
			report "line(144): Test reset DUT_1 - expecting sys_bus_o.dat = x00" severity error;
		wait for post_hold;
		sys_bus_i.adr <= (others => '0');
		
		
		
		wait for 5*clk_period;
		
		
		
		--Test signal processing
		channel_b.dat <= '1';
		channel_a.dat <= '0';
		for i in 0 to 1 loop
			--Change direction of the movement
			channel_b.dat <= not channel_b.dat;
			
			--Simulate impulses of rotation
			for j in 0 to 4 loop
				channel_a.dat <= not channel_a.dat;
				wait for 2*clk_period;
				channel_a.dat <= not channel_a.dat;
				wait for 2*clk_period;
			end loop;
			
			wait for clk_period;
			if(i = 0) then
				sys_bus_i.we  <= '0';
				sys_bus_i.adr <= std_logic_vector(to_unsigned(1,7));
				wait for assert_hold;
				assert(sys_bus_o_1.dat = x"0A")
					report "line(175): Test signal processing DUT_1 - expecting sys_bus_o.dat = x0A" severity error;
				wait for post_hold;
				
			else
				sys_bus_i.we  <= '0';
				sys_bus_i.adr <= std_logic_vector(to_unsigned(1,7));
				wait for assert_hold;
				assert(sys_bus_o_1.dat = x"00")
					report "line(183): Test signal processing DUT_1 - expecting sys_bus_o.dat = x00" severity error;
				wait for post_hold;
			end if;
		end loop;
		
		
		
		wait for 5*clk_period;
		
		
		
		--DUT_2
		--Test reset conditions
		channel_i.dat <= '1';
		sys_bus_i.adr <= std_logic_vector(to_unsigned(3,7));
		wait for assert_hold;
		assert(sys_bus_o_2.dat = x"00")
			report "line(200): Test reset DUT_2 - expecting sys_bus_o.dat = x00" severity error;
		wait for post_hold;
		sys_bus_i.adr <= std_logic_vector(to_unsigned(4,7));
		wait for assert_hold;
		assert(sys_bus_o_2.dat = x"00")
			report "line(205): Test reset DUT_2 - expecting sys_bus_o.dat = x00" severity error;
		wait for post_hold;
		sys_bus_i.adr <= (others => '0');
		
		
		
		wait for 5*clk_period;
		
		
		
		--Test signal processing
		channel_b.dat <= '1';
		channel_a.dat <= '0';
		for i in 0 to 1 loop
			--Change direction of the movement
			channel_b.dat <= not channel_b.dat;
			
			--Simulate impulses of rotation
			for j in 0 to 4 loop
				channel_a.dat <= not channel_a.dat;
				wait for 2*clk_period;
				channel_a.dat <= not channel_a.dat;
				wait for 2*clk_period;
			end loop;
			
			wait for clk_period;
			if(i = 0) then
				sys_bus_i.we  <= '0';
				sys_bus_i.adr <= std_logic_vector(to_unsigned(3,7));
				wait for assert_hold;
				assert(sys_bus_o_2.dat = x"0A")
					report "line(236): Test signal processing DUT_2 - expecting sys_bus_o.dat = x0A" severity error;
				wait for post_hold;
				
			else
				sys_bus_i.we  <= '0';
				sys_bus_i.adr <= std_logic_vector(to_unsigned(3,7));
				wait for assert_hold;
				assert(sys_bus_o_2.dat = x"00")
					report "line(244): Test signal processing DUT_2 - expecting sys_bus_o.dat = x00" severity error;
				wait for post_hold;
			end if;
		end loop;
		

		
		--End simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	
	
end TB;