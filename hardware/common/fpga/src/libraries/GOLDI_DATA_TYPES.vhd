-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		GOLDi data types for complex structures 
-- Module Name:		GOLDI_DATA_TYPES.vhd
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
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




package GOLDI_DATA_TYPES is

    --****TMC2660 ROM MEMORY - SLICE USE****
	-----------------------------------------------------------------------------------------------
    type tmc2660_rom is array(natural range <>) of std_logic_vector(23 downto 0);
	-----------------------------------------------------------------------------------------------



    --****VIRTUAL SENSOR ARRAY LIMITS****
    -----------------------------------------------------------------------------------------------
    type sensor_limit is array(1 downto 0) of integer;
    type sensor_limit_array is array(natural range <>) of sensor_limit;
    -----------------------------------------------------------------------------------------------

end package GOLDI_DATA_TYPES;