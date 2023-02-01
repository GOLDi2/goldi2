library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

package crossbar_config is
    constant config : work.crossbar.uconfig_word_vector(0 to 15) := (
        std_logic_vector(to_unsigned(0,8)),
        std_logic_vector(to_unsigned(1,8)),
        std_logic_vector(to_unsigned(2,8)),
        std_logic_vector(to_unsigned(3,8)),
        std_logic_vector(to_unsigned(4,8)),
        std_logic_vector(to_unsigned(5,8)),
        std_logic_vector(to_unsigned(6,8)),
        std_logic_vector(to_unsigned(7,8)),
        std_logic_vector(to_unsigned(8,8)),
        std_logic_vector(to_unsigned(9,8)),
        std_logic_vector(to_unsigned(10,8)),
        std_logic_vector(to_unsigned(11,8)),
        std_logic_vector(to_unsigned(12,8)),
        std_logic_vector(to_unsigned(13,8)),
        std_logic_vector(to_unsigned(14,8)),
        std_logic_vector(to_unsigned(15,8))
    );
end package crossbar_config;