-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		System constants for individual module
-- Module Name:		GOLDI_MODULE_CONFIG
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
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



package GOLDI_MODULE_CONFIG is

    --Module pins
    constant PHYSICAL_PIN_NUMBER   	:   natural range 1 to (2**BUS_ADDRESS_WIDTH)-3 := 66;
    constant VIRTUAL_PIN_NUMBER    	:   natural range 1 to (2**SYSTEM_DATA_WIDTH)-1 := 6;
    
    
    --****TMC2660****
    -----------------------------------------------------------------------------------------------
    constant ROM_DEPTH  :   natural := 5;
    constant ROM_WIDTH  :   natural := 20;
    type rom_type is array(ROM_DEPTH-1 downto 0) of std_logic_vector(ROM_WIDTH-1 downto 0);
    
    constant memory     :   rom_type :=
    (
        x"0000F",
        x"000F0",
        x"00F00",
        x"0F000",
        x"F0000"
    );
    -----------------------------------------------------------------------------------------------


end package;
