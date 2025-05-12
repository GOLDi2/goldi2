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
		dat : std_logic;
	end record;

	--IO output type. Type consists of an enable and a data signal that drive a tri-state buffer.
	--The FPGA pin is considered in 'Z' state when the "enb" signal is low and an output when the
	--"enb" signal is high.
	type io_o is record
		enb : std_logic;
		dat : std_logic;
	end record;
	-----------------------------------------------------------------------------------------------

	--****ARRAY STRUCTURES****
	-----------------------------------------------------------------------------------------------
	type io_i_vector is array (natural range <>) of io_i;
	type io_o_vector is array (natural range <>) of io_o;
	-----------------------------------------------------------------------------------------------

	--****CONSTANTS****
	-----------------------------------------------------------------------------------------------
	constant gnd_io_i  : io_i := (dat => '0');
	constant low_io_i  : io_i := (dat => '0');
	constant high_io_i : io_i := (dat => '1');
	constant gnd_io_o  : io_o := (enb => '0', dat => '0');
	constant low_io_o  : io_o := (enb => '1', dat => '0');
	constant high_io_o : io_o := (enb => '1', dat => '1');
	-----------------------------------------------------------------------------------------------

end package GOLDI_IO_STANDARD;
