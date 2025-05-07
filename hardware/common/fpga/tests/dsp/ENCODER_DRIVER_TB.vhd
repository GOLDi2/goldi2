library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;

entity ENCODER_TB is
end entity ENCODER_TB;

architecture TB of ENCODER_TB is
    --Simulation timing
    constant clk_period : time                          := 20 ns;
    signal reset        : std_logic                     := '0';
    signal clock        : std_logic                     := '0';
    -- DUT IOs
    signal p_enc_count  : std_logic_vector(15 downto 0) := (others => '0');
    signal p_channel_a  : std_logic                     := '0';
    signal p_channel_b  : std_logic                     := '0';

begin

    --****COMPONENTS****
    -----------------------------------------------------------------------------------------------
    DUT : entity work.ENCODER
        generic map(
            g_invert_dir       => false,
            g_enc_internal_bit => 16
        )
        port map(
            clk         => clock,
            rst         => reset,
            p_channel_a => p_channel_a,
            p_channel_b => p_channel_b,
            p_enc_count => p_enc_count
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

        --**Test idle state**
        wait for assert_hold;
        assert (p_enc_count = (p_enc_count'range => '0'))
        report "ID01: Test reset - expecting enc_count = x00"
        severity error;
        wait for post_hold;

        --**Test signal processing**
        --Test positive movement
        p_channel_a <= '0';
        p_channel_b <= '1';
        wait for clk_period;
        --Simulate impulses in CCW direction
        for i in 0 to 4 loop
            p_channel_a <= not p_channel_a;
            wait for 2 * clk_period;
            p_channel_b <= not p_channel_b;
            wait for 2 * clk_period;
            p_channel_a <= not p_channel_a;
            wait for 2 * clk_period;
            p_channel_b <= not p_channel_b;
            wait for 2 * clk_period;
        end loop;

        wait for assert_hold;
        assert (p_enc_count = x"000A")
        report "ID03: Test CCW operation - expecting enc_count = x0A"
        severity error;
        wait for post_hold;

        wait for 5 * clk_period;

        --Test negative movement
        p_channel_a <= '0';
        p_channel_b <= '0';
        wait for clk_period;
        --Simulate impulses in CCW direction
        for i in 0 to 4 loop
            p_channel_a <= not p_channel_a;
            wait for 2 * clk_period;
            p_channel_b <= not p_channel_b;
            wait for 2 * clk_period;
            p_channel_a <= not p_channel_a;
            wait for 2 * clk_period;
            p_channel_b <= not p_channel_b;
            wait for 2 * clk_period;
        end loop;

        wait for assert_hold;
        assert (p_enc_count = x"0000")
        report "ID04: Test CCW operation - expecting enc_count = x00"
        severity error;
        wait for post_hold;

        std.env.finish;
    end process;
    -----------------------------------------------------------------------------------------------

end architecture;
