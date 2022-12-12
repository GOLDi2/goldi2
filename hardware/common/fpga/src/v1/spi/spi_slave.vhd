library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity spi_slave is
    port(
        clk            : in  std_logic;
        rst            : in  std_logic;
        --
        mosi           : in  std_logic;
        miso           : out std_logic;
        sck            : in  std_logic;
        --
        frame_received : out std_logic;
        din            : in  std_logic_vector(7 downto 0);
        dout           : out std_logic_vector(7 downto 0)
    );
end entity spi_slave;

architecture RTL of spi_slave is
    signal bit_count : integer range 0 to 7;
    signal sck_old   : std_logic;
begin
    process(clk, rst) is
    begin
        if rst = '1' then
            miso           <= '0';
            frame_received <= '0';
            dout           <= (others => '0');
            bit_count      <= 0;
            sck_old        <= '0';
        elsif rising_edge(clk) then
            if sck = '1' and sck_old = '0' then
                dout(7 - bit_count) <= mosi;
                if bit_count = 7 then
                    frame_received <= '1';
                else
                    frame_received <= '0';
                end if;
                bit_count           <= 0 when bit_count = 7 else bit_count + 1;
            else
                frame_received <= '0';
            end if;
            if sck = '0' then
                miso    <= din(7 - bit_count);                
            end if;
            sck_old <= sck;
        end if;
    end process;
end architecture RTL;
