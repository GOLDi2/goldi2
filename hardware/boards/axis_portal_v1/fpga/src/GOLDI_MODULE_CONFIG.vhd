-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Configuration parameters for 3_axis_portal_v1
-- Module Name:		GOLDI_MODULE_CONFIG
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
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




package GOLDI_MODULE_CONFIG is
    
    --****BOARD PINS****
    -----------------------------------------------------------------------------------------------
    --Model pins
    --Number of physical FPGA pins that are available for IO functions
    constant PHYSICAL_PIN_NUMBER    :   natural range 1 to (2**BUS_ADDRESS_WIDTH)-3 := 41;
    --Number of IO pins needed for the system modules
    constant VIRTUAL_PIN_NUMBER     :   natural range 1 to (2**SYSTEM_DATA_WIDTH)-1 := 41;
    -----------------------------------------------------------------------------------------------
 
    
	
	--****MEMORY****
	-----------------------------------------------------------------------------------------------
	--Module Base Adderesses; Length based on a system_data_width = 8
	constant CONFIG_REG_ADDRESS		:	natural := 1;		--Table length: 1
	constant SENSOR_REG_ADDRESS		:	natural := 2;		--Table length: 2
	constant ERROR_LIST_ADDRESS		:	natural := 4;		--Table length: 3
	constant GPIO_DRIVER_ADDRESS	:	natural := 7;		--Table length: 2
	constant X_ENCODER_ADDRESS		:	natural := 9;		--Table length: 2
	constant Y_ENCODER_ADDRESS		:	natural := 11;		--Table length: 2
	constant X_MOTOR_ADDRESS		:	natural := 13;		--Table length: 2
	constant Y_MOTOR_ADDRESS		:	natural := 15;		--Table length: 2
	constant Z_MOTOR_ADDRESS		:	natural := 17;		--Table length: 2
	constant EMAG_ADDRESS			:	natural := 19;		--Table length: 1
	constant PR_LED_ADDRESS			:	natural := 20;		--Table length: 1
	constant PG_LED_ADDRESS			:	natural := 21;		--Table length: 1
	constant ER_LED_ADDRESS			:	natural := 22;		--Table length: 1
	constant EW_LED_ADDRESS			:	natural := 23;		--Table length: 1
	constant EG_LED_ADDRESS			:	natural := 24; 		--Table length: 1
	-----------------------------------------------------------------------------------------------

    

	--****SENSOR DATA MANAGEMENT****
	-----------------------------------------------------------------------------------------------
	constant SENSORS_DEFAULT	    :	std_logic_vector(9 downto 0) := (others => '0');
	-----------------------------------------------------------------------------------------------
	
	
	
    --****INCREMENTAL ENCODERS****
    ----------------------------------------------------------------------------------------------
    --Activates the use of Channel_I for reference
    constant X_ENCODER_RST_TYPE :   boolean := false;
    constant X_ENCODER_INVERT   :   boolean := false;
    constant Y_ENCODER_RST_TYPE :   boolean := false;
    constant Y_ENCODER_INVERT   :   boolean := true;
    -----------------------------------------------------------------------------------------------



    --****ACTUATORS****
    -----------------------------------------------------------------------------------------------
    --Frequency of PWM signal
    constant X_MOTOR_FREQUENCY  :   natural := 27;
    constant Y_MOTOR_FREQUENCY  :   natural := 27;
    constant Z_MOTOR_FREQUENCY  :   natural := 27;
    -----------------------------------------------------------------------------------------------
    


    --****LED****
    -----------------------------------------------------------------------------------------------
    --Module constants
    constant PR_LED_FREQUENCY   :   natural := 50000000;
    constant PG_LED_FREQUENCY   :   natural := 50000000;
    constant ER_LED_FREQUENCY   :   natural := 50000000;
    constant EW_LED_FREQUENCY   :   natural := 50000000;
    constant EG_LED_FREQUENCY   :   natural := 50000000;
    constant PR_LED_INVERTED    :   boolean := false;
    constant PG_LED_INVERTED    :   boolean := false; 
    constant ER_LED_INVERTED    :   boolean := false;
    constant EW_LED_INVERTED    :   boolean := false;
    constant EG_LED_INVERTED    :   boolean := false;
    -----------------------------------------------------------------------------------------------
    

end package;