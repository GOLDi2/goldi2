library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;

--! Functionality simulation
entity EMAGNET_SMODULE_TB is
end entity EMAGNET_SMODULE_TB;

--! Simulation architecture
architecture TB of EMAGNET_SMODULE_TB is

    --****DUT****
    component EMAGNET_SMODULE
        generic(
            g_address         : integer;
            g_magnet_tao      : integer;
            g_pulse_width     : integer;
            g_pulse_reduction : integer
        );
        port(
            clk        : in  std_logic;
            rst        : in  std_logic;
            sys_bus_i  : in  sbus_in;
            sys_bus_o  : out sbus_out;
            p_em_enb   : out io_o;
            p_em_out_1 : out io_o;
            p_em_out_2 : out io_o
        );
    end component;

    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period : time      := 20 ns;
    signal reset        : std_logic := '0';
    signal clock        : std_logic := '0';
    --DUT IOs
    signal sys_bus_i    : sbus_in   := gnd_sbus_i;
    signal sys_bus_o    : sbus_out  := gnd_sbus_o; -- @suppress "Signal sys_bus_o is never read"
    signal p_em_enb     : io_o      := low_io_o;
    signal p_em_out_1   : io_o      := low_io_o;
    signal p_em_out_2   : io_o      := low_io_o;

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : EMAGNET_SMODULE
        generic map(
            g_address         => 1,
            g_magnet_tao      => 1000,
            g_pulse_width     => 5000,
            g_pulse_reduction => 1000
        )
        port map(
            clk        => clock,
            rst        => reset,
            sys_bus_i  => sys_bus_i,
            sys_bus_o  => sys_bus_o,
            p_em_enb   => p_em_enb,
            p_em_out_1 => p_em_out_1,
            p_em_out_2 => p_em_out_2
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
        constant init_hold   : time := 5 * clk_period / 2;
        constant assert_hold : time := 3 * clk_period / 2;
        constant post_hold   : time := 1 * clk_period / 2;
    begin
        --**Initial setup**
        wait for init_hold;

        --**Test reset state**
        wait for assert_hold;
        assert (p_em_enb = ('1', '0'))
        report "ID01: Test reset - expecting p_em_enb = (1,0)" severity error;
        assert (p_em_out_1 = ('1', '0'))
        report "ID02: Test reset - expecting p_em_out_1 = (1,0)" severity error;
        assert (p_em_out_2 = ('1', '0'))
        report "ID03: Test reset - expecting p_em_out_2 = (1,0)" severity error;
        wait for post_hold;

        --**Test power on**
        sys_bus_i <= writeBus(1, 1);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        assert (p_em_enb = ('1', '1'))
        report "ID04: Test power on - expecting p_em_enb = (1,1)" severity error;
        assert (p_em_out_1 = ('1', '1'))
        report "ID05: Test power on - expecting p_em_out_1 = (1,1)" severity error;
        assert (p_em_out_2 = ('1', '0'))
        report "ID06: Test power on - expecting p_em_out_2 = (1,0)" severity error;
        wait for post_hold;

        wait for 5 * clk_period;

        --**Test power off**
        sys_bus_i <= writeBus(1, 0);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 1 to 5 loop

            for j in 1 to 10 loop
                assert (p_em_enb = ('1', '0'))
                report "ID07: Test power off - expecting p_em_enb = (1,0) [" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                assert (p_em_out_1 = ('1', '0'))
                report "ID08: Test power off - expecting p_em_out_1 = (1,0) [" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                assert (p_em_out_2 = ('1', '0'))
                report "ID09: Test power off - expecting p_em_out_2 = (1,0)[" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                wait for 100 * clk_period;
            end loop;

            for j in 1 to (6 - i) loop
                assert (p_em_enb = ('1', '1'))
                report "ID10: Test power off - expecting p_em_enb = (1,1)[" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                assert (p_em_out_1 = ('1', '0'))
                report "ID11: Test power off - expecting p_em_out_1 = (1,0)[" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                assert (p_em_out_2 = ('1', '1'))
                report "ID12: Test power off - expecting p_em_out_2 = (1,1)[" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                wait for 1000 * clk_period;
            end loop;

            for j in 1 to 10 loop
                assert (p_em_enb = ('1', '0'))
                report "ID14: Test power off - expecting p_em_enb = (1,0) [" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                assert (p_em_out_1 = ('1', '0'))
                report "ID15: Test power off - expecting p_em_out_1 = (1,0) [" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                assert (p_em_out_2 = ('1', '0'))
                report "ID16: Test power off - expecting p_em_out_2 = (1,0)[" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                wait for 100 * clk_period;
            end loop;

            for j in 1 to (5 - i) loop
                assert (p_em_enb = ('1', '1'))
                report "ID17: Test power off - expecting p_em_enb = (1,1)[" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                assert (p_em_out_1 = ('1', '1'))
                report "ID18: Test power off - expecting p_em_out_1 = (1,0)[" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                assert (p_em_out_2 = ('1', '0'))
                report "ID19: Test power off - expecting p_em_out_2 = (1,1)[" & integer'image(i) & "," & integer'image(j) & "]"
                severity error;
                wait for 1000 * clk_period;
            end loop;
        end loop;

        --**End simulation**
        wait for 500 ns;
        report "EMAGNET_SMODULE_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------

end architecture;
