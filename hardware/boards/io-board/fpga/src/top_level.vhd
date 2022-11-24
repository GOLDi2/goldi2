library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

library machxo2;
use machxo2.all;


library common;
use common.decoder_types.all;

entity top_level is
    port(
        LEDPowerR   : out   std_logic;
        SPI0_MISO   : out   std_logic;
        SPI0_SCLK   : inout std_logic;
        SPI0_MOSI   : inout std_logic;
        SPI0_nCE0   : inout std_logic;
        FPGA_nReset : inout std_logic;
        IO          : inout std_logic_vector(63 downto 0)
    );
end entity top_level;

architecture RTL of top_level is
    signal rst : std_logic;
    signal clk : std_logic;

    signal SPI0_MOSI_sync : std_logic;
    signal SPI0_SCLK_sync : std_logic;
    signal SPI0_CE0_sync  : std_logic;

    signal spi0_frame_received : std_logic;
    signal spi0_din            : std_logic_vector(7 downto 0);
    signal spi0_dout           : std_logic_vector(7 downto 0);

    signal bus0_do       : std_logic_vector(7 downto 0);
    signal bus0_di       : std_logic_vector(7 downto 0);
    signal bus0_we       : std_logic;
    signal bus0_addr     : std_logic_vector(8 downto 0);
    signal bus0_do_fanin : data_array(0 to 1);

    signal io_internal       : std_logic_vector(63 downto 0);
    signal io_internal_drive : std_logic_vector(63 downto 0);
begin
    tristate2 : for i in 0 to 63 generate
        IO(i) <= 'Z' when io_internal_drive(i) = '0' else io_internal(i);
    end generate;

    LEDPowerR <= '1';

    rst_syncronizer : entity common.syncronzier
        generic map(
            stages => 2
        )
        port map(
            clk  => clk,
            rst  => not FPGA_nReset,
            bit  => not FPGA_nReset,
            sync => rst
        );

    SPI0_MOSI_syncronizer : entity common.syncronzier
        generic map(
            stages => 2
        )
        port map(
            clk  => clk,
            rst  => rst,
            bit  => SPI0_MOSI,
            sync => SPI0_MOSI_sync
        );

    SPI0_SCLK_syncronzier : entity common.syncronzier
        generic map(
            stages => 2
        )
        port map(
            clk  => clk,
            rst  => rst,
            bit  => SPI0_SCLK,
            sync => SPI0_SCLK_sync
        );

    SPI0_nCE0_syncronizer : entity common.syncronzier
        generic map(
            stages => 2
        )
        port map(
            clk  => clk,
            rst  => rst,
            bit  => not SPI0_nCE0,
            sync => SPI0_CE0_sync
        );

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

    spi0 : entity common.spi_slave
        port map(
            clk            => clk,
            rst            => rst or not ('0' or SPI0_CE0_sync),
            mosi           => SPI0_MOSI_sync,
            miso           => SPI0_MISO,
            sck            => SPI0_SCLK_sync,
            frame_received => spi0_frame_received,
            din            => spi0_din,
            dout           => spi0_dout
        );

    spi0_transaction : entity common.spi_multi_transaction
        port map(
            clk            => clk,
            rst            => rst,
            cs             => '0' & SPI0_CE0_sync,
            frame_received => spi0_frame_received,
            din            => spi0_dout,
            dout           => spi0_din,
            bus_do         => bus0_do,
            bus_di         => bus0_di,
            bus_we         => bus0_we,
            bus_addr       => bus0_addr
        );

    bus0_fanin : entity common.bus_fan_in
        generic map(
            addresses     => ((1, 22), (24, 24)),
            address_width => 9
        )
        port map(
            address      => bus0_addr,
            bus_do       => bus0_do,
            bus_do_fanin => bus0_do_fanin
        );

    io_controller0 : entity common.io_controller
        generic map(
            address => 1,
            ports   => 8
        )
        port map(
            clk                => clk,
            rst                => rst,
            bus_do             => bus0_do_fanin(0),
            bus_di             => bus0_di,
            bus_we             => bus0_we,
            bus_addr           => bus0_addr,
            inp(63 downto 0)   => IO(63 downto 0),
            outp(63 downto 0)  => io_internal,
            drive(63 downto 0) => io_internal_drive
        );
end architecture RTL;
