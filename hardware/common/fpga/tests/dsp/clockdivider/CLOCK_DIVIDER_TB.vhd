library IEEE;
use IEEE.std_logic_1164.all;
use std.env.all;

entity CLOCK_DIVIDER_TB is
end entity CLOCK_DIVIDER_TB;

--! Simulation architecture
architecture TB of CLOCK_DIVIDER_TB is
    --Simulation timing
    constant clk_period     : time      := 25 ns;
    signal rst              : std_logic := '0';
    signal clk              : std_logic := '0';
    --DUT IOs
    signal p_clk_enb_out_1  : std_logic := '0';
    signal p_clk_enb_out_2  : std_logic := '0';
    signal p_clk_enb_out_3  : std_logic := '0';
    signal p_clk_enb_out_4  : std_logic := '0';
    signal p_clk_enb_out_10 : std_logic := '0';
begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT_1 : entity work.Clock_Divider
        generic map(
            gDivideFactor => 1
        )
        port map(
            clk         => clk,
            reset       => rst,
            clk_enb_out => p_clk_enb_out_1
        );

    DUT_2 : entity work.Clock_Divider
        generic map(
            gDivideFactor => 2
        )
        port map(
            clk         => clk,
            reset       => rst,
            clk_enb_out => p_clk_enb_out_2
        );

    DUT_3 : entity work.Clock_Divider
        generic map(
            gDivideFactor => 3
        )
        port map(
            clk         => clk,
            reset       => rst,
            clk_enb_out => p_clk_enb_out_3
        );

    DUT_4 : entity work.Clock_Divider
        generic map(
            gDivideFactor => 4
        )
        port map(
            clk         => clk,
            reset       => rst,
            clk_enb_out => p_clk_enb_out_4
        );

    DUT_10 : entity work.Clock_Divider
        generic map(
            gDivideFactor => 10
        )
        port map(
            clk         => clk,
            reset       => rst,
            clk_enb_out => p_clk_enb_out_10
        );

    --****SIMULATION TIMING****
    clk <= not clk after clk_period / 2;
    rst <= '1' after 10 ns, '0' after 30 ns;

    TEST_1 : process
    begin
        wait for 2 * clk_period;
        for i in 1 to 20 / 1 + 1 loop
            assert p_clk_enb_out_1 = '1';
            wait for clk_period;
        end loop;
    end process;

    TEST_2 : process
    begin
        wait for 2 * clk_period;
        for i in 1 to 20 / 2 + 1 loop
            for j in 1 to 1 loop
                assert p_clk_enb_out_2 = '0';
                wait for clk_period;
            end loop;
            assert p_clk_enb_out_2 = '1';
            wait for clk_period;
        end loop;
    end process;

    TEST_3 : process
    begin
        wait for 2 * clk_period;
        for i in 1 to 20 / 3 + 1 loop
            for j in 1 to 2 loop
                assert p_clk_enb_out_3 = '0';
                wait for clk_period;
            end loop;
            assert p_clk_enb_out_3 = '1';
            wait for clk_period;
        end loop;
    end process;

    TEST_4 : process
    begin
        wait for 2 * clk_period;
        for i in 1 to 20 / 4 + 1 loop
            for j in 1 to 3 loop
                assert p_clk_enb_out_4 = '0';
                wait for clk_period;
            end loop;
            assert p_clk_enb_out_4 = '1';
            wait for clk_period;
        end loop;
    end process;

    TEST_10 : process
    begin
        wait for 2 * clk_period;
        for i in 1 to 2 loop
            for j in 1 to 9 loop
                assert p_clk_enb_out_10 = '0';
                wait for clk_period;
            end loop;
            assert p_clk_enb_out_10 = '1';
            wait for clk_period;
        end loop;

        std.env.finish;
    end process;

end architecture;
