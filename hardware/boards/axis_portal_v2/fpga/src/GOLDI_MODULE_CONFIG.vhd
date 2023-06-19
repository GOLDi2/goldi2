-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		25/05/2023
-- Design Name:		Configuration parameters for 3_axis_portal_v2
-- Module Name:		GOLDI_MODULE_CONFIG
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V2.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V3.00.00 - Default module version for release 3.00.00
-- Additional Comments: Release for Axis Portal V2 (AP2)
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom package
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;




package GOLDI_MODULE_CONFIG is
    
    --****BOARD PINS****
    -----------------------------------------------------------------------------------------------
    --Model pins
    --Number of physical FPGA pins that are available for IO functions
    constant PHYSICAL_PIN_NUMBER    :   natural range 1 to (2**BUS_ADDRESS_WIDTH)-3 := 42;
    --Number of IO pins needed for the system modules
    --constant VIRTUAL_PIN_NUMBER     :   natural range 1 to (2**SYSTEM_DATA_WIDTH)-1 := 41;
    -----------------------------------------------------------------------------------------------
 
    
	
	--****MEMORY****
	-----------------------------------------------------------------------------------------------
	--Module Base Adderesses; Length based on a system_data_width = 8
	constant CTRL_REG_ADDRESS		:	natural := 1;		--Table length: 1
	constant SENSOR_REG_ADDRESS		:	natural := 2;		--Table length: 1
	constant ERROR_LIST_ADDRESS		:	natural := 3;		--Table length: 2
	constant GPIO_DRIVER_ADDRESS	:	natural := 5;		--Table length: 2
	constant X_ENCODER_ADDRESS		:	natural := 7;		--Table length: 2
	constant Y_ENCODER_ADDRESS		:	natural := 9;		--Table length: 2
	constant X_MOTOR_ADDRESS		:	natural := 11;		--Table length: 2
	constant Y_MOTOR_ADDRESS		:	natural := 17;		--Table length: 2
	constant Z_MOTOR_ADDRESS		:	natural := 23;		--Table length: 2
	constant EMAG_ADDRESS			:	natural := 25;		--Table length: 1
	constant PR_LED_ADDRESS			:	natural := 26;		--Table length: 1
	constant PG_LED_ADDRESS			:	natural := 27;		--Table length: 1
	constant ER_LED_ADDRESS			:	natural := 28;		--Table length: 1
	constant EW_LED_ADDRESS			:	natural := 29;		--Table length: 1
	constant EG_LED_ADDRESS			:	natural := 30; 		--Table length: 1
	-----------------------------------------------------------------------------------------------

    

	--****SENSOR DATA MANAGEMENT****
	-----------------------------------------------------------------------------------------------
	constant SENSORS_DEFAULT	    :	std_logic_vector(6 downto 0) := (others => '0');
	-----------------------------------------------------------------------------------------------
	
	
	
    --****INCREMENTAL ENCODERS****
    ----------------------------------------------------------------------------------------------
    --Activate the use of Channel_I for reference after reset
    constant X_ENCODER_RST_TYPE :   boolean := false;
    constant Y_ENCODER_RST_TYPE :   boolean := false;
    --Select positive direction [false -> CCW | true -> CC]
    constant X_ENCODER_INVERT   :   boolean := false;
    constant Y_ENCODER_INVERT   :   boolean := false;
    -----------------------------------------------------------------------------------------------



    --****X AXIS STEPPER MOTOR****
    -----------------------------------------------------------------------------------------------
    --Serial clock divider value. Sets the frequency of the serial clock in relationship to the
    --system clock. It is recomended to use an even value to get a 50% duty cycle
    constant X_MOTOR_SCLK_FACTOR    :   natural := 48;

    --Initial configuration of the TMC2660 Stepper driver
    constant X_MOTOR_CONFIGURATION  :   tmc2660_rom(4 downto 0) :=(


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
        --[16]      StallGuard2 filter enable -> '1'
        --[15]      Reserved -> '0'
        --[14:8]    StallGuard2 threshold value
        --[7:5]     Reserved -> '0'
        --[4:0]     Current scale  
        3 => x"0D0A0F",   --x"C041E"
        
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
        4 => x"0E0060" --x"E0060"
    );
    -----------------------------------------------------------------------------------------------



    --****Y AXIS STEPPER MOTOR****
    -----------------------------------------------------------------------------------------------
    --Serial clock divider value. Sets the frequency of the serial clock in relationship to the
    --system clock. It is recomended to use an even value to get a 50% duty cycle
    constant Y_MOTOR_SCLK_FACTOR    :   natural := 48;

    --Initial configuration of the TMC2660 Stepper driver
    constant Y_MOTOR_CONFIGURATION  :   tmc2660_rom(5 downto 0) :=(
        0 => x"000000",

        --**Driver Control Register STEP/DIR mode (DRVCTRL)**
        --[19:18]   Address = 00
        --[17:10]   Reserved -> '0'
        --[9]       Enable STEP interpolation 
        --[8]       Enable double edge STEP pulses
        --[7:4]     Reserved -> '0'
        --[3:0]     Microstep resolution for STEP/DIR mode
        1 => x"000004",   --x"00004"

        --**Chopper Control Register (CHOPCONF)**
        --[19:17]   Address = 100
        --[16:15]   Blanking time
        --[14]      Chopper mode
        --[13]      Random Toff time
        --[12:11]   Hysteresis decrement interval
        --[10:7]    Hysteresis end value (low)
        --[6:4]     Hysteresis start value 
        --[3:0]     Off time MOSFET disable  
        2 => x"094557",   --x"94557"
      
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
        3 => x"0A0000",   --x"A0000" --CoolStep disabled[SEMIN=0]

        --**StallGuard2 Control Register (SGCSCONF)**
        --[19:17]   Address = 110
        --[16]      StallGuard2 filter enable
        --[15]      Reserved -> '0'
        --[14:8]    StallGuard2 threshold value
        --[7:5]     Reserved -> '0'
        --[4:0]     Current scale  
        4 => x"0C040F",   --x"C040F"
        
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
        5 => x"0E0070" --x"E0070"
    );
    -----------------------------------------------------------------------------------------------



    --****Z AXIS DC MOTOR****
    -----------------------------------------------------------------------------------------------
    --Frequency of PWM signal
    --Frequency factor calculated by [F = (f_clk/f_pwm*255)] with
    -- F     - frequency factor
    -- f_clk - system clock
    -- f_pwm - desired frequency of pwm signals
    constant Z_MOTOR_FREQUENCY  :   natural := 27;
    -----------------------------------------------------------------------------------------------
    


    --****ELECTROMAGNET TIME CONSTANTS****
    -----------------------------------------------------------------------------------------------
    --Electromagnet time constant in clk cycles. Used as a wait time to avoid an imediate voltage 
    --drop on the unprotected H-Bridge inputs when the depolarization pulse in generated.
    constant EMAG_TAO               :   natural := 5000;

    --Depolarization pulse duration in clk cycles. Used to reduce remanent polarization when the
    --magnet is powered off. To disable function use a value of 0
    constant EMAG_DEMAG_FACTOR      :   natural := 50000;

    --Pulse reduction constant. Demagnetization pulse reduced from the starting value in the 
    --register (reg_data*1000) by the given factor. Signal returns to idel when the pulse
    --width is smaller than the reduction factor
    constant EMAG_PULSE_REDUCTION   :   integer := 5000;
    -----------------------------------------------------------------------------------------------



    --****LED****
    -----------------------------------------------------------------------------------------------
    --Frequency: Blinking frequency factor for LEDs. Blink pattern last for 2*frequency 
    --           and on/off ratio is a divided into two configureable frequency/16 segments
    --
    --Invert:    Invert on/off behaviour
    
    --Power LED Red
    constant PR_LED_FREQUENCY   :   natural := 50000000;
    constant PR_LED_INVERTED    :   boolean := false;
    --Power LED Green
    constant PG_LED_FREQUENCY   :   natural := 50000000;
    constant PG_LED_INVERTED    :   boolean := false;
    --Environment LED Red
    constant ER_LED_FREQUENCY   :   natural := 50000000;
    constant ER_LED_INVERTED    :   boolean := false;
    --Environment LED White
    constant EW_LED_FREQUENCY   :   natural := 50000000;
    constant EW_LED_INVERTED    :   boolean := false;
    --Environment LED Green
    constant EG_LED_FREQUENCY   :   natural := 50000000;
    constant EG_LED_INVERTED    :   boolean := false;
    -----------------------------------------------------------------------------------------------
    

end package;
