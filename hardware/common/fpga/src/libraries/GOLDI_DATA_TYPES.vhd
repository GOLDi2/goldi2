-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Special data types for the GOLDi project 
-- Module Name:		GOLDI_DATA_TYPES
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: - 
--
-- Revision V4.00.00 - Extension of package documentation
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




package GOLDI_DATA_TYPES is


    --****ROM MEMORY - PFU BASED STRUCTURES****
	-----------------------------------------------------------------------------------------------
    --PFU ROM memory for the general use ROM16XN_FIFO module used to initialize ICs
    type array_16_bit is array(natural range <>) of std_logic_vector(15 downto 0);

    --PFU ROM memory for the TMC2660 stepper motor driver module. The rom is used to configure
    --the initial state of the IC 
    type tmc2660_rom is array(natural range <>) of std_logic_vector(23 downto 0);
	-----------------------------------------------------------------------------------------------



    --****VIRTUAL SENSOR ARRAY LIMITS****
    -----------------------------------------------------------------------------------------------
    --The sensor_limit data type is a representation of an interval usign two integers.
    --The first integer in the array represent the middle point (arithmetic average) of the 
    --interval. The second integer represents the symetric range of the interval.
    --Example: The interval (10,5) is to be interpreted as the interval [10-5|10+5].
    type sensor_limit is array(1 downto 0) of integer;

    --Vector structure of limit arrays for codification of multiple intervals
    type sensor_limit_array is array(natural range <>) of sensor_limit;
    -----------------------------------------------------------------------------------------------


end package GOLDI_DATA_TYPES;