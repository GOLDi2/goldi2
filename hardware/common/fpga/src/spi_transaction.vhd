library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;
use ieee.numeric_std_unsigned.all;

entity spi_transaction is
    port(
        clk            : in  std_logic;
        rst            : in  std_logic;
        --
        cs             : in  std_logic;
        frame_received : in  std_logic;
        din            : in  std_logic_vector(7 downto 0);
        dout           : out std_logic_vector(7 downto 0);
        --
        bus_do         : in  std_logic_vector(7 downto 0);
        bus_di         : out std_logic_vector(7 downto 0);
        bus_we         : out std_logic;
        bus_addr       : out std_logic_vector(7 downto 0)
    );
end entity spi_transaction;

architecture RTL of spi_transaction is
    signal initialized : std_logic;
begin
    bus_di <= din;
    dout <= bus_do;
    
    process(clk, rst) is
    begin
        if rst = '1' then
            initialized <= '0';
            bus_addr <= (others=>'0');
        elsif rising_edge(clk) then
            if cs = '1' then
                if frame_received = '1' then
                    if initialized = '0' then
                        bus_we<='0';
                        bus_addr <= din;
                    else
                        bus_we<='1';
                    end if;
                    initialized <= '1';
                else
                    if bus_we = '1' then
                        bus_addr <= bus_addr+1;
                    end if;
                    bus_we<='0';
                end if;
            else
                bus_addr   <= (others=>'0');
                initialized <= '0';
            end if;
        end if;
    end process;
end architecture RTL;
