library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;
use work.GOLDI_COMM_STANDARD.all;

--! Functionality testbench
entity REGISTER_TABLE_TB is
end entity REGISTER_TABLE_TB;

--! Simulation architecture
architecture TB of REGISTER_TABLE_TB is
	--****INTERNAL SIGNALS****
	--Simulation timing
	constant clk_period  : time                                                 := 20 ns;
	signal reset         : std_logic                                            := '0';
	signal clock         : std_logic                                            := '0';
	--DUT IOs
	constant reg_default : data_word_vector(2 downto 0)                         := (
		std_logic_vector(to_unsigned(255, SYSTEM_DATA_WIDTH)),
		std_logic_vector(to_unsigned(240, SYSTEM_DATA_WIDTH)),
		std_logic_vector(to_unsigned(15, SYSTEM_DATA_WIDTH)));
	signal sys_bus_i     : sbus_in                                              := gnd_sbus_i;
	signal sys_bus_o     : sbus_out                                             := gnd_sbus_o;
	signal p_data_in     : data_word_vector(2 downto 0)                         := (others => (others => '0'));
	signal p_data_out    : data_word_vector(2 downto 0)                         := (others => (others => '0'));
	signal p_read_stb    : std_logic_vector(2 downto 0)                         := (others => '0');
	signal p_write_stb   : std_logic_vector(2 downto 0)                         := (others => '0');
	--Testbench
	constant data_buff   : std_logic_vector(3 * SYSTEM_DATA_WIDTH - 1 downto 0) := std_logic_vector(to_unsigned(3, SYSTEM_DATA_WIDTH)) & std_logic_vector(to_unsigned(2, SYSTEM_DATA_WIDTH)) & std_logic_vector(to_unsigned(1, SYSTEM_DATA_WIDTH));

begin

	--****COMPONENT****
	-----------------------------------------------------------------------------------------------
	DUT : entity work.REGISTER_TABLE(RTL)
		generic map(
			g_address    => 1,
			g_reg_number => 3,
			g_def_values => reg_default
		)
		port map(
			clk         => clock,
			rst         => reset,
			sys_bus_i   => sys_bus_i,
			sys_bus_o   => sys_bus_o,
			p_data_in   => p_data_in,
			p_data_out  => p_data_out,
			p_read_stb  => p_read_stb,
			p_write_stb => p_write_stb
		);
	-----------------------------------------------------------------------------------------------

	--****SIMULATION TIMING****
	-----------------------------------------------------------------------------------------------
	clock <= not clock after clk_period / 2;
	reset <= '1' after 10 ns, '0' after 30 ns;
	-----------------------------------------------------------------------------------------------

	--****TEST****
	-----------------------------------------------------------------------------------------------
	TEST : process
		--Timing
		constant init_hold   : time := 5 * clk_period / 2;
		constant assert_hold : time := 3 * clk_period / 2;
		constant post_hold   : time := 1 * clk_period / 2;
	begin
		--**Initial setup**
		wait for init_hold;

		--**Test reset conditions**
		wait for assert_hold;
		assert (p_data_out(0) = std_logic_vector(to_unsigned(15, SYSTEM_DATA_WIDTH)))
		report "ID01: Test reset - expecting p_data_out(0) = x0F" severity error;
		assert (p_data_out(1) = std_logic_vector(to_unsigned(240, SYSTEM_DATA_WIDTH)))
		report "ID02: Test reset - expecting p_data_out(1) = xF0" severity error;
		assert (p_data_out(2) = std_logic_vector(to_unsigned(255, SYSTEM_DATA_WIDTH)))
		report "ID03: Test reset - expecting p_data_out(2) = xFF" severity error;
		assert (p_read_stb = (p_read_stb'range => '0'))
		report "ID04: Test reset - expecting p_read_stb = 000" severity error;
		assert (p_write_stb = (p_write_stb'range => '0'))
		report "ID05: Test reset - expecting p_write_stb = 000" severity error;
		assert (sys_bus_o = gnd_sbus_o)
		report "ID06: Test bus write - expecting sys_bus_o = gnd_sbus_o" severity error;
		wait for post_hold;

		wait for 5 * clk_period;

		--**Test read bus**
		p_data_in <= setMemory(data_buff);
		wait for clk_period;
		for i in 1 to 3 loop
			--Load address, write enable and data
			sys_bus_i.we  <= '0';
			sys_bus_i.adr <= std_logic_vector(to_unsigned(i, BUS_ADDRESS_WIDTH));
			sys_bus_i.dat <= std_logic_vector(to_unsigned(1, SYSTEM_DATA_WIDTH));

			wait for assert_hold;
			assert (sys_bus_o.dat = std_logic_vector(to_unsigned(i, SYSTEM_DATA_WIDTH)))
			report "ID07: Test bus read - expecting sys_bus_o.dat = " & integer'image(i)
			severity error;
			assert (sys_bus_o.mux = '1')
			report "ID08: Test bus read - expecting sys_bus_o.mux = '1'"
			severity error;
			assert (p_read_stb = (p_read_stb'range => '0'))
			report "ID09: Test bus read - expecting p_read_stb = '0'"
			severity error;
			wait for post_hold;

			sys_bus_i <= readBus(i);
			wait for assert_hold;
			assert (sys_bus_o.dat = std_logic_vector(to_unsigned(i, SYSTEM_DATA_WIDTH)))
			report "ID10: Test bus read - expecting sys_bus_o.dat = " & integer'image(i)
			severity error;
			assert (sys_bus_o.mux = '1')
			report "ID11: Test bus read - expecting sys_bus_o.mux = '1'"
			severity error;
			assert (p_read_stb(i - 1) = '1')
			report "ID12: Test bus read - expecting p_read_stb(" & integer'image(i - 1) & ") = '1'"
			severity error;
			wait for post_hold;
			sys_bus_i <= gnd_sbus_i;

		end loop;

		wait for 5 * clk_period;

		--**Test write bus**
		for i in 1 to 3 loop
			--Load address, write enable and data
			sys_bus_i.we  <= '1';
			sys_bus_i.adr <= std_logic_vector(to_unsigned(1, BUS_ADDRESS_WIDTH));
			sys_bus_i.dat <= std_logic_vector(to_unsigned(10, SYSTEM_DATA_WIDTH));

			wait for assert_hold;
			assert (p_data_out(i - 1) = reg_default(i - 1))
			report "ID13: Test bus write - expecting p_data_out(i) = reg_default(i)"
			severity error;
			assert (p_write_stb = (p_write_stb'range => '0'))
			report "ID14: Test bus write - expecting p_write_stb = '0'"
			severity error;
			wait for post_hold;

			sys_bus_i <= writeBus(i, 10);
			wait for assert_hold;
			assert (sys_bus_o.dat = (sys_bus_o.dat'range => '0'))
			report "ID15: Test bus write - expecting sys_bus_o.dat = x00"
			severity error;
			assert (p_data_out(i - 1) = std_logic_vector(to_unsigned(10, SYSTEM_DATA_WIDTH)))
			report "ID16: Test bus write - expecting p_data_out(" & integer'image(i - 1) & ") = x0A"
			severity error;
			assert (p_write_stb(i - 1) = '1')
			report "ID17: Test bus write - expecting p_write_stb(" & integer'image(i - 1) & ") = '1'"
			severity error;
			wait for post_hold;
			sys_bus_i <= gnd_sbus_i;

		end loop;

		--**End simulation**
		wait for 50 ns;
		report "REGISTER_TABLE_TB - testbench completed";
		--Simulation end usign vhdl2008 env library (Pipeline use)
		std.env.finish;
		--Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
		-- run_sim <= '0';
		-- wait;

	end process;
	-----------------------------------------------------------------------------------------------

end TB;
