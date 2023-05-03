LIBRARY ieee; 
USE ieee.std_logic_1164.all; 

entity BB is
    PORT(
        B:  INOUT std_logic := 'X';
        I:  IN std_logic := 'X';
        T:  IN std_logic := 'X';
        O:  OUT std_logic);
end entity BB;

architecture behaviour of BB is
begin
    O <= B and I and T;
end architecture behaviour;
