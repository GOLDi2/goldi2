-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Custom io data types for Goldi_FPGA_CORE proyect
-- Module Name:		GOLDI_IO_STANDARD
-- Project Name:	GOLDi_FPGA_SRC
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
-- Additional Comments: Release for Axis Portal V1 (AP1)
-------------------------------------------------------------------------------
--! Include standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




package GOLDI_IO_STANDARD is	
	
	--****IO Data Structures****
	-----------------------------------------------------------------------------------------------
	--IO fpga system input signals
	type io_i is record
		dat		:	std_logic;
	end record;
	
	--IO fpga system output signals
	type io_o is record
		enb		:	std_logic;
		dat		:	std_logic;
	end record;	


	--Array structures
	type io_i_vector is array(natural range <>) of io_i;
	type io_o_vector is array(natural range <>) of io_o;


	--Constant values
	constant gnd_io_i : io_i := (dat => '0');
	constant gnd_io_o : io_o := (enb => '0', dat => '0');
	-----------------------------------------------------------------------------------------------



	--****Functions****
	-----------------------------------------------------------------------------------------------	
	function getIOInData(io : io_i_vector) return std_logic_vector;
	function getIOOutData(io : io_o_vector) return std_logic_vector;
	-----------------------------------------------------------------------------------------------

end package GOLDI_IO_STANDARD;




package body GOLDI_IO_STANDARD is


	function getIOInData(io : io_i_vector) return std_logic_vector is
		variable data	:	std_logic_vector(io'range);
	begin
		for i in io'range loop
			data(i) := io(i).dat;
 		end loop;

		return data;
	end getIOInData;


	
	function getIOOutData(io : io_o_vector) return std_logic_vector is
		variable data	:	std_logic_vector(io'range);
	begin
		for i in io'range loop
			data(i) := io(i).dat;
		end loop;

		return data;
  	end getIOOutData;


end package body GOLDI_IO_STANDARD;