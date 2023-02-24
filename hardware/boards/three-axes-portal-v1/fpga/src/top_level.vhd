library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

library machxo2;
use machxo2.all;

entity top_level is
    port(
        LEDPowerR    : out   std_logic;
        SPI0_MISO    : out   std_logic;
        SPI0_SCLK    : inout std_logic;
        SPI0_MOSI    : inout std_logic;
        SPI0_nCE0    : inout std_logic;
        FPGA_nReset  : inout std_logic;
        --
        OutDCY_B     : out   std_logic;
        EnableDCY    : out   std_logic;
        OutDCY_A     : out   std_logic;
        OutMagnet    : out   std_logic;
        EnableMagnet : out   std_logic;
        OutDCZ_B     : out   std_logic;
        OutDCZ_A     : out   std_logic;
        EnableDCZ    : out   std_logic;
        OutDCX_B     : out   std_logic;
        OutDCX_A     : out   std_logic;
        EnableDCX    : out   std_logic;
        InProximity  : in    std_logic;
        InIncrY_I    : in    std_logic;
        InIncrY_B    : in    std_logic;
        InIncrY_A    : in    std_logic;
        InIncrX_I    : in    std_logic;
        InIncrX_B    : in    std_logic;
        InIncrX_A    : in    std_logic;
        InZBottom    : in    std_logic;
        InZTop       : in    std_logic;
        InYRef       : in    std_logic;
        InYBack      : in    std_logic;
        InYFront     : in    std_logic;
        InXRef       : in    std_logic;
        InXRight     : in    std_logic;
        InXLeft      : in    std_logic
    );
end entity top_level;

architecture RTL of top_level is
    signal rst            : std_logic;
    signal clk            : std_logic;
    signal bus_miso       : work.GBus.umaster_in;
    signal bus_mosi       : work.GBus.umaster_out;
    signal gpio_ports_out : work.crossbar.uport_out_vector(15 downto 0);
    signal gpio_ports_in  : work.crossbar.uport_in_vector(15 downto 0);
    signal ports_in       : work.crossbar.uport_in_vector(15 downto 0);
    signal ports_out      : work.crossbar.uport_out_vector(15 downto 0);

    signal EnableDCX_unsafe: std_logic;
    signal OutDCX_A_unsafe : std_logic;
    signal OutDCX_B_unsafe : std_logic;
    signal EnableDCY_unsafe : std_logic;
    signal OutDCY_A_unsafe : std_logic;
    signal OutDCY_B_unsafe : std_logic;
    signal EnableDCZ_unsafe : std_logic;
    signal OutDCZ_A_unsafe : std_logic;
    signal OutDCZ_B_unsafe : std_logic;
    signal OutMagnet_unsafe : std_logic;
    signal EnableMagnet_unsafe : std_logic;
begin
    LEDPowerR <= '1';
    rst       <= FPGA_nReset;

    protection_inst : entity work.protection
        port map(
            InProximity         => InProximity,
            InIncrY_I           => InIncrY_I,
            InIncrY_B           => InIncrY_B,
            InIncrY_A           => InIncrY_A,
            InIncrX_I           => InIncrX_I,
            InIncrX_B           => InIncrX_B,
            InIncrX_A           => InIncrX_A,
            InZBottom           => InZBottom,
            InZTop              => InZTop,
            InYRef              => InYRef,
            InYBack             => InYBack,
            InYFront            => InYFront,
            InXRef              => InXRef,
            InXRight            => InXRight,
            InXLeft             => InXLeft,
            EnableDCX           => EnableDCX,
            OutDCX_A            => OutDCX_A,
            OutDCX_B            => OutDCX_B,
            EnableDCY           => EnableDCY,
            OutDCY_A            => OutDCY_A,
            OutDCY_B            => OutDCY_B,
            EnableDCZ           => EnableDCZ,
            OutDCZ_A            => OutDCZ_A,
            OutDCZ_B            => OutDCZ_B,
            OutMagnet           => OutMagnet,
            EnableMagnet        => EnableMagnet,
            EnableDCX_unsafe    => EnableDCX_unsafe,
            OutDCX_A_unsafe     => OutDCX_A_unsafe,
            OutDCX_B_unsafe     => OutDCX_B_unsafe,
            EnableDCY_unsafe    => EnableDCY_unsafe,
            OutDCY_A_unsafe     => OutDCY_A_unsafe,
            OutDCY_B_unsafe     => OutDCY_B_unsafe,
            EnableDCZ_unsafe    => EnableDCZ_unsafe,
            OutDCZ_A_unsafe     => OutDCZ_A_unsafe,
            OutDCZ_B_unsafe     => OutDCZ_B_unsafe,
            OutMagnet_unsafe    => OutMagnet_unsafe,
            EnableMagnet_unsafe => EnableMagnet_unsafe
        );
    
    EnableDCX_unsafe <= '1';
    EnableDCY_unsafe <= '1';
    EnableDCZ_unsafe <= '1';
    OutDCX_A_unsafe <= ports_out(0).output and ports_out(0).enable;
    OutDCX_B_unsafe <= ports_out(1).output and ports_out(1).enable;
    OutDCY_A_unsafe <= ports_out(2).output and ports_out(2).enable;
    OutDCY_B_unsafe <= ports_out(3).output and ports_out(3).enable;
    OutDCZ_A_unsafe <= ports_out(4).output and ports_out(4).enable;
    OutDCZ_B_unsafe <= ports_out(5).output and ports_out(5).enable;
    OutMagnet_unsafe <= ports_out(6).output and ports_out(6).enable;
    EnableMagnet_unsafe <= ports_out(6).output and ports_out(6).enable;

    ports_in(8) <= (input=> InXRight);
    ports_in(9) <= (input=> InXLeft);
    ports_in(10) <= (input=> InYBack);
    ports_in(11) <= (input=> InYFront);
    ports_in(12) <= (input=> InZBottom);
    ports_in(13) <= (input=> InZTop);
    ports_in(14) <= (input=> InProximity);

    --clk <= ClockFPGA;
    OSCInst0 : component machxo2.components.OSCH
        generic map(
            NOM_FREQ => "133.00"
        )
        port map(
            STDBY    => '0',
            OSC      => clk,
            SEDSTDBY => open
        );

    spi0 : entity work.spi_gbus_bridge_synchronized
        port map(
            clk     => clk,
            rst     => rst,
            mosi    => SPI0_MOSI,
            miso    => SPI0_MISO,
            sck     => SPI0_SCLK,
            cs      => not SPI0_nCE0,
            bus_in  => bus_miso,
            bus_out => bus_mosi
        );

    gpio_module_array_inst : entity work.gpio_module_array
        generic map(
            address    => 0,
            module_cnt => 4
        )
        port map(
            clk      => clk,
            rst      => rst,
            bus_in   => bus_mosi,
            bus_out  => bus_miso,
            port_out => gpio_ports_out,
            port_in  => gpio_ports_in
        );

    crossbar_switch_inst : entity work.crossbar_switch
        generic map(
            left_side_port_cnt  => 16,
            right_side_port_cnt => 16
        )
        port map(
            config          => work.crossbar_config.config,
            left_ports_out  => gpio_ports_out,
            right_ports_out => ports_out,
            left_ports_in   => gpio_ports_in,
            right_ports_in  => ports_in
        );


end architecture RTL;
