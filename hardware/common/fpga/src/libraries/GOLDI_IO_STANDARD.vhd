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
--
-- Revision V4.00.00 - Simplification of package
-- Additional Comments: Functions deleted due to lack of use
-------------------------------------------------------------------------------
--! Include standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




package GOLDI_IO_STANDARD is	


	--****IO Data Structures****
	-----------------------------------------------------------------------------------------------
	--IO signals for use in the GOLDi system. The io_i and io_o types provide a standard 
	--interface for signals that are used in combination with tri-state buffers or the FPGA 
	--pins. The structures allow "in", "out", and "inout" signals to be routed accross the 
	--device and enables the GOLDi submodules to be statically and dynamicaly routed accross 
	--the FPGA pins without changes to the pin contstraints.
	
	--IO input type. Signal is considered an input when the FPGA pin is in 'Z' state, when the
	--FPGA pin is used as an output the io_i takes the value driven at the pin as the input value.
	type io_i is record
		dat		:	std_logic;
	end record;
	
	--IO output type. Type consists of an enable and a data signal that drive a tri-state buffer.
	--The FPGA pin is considered in 'Z' state when the "enb" signal is low and an output when the
	--"enb" signal is high.
	type io_o is record
		enb		:	std_logic;
		dat		:	std_logic;
	end record;	
	-----------------------------------------------------------------------------------------------



	--****ARRAY STRUCTURES****
	-----------------------------------------------------------------------------------------------
	type io_i_vector is array(natural range <>) of io_i;
	type io_o_vector is array(natural range <>) of io_o;
	-----------------------------------------------------------------------------------------------



	--****CONSTANTS****
	-----------------------------------------------------------------------------------------------
	constant gnd_io_i 		: 	io_i := (dat => '0');
	constant low_io_i		:	io_i := (dat => '0');
	constant high_io_i		:	io_i := (dat => '1');
	constant gnd_io_o 		: 	io_o := (enb => '0', dat => '0');
	constant low_io_o		:	io_o := (enb => '1', dat => '0');
	constant high_io_o		:	io_o := (enb => '1', dat => '1');
	-----------------------------------------------------------------------------------------------


end package GOLDI_IO_STANDARD;