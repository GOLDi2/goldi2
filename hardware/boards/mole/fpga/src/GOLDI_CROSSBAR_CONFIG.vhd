library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_CROSSBAR_STANDARD.all;
use work.GOLDI_MODULE_CONFIG.all;




package GOLDI_CROSSBAR_CONFIG is   

    
    --****CONSTANT DEFINITION***
    -----------------------------------------------------------------------------------------------
    --Crossbar bank reduction constants
    --Rigth side of bank crossbar
    constant R_BANK_SIZE    :   natural := 8;
    --Left side of the bandk crossbar
    constant L_BANK_SIZE    :   natural := 10;


    --Layout of right side port of crossbar. Assignment of multiple 
    --left side port lines to the same right side port line will provoque an operation error.
    constant DEFAULT_R_CROSSBAR_LAYOUT  :   cb_right_port_ram(R_BANK_SIZE-1 downto 0) :=
    (
        0   => x"00",
        1   => x"01",
        2   => x"02",
        3   => x"03",
        4   => x"04",
        5   => x"05",
        6   => x"06",
        7   => x"07"
    );

    --Layout of left side port of crossbar. (inverted matrix + additional pin routing)
    constant DEFAULT_L_CROSSBAR_LAYOUT  :   cb_left_port_ram(L_BANK_SIZE-1 downto 0) := 
    (
        0   => to_unsigned(0,BUS_ADDRESS_WIDTH),
        1   => to_unsigned(1,BUS_ADDRESS_WIDTH),
        2   => to_unsigned(2,BUS_ADDRESS_WIDTH),
        3   => to_unsigned(3,BUS_ADDRESS_WIDTH),
        4   => to_unsigned(4,BUS_ADDRESS_WIDTH),
        5   => to_unsigned(5,BUS_ADDRESS_WIDTH),
        6   => to_unsigned(6,BUS_ADDRESS_WIDTH),
        7   => to_unsigned(7,BUS_ADDRESS_WIDTH),
        8   => to_unsigned(0,BUS_ADDRESS_WIDTH),
        9   => to_unsigned(0,BUS_ADDRESS_WIDTH)
    );
    -----------------------------------------------------------------------------------------------


end package GOLDI_CROSSBAR_CONFIG;