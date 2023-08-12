-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Custom IO data types for GOLDi_FPGA_SRC project
-- Module Name:		GOLDI_IO_STANDARD
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
--! Include standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




package GOLDI_IO_STANDARD is	
	
	--****IO Data Structures****
	-----------------------------------------------------------------------------------------------
	--IO signals for use in the GOLDi system. The io_i and io_o types provide a standard interface 
	--for signals that are used in combination with tri-state buffers or the FPGA pins. The types 
	--allow "in", "out", and "inout" signals to be routed accross and enables the GOLDi submodules 
	--to be statically and dynamicaly routed accross the FPGA pins without changes to the pin 
	--contstraints.
	
	--IO input type. Signal is considered an input when the FPGA pin is in 'Z' state, when the
	--FPGA pin is used as an output the signal inputs the value driven at the pin.
	type io_i is record
		dat		:	std_logic;
	end record;
	
	--IO output type. Type consists of an enable and a data signal that drive a tri-state buffer.
	--The FPGA pin is considered in 'Z'-state when the "enb" signal is low and an output when the
	--"enb" signal is high.
	type io_o is record
		enb		:	std_logic;
		dat		:	std_logic;
	end record;	


	--Array structures
	type io_i_vector is array(natural range <>) of io_i;
	type io_o_vector is array(natural range <>) of io_o;


	--Constant values
	constant gnd_io_i 		: 	io_i := (dat => '0');
	constant gnd_io_o 		: 	io_o := (enb => '0', dat => '0');
	constant low_io_o		:	io_o := (enb => '1', dat => '0');
	constant high_io_o		:	io_o := (enb => '1', dat => '1');
	-----------------------------------------------------------------------------------------------



	--****Functions****
	-----------------------------------------------------------------------------------------------	
	function getIOInData(io : io_i_vector) return std_logic_vector;
	function getIOOutData(io : io_o_vector) return std_logic_vector;
	-----------------------------------------------------------------------------------------------

end package GOLDI_IO_STANDARD;




package body GOLDI_IO_STANDARD is

	--! @brief Convert IO input vector to std_logic_vector
	--! @details
	--! Convert a IO in vector to an std_logic vector to recover the data 
	function getIOInData(io : io_i_vector) return std_logic_vector is
		variable data	:	std_logic_vector(io'range);
	begin
		for i in io'range loop
			data(i) := io(i).dat;
 		end loop;

		return data;
	end getIOInData;


	--! @brief Convert IO output vector to std_logic_vector
	--! @details
	--! Convert a IO out vector to an std_logic vector to recover the data
	function getIOOutData(io : io_o_vector) return std_logic_vector is
		variable data	:	std_logic_vector(io'range);
	begin
		for i in io'range loop
			data(i) := io(i).dat;
		end loop;

		return data;
  	end getIOOutData;


end package body GOLDI_IO_STANDARD;