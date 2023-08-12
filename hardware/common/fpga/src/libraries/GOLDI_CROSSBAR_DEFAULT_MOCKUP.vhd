-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Crossbar data types and constants for testing
-- Module Name:		GOLDI_CROSSBAR_DEFAULT (MOCKUP)
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies:    -> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V3.00.00 - Library modified to tamplate
-- Additional Comments: "MOCKUP" denomination added to avoid multiple 
--                      versions of the file when simulating CROSSBAR
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




package GOLDI_CROSSBAR_DEFAULT_MOCKUP is

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
    constant RIGHT_SIZE    :   natural := 3;
    --Left side of the bandk crossbar
    constant LEFT_SIZE    :   natural := 6;


    --Layout of right side port of crossbar. Assignment of multiple 
    --right side port lines to the same left side port line will provoque an operation error.
    constant DEFAULT_CROSSBAR_LAYOUT :   cb_right_port_ram(RIGHT_SIZE-1 downto 0) :=
    (
        0   => x"00",
        1   => x"01",
        2   => x"02"
    );
    -----------------------------------------------------------------------------------------------


end package GOLDI_CROSSBAR_DEFAULT_MOCKUP;