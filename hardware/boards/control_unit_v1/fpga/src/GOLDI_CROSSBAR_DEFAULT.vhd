-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		00/00/2023
-- Design Name:		Crossbar default configuration -
-- Module Name:		GOLDI_CROSSBAR_DEFAULT
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--
-- Revisions:
-- Revision V0.00.00 - File Created
-- Additional Comments: First commitment
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




package GOLDI_CROSSBAR_DEFAULT is

    --****CROSBAR DATA STURCTURES****
	-----------------------------------------------------------------------------------------------
	type cb_left_port_ram is array(natural range <>) of unsigned(BUS_ADDRESS_WIDTH-1 downto 0);
	type cb_right_port_ram is array(natural range <>) of unsigned(SYSTEM_DATA_WIDTH-1 downto 0);
	-----------------------------------------------------------------------------------------------
    

    
    --****CONSTANT DEFINITION***
    -----------------------------------------------------------------------------------------------
    --Block dynamic changes to crossbar in design.
    --The default layout will be used as the routing map
    constant block_layout   :   boolean := false;


    --Crossbar bank reduction constants
    --Rigth side of bank crossbar
    constant R_BANK_SIZE    :   natural := 8;
    --Left side of the bandk crossbar
    constant L_BANK_SIZE    :   natural := 10;


    --Layout of right side port of crossbar. Assignment of multiple 
    --right side port lines to the same left side port line will provoque an operation error.
    constant DEFAULT_CROSSBAR_LAYOUT :   cb_right_port_ram(R_BANK_SIZE-1 downto 0) :=
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
    -----------------------------------------------------------------------------------------------


end package GOLDI_CROSSBAR_DEFAULT;