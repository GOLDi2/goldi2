library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;

--! Functionality simulation
entity TMC2660_SMODULE_TB is
end entity TMC2660_SMODULE_TB;

--! Simulation architecture
architecture TB of TMC2660_SMODULE_TB is

    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period   : time      := 25 ns;
    signal reset          : std_logic := '0';
    signal clock          : std_logic := '0';
    signal run_sim        : std_logic := '1';
    --DUT IOs
    signal sys_bus_i      : sbus_in   := gnd_sbus_i;
    signal sys_bus_o      : sbus_out  := gnd_sbus_o;
    signal p_tmc2660_clk  : io_o      := low_io_o;
    signal p_tmc2660_enn  : io_o      := low_io_o;
    signal p_tmc2660_sg   : io_i      := low_io_i;
    signal p_tmc2660_dir  : io_o      := low_io_o;
    signal p_tmc2660_step : io_o      := low_io_o;
    signal p_tmc2660_sclk : io_o      := low_io_o;
    signal p_tmc2660_ncs  : io_o      := low_io_o;
    signal p_tmc2660_mosi : io_o      := low_io_o;

begin
    DUT : entity work.TMC2660_SMODULE
        generic map(
            g_address                  => 0,
            g_sclk_factor              => 10,
            g_tmc2660_config           => (x"0000", x"0000"),
            g_acceleration             => 20,
            g_stepperDivideFactor      => 400,
            g_accelerationDivideFactor => 1
        )
        port map(
            clk            => clock,
            rst            => reset,
            sys_bus_i      => sys_bus_i,
            sys_bus_o      => sys_bus_o,
            p_tmc2660_clk  => p_tmc2660_clk,
            p_tmc2660_enn  => p_tmc2660_enn,
            p_tmc2660_sg   => (dat => '1'),
            p_tmc2660_dir  => p_tmc2660_dir,
            p_tmc2660_step => p_tmc2660_step,
            p_tmc2660_sclk => p_tmc2660_sclk,
            p_tmc2660_ncs  => p_tmc2660_ncs,
            p_tmc2660_mosi => p_tmc2660_mosi,
            p_tmc2660_miso => (dat => '1'),
            p_enc_res      => '0',
            p_enc_a        => (dat => '0'),
            p_enc_b        => (dat => '0')
        );

    clock <= not clock after clk_period / 2;
    reset <= '1' after 10 ns, '0' after 30 ns;

    TEST : process
    begin
        sys_bus_i <= writeBus(1, 255);
        wait for clk_period;
        sys_bus_i <= writeBus(2, 255);
        wait for clk_period;
        sys_bus_i <= writeBus(0, 1);
        wait for clk_period;
        sys_bus_i <= writeBus(0, 0);
        wait for 2 ms;

        std.env.finish;
    end process;

end architecture;
