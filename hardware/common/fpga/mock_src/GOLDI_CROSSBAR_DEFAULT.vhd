-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Default Crossbar Configuration for axis_porta_v1 Model
-- Module Name:		GOLDI_CROSSBAR_DEFAULT
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_MODULE_CONFIG.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




package GOLDI_CROSSBAR_DEFAULT is

    --****Crossbar Data Structures****
	-----------------------------------------------------------------------------------------------
	type cb_left_port_ram  is array(natural range <>) of unsigned(BUS_ADDRESS_WIDTH-1 downto 0);
	type cb_right_port_ram is array(natural range <>) of unsigned(SYSTEM_DATA_WIDTH-1 downto 0);
	-----------------------------------------------------------------------------------------------


    --****Constants***
    -----------------------------------------------------------------------------------------------
    --Block dynamic changes to crossbar in design.
    --The default layout will be used as the routing map
    constant block_layout   :   boolean := true;
    
    
    --Layout of right side port of crossbar. Assignment of multiple 
    --right side port lines to the same left side port line will provoque an operation error.
    constant DEFAULT_CROSSBAR_LAYOUT :   cb_right_port_ram(3 downto 0) :=
    (
        0 => x"00",
        1 => x"01",
        2 => x"02",
        3 => x"03"
    );
    -----------------------------------------------------------------------------------------------

end package;