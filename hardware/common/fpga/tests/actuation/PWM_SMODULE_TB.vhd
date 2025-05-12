library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;

--! Functionality Simulation
entity PWM_SMODULE_TB is
end entity PWM_SMODULE_TB;

--! Simulation architecture
architecture TB of PWM_SMODULE_TB is

    --****DUT****
    component PWM_SMODULE
        generic(
            g_address  : integer := 1;
            g_sys_freq : natural := 100000000;
            g_pwm_freq : natural := 5000
        );
        port(
            clk          : in  std_logic;
            rst          : in  std_logic;
            sys_bus_i    : in  sbus_in;
            sys_bus_o    : out sbus_out;
            p_pwm_output : out io_o
        );
    end component;

    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_frequency : integer   := 50000000;
    constant clk_period    : time      := 20 ns;
    signal reset           : std_logic := '0';
    signal clock           : std_logic := '0';
    --DUT IOs
    signal sys_bus_i       : sbus_in   := gnd_sbus_i;
    signal sys_bus_o       : sbus_out  := gnd_sbus_o; -- @suppress "Signal sys_bus_o is never read"
    signal p_pwm_output    : io_o      := low_io_o;
    --Testbench
    constant pwm_delay     : integer   := clk_frequency / (255 * 25000);

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : PWM_SMODULE
        generic map(
            g_address  => 1,
            g_sys_freq => clk_frequency,
            g_pwm_freq => 25000
        )
        port map(
            clk          => clock,
            rst          => reset,
            sys_bus_i    => sys_bus_i,
            sys_bus_o    => sys_bus_o,
            p_pwm_output => p_pwm_output
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
        constant assert_hold : time := 5 * clk_period / 2;
        constant post_hold   : time := 1 * clk_period / 2;
    begin
        --**Initial Setup**
        wait for init_hold;

        --**Test PWM = 0/x00**
        sys_bus_i <= writeBus(1, 0);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 1 to 255 loop
            assert (p_pwm_output = ('1', '0'))
            report "ID01: Test PWM=x00 - expecting dat = '0' [" & integer'image(i) & "]"
            severity error;
            wait for clk_period * pwm_delay;
        end loop;
        wait for post_hold;

        wait for 5 * clk_period;

        --**Test PWM = 255/xFF**
        sys_bus_i <= writeBus(1, 255);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 1 to 255 loop
            assert (p_pwm_output = ('1', '1'))
            report "ID02: Test PWM=xFF - expecting dat = '1' [" & integer'image(i) & "]"
            severity error;
            wait for clk_period * pwm_delay;
        end loop;
        wait for post_hold;

        wait for 5 * clk_period;

        --**Test PWM = 128/x80**
        sys_bus_i <= writeBus(1, 128);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 1 to 255 loop
            if (i <= 128) then
                assert (p_pwm_output = ('1', '1'))
                report "ID03: Test PWM=x80 - expecting dat = '1' [" & integer'image(i) & "]"
                severity error;
            else
                assert (p_pwm_output = ('1', '0'))
                report "ID04: Test PWM=x80 - expecting dat = '0' [" & integer'image(i) & "]"
                severity error;
            end if;
            wait for clk_period * pwm_delay;
        end loop;
        wait for post_hold;

        std.env.finish;
    end process;
    -----------------------------------------------------------------------------------------------

end architecture;
