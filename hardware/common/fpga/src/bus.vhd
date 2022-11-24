library IEEE;
use IEEE.Std_Logic_1164.all;

package GoldiBus is
    constant ADDRESS_WIDTH : Positive range 8 to 64 := 8;
    constant WORD_WIDTH    : Positive range 8 to 64 := 8;

    type SlaveInType is record
        write_enable : std_logic;

        address      : std_logic_vector(ADDRESS_WIDTH - 1 downto 0);
        write_data   : std_logic_vector(WORD_WIDTH - 1 downto 0);
    end record;
    
    type SlaveOutType is record
        read_data   : std_logic_vector(WORD_WIDTH - 1 downto 0);
    end record;
end GoldiBus;
