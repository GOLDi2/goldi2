library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;

--! Functionality simulation
entity HIGH_DEBOUNCE_TB is
end entity HIGH_DEBOUNCE_TB;

--! General architecture
architecture TB of HIGH_DEBOUNCE_TB is

    --****DUT****
    component HIGH_DEBOUNCE
        generic(
            g_stages     : natural;
            g_clk_factor : natural
        );
        port(
            clk         : in  std_logic;
            rst         : in  std_logic;
            p_io_raw    : in  std_logic;
            p_io_stable : out std_logic
        );
    end component;

    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period : time      := 20 ns;
    signal reset        : std_logic := '0';
    signal clock        : std_logic := '0';
    --DUT IOs
    signal p_io_raw     : std_logic := '0';
    signal p_io_stable  : std_logic := '0';

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : HIGH_DEBOUNCE
        generic map(
            g_stages     => 4,
            g_clk_factor => 10
        )
        port map(
            clk         => clock,
            rst         => reset,
            p_io_raw    => p_io_raw,
            p_io_stable => p_io_stable
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
        --**Initial Setup**
        wait for init_hold;

        --**Test reset contidions**
        wait for assert_hold;
        assert (p_io_stable = '0')
        report "ID01: Test reset - expecting io_stable = '0'" severity error;
        wait for post_hold;

        --**Test reaction to high input**
        p_io_raw <= '1';
        wait for assert_hold;
        assert (p_io_stable = '1')
        report "ID02: Test input high - expecting io_stable = '1'" severity error;
        wait for post_hold;

        wait for 5 * clk_period;

        --**Test glitching reaction**
        for i in 0 to 3 loop
            p_io_raw <= not p_io_raw;
            wait for assert_hold;
            assert (p_io_stable = '1')
            report "ID03: Test glitching - expecting io_stable = '1'" severity error;
            wait for post_hold;
        end loop;
        p_io_raw <= '0';

        wait for 50 * clk_period;

        --**Test hold input**
        p_io_raw <= '1';
        wait for clk_period;
        p_io_raw <= '0';
        wait for clk_period / 2;
        for i in 1 to 40 loop
            assert (p_io_stable = '1')
            report "ID04: Test input hold - expecting io_stable = '1' [" & integer'image(i) & "]"
            severity error;
            wait for clk_period;
        end loop;

        assert (p_io_stable = '0')
        report "ID05: Test input hold - expecting io_stable = '0'" severity error;
        wait for post_hold;

        --**End simulation**
        wait for 50 ns;
        report "HIGH_DEBOUNCE_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------

end TB;
