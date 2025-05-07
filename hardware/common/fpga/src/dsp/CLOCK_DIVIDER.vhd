library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.numeric_std.ALL;

entity Clock_Divider is

    generic(
        gDivideFactor : natural := 100
    );

    port(
        clk, reset  : in  std_logic;
        clk_enb_out : out std_logic);
end Clock_Divider;

architecture bhv of Clock_Divider is

    signal count : integer range 0 to gDivideFactor - 1 := 0;
    signal tmp   : std_logic                            := '0';

begin

    clk_enb_out <= '1' when gDivideFactor = 1 else tmp;

    process(clk, reset)
    begin
        if (reset = '1') then
            count <= 0;
            tmp   <= '0';
        elsif (rising_edge(clk)) then
            if (count = gDivideFactor - 1) then
                tmp   <= '1';
                count <= 0;
            else
                tmp   <= '0';
                count <= count + 1;
            end if;
        end if;
    end process;

end bhv;
