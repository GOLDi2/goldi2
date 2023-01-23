-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		System constants for individual module
-- Module Name:		GOLDI_MODULE_CONFIG
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;



package GOLDI_MODULE_CONFIG is
    --System constants
	constant BUS_ADDRESS_WIDTH	    :	natural range 7 to 63 := 7;
	constant SYSTEM_DATA_WIDTH	    :	natural range 8 to 64 := 8;

    --Module pins
    constant PHYSICAL_PIN_NUMBER   	:   natural range 1 to (2**BUS_ADDRESS_WIDTH)-3 := 3;
    constant VIRTUAL_PIN_NUMBER    	:   natural range 1 to (2**SYSTEM_DATA_WIDTH)-1 := 6;
    
	--Crossbar data types
	type phy_io_layout is array(0 to PHYSICAL_PIN_NUMBER-1) of unsigned(SYSTEM_DATA_WIDTH-1 downto 0);
    type vir_io_layout is array(0 to VIRTUAL_PIN_NUMBER-1) of unsigned(BUS_ADDRESS_WIDTH-1 downto 0);
	
    constant DEFAULT_IO_LAYOUT      :   phy_io_layout :=
        (0 => x"00",
         1 => x"01",
         2 => x"02");
  
end package;
