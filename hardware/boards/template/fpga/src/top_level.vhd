library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

library machxo2;
use machxo2.all;

entity top_level is
    port(
        SPI0_MISO   : out   std_logic;
        SPI0_SCLK   : inout std_logic;
        SPI0_MOSI   : inout std_logic;
        SPI0_nCE0   : inout std_logic;
        FPGA_nReset : inout std_logic
    );
end entity top_level;

architecture RTL of top_level is
    signal rst : std_logic;
    signal clk : std_logic;
    signal bus_miso : work.GBus.umaster_in;
    signal bus_mosi : work.GBus.umaster_out;
begin
    rst <= not FPGA_nReset;

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
        ) ;
end architecture RTL;
