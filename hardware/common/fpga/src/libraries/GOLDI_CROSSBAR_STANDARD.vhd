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
--
-- Revision V4.00.00 - Package renaming and restructuring
-- Additional Comments: Package used as a fix imported package and change
--                      of the declared constants to testbench constants.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




package GOLDI_CROSSBAR_STANDARD is

    --****CROSBAR DATA STURCTURES****
	-----------------------------------------------------------------------------------------------
    type cb_left_port_ram  is array(natural range <>) of unsigned(BUS_ADDRESS_WIDTH-1 downto 0);
	type cb_right_port_ram is array(natural range <>) of unsigned(SYSTEM_DATA_WIDTH-1 downto 0);
	-----------------------------------------------------------------------------------------------
    

    
    --****CONSTANT DEFINITION FOR TESTBENCH AND AS TEMPLATE FOR CROSSBAR CONFIGURATION***
    -----------------------------------------------------------------------------------------------
    --Crossbar bank reduction constants
    --Left side of the bandk crossbar
    constant TB_CB_LEFT_SIZE   :   natural := 6;
    --Rigth side of bank crossbar
    constant TB_CB_RIGHT_SIZE  :   natural := 3;

    --Default layout of right side port of the crossbar. Assignment of multiple 
    --right side port lines to the same left side port line will provoque an operation error.
    constant TB_DEFAULT_RIGHT_CB_LAYOUT :   cb_right_port_ram(TB_CB_RIGHT_SIZE-1 downto 0) :=
    (
        0 => x"00",
        1 => x"01",
        2 => x"02"
    );

    --Default layout of the left side port of the crossbar. This is matrix is equivalent
    --to the transposed matrix of the right side and the right input ports for the  
    --disconnected left signals.
    constant TB_DEFAULT_LEFT_CB_LAYOUT  :   cb_left_port_ram(TB_CB_LEFT_SIZE-1 downto 0) := 
    (
        0 => std_logic_vector(to_unsigned(0,BUS_ADDRESS_WIDTH)),
        1 => std_logic_vector(to_unsigned(1,BUS_ADDRESS_WIDTH)),
        2 => std_logic_vector(to_unsigned(2,BUS_ADDRESS_WIDTH)),
        3 => std_logic_vector(to_unsigned(0,BUS_ADDRESS_WIDTH)),
        4 => std_logic_vector(to_unsigned(0,BUS_ADDRESS_WIDTH)),
        5 => std_logic_vector(to_unsigned(0,BUS_ADDRESS_WIDTH)) 
    );
    -----------------------------------------------------------------------------------------------


end package GOLDI_CROSSBAR_STANDARD;