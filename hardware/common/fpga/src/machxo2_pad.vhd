library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

library machxo2;

entity machxo2_pad is
    port(
        port_out : in  work.crossbar.uport_out;
        port_in  : out work.crossbar.uport_in;
        output : out std_logic
    );
end entity machxo2_pad;

architecture RTL of machxo2_pad is
    signal input : std_logic;
begin
    pad : machxo2.components.BB
        port map(
            B => output,
            I => port_out.output,
            T => not port_out.enable,
            O => input
        );
    
    port_in <= (input=>input);
end architecture RTL;
