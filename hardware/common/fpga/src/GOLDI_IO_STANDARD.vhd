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
--! Use assert libarry 
use std.standard.all;


--! @brief
--! @details
--!
package GOLDI_IO_STANDARD is	
	--*********************************************************************************************
	--Data arrays
	type word_8_bit_array  	is array (natural range <>) of std_logic_vector(7 downto 0);
	type word_16_bit_array 	is array (natural range <>) of std_logic_vector(15 downto 0);
	type word_20_bit_array 	is array (natural range <>) of std_logic_vector(19 downto 0);
	type natural_array		is array (natural range <>) of natural;
	type boolean_array		is arraY (natural range <>) of boolean;
	
	
	--*********************************************************************************************
	--Data structures	
	--IO fpga system input signals
	type io_i is record
		dat		:	std_logic;
	end record;
	
	--IO fpga system output signals
	type io_o is record
		enb		:	std_logic;
		dat		:	std_logic;
	end record;	

	--Packaging record for assignment simplification
	type std_io is record
		input	:	io_i;
		output  :	io_o;
	end record;
	
	constant gnd_io_i : io_i := (dat => '0');
	constant gnd_io_o : io_o := (enb => '0', dat => '0');


	--Array structures
	type io_i_vector is array (natural range <>) of io_i;
	type io_o_vector is array (natural range <>) of io_o;
	type std_io_vector is array (natural range <>) of std_io;


	--Functions
	function getInVector(io : std_io_vector) return io_i_vector;
	function getOutVector(io : std_io_vector) return io_o_vector;
	function setInVector(sc : io_i_vector; tg : std_io_vector) return std_io_vector;
	function setOutVector(sc : io_o_vector; tg : std_io_vector) return std_io_vector;

end package GOLDI_IO_STANDARD;



package body GOLDI_IO_STANDARD is

	--!
	function getInVector(io : std_io_vector) return io_i_vector is
		variable io_vector 	:	io_i_vector(io'range);
	begin
		for i in 0 to io'length-1 loop
			io_vector(i) := io(i).input;
		end loop;

		return io_vector;
	end getInVector;


	--!
	function getOutVector(io : std_io_vector) return io_o_vector is
		variable io_vector	:	io_o_vector(io'range);
  	begin
		for i in 0 to io'length-1 loop
			io_vector(i) := io(i).output;
		end loop;
		
		return io_vector;
	end getOutVector;


	--! 
	function setInVector(sc : io_i_vector; tg : std_io_vector) return std_io_vector is
		variable io_vector	:	std_io_vector(tg'range);
 	begin
		assert(sc'length = tg'length) report "Unequal vector ranges" severity error;
		for i in 0 to tg'length loop
			io_vector(i).input  := sc(i);
			io_vector(i).output := tg(i).output; 
		end loop;

		return io_vector;
	end setInVector;


	--!
	function setOutVector(sc : io_o_vector; tg : std_io_vector) return std_io_vector is
		variable io_vector	:	std_io_vector(tg'range);
 	begin
		assert(sc'length = tg'length) report "Unequal vector ranges" severity error;
		for i in 0 to tg'length loop
			io_vector(i).input  := tg(i).input;
			io_vector(i).output := sc(i); 
		end loop;

		return io_vector;
	end setOutVector;

	
end package body GOLDI_IO_STANDARD;