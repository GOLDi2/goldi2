library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity syncronzier is
    generic(
        stages : natural := 2
    );
    port(
        clk  : in  std_logic;
        rst  : in  std_logic;
        bit  : in  std_logic;
        sync : out std_logic
    );
end entity syncronzier;

architecture RTL of syncronzier is
    signal sr : std_logic_vector(stages - 1 downto 0);
begin
    process(clk, rst) is
    begin
        if rst = '1' then
            sr <= (others => '0');
        elsif rising_edge(clk) then
            sr <= sr(stages - 2 downto 0) & bit;
        end if;
    end process;
    sync <= sr(stages - 1);
end architecture RTL;
