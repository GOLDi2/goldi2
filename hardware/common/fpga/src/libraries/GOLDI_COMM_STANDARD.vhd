-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Custom communication data types for Goldi_FPGA_CORE project
-- Module Name:		GOLDI_BUS_STANDARD
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_MODULE_CONFIG.vhd
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
--! Use custom library
library work;
use work.GOLDI_MODULE_CONFIG.all;



package GOLDI_COMM_STANDARD is
	
	--****Internal Communication Data Structures****
	-----------------------------------------------------------------------------------------------
    subtype address_word 	is std_logic_vector(BUS_ADDRESS_WIDTH-1 downto 0);
    subtype data_word 		is std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);

	type data_word_vector 	is array (natural range <>) of data_word;
	-----------------------------------------------------------------------------------------------



	--****BUS****
	-----------------------------------------------------------------------------------------------
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


	--BUS vectors
	type sbus_i_vector is array(natural range <>) of sbus_in;
	type sbus_o_vector is array(natural range <>) of sbus_out;


	--BUS constants
	constant gnd_mbus_o		:	mbus_out :=
	(
		we  => '0',
		adr => (others => '0'),
		dat => (others => '0')
	);

	constant gnd_sbus_i		:	sbus_in := 
	(
		we  => '0', 
		adr => (others => '0'), 
		dat => (others =>'0')
	);

	constant gnd_sbus_o		:	sbus_out :=
	(
		dat => (others => '0'),
		val => '0'
	);
	-----------------------------------------------------------------------------------------------
	
	
	
	--****Functions****
	-----------------------------------------------------------------------------------------------
	--function dataVectorToStdVector(vector : data_word_vector) return std_logic_vector;
	function getMemoryLength(a : natural) return natural;
	function assignMemory(data : std_logic_vector) return data_word_vector;
	function reduceBusVector(bus_vector : sbus_o_vector) return sbus_out;
	-----------------------------------------------------------------------------------------------

end package;



package body GOLDI_COMM_STANDARD is

	--
	-- function dataVectorToStdVector(vector : data_word_vector) return std_logic_vector is
	-- 	variable vector_buff	:	std_logic_vector((vector'length*SYSTEM_DATA_WIDTH)-1 downto 0);
	-- begin
	-- 	for i in 0 to vector'length-1 loop
	-- 		vector_buff((SYSTEM_DATA_WIDTH*(i+1)-1) downto i*SYSTEM_DATA_WIDTH) := vector_buff(i);
	-- 	end loop;

	-- 	return vector_buff;
	-- end dataVectorToStdVector;


	-- Returns the minimum number of registers needed to 
	-- save a vector of size a; based on the SYSTEM_DATA_WIDTH of 
	-- the GOLDI_MODULE_CONFIG package.
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


	-- Returns a data_word_vector corresponding to the minimum number
	-- of register to save "data". The index 0 of the logic_vector is taken
	-- as the lowest index of the register 0 and "data" is assigned in ascending
	-- order.
	function assignMemory(data : std_logic_vector) return data_word_vector is
		constant memory_length 	: 	natural := getMemoryLength(data'length);
		variable memory			:	data_word_vector(memory_length-1 downto 0);
		variable vector_buff	:	std_logic_vector((memory_length*SYSTEM_DATA_WIDTH)-1 downto 0);
	begin
		vector_buff := (others => '0');
		vector_buff(data'range) := data;
		
		for i in 0 to memory_length-1 loop
			memory(i) := vector_buff(((i+1)*SYSTEM_DATA_WIDTH)-1 downto (i*SYSTEM_DATA_WIDTH));
		end loop;

		return memory;
	end assignMemory;


	-- Returns a sbus_out structure corresponding to the addressed register.
	-- Used in synthesis to generate multiplexer for multiple register tables.
	function reduceBusVector(bus_vector : sbus_o_vector) return sbus_out is
		variable index 	:	natural;
  	begin
		for i in 0 to bus_vector'length-1 loop
			if(bus_vector(i).val = '1') then
				index := i;
			end if;
		end loop;

		return bus_vector(index);
	end reduceBusVector;

end package body GOLDI_COMM_STANDARD;