library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

use work.all;

entity spi_gbus_bridge_synchronized is
    port(
        clk     : in  std_ulogic;
        rst     : in  std_ulogic;
        --
        mosi    : in  std_ulogic;
        miso    : out std_ulogic;
        sck     : in  std_ulogic;
        cs      : in  std_ulogic;
        --
        bus_in  : in  GBus.master_in;
        bus_out : out GBus.umaster_out
    );
end entity spi_gbus_bridge_synchronized;

architecture RTL of spi_gbus_bridge_synchronized is
    signal mosi_sync : std_ulogic;
    signal sck_sync  : std_ulogic;
    signal cs_sync   : std_ulogic;
begin
    synchronizer_array_inst : entity work.synchronizer_array
        generic map(
            stages           => 2,
            synchronizer_cnt => 3
        )
        port map(
            clk     => clk,
            rst     => rst,
            bit(0)  => mosi,
            bit(1)  => sck,
            bit(2)  => cs,
            sync(0) => mosi_sync,
            sync(1) => sck_sync,
            sync(2) => cs_sync
        );

    spi_gbus_bridge_inst : entity work.spi_gbus_bridge
        port map(
            clk     => clk,
            rst     => rst,
            mosi    => mosi_sync,
            miso    => miso,
            sck     => sck_sync,
            cs      => cs_sync,
            bus_in  => bus_in,
            bus_out => bus_out
        );

end architecture RTL;
