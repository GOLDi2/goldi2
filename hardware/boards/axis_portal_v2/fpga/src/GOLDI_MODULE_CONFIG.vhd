-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/04/2023
-- Design Name:		Configuration parameters for 3_axis_portal_v2
-- Module Name:		GOLDI_MODULE_CONFIG
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V0.01.03 - File Created
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
    --Address width sets the protocol for SPI communication and the number of possible registers
    --SPI communication protocol takes first bit of the configuration byte's for write enable
    --because of that BUS_ADDRESS_WIDTH = (n*bytes)-1
    constant BUS_ADDRESS_WIDTH	:	natural range 7 to 63 := 7;
    
    --Main parameter of the system. Sets the width of data words 
    constant SYSTEM_DATA_WIDTH	:	natural range 8 to 64 := 8;
    

    --Model pins
    --Number of physical FPGA pins that are available for IO functions
    constant PHYSICAL_PIN_NUMBER    :   natural range 1 to (2**BUS_ADDRESS_WIDTH)-3 := 43;
    --Number of IO pins needed for the system modules
    constant VIRTUAL_PIN_NUMBER     :   natural range 1 to (2**SYSTEM_DATA_WIDTH)-1 := 43;
    -----------------------------------------------------------------------------------------------
 
    

    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    --Module Base Addresses; Length based on a system_data_width = 8
    constant CONFIG_REG_ADDRESS     :   natural := 1;       --Table length: 1
    constant SENSOR_REG_ADDRESS     :   natural := 2;       --Table length: 1
    constant ERROR_LIST_ADDRESS     :   natural := 3;       --Table length: 2
    constant GPIO_DRIVER_ADDRESS    :   natural := 5;       --Table length: 2
    constant X_MOTOR_ADDRESS        :   natural := 7;       --Table length: 5
    constant Y_MOTOR_ADDRESS        :   natural := 12;      --Table length: 5
    constant Z_MOTOR_ADDRESS        :   natural := 17;      --Table length: 2
    constant EMAG_ADDRESS           :   natural := 19;      --Table length: 1
    constant X_ENCODER_ADDRESS      :   natural := 20;      --Table length: 2
    constant Y_ENCODER_ADDRESS      :   natural := 22;      --Table length: 2
    constant PR_LED_ADDRESS         :   natural := 24;      --Table length: 1
    constant PG_LED_ADDRESS         :   natural := 25;      --Table length: 1
    constant ER_LED_ADDRESS         :   natural := 26;      --Table length: 1
    constant EW_LED_ADDRESS         :   natural := 27;      --Table length: 1
    constant EG_LED_ADDRESS         :   natural := 28;      --Table length: 1
    
	
	--Default Value for Configuration Register
	constant REG_CONFIG_DEFAULT		:	std_logic_vector(7 downto 0) :=  (others => '0');
	-----------------------------------------------------------------------------------------------
    


    --****SENSOR DATA MANAGEMENT****
	-----------------------------------------------------------------------------------------------
	constant SENSORS_DEFAULT    :	std_logic_vector(6 downto 0) := (others => '0');
	-----------------------------------------------------------------------------------------------
	
	
	
    --****INCREMENTAL ENCODERS****
    ----------------------------------------------------------------------------------------------
    --Activates the use of Channel_I for reference
    constant X_ENCODER_RST_TYPE :   boolean := false;
    constant Y_ENCODER_RST_TYPE :   boolean := false;
    -----------------------------------------------------------------------------------------------



    --****ACTUATORS****
    -----------------------------------------------------------------------------------------------
    --Frequency of PWM signal
    constant Z_MOTOR_FREQUENCY  :   natural := 377;

    --Magnet time constants
    constant EMAG_TAO           :   natural := 36000000;
    constant EMAG_DEMAG_TIME    :   natural := 9600000;
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