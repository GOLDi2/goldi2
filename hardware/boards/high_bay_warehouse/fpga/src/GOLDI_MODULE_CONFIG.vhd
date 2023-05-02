-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Configuration parameters for High-bay warehouse 
-- Module Name:		GOLDI_MODULE_CONFIG
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDRD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;




package GOLDI_MODULE_CONFIG is

    --****BOARD PINS****
    -----------------------------------------------------------------------------------------------
    --Model pins
    --Number of physical FPGA pins that are available for IO functions
    constant PHYSICAL_PIN_NUMBER    :   natural range (2**BUS_ADDRESS_WIDTH)-3 downto 1 := 41;
    --Number of IO pins needed for the system modules
    constant VIRTUAL_PIN_NUMBER     :   natural range (2**SYSTEM_DATA_WIDTH)-1 downto 1 := 41;
    -----------------------------------------------------------------------------------------------



    --****MEMORY ALLOCATION****
    -----------------------------------------------------------------------------------------------
    --Module Base Addresses. Length based on system_data_width = 8
    constant CTRL_REGISTER_ADDRESS  :   natural := 1;       --Table length: 1
    constant SENSOR_ARRAY_ADDRESS   :   natural := 2;       --Table length: 3
    constant ERROR_LIST_ADDRESS     :   natural := 5;       --Table length: 2
    constant GPIO_DRIVER_ADDRESS    :   natural := 7;       --Table length: 2
    constant X_ENCODER_ADDRESS      :   natural := 9;       --Table length: 2
    constant Z_ENCODER_ADDRESS      :   natural := 11;      --Table length: 2
    constant X_MOTOR_ADDRESS        :   natural := 13;      --Table length: 5
    constant Y_MOTOR_ADDRESS        :   natural := 18;      --Table length: 2
    constant Z_MOTOR_ADDRESS        :   natural := 20;      --Table length: 5
    constant PR_LED_ADDRESS         :   natural := 25;      --Table length: 1
    constant PG_LED_ADDRESS         :   natural := 26;      --Table length: 1
    constant ER_LED_ADDRESS         :   natural := 27;      --Table length: 1
    constant EW_LED_ADDRESS         :   natural := 28;      --Table length: 1
    constant EG_LED_ADDRESS         :   natural := 28;      --Table length: 1
    -----------------------------------------------------------------------------------------------



    --****SYSTEM PROTECTION****
    -----------------------------------------------------------------------------------------------
    --Step motor active detection time 
    constant ERROR_STEP_ON_FACTOR   :   natural := 10000;
    
    --Movement limits in horizontal axis inside a storage box
    --X Axis (10 sensors):
    constant X_MOVEMENT_LIMITS       :   sensor_limit_array(9 downto 0) := (
        0 => (10, 1),
        1 => (10, 2),
        2 => (10, 3),
        3 => (10, 4),
        4 => (10, 5),
        5 => (10, 6),
        6 => (10, 7),
        7 => (10, 8),
        8 => (10, 9),
        9 => (10,10)
    );

    --Movement limits in vertical axis inside a storage box
    --Z Axis (6 sensors):
    constant Z_MOVEMENT_LIMITS       :   sensor_limit_array(5 downto 0) := (
        0 => (10,0),
        1 => (10,1),
        2 => (10,2),
        3 => (10,3),
        4 => (10,4),
        5 => (10,5)     
    );
    -----------------------------------------------------------------------------------------------

    
    
    --****SENSOR CONSTANTS****
    -----------------------------------------------------------------------------------------------
    --Limits for virtual sensors
    --X Axis (10 sensors):
    constant X_SENSOR_LIMITS        :   sensor_limit_array(9 downto 0) := (
        0 => (2,1),
        1 => (4,3),
        2 => (6,5),
        3 => (8,7),
        4 => (10,9),
        5 => (12,11),
        6 => (14,13),
        7 => (16,15),
        8 => (18,17),
        9 => (20,19)
    );

    --Z Axis (6 sensors):
    constant Z_SENSOR_LIMITS        :   sensor_limit_array(5 downto 0) := (
        0 => (2,1),
        1 => (4,3),
        2 => (6,5),
        3 => (8,7),
        4 => (10,9),
        5 => (12,11)
    );
    -----------------------------------------------------------------------------------------------



    --****INCREMENTAL ENCODERS****
    -----------------------------------------------------------------------------------------------
    --Activate the use of Channel_I for reference after reset
    constant X_ENCODER_RST_TYPE     :   boolean := false;
    constant Z_ENCODER_RST_TYPE     :   boolean := false;
    --Select positive direction [false -> CCW | true -> CC]
    constant X_ENCODER_INVERT       :   boolean := false;
    constant Z_ENCODER_INVERT       :   boolean := false;
    -----------------------------------------------------------------------------------------------



    --****X AXIS STEPPER MOTOR****
    -----------------------------------------------------------------------------------------------
    --Step/Direction Interface frequency scaling factor.
    --Value is multiplied with the dynamic nominal_frequency to obtain the desired frequency range
    constant X_MOTOR_SD_FACTOR      :   natural := 10000;

    --Serial clock divider value. Sets the frequency of the serial clock in relationship to the
    --system clock. It is recomended to use an even value to get a 50% duty cycle
    constant X_MOTOR_SCLK_FACTOR    :   natural := 12;

    --Initial configuration of the TMC2660 Stepper driver
    constant X_MOTOR_CONFIGURATION  :   tmc2660_rom(4 downto 0) :=(
        0 => x"00007",
        1 => x"80000",
        2 => x"A0F0F",
        3 => x"C0000",
        4 => x"E5100"
    );
    -----------------------------------------------------------------------------------------------



    --****Y AXIS DC MOTOR****
    -----------------------------------------------------------------------------------------------
    --Frequency of PWM signal
    constant Y_MOTOR_FREQUENCY      :   natural := 30;
    -----------------------------------------------------------------------------------------------



    --****Z AXIS STEPPER MOTOR****
    -----------------------------------------------------------------------------------------------
    --Step/Direction Interface frequency scaling factor.
    --Value is multiplied with the dynamic nominal_frequency to obtain the desired frequency range
    constant Z_MOTOR_SD_FACTOR      :   natural := 10000;

    --Serial clock divider value. Sets the frequency of the serial clock in relationship to the
    --system clock. It is recomended to use an even value to get a 50% duty cycle
    constant Z_MOTOR_SCLK_FACTOR    :   natural := 12;

    --Initial configuration of the TMC2660 Stepper driver
    constant Z_MOTOR_CONFIGURATION  :   tmc2660_rom(4 downto 0) :=(
        0 => x"00007",
        1 => x"80000",
        2 => x"A0F0F",
        3 => x"C0000",
        4 => x"E5100"
    );
    -----------------------------------------------------------------------------------------------



    --****LED CONSTANTS****
    -----------------------------------------------------------------------------------------------
    --Power LED Red
    constant PR_LED_FREQUENCY       :   natural := 50000000;
    constant PR_LED_INVERTED        :   boolean := false;
    --Power LED Green
    constant PG_LED_FREQUENCY       :   natural := 50000000;
    constant PG_LED_INVERTED        :   boolean := false;
    --Environment LED Red
    constant ER_LED_FREQUENCY       :   natural := 50000000;
    constant ER_LED_INVERTED        :   boolean := false;
    --Environment LED White
    constant EW_LED_FREQUENCY       :   natural := 50000000;
    constant EW_LED_INVERTED        :   boolean := false;
    --Environment LED Green
    constant EG_LED_FREQUENCY       :   natural := 50000000;
    constant EG_LED_INVERTED        :   boolean := false;
    -----------------------------------------------------------------------------------------------


end package GOLDI_MODULE_CONFIG;