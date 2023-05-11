-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		00/00/2023
-- Design Name:		Board constants and configuration values -  
-- Module Name:		GOLDI_MODUE_CONFIG
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	
--
-- Revisions:
-- Revision V0.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom package
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




package GOLDI_MODULE_CONFIG is
    
    --****SYSTEM CONSTANTS****
    -----------------------------------------------------------------------------------------------
    -- System clock frequency
    constant SYS_CLOCK_FREQUENCY    :   natural := 48000000; 

    --Model pins
    --Number of physical FPGA pins that are available for IO functions
    constant PHYSICAL_PIN_NUMBER    :   natural range 1 to (2**BUS_ADDRESS_WIDTH)-3 := 66;
    --Number of IO pins needed for the system modules
    constant VIRTUAL_PIN_NUMBER     :   natural range 1 to (2**SYSTEM_DATA_WIDTH)-1 := 76;
    -----------------------------------------------------------------------------------------------
 
    
	
	--****MEMORY****
	-----------------------------------------------------------------------------------------------
	--Module Base Adderesses; Length based on a system_data_width = 8
	constant CTRL_REG_ADDRESS		:	integer := 1;		--Table length: 1
    constant GPIO_BASE_ADDRESS      :   integer := 2;       --Table length: 64
    constant PWM_BASE_ADDRESS       :   integer := 65;      --Table length: 10
    constant PR_LED_ADDRESS         :   integer := 75;      --Table length: 1
    constant PG_LED_ADDRESS         :   integer := 76;      --Table length: 1
	-----------------------------------------------------------------------------------------------



    --****PWM DRIVERS****
    -----------------------------------------------------------------------------------------------
    --PWM Signal frequency in Hz
    constant PWM_FREQUENCY          :   natural := 5000;
    -----------------------------------------------------------------------------------------------



    --****LED CONSTANTS****
    -----------------------------------------------------------------------------------------------
    --Power LED Red
    constant PR_LED_FREQUENCY       :   natural := 50000000;
    constant PR_LED_INVERTED        :   boolean := false;
    --Power LED Green
    constant PG_LED_FREQUENCY       :   natural := 50000000;
    constant PG_LED_INVERTED        :   boolean := false;
    -----------------------------------------------------------------------------------------------

    
end package;