-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Custom data types for Goldi_FPGA_CORE proyect
-- Module Name:		GOLDI_BUS_STANDARD
-- Project Name:	GOLDi_FPGA_CORE
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
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Include standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use work.GOLDI_MODULE_CONFIG.all;



package GOLDI_COMM_STANDARD is
	--*********************************************************************************************
    --Internal communication data structures
    subtype address_word is std_logic_vector(BUS_ADDRESS_WIDTH-1 downto 0);
    subtype data_word is std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
    type data_word_vector is array (natural range <>) of data_word;


	--*********************************************************************************************
	--**BUS**
	--Slave Interface Data structures
	type sbus_in is record
		we	:	std_logic;
		adr	:	address_word;
		dat	:	data_word;
	end record;
	
	type sbus_out is record
		dat :	data_word;
		val :	std_logic;
	end record;
	
	--Master Interface Data Structures
	alias mbus_in is sbus_out;
	alias mbus_out is sbus_in;


	--*********************************************************************************************
	--Functions
	function getMemoryLength(a : natural) return natural;
	function assignMemory(data : std_logic_vector) return data_word_vector;

end package;



package body GOLDI_COMM_STANDARD is

	--!
	function getMemoryLength(a : natural) return natural is
		variable quotient	:	natural;
		variable rest		:	natural;
	begin
		quotient :=  a/SYSTEM_DATA_WIDTH;
		rest := a mod SYSTEM_DATA_WIDTH;

		if(rest /= 0) then
			quotient := quotient + 1;
		end if;

		return quotient;
	end getMemoryLength;


	--! 
	function assignMemory(data : std_logic_vector) return data_word_vector is
		constant memory_length 	: 	natural := getMemoryLength(data'length);
		variable memory			:	data_word_vector(memory_length-1 downto 0);
	begin
		for i in 0 to memory_length-1 loop
			if(i = memory_length-1) then
				memory(i) := (SYSTEM_DATA_WIDTH-1 downto data'left+1 => '0') & 
							 data(data'left downto i*SYSTEM_DATA_WIDTH);
			else
				memory(i) := data(((i+1)*SYSTEM_DATA_WIDTH)-1 downto (i*SYSTEM_DATA_WIDTH));
			end if;
		end loop;

		return memory;
	end assignMemory;


end package body GOLDI_COMM_STANDARD;