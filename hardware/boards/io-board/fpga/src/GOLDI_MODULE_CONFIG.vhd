-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		16/02/2023
-- Design Name:		System constants for IO-Board Model
-- Module Name:		GOLDI_MODULE_CONFIG
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V0.01.04 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;



package GOLDI_MODULE_CONFIG is

    --****SYSTEM CONSTANTS****
    -----------------------------------------------------------------------------------------------
    --System size
    --BUS_ADDRESS_WIDTH sets the length of the configuration word for SPI communication 
    --and the number of possible registers. The configuration word consists of 
    --1+BUS_ADDRESS_WIDTH bits, corresponding to Write-Enable and Register-Address
	constant BUS_ADDRESS_WIDTH	    :	natural range 7 to 63 := 7;
    --Main parameter of the system. Sets the width of data words 
    constant SYSTEM_DATA_WIDTH	    :	natural range 8 to 64 := 8;


    --Model pins
    --Number of physical FPGA pins that are available for IO functions
    constant PHYSICAL_PIN_NUMBER   	:   natural range 1 to (2**BUS_ADDRESS_WIDTH)-3 := 66;
    --Number of IO formatted signals used by the system modules
    constant VIRTUAL_PIN_NUMBER    	:   natural range 1 to (2**SYSTEM_DATA_WIDTH)-1 := 66;
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    --Module Base Addresses; Lenght based on system_data_width = 8
    constant CONFIG_REG_ADDRESS     :   natural := 1;       --Table Length: 1
    constant GPIO_DRIVER_ADDRESS    :   natural := 2;       --Table Length: 64
    constant POW_R_LED_ADDRESS      :   natural := 66;      --Table Length: 1
    constant POW_G_LED_ADDRESS      :   natural := 67;      --Table Length: 1


    --Default Value for Configuration Register
    constant REG_CONFIG_DEFAULT     :   std_logic_vector(7 downto 0) := (others => '0'); 
    -----------------------------------------------------------------------------------------------



    --****LEDs****
    -----------------------------------------------------------------------------------------------
    --Module constants
    constant POW_R_LED_FREQUENCY    :   natural := 1133000000;
    constant POW_G_LED_FREQUENCY    :   natural := 1133000000;
    constant POW_R_LED_INVERTED     :   boolean := false;
    constant POW_G_LED_FREQUENCY    :   boolean := false;
    -----------------------------------------------------------------------------------------------


end package;
