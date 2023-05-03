LIBRARY ieee; 
USE ieee.std_logic_1164.all; 

entity OSCH is
    GENERIC (
        NOM_FREQ : String := "2.08"
    );
    PORT (
        STDBY : in std_logic := 'X';
        OSC : out std_logic := '0';
        SEDSTDBY : out std_logic
    );
end entity OSCH;

architecture behaviour of OSCH is
begin
    OSC <= (not OSC) after 10 ns;
end architecture behaviour;