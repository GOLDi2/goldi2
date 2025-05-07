library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;

--! Functionality Testbench
entity ENCODER_SMODULE_TB is
end entity ENCODER_SMODULE_TB;

--! Simulation architecture
architecture TB of ENCODER_SMODULE_TB is
	--Simulation timing
	constant clk_period : time      := 20 ns;
	signal reset        : std_logic := '0';
	signal clock        : std_logic := '0';
	--DUT i/o
	signal sys_bus_i    : sbus_in   := gnd_sbus_i;
	signal sys_bus_o_1  : sbus_out  := gnd_sbus_o;
	signal sys_bus_o_2  : sbus_out  := gnd_sbus_o;
	signal channel_a_1  : io_i      := gnd_io_i;
	signal channel_b_1  : io_i      := gnd_io_i;
	signal channel_a_2  : io_i      := gnd_io_i;
	signal channel_b_2  : io_i      := gnd_io_i;

begin

	--****COMPONENTS****
	-----------------------------------------------------------------------------------------------
	DUT_1 : entity work.ENCODER_SMODULE
		generic map(
			g_address => 1,
			g_invert  => false
		)
		port map(
			clk         => clock,
			rst         => reset,
			sys_bus_i   => sys_bus_i,
			sys_bus_o   => sys_bus_o_1,
			p_channel_a => channel_a_1,
			p_channel_b => channel_b_1
		);

	DUT_2 : entity work.ENCODER_SMODULE
		generic map(
			g_address => 3,
			g_invert  => true
		)
		port map(
			clk         => clock,
			rst         => reset,
			sys_bus_i   => sys_bus_i,
			sys_bus_o   => sys_bus_o_2,
			p_channel_a => channel_a_2,
			p_channel_b => channel_b_2
		);
	-----------------------------------------------------------------------------------------------

	--****SIMULATION TIMING****
	-----------------------------------------------------------------------------------------------
	clock <= not clock after clk_period / 2;
	reset <= '1' after 10 ns, '0' after 20 ns;
	-----------------------------------------------------------------------------------------------

	--****TEST****
	-----------------------------------------------------------------------------------------------
	TEST : process
		--Timing
		constant init_hold   : time := 5 * clk_period / 2;
		constant assert_hold : time := 3 * clk_period / 2;
		constant post_hold   : time := 1 * clk_period / 2;
	begin
		--**Initial Setup**
		wait for init_hold;

		--**DUT 1**
		--**Test reset conditions**
		sys_bus_i <= readBus(1);
		wait for assert_hold;
		assert (sys_bus_o_1.dat = x"00")
		report "ID01: Test reset DUT_1 - expecting sys_bus_o_1.dat = x00" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(2);
		wait for assert_hold;
		assert (sys_bus_o_1.dat = x"00")
		report "ID02: Test reset DUT_1 - expecting sys_bus_o_1.dat = x00" severity error;
		wait for post_hold;
		sys_bus_i <= gnd_sbus_i;

		wait for 5 * clk_period;

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
			wait for 2 * clk_period;
			channel_b_1.dat <= not channel_b_1.dat;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2 * clk_period;
			channel_a_1.dat <= not channel_a_1.dat;
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2 * clk_period;
			channel_b_1.dat <= not channel_b_1.dat;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2 * clk_period;
		end loop;
		--Read data
		sys_bus_i       <= readBus(1);
		wait for assert_hold;
		assert (sys_bus_o_1.dat = x"0A")
		report "ID03: Test DUT_1 CCW operation - expecting sys_bus_o_1.dat = x0A" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(2);
		wait for assert_hold;
		assert (sys_bus_o_1.dat = x"00")
		report "ID04: Test DUT_1 CCW operation - expecting sys_bus_o_1.dat = x00" severity error;
		wait for post_hold;

		wait for 5 * clk_period;

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
			wait for 2 * clk_period;
			channel_b_1.dat <= not channel_b_1.dat;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2 * clk_period;
			channel_a_1.dat <= not channel_a_1.dat;
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2 * clk_period;
			channel_b_1.dat <= not channel_b_1.dat;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2 * clk_period;
		end loop;
		--Read data
		sys_bus_i       <= readBus(1);
		wait for assert_hold;
		assert (sys_bus_o_1.dat = x"00")
		report "ID05: Test DUT_1 CW operation - expecting sys_bus_o_1.dat = x00" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(2);
		wait for assert_hold;
		assert (sys_bus_o_1.dat = x"00")
		report "ID06: Test DUT_1 CW operation - expecting sys_bus_o_1.dat = x00" severity error;
		wait for post_hold;

		wait for 5 * clk_period;

		--**DUT 2**
		--**Test reset conditions**
		sys_bus_i <= readBus(3);
		wait for assert_hold;
		assert (sys_bus_o_2.dat = x"00")
		report "ID07: Test reset DUT_1 - expecting sys_bus_o_2.dat = x00" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(4);
		wait for assert_hold;
		assert (sys_bus_o_2.dat = x"00")
		report "ID08: Test reset DUT_1 - expecting sys_bus_o_2.dat = x00" severity error;
		wait for post_hold;
		sys_bus_i <= gnd_sbus_i;

		wait for 5 * clk_period;

		--**Test signal processing**
		--Enable DUT_2 
		wait for clk_period;

		--Test positive movement
		channel_b_2.dat <= '0';
		channel_a_2.dat <= '0';
		--Simulate impulses in CCW direction
		for j in 0 to 4 loop
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2 * clk_period;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2 * clk_period;
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2 * clk_period;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2 * clk_period;
		end loop;
		--Read data
		sys_bus_i       <= readBus(3);
		wait for assert_hold;
		assert (sys_bus_o_2.dat = x"0A")
		report "ID09: Test DUT_2 CCW operation - expecting sys_bus_o_2.dat = x0A" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(4);
		wait for assert_hold;
		assert (sys_bus_o_2.dat = x"00")
		report "ID10: Test DUT_2 CCW operation - expecting sys_bus_o_2.dat = x00" severity error;
		wait for post_hold;

		wait for 5 * clk_period;

		--Test negative movement
		channel_a_2.dat <= '0';
		channel_b_2.dat <= '1';
		wait for clk_period;
		--Simulate impulses in CW direction
		for j in 0 to 4 loop
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2 * clk_period;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2 * clk_period;
			channel_a_2.dat <= not channel_a_2.dat;
			wait for 2 * clk_period;
			channel_b_2.dat <= not channel_b_2.dat;
			wait for 2 * clk_period;
		end loop;
		--Read data
		sys_bus_i       <= readBus(3);
		wait for assert_hold;
		assert (sys_bus_o_2.dat = x"00")
		report "ID11: Test DUT_2 CW operation - expecting sys_bus_o_2.dat = x00" severity error;
		wait for post_hold;

		sys_bus_i <= readBus(4);
		wait for assert_hold;
		assert (sys_bus_o_2.dat = x"00")
		report "ID12: Test DUT_2 CW operation - expecting sys_bus_o_2.dat = x00" severity error;
		wait for post_hold;

		std.env.finish;

	end process;
	-----------------------------------------------------------------------------------------------

end TB;
