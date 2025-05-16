library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom package
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;

package GOLDI_MODULE_CONFIG is

    --****BOARD PINS****
    -----------------------------------------------------------------------------------------------
    --Model pins
    --Number of physical FPGA pins that are available for IO functions
    constant PHYSICAL_PIN_NUMBER : natural range 1 to (2 ** BUS_ADDRESS_WIDTH) - 3 := 42;
    --Number of IO pins needed for the system modules
    --constant VIRTUAL_PIN_NUMBER     :   natural range 1 to (2**SYSTEM_DATA_WIDTH)-1 := 41;
    -----------------------------------------------------------------------------------------------

    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    --Module Base Adderesses; Length based on a system_data_width = 8
    constant CTRL_REG_ADDRESS    : natural := 1; --Table length: 1
    constant SENSOR_REG_ADDRESS  : natural := 2; --Table length: 1
    constant ERROR_LIST_ADDRESS  : natural := 3; --Table length: 2
    constant GPIO_DRIVER_ADDRESS : natural := 5; --Table length: 2
    constant X_MOTOR_ADDRESS     : natural := 7; --Table length: 9
    constant Y_MOTOR_ADDRESS     : natural := 16; --Table length: 9
    constant Z_MOTOR_ADDRESS     : natural := 25; --Table length: 2
    constant EMAG_ADDRESS        : natural := 27; --Table length: 1
    constant PR_LED_ADDRESS      : natural := 28; --Table length: 1
    constant PG_LED_ADDRESS      : natural := 29; --Table length: 1
    constant ER_LED_ADDRESS      : natural := 30; --Table length: 1
    constant EW_LED_ADDRESS      : natural := 31; --Table length: 1
    constant EG_LED_ADDRESS      : natural := 32; --Table length: 1
    -----------------------------------------------------------------------------------------------
    
    -----------------------------------------------------------------------------------------------
    --****X AXIS ****
    -----------------------------------------------------------------------------------------------
    constant X_ENCODER_INVERT       : boolean                       := false;
    constant X_ENCODER_INTERNAL_BIT : natural                       := 18;
    constant X_MOTOR_CONFIG_16BIT : array_16_bit(7 downto 0) := (
        0 => x"0004",
        1 => x"5700",
        2 => x"0945",
        3 => x"0000",
        4 => x"0F0A",
        5 => x"0C04",
        6 => x"0070",
        7 => x"000E"
    );
    
    -----------------------------------------------------------------------------------------------
    --****Y AXIS ****
    -----------------------------------------------------------------------------------------------
    constant Y_ENCODER_INVERT       : boolean                       := false;
    constant Y_ENCODER_INTERNAL_BIT : natural                       := 16;
    constant Y_MOTOR_CONFIG_16BIT : array_16_bit(7 downto 0) := (
        0 => x"0004",
        1 => x"5700",
        2 => x"0945",
        3 => x"0000",
        4 => x"0F0A",
        5 => x"0C04",
        6 => x"0070",
        7 => x"000E"
    );

    -----------------------------------------------------------------------------------------------
    --****Z AXIS DC MOTOR****
    -----------------------------------------------------------------------------------------------
    --Frequency of PWM signal
    --Frequency factor calculated by [F = (f_clk/f_pwm*255)] with
    constant Z_MOTOR_FREQUENCY : natural := 27;
    -----------------------------------------------------------------------------------------------

    --****ELECTROMAGNET TIME CONSTANTS****
    -----------------------------------------------------------------------------------------------
    --Electromagnet time constant in clk cycles. Used as a wait time to avoid an imediate voltage 
    --drop on the unprotected H-Bridge inputs when the depolarization pulse in generated.
    constant EMAG_TAO : natural := 5000;

    --Inital pulse width for demagnetization process
    constant EMAG_PULSE_WIDTH : natural := 500000;

    --Pulse reduction constant. Demagnetization pulse reduced from the starting value in the 
    --register (reg_data*1000) by the given factor. Signal returns to idel when the pulse
    --width is smaller than the reduction factor
    constant EMAG_PULSE_REDUCTION : integer := 50000;
    -----------------------------------------------------------------------------------------------

    --****LED****
    -----------------------------------------------------------------------------------------------
    --Frequency: Blinking frequency factor for LEDs. Blink pattern last for 2*frequency 
    --           and on/off ratio is a divided into two configureable frequency/16 segments
    --
    --Invert:    Invert on/off behaviour

    --Power LED Red
    constant PR_LED_FREQUENCY : natural := 50000000;
    constant PR_LED_INVERTED  : boolean := false;
    --Power LED Green
    constant PG_LED_FREQUENCY : natural := 50000000;
    constant PG_LED_INVERTED  : boolean := false;
    --Environment LED Red
    constant ER_LED_FREQUENCY : natural := 50000000;
    constant ER_LED_INVERTED  : boolean := false;
    --Environment LED White
    constant EW_LED_FREQUENCY : natural := 50000000;
    constant EW_LED_INVERTED  : boolean := false;
    --Environment LED Green
    constant EG_LED_FREQUENCY : natural := 50000000;
    constant EG_LED_INVERTED  : boolean := false;
    -----------------------------------------------------------------------------------------------

end package GOLDI_MODULE_CONFIG;
