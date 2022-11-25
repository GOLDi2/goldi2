library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;
use ieee.numeric_std_unsigned.all;

use work.all;

entity spi_gbus_bridge is
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
end entity spi_gbus_bridge;

architecture RTL of spi_gbus_bridge is
    signal frame_received : std_ulogic;
    signal dout           : std_ulogic_vector(7 downto 0);

    signal bus_addr    : std_ulogic_vector(7 downto 0);
    signal bus_we      : std_ulogic;
    signal initialized : std_ulogic;
begin
    bus_out <= GBus.master_writeread("00000000" & bus_addr, dout) when bus_we else GBus.master_read("00000000" & bus_addr);

    spi_slave_inst : entity work.spi_slave
        port map(
            clk            => clk,
            rst            => rst or not cs,
            mosi           => mosi,
            miso           => miso,
            sck            => sck,
            frame_received => frame_received,
            din            => bus_in.read_data,
            dout           => dout
        );

    process(clk, rst) is
    begin
        if rst = '1' then
            initialized <= '0';
            bus_addr    <= (others => '0');
        elsif rising_edge(clk) then
            if cs = '1' then
                if frame_received = '1' then
                    if initialized = '0' then
                        bus_we   <= '0';
                        bus_addr <= dout;
                    else
                        bus_we <= '1';
                    end if;
                    initialized <= '1';
                else
                    if bus_we = '1' then
                        bus_addr <= bus_addr + 1;
                    end if;
                    bus_we <= '0';
                end if;
            else
                bus_addr    <= (others => '0');
                initialized <= '0';
            end if;
        end if;
    end process;
end architecture RTL;
