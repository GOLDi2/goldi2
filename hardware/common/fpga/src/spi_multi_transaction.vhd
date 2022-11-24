library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;
use ieee.numeric_std_unsigned.all;

entity spi_multi_transaction is
    port(
        clk            : in  std_logic;
        rst            : in  std_logic;
        --
        cs             : in  std_logic_vector(1 downto 0);
        frame_received : in  std_logic;
        din            : in  std_logic_vector(7 downto 0);
        dout           : out std_logic_vector(7 downto 0);
        --
        bus_do         : in  std_logic_vector(7 downto 0);
        bus_di         : out std_logic_vector(7 downto 0);
        bus_we         : out std_logic;
        bus_addr       : out std_logic_vector(8 downto 0)
    );
end entity spi_multi_transaction;

architecture RTL of spi_multi_transaction is
    component spi_transaction
        port(
            clk            : in  std_logic;
            rst            : in  std_logic;
            cs             : in  std_logic;
            frame_received : in  std_logic;
            din            : in  std_logic_vector(7 downto 0);
            dout           : out std_logic_vector(7 downto 0);
            bus_do         : in  std_logic_vector(7 downto 0);
            bus_di         : out std_logic_vector(7 downto 0);
            bus_we         : out std_logic;
            bus_addr       : out std_logic_vector(7 downto 0)
        );
    end component spi_transaction;

    type muxed_std_logic is array (1 downto 0) of std_logic;
    type muxed_std_logic_vector is array (1 downto 0) of std_logic_vector(7 downto 0);
    signal muxed_bus_we   : muxed_std_logic;
    signal muxed_bus_addr : muxed_std_logic_vector;

    signal mux   : std_logic_vector(0 downto 0);
    signal valid : std_logic;
begin
    bus_di <= din;
    dout   <= bus_do;

    valid <= cs(0) xor cs(1);
    mux   <= "1" when cs(1) = '1' else "0";

    bus_we               <= muxed_bus_we(to_integer(mux)) when valid else '0';
    bus_addr(7 downto 0) <= muxed_bus_addr(to_integer(mux)) when valid else (others => '0');
    bus_addr(8 downto 8) <= mux when valid else (others => '0');

    transaction : for i in 0 to 1 generate
        t : component spi_transaction
            port map(
                clk            => clk,
                rst            => rst,
                cs             => cs(i),
                frame_received => frame_received,
                din            => din,
                dout           => open,
                bus_do         => (others => '0'),
                bus_di         => open,
                bus_we         => muxed_bus_we(i),
                bus_addr       => muxed_bus_addr(i)
            );
    end generate transaction;
end architecture RTL;
