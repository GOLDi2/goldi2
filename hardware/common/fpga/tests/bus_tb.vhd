library ieee;
use ieee.std_logic_1164.all;

use work.GoldiBus.all;

entity bus_tb is
end bus_tb;

architecture behaviour of bus_tb is
    constant period : time := 50 ns;
    signal master_in : SlaveOutType;
    signal master_out: SlaveOutType;
begin
    driver1 : process
    begin
        -- Reset
        master_in.read_data <= (others => '0');
        wait for period;
        master_in.read_data <= (others => '1');
        wait;
    end process driver1;
    
    driver2 : process
    begin
        -- Reset
        master_in.read_data <= (others => '1');
        wait for period;
        master_in.read_data <= (others => '0');
        wait;
    end process driver2;
    
end architecture behaviour;
