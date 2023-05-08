-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Default crossbar configuration for High-bay warehouse 
-- Module Name:		GOLDI_CROSSBAR_DEFAULT
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDRD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_MODULE_CONFIG.all;




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
    constant block_layout   :   boolean := false;

    --Layout of right side port of crossbar. Assignment of multiple 
    --right side port lines to the same left side port line will provoque an operation error.
    constant DEFAULT_CROSSBAR_LAYOUT :   cb_right_port_ram(PHYSICAL_PIN_NUMBER-1 downto 0) :=
    (
        0  => x"00",
        1  => x"01",
        2  => x"02",
        3  => x"03",
        4  => x"04",
        5  => x"05",
        6  => x"06",
        7  => x"07",
        8  => x"08",
        9  => x"09",
        10 => x"0A",
        11 => x"0B",
        12 => x"0C",
        13 => x"0D",
        14 => x"0E",
        15 => x"0F",
        16 => x"10",
        17 => x"11",
        18 => x"12",
        19 => x"13",
        20 => x"14",
        21 => x"15",
        22 => x"16",
        23 => x"17",
        24 => x"18",
        25 => x"19",
        26 => x"1A",
        27 => x"1B",
        28 => x"1C",
        29 => x"1D",
        30 => x"1E",
        31 => x"1F",
        32 => x"20",
        33 => x"21",
        34 => x"22",
        35 => x"23",
        36 => x"24",
        37 => x"25",
        38 => x"26",
        39 => x"27",
        40 => x"28"
    );
    -----------------------------------------------------------------------------------------------
    

end package GOLDI_CROSSBAR_DEFAULT;