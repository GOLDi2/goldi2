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
-------------------------------------------------------------------------------
--! Include standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;



package GOLDI_BUS_STANDARD is

	--System constants
	constant BUS_ADDRESS_WIDTH	:	natural := 7;
	constant BUS_DATA_WIDTH		:	natural := 8;

	--Data structures
	type bus_in is record
		we	:	std_logic;
		adr	:	std_logic_vector(BUS_ADDRESS_WIDTH-1 downto 0);
		dat	:	std_logic_vector(BUS_DATA_WIDTH-1 downto 0);
	end record;
	
	type bus_out is record
		dat :	std_logic_vector(BUS_DATA_WIDTH-1 downto 0);
		err	:	std_logic;
	end record;
	


end package;