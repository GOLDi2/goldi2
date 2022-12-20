-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/12/2022
-- Design Name:		Custom data types for Goldi_FPGA_CORE proyect
-- Module Name:		GOLDI_BUS_STANDARD
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V2.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Include standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;



package GOLDI_COMM_STANDARD is

	--System constants
	constant BUS_ADDRESS_WIDTH	:	natural range 7 to 63 := 7;
	constant SYSTEM_DATA_WIDTH	:	natural range 8 to 64 := 8;


    --Internal data structures
    subtype address_word is std_logic_vector(BUS_ADDRESS_WIDTH-1 downto 0);
    subtype data_word is std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
    type data_word_vector is array (natural range <>) of data_word;



	--BUS Data structures
	type bus_in is record
		we	:	std_logic;
		adr	:	address_word;
		dat	:	data_word;
	end record;
	
	type bus_out is record
		dat :	data_word;
	end record;
	


end package;