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

    --****Crossbar Data Structures****
	-----------------------------------------------------------------------------------------------
	type cb_left_port_ram is array(natural range <>) of unsigned(BUS_ADDRESS_WIDTH-1 downto 0);
	type cb_right_port_ram is array(natural range <>) of unsigned(SYSTEM_DATA_WIDTH-1 downto 0);
	-----------------------------------------------------------------------------------------------


    --****Constants***
    -----------------------------------------------------------------------------------------------
    --Block dynamic changes to crossbar in design.
    --The default layout will be used as the routing map
    constant block_layout   :   boolean := true;
    
    
    --Layout of right side port of crossbar. Assignment of multiple 
    --right side port lines to the same left side port line will provoque an operation error.
    constant DEFAULT_CROSSBAR_LAYOUT :   cb_right_port_ram(4 downto 0) :=
    (
        0 => x"00",
        1 => x"01",
        2 => x"02",
        3 => x"03"
    );
    -----------------------------------------------------------------------------------------------

end package;