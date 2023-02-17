--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom libraires
library work;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;



package GOLDI_CROSSBAR_DEFAULT is

    constant DEFAULT_CROSSBAR_LAYOUT :   cb_right_port_ram(2 downto 0) :=
    (
        0 => x"00",
        1 => x"01",
        2 => x"02"
    );


end package;