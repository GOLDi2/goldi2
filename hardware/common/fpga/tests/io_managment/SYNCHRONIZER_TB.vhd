library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;

--! Functionality testbench
entity SYNCHRONIZER_TB is
end entity SYNCHRONIZER_TB;

--! Simulation architecture
architecture TB of SYNCHRONIZER_TB is

    --****DUT****
    component SYNCHRONIZER
        generic(
            g_stages : natural := 2
        );
        port(
            clk       : in  std_logic;
            rst       : in  std_logic;
            p_io_i    : in  std_logic;
            p_io_sync : out std_logic
        );
    end component;

    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period : time                         := 20 ns;
    signal reset        : std_logic                    := '0';
    signal clock        : std_logic                    := '0';
    --DUT IOs
    signal p_io_i       : std_logic                    := '0';
    signal p_io_sync    : std_logic                    := '0';
    signal data_in      : std_logic_vector(3 downto 0) := (others => '0');
    signal data_out     : std_logic_vector(3 downto 0) := (others => '0');

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : SYNCHRONIZER
        generic map(
            g_stages => 2
        )
        port map(
            clk       => clock,
            rst       => reset,
            p_io_i    => p_io_i,
            p_io_sync => p_io_sync
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
        constant assert_hold : time := 1 * clk_period / 2;
        constant post_hold   : time := 1 * clk_period / 2;
    begin
        --Preset data
        data_in  <= x"A";
        data_out <= (others => '0');
        p_io_i   <= '0';
        wait for init_hold;

        --**Test reset conditions**
        wait for assert_hold;
        assert (p_io_sync = '0')
        report "ID01: Test reset - expecting io_sync = '0'" severity error;
        wait for post_hold;

        --**Test operation**
        for i in 0 to 3 loop
            p_io_i      <= data_in(i);
            wait for 3 * clk_period;
            data_out(i) <= p_io_sync;
        end loop;

        wait for assert_hold;
        assert (data_in = data_out)
        report "ID02: Test operation - expecting data_in = data_out" severity error;
        wait for post_hold;

        --**End simulation**
        wait for 50 ns;
        report "SYNCHRONIZER_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------

end TB;
