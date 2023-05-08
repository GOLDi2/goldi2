-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Error list for high-bay warehouse 
-- Module Name:		ERROR_DETECTOR
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--                  -> VIRTUAL_SENSOR_ARRAY.vhd
--                  -> REGISTER_TABLE.vhd
--                  -> IO_DEBOUNCE.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - First release
-- Additional Comments:
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
use work.GOLDI_MODULE_CONFIG.all;




--! @brief
--! @details
--!
entity ERROR_DETECTOR is
    generic(
        ADDRESS         :   natural := 1;
        ENC_X_INVERT    :   boolean := false;
        ENC_Z_INVERT    :   boolean := false;
        LIMIT_X_SENSORS :   sensor_limit_array(9 downto 0) := (others => (0,0));
        LIMIT_Z_SENSORS :   sensor_limit_array(4 downto 0) := (others => (0,0))
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --Communication
        sys_bus_i       : in    sbus_in;
        sys_bus_o       : out   sbus_out;
        --IOs
        sys_io_i        : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
        sys_io_o        : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
    );
end entity ERROR_DETECTOR;




--! General architecture
architecture RTL of ERROR_DETECTOR is

    --****INTERNAL SIGNALS****
    --Memory
    constant memory_length      :   natural := getMemoryLength(15);
    constant reg_default        :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_data_in          :   data_word_vector(memory_length-1 downto 0);
    --Errors
    signal error_list           :   std_logic_vector(14 downto 0);
    --****INTERNAL SIGNALS****
    --Motor inputs
    alias motor_x_step      :   std_logic is sys_io_o(18).dat;
    alias motor_x_dir       :   std_logic is sys_io_o(19).dat;
    alias motor_y_enb       :   std_logic is sys_io_o(24).dat;
    alias motor_y_neg       :   std_logic is sys_io_o(25).dat;
    alias motor_y_pos       :   std_logic is sys_io_o(26).dat;
    alias motor_z_step      :   std_logic is sys_io_o(30).dat;
    alias motor_z_dir       :   std_logic is sys_io_o(31).dat;
    --Debounce sensors
    signal stable_sensors   :   std_logic_vector(5 downto 0);
        alias limit_x_neg   :   std_logic is stable_sensors(0);
        alias limit_x_pos   :   std_logic is stable_sensors(1);
        alias limit_y_neg   :   std_logic is stable_sensors(2);
        alias limit_y_pos   :   std_logic is stable_sensors(3);
        alias limit_z_neg   :   std_logic is stable_sensors(4);
        alias limit_z_pos   :   std_logic is stable_sensors(5);
    --Virtual sensor limits
    signal rst_virtual_x    :   std_logic;
    signal rst_virtual_z    :   std_logic;
    signal x_sensor_array   :   std_logic_vector(9 downto 0);
    signal z_sensor_array   :   std_logic_vector(4 downto 0);
    signal x_virtual_limit  :   std_logic;
    signal z_virtual_limit  :   std_logic;
    --Active flags
    signal x_stepper_active :   std_logic;
    signal z_stepper_active :   std_logic;


