library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity test_tb is
end test_tb;

architecture behaviour of test_tb is    
    signal bus_do: std_logic_vector(7 downto 0);
    signal address: std_logic_vector(7 downto 0) := (others=>'0');
    signal clk: std_logic := '0';

    signal finished     : boolean := false;
begin
    clock_driver : process
        constant period : time := 10 ns;
    begin
        clk <= '0';
        wait for period / 2;
        clk <= '1';
        wait for period / 2;
        if finished then
            wait;
        end if;
    end process clock_driver;

    test : process
        constant period : time := 10 ns;
    begin
        for i in 0 to 100 loop
            address<=std_logic_vector(to_unsigned(i, 8));
            wait for period / 2;
        end loop;
        finished <= true;
        assert false report "Finished" severity note;
        wait;
    end process test;
    
end architecture behaviour;
