library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

use work.all;

entity crossbar_switch is
    generic(
        left_side_port_cnt  : positive range 1 to 256;
        right_side_port_cnt : positive
    );
    port(
        config          :     crossbar.uconfig_word_vector(0 to right_side_port_cnt - 1);
        --
        left_ports_out  : in  crossbar.uport_out_vector(0 to left_side_port_cnt - 1);
        right_ports_out : out crossbar.uport_out_vector(0 to right_side_port_cnt - 1);
        left_ports_in   : out crossbar.uport_in_vector(0 to left_side_port_cnt - 1);
        right_ports_in  : in  crossbar.uport_in_vector(0 to right_side_port_cnt - 1)
    );
end entity crossbar_switch;

architecture RTL of crossbar_switch is
begin
    generate_out : for i in 0 to right_side_port_cnt - 1 generate
        right_ports_out(i)                             <= left_ports_out(to_integer(unsigned(config(i))));
    end generate generate_out;

    generate_in : for i in 0 to left_side_port_cnt - 1 generate
        left_ports_in(i) <= work.crossbar.weighted_reduce(right_ports_in, work.crossbar.equality(config, work.crossbar.uconfig_word(to_unsigned(i, 8))));
    end generate generate_in;

end architecture RTL;