begin

    --****SENSOR DEBOUNCE****
    -----------------------------------------------------------------------------------------------
    STABILIZERS : for i in 0 to 5 generate
        DEBOUNCER : entity work.IO_DEBOUNCE
        generic map(
            STAGES      => 4,
            CLK_FACTOR  => 12000
        )
        port map(
            clk         => clk,
            rst         => rst,
            io_raw      => sys_io_i(i+2).dat,
            io_stable   => stable_sensors(i)
        );
    end generate;
    -----------------------------------------------------------------------------------------------



    --****VIRTUAL SENSOR ARRAYS****
    -----------------------------------------------------------------------------------------------
    --Reset sensor arrays with normal reset and when sensor limit_x_neg/limit_z_neg are triggered
    rst_virtual_x <= rst or limit_x_neg;
    rst_virtual_z <= rst or limit_z_neg;


    X_SENSORS : entity work.VIRTUAL_SENSOR_ARRAY
    generic map(
        INVERT          => ENC_X_INVERT,
        NUMBER_SENSORS  => 10,
        SENSOR_LIMITS   => LIMIT_X_SENSORS
    )
    port map(
        clk             => clk,
        rst             => rst_virtual_x,
        enc_channel_a   => sys_io_i(9).dat,     --Encoder x channel a
        enc_channel_b   => sys_io_i(10).dat,    --Encoder x channel b
        sensor_data_out => x_sensor_array
    );
    

    Z_SENSORS : entity work.VIRTUAL_SENSOR_ARRAY
    generic map(
        INVERT          => ENC_Z_INVERT,
        NUMBER_SENSORS  => 5,
        SENSOR_LIMITS   => LIMIT_Z_SENSORS
    )
    port map(
        clk             => clk,
        rst             => rst_virtual_z,
        enc_channel_a   => sys_io_i(12).dat,    --Encoder z channel a
        enc_channel_b   => sys_io_i(13).dat,    --Encoder z channel b
        sensor_data_out => z_sensor_array
    );

     --Reduce limit vectors to a limit flag that indicates if the crane is out of bounds
    x_virtual_limit <= '1' when((x_sensor_array'range => '0') = x_sensor_array) else '0';
    z_virtual_limit <= '1' when((z_sensor_array'range => '0') = z_sensor_array) else '0';
    -----------------------------------------------------------------------------------------------




    --****STEPPER ACTIVE DETECTION****
    -----------------------------------------------------------------------------------------------
    X_STEPPER_ON : entity work.IO_DEBOUNCE
    generic map(
        STAGES      => 5,       
        CLK_FACTOR  => 19200    
    )
    port map(
        clk         => clk,
        rst         => rst,
        io_raw      => motor_x_step,
        io_stable   => x_stepper_active
    );


    Z_STEPPER_ON : entity work.IO_DEBOUNCE
    generic map(
        STAGES      => 5,       
        CLK_FACTOR  => 19200    
    )
    port map(
        clk         => clk,
        rst         => rst,
        io_raw      => motor_z_step,
        io_stable   => z_stepper_active
    );   
    -----------------------------------------------------------------------------------------------




    --****ERROR LIST****
    -----------------------------------------------------------------------------------------------
    --Multi-sensor activation sensors:
    --Error code 0 - Limit sensors left and right active
    error_list(0)   <= '1' when(limit_x_neg = '1' and limit_x_pos = '1') else '0';
    --Error code 1 - Limit sensors y-Outside and y-Inside active
    error_list(1)   <= '1' when(limit_y_neg = '1' and limit_y_pos = '1') else '0';
    --Error code 2 - Limit sensors bottom and top active
    error_list(2)   <= '1' when(limit_z_neg = '1' and limit_z_pos = '1') else '0';
   

    --Model physical limits
    --Error code 3 - Motor x left active and limit left active
    error_list(3)   <=  '1' when(limit_x_neg      = '1'     and
                                 motor_x_dir      = '1'     and
                                 x_stepper_active = '1')    else
                        '0';
    --Error code 4 - Motor x right active and limit right active
    error_list(4)   <=  '1' when(limit_x_pos      = '1'     and
                                 motor_x_dir      = '0'     and
                                 x_stepper_active = '1')    else
                        '0';
    --Error code 5 - Motor y outside active and limit outside active
    error_list(5)   <=  '1' when(limit_y_neg      = '1'     and
                                 motor_y_enb      = '1'     and
                                 motor_y_neg      = '1')    else
                        '0';
    --Error code 6 - Motor y inside active and limit inside active
    error_list(6)   <=  '1' when(limit_y_pos      = '1'     and
                                 motor_y_enb      = '1'     and
                                 motor_y_pos      = '1')    else
                        '0';
    --Error code 7 - Motor z bottom active and limit bottom active
    error_list(7)   <=  '1' when(limit_z_neg       = '1'    and
                                 motor_z_dir       = '1'    and
                                 z_stepper_active  = '1')   else
                        '0';
    --Error code 8 - Motor z top active and limit top active
    error_list(8)   <=  '1' when(limit_z_pos       = '1'    and
                                 motor_z_dir       = '0'    and
                                 x_stepper_active  = '1')   else
                        '0';


    --Crane position error
    --Error code 9 - Out of bounds virtual box x axis negative direction
    error_list(9)   <=  '1' when(x_virtual_limit    = '1'   and
                                 motor_x_dir        = '1'   and
                                 x_stepper_active   = '1'   and
                                 limit_y_neg        = '0')  else
                        '0';
    --Error code 10 - Out of bounds virtual box x axis positive direction
    error_list(10)  <=  '1' when(x_virtual_limit    = '1'   and
                                 motor_x_dir        = '0'   and
                                 x_stepper_active   = '1'   and
                                 limit_y_neg        = '0')  else
                        '0';
    --Error code 11 - Out of bounds virtual box z axis negative direction
    error_list(11)  <=  '1' when(z_virtual_limit    = '1'   and
                                 motor_z_dir        = '1'   and
                                 z_stepper_active   = '1'   and
                                 limit_y_neg        = '0')  else
                        '0';
    --Error code 12 - Out of bounds virtual box z axis positive direction
    error_list(12)  <=  '1' when(z_virtual_limit    = '1'   and
                                 motor_z_dir        = '0'   and
                                 z_stepper_active   = '1'   and
                                 limit_y_neg        = '0')  else
                        '0';

    error_list(13)  <= x_stepper_active;
    error_list(14)  <= z_stepper_active;
    -----------------------------------------------------------------------------------------------




    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => ADDRESS,
        NUMBER_REGISTERS    => memory_length,
        REG_DEFAULT_VALUES  => reg_default
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o,
        data_in             => reg_data_in,
        data_out            => open,
        read_stb            => open,
        write_stb           => open
    );

    reg_data_in <= setMemory(error_list);
    -----------------------------------------------------------------------------------------------


end RTL;
