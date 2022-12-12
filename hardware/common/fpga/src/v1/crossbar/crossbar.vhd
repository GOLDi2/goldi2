library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

package crossbar is
    type uport_out is record
        output : std_ulogic;
        enable : std_ulogic;
    end record;
    type uport_out_vector is array (natural range <>) of uport_out;
    
    type uport_in is record
        input: std_ulogic;
    end record;
    type uport_in_vector is array (natural range <>) of uport_in;
    
    subtype uconfig_word is std_ulogic_vector(7 downto 0);
    type uconfig_word_vector  is array (natural range <>) of uconfig_word;
    
    function equality (a: uconfig_word_vector; b: uconfig_word) return std_logic_vector;
    function weighted_reduce(a : uport_in_vector; w: std_logic_vector) return uport_in;
end package crossbar;

package body crossbar is
    function equality (a: uconfig_word_vector; b: uconfig_word) return std_logic_vector is
        variable ret: std_logic_vector(a'length-1 downto 0) := (others=>'0');
    begin
        for i in a'range loop
            ret(i) := '1' when a(i) = b else '0';
        end loop;
        return ret;
    end equality;
    
    function weighted_reduce(a : uport_in_vector; w: std_logic_vector) return uport_in is
        variable input: std_ulogic := '0';
    begin
        if (a'length = 1) then
            return a(a'low);
        else
            for i in a'range loop
                input := input or (a(i).input and w(i));
            end loop;
            return (
                input => input
            );
        end if;
    end weighted_reduce;
end package body crossbar;
