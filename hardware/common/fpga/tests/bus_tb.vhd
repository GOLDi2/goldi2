library ieee;
use ieee.std_logic_1164.all;

use work.GBus;

entity bus_tb is
end bus_tb;

architecture behaviour of bus_tb is
    constant period   : time := 50 ns;
    signal out_signal : GBus.slave_out;
begin
    driver1 : process
    begin
        out_signal <= GBus.slave_idle;
        wait for period;
        out_signal <= GBus.slave_idle;
        wait for period;
        out_signal <= GBus.slave_data("00000001");
        
        wait;
    end process driver1;

    driver2 : process
    begin
        out_signal <= GBus.slave_idle;
        wait for period;
        out_signal <= GBus.slave_data("00000010");
        wait for period;
        out_signal <= GBus.slave_idle;
        wait;
    end process driver2;

    assertion : process
    begin
        wait for period / 2;
        assert out_signal.read_data = "00000000";
        assert out_signal.valid = '0';
        wait for period;
        assert out_signal.read_data = "00000010";
        assert out_signal.valid = '1';
        wait for period;
        assert out_signal.read_data = "00000001";
        assert out_signal.valid = '1';
        
        wait;
    end process assertion;

end architecture behaviour;
