library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;

package GOLDI_MODULE_CONFIG is
    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    --Module Base Adderesses; Length based on a system_data_width = 8
    constant CONFIG_REG_ADDRESS  : natural := 1; --Table length: 1
    constant PR_LED_ADDRESS      : natural := 2; --Table length: 1
    constant PG_LED_ADDRESS      : natural := 3; --Table length: 1
    constant GPIO_DRIVER_ADDRESS : natural := 100; --Table length: 87

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
    -----------------------------------------------------------------------------------------------

end package GOLDI_MODULE_CONFIG;
