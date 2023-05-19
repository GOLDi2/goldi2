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
-- Additional Comments: Release for warehouse_v2  
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
    constant X_MOTOR_ADDRESS        :   natural := 13;      --Table length: 6
    constant Y_MOTOR_ADDRESS        :   natural := 19;      --Table length: 2
    constant Z_MOTOR_ADDRESS        :   natural := 21;      --Table length: 6
    constant PR_LED_ADDRESS         :   natural := 27;      --Table length: 1
    constant PG_LED_ADDRESS         :   natural := 28;      --Table length: 1
    constant ER_LED_ADDRESS         :   natural := 29;      --Table length: 1
    constant EW_LED_ADDRESS         :   natural := 30;      --Table length: 1
    constant EG_LED_ADDRESS         :   natural := 31;      --Table length: 1
    -----------------------------------------------------------------------------------------------



    --****SYSTEM PROTECTION****
    -----------------------------------------------------------------------------------------------
    --Border margin for virtual limits
    constant X_BORDER_MARGIN        :   integer := 0;
    constant Z_BORDER_MARGIN        :   integer := 10;

    --Movement limits in horizontal axis inside a storage box
    --(sensor_possition, valid range in pos/neg direction)
    --X Axis (10 sensors):
    constant X_PROTECTION_LIMITS    :   sensor_limit_array(9 downto 0) := (
        0 => (  607,8),
        1 => ( 1807,8),
        2 => ( 3007,8),
        3 => ( 4207,8),
        4 => ( 5407,8),
        5 => ( 6607,8),
        6 => ( 7807,8),
        7 => ( 9007,8),
        8 => (10207,8),
        9 => (11407,8)
    ); 

    --Movement limits in vertical axis inside a storage box
    --Z Axis (6 sensors):
 constant Z_PROTECTION_LIMITS       :   sensor_limit_array(4 downto 0) := (
        0 => (  894,1490),
        1 => (11324,1490),
        2 => (21754,1490),
        3 => (32184,1490),
		4 => (42614,1490)
    );
    -----------------------------------------------------------------------------------------------

    
    
    --****SENSOR CONSTANTS****
    -----------------------------------------------------------------------------------------------
    --Limits for virtual sensors
    --X Axis (10 sensors):
    constant X_SENSOR_LIMITS        :   sensor_limit_array(9 downto 0) := (
        0 => (  607,8),
        1 => ( 1807,8),
        2 => ( 3007,8),
        3 => ( 4207,8),
        4 => ( 5407,8),
        5 => ( 6607,8),
        6 => ( 7807,8),
        7 => ( 9007,8),
        8 => (10207,8),
        9 => (11407,8)
    );

    --Z Axis (6 sensors):
    constant Z_SENSOR_LIMITS        :   sensor_limit_array(4 downto 0) := (
        0 => (  894,1490),
        1 => (11324,1490),
        2 => (21754,1490),
        3 => (32184,1490),
		4 => (42614,1490)
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
    --Serial clock divider value. Sets the frequency of the serial clock in relationship to the
    --system clock. It is recomended to use an even value to get a 50% duty cycle
    constant X_MOTOR_SCLK_FACTOR    :   natural := 48;

    --Initial configuration of the TMC2660 Stepper driver
    constant X_MOTOR_CONFIGURATION  :   tmc2660_rom(5 downto 0) :=(
        --**Driver Control Register STEP/DIR mode (DRVCTRL)**
        --[19:18]   Address = 00
        --[17:10]   Reserved -> '0'
        --[9]       Enable STEP interpolation 
        --[8]       Enable double edge STEP pulses
        --[7:4]     Reserved -> '0'
        --[3:0]     Microstep resolution for STEP/DIR mode
        0 => x"000004",   --x"00004"

        --**Chopper Control Register (CHOPCONF)**
        --[19:17]   Address = 100
        --[16:15]   Blanking time
        --[14]      Chopper mode
        --[13]      Random Toff time
        --[12:11]   Hysteresis decrement interval
        --[10:7]    Hysteresis end value (low)
        --[6:4]     Hysteresis start value 
        --[3:0]     Off time MOSFET disable  
        1 => x"094557",   --x"94557"
      
        --**Coolstep Control Register (SMARTEN)**
        --[19:17]   Address = 101
        --[16]      Reserved -> '0'
        --[15]      Minimum coolStep current
        --[14:13]   Current decrement speed
        --[12]      Reserved -> '0'
        --[11:8]    Upper coolStep threshold SEMAX
        --[7]       Reserved -> '0'
        --[6:5]     Current increment size
        --[4]       Reserved -> '0'
        --[3:0]     Lower coolStep threshold SEMIN
        2 => x"0A0000",   --x"A0000" --CoolStep disabled[SEMIN=0]

        --**StallGuard2 Control Register (SGCSCONF)**
        --[19:17]   Address = 110
        --[16]      StallGuard2 filter enable
        --[15]      Reserved -> '0'
        --[14:8]    StallGuard2 threshold value
        --[7:5]     Reserved -> '0'
        --[4:0]     Current scale  
        3 => x"0C040F",   --x"C040F"
        
        --**Driver Control Register (DRVCONF)**
        --[19:17]   Address = 111
        --[16]      Test Mode - reserved -> '0'
        --[15:14]   Slope control, high side
        --[13:12]   Slope control, low side
        --[11]      Reserved -> '0'
        --[10]      Short to GND protection disable
        --[9:8]     Short to GND detection timer
        --[7]       STEP/DIR interface disable 
        --[6]       Sense resistor voltage-based current scaling
        --[5:4]     Select value for read out
        --[3:0]     Reserved -> '0'
        4 => x"0E0070", --x"E0070"
        5 => x"000004"
    );
    -----------------------------------------------------------------------------------------------



    --****Y AXIS DC MOTOR****
    -----------------------------------------------------------------------------------------------
    --Frequency of PWM signal
    constant Y_MOTOR_FREQUENCY      :   natural := 30;
    -----------------------------------------------------------------------------------------------



    --****Z AXIS STEPPER MOTOR****
    -----------------------------------------------------------------------------------------------
    --Serial clock divider value. Sets the frequency of the serial clock in relationship to the
    --system clock. It is recomended to use an even value to get a 50% duty cycle
    constant Z_MOTOR_SCLK_FACTOR    :   natural := 48;

    --Initial configuration of the TMC2660 Stepper driver
    constant Z_MOTOR_CONFIGURATION  :   tmc2660_rom(5 downto 0) :=(
        --**Driver Control Register STEP/DIR mode (DRVCTRL)**
        --[19:18]   Address = 00
        --[17:10]   Reserved -> '0'
        --[9]       Enable STEP interpolation 
        --[8]       Enable double edge STEP pulses
        --[7:4]     Reserved -> '0'
        --[3:0]     Microstep resolution for STEP/DIR mode
        0 => x"000004",   --x"00004"

        --**Chopper Control Register (CHOPCONF)**
        --[19:17]   Address = 100
        --[16:15]   Blanking time
        --[14]      Chopper mode
        --[13]      Random Toff time
        --[12:11]   Hysteresis decrement interval
        --[10:7]    Hysteresis end value (low)
        --[6:4]     Hysteresis start value 
        --[3:0]     Off time MOSFET disable  
        1 => x"094557",   --x"94557"
      
        --**Coolstep Control Register (SMARTEN)**
        --[19:17]   Address = 101
        --[16]      Reserved -> '0'
        --[15]      Minimum coolStep current
        --[14:13]   Current decrement speed
        --[12]      Reserved -> '0'
        --[11:8]    Upper coolStep threshold SEMAX
        --[7]       Reserved -> '0'
        --[6:5]     Current increment size
        --[4]       Reserved -> '0'
        --[3:0]     Lower coolStep threshold SEMIN
        2 => x"0A0000",   --x"A0000" --CoolStep disabled[SEMIN=0]

        --**StallGuard2 Control Register (SGCSCONF)**
        --[19:17]   Address = 110
        --[16]      StallGuard2 filter enable
        --[15]      Reserved -> '0'
        --[14:8]    StallGuard2 threshold value
        --[7:5]     Reserved -> '0'
        --[4:0]     Current scale  
        3 => x"0C040F",   --x"C040F"
        
        --**Driver Control Register (DRVCONF)**
        --[19:17]   Address = 111
        --[16]      Test Mode - reserved -> '0'
        --[15:14]   Slope control, high side
        --[13:12]   Slope control, low side
        --[11]      Reserved -> '0'
        --[10]      Short to GND protection disable
        --[9:8]     Short to GND detection timer
        --[7]       STEP/DIR interface disable 
        --[6]       Sense resistor voltage-based current scaling
        --[5:4]     Select value for read out
        --[3:0]     Reserved -> '0'
        4 => x"0E0070",--x"E0070"
        5 => x"000004"
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