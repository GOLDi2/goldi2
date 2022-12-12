-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Custom data types for Goldi_FPGA_CORE proyect
-- Module Name:		GOLDI_DATA_TYPES
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



--! @brief
--! @details
--!
package GOLDI_DATA_TYPES is	
	--*********************************************************************************************
	--Data arrays
	type word_8_bit_array  	is array (natural range <>) of std_logic_vector(7 downto 0);
	type word_16_bit_array 	is array (natural range <>) of std_logic_vector(15 downto 0);
	type word_20_bit_array 	is array (natural range <>) of std_logic_vector(19 downto 0);
	type natural_array		is array (natural range <>) of natural;
	type boolean_array		is arraY (natural range <>) of boolean;
	
	
	--*********************************************************************************************
	--Data structures	
	--! io input signals
	type io_i is record
		dat		:	std_logic;
	end record;
	
	--! io output signals
	type io_o is record
		enb		:	std_logic;
		dat		:	std_logic;
		z_enb	:	std_logic;
	end record;	
	
	--*********************************************************************************************
	--Register table data types
	type reg_type is (R,W,BI);
	type reg_type_array is array (natural range <>) of reg_type;

	
	
end package GOLDI_DATA_TYPES;