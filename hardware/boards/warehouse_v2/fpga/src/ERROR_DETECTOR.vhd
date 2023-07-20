-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
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
--
-- Revision V3.01.00 - Optimized error list
-- Additional Comments: Simplification of enityt and protection cases
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
        g_address       :   natural := 1;
        g_enc_x_invert  :   boolean := false;
        g_enc_z_invert  :   boolean := false;
        g_x_box_margins :   sensor_limit_array(9 downto 0) := (others => (0,0));
        g_z_box_margins :   sensor_limit_array(4 downto 0) := (others => (0,0))
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --Flags
        rst_x_encoder   : in    std_logic;
        rst_z_encoder   : in    std_logic;
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
    --**Memory**
    constant memory_length      :   natural := getMemoryLength(13);
    constant reg_default        :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_data_in          :   data_word_vector(memory_length-1 downto 0);
    --**Errors**
    signal error_list           :   std_logic_vector(12 downto 0);    
    --**Inputs**
    --Sensor inputs
    signal stable_sensors_i     :   std_logic_vector(5 downto 0);
    alias limit_x_neg           :   std_logic is stable_sensors_i(0);
    alias limit_x_pos           :   std_logic is stable_sensors_i(1);
    alias limit_y_neg           :   std_logic is stable_sensors_i(2);
    alias limit_y_pos           :   std_logic is stable_sensors_i(3);
    alias limit_z_neg           :   std_logic is stable_sensors_i(4);
    alias limit_z_pos           :   std_logic is stable_sensors_i(5);
    --Incremental encoders
    alias x_channel_a           :   std_logic is sys_io_i(9).dat;
    alias x_channel_b           :   std_logic is sys_io_i(10).dat;
    alias z_channel_a           :   std_logic is sys_io_i(12).dat;
    alias z_channel_b           :   std_logic is sys_io_i(13).dat;
	--Motor inputs
    signal motor_x_step         :   std_logic;
    signal motor_y_enb          :   std_logic;
    signal motor_z_step         :   std_logic;
    alias  motor_x_dir          :   std_logic is sys_io_o(19).dat;
    alias  motor_y_out_1        :   std_logic is sys_io_o(25).dat;
    alias  motor_y_out_2        :   std_logic is sys_io_o(26).dat;
    alias  motor_z_dir          :   std_logic is sys_io_o(31).dat;
    --Box margin signals
    signal box_x_rst            :   std_logic;
    signal box_z_rst            :   std_logic;
    signal box_x_margins        :   std_logic_vector(9 downto 0);
    signal box_z_margins        :   std_logic_vector(4 downto 0);
    signal x_margin_flag        :   std_logic;
    signal z_margin_flag        :   std_logic;


begin

    --****SENSOR DEBOUNCE****
    -----------------------------------------------------------------------------------------------
    --Sensor debounce removes signal jitter by holding the signal until a logic low is detected
    --for at least 1ms (clk(48*10^6)/stages(4)*clk_factor(12000))
    STABILIZERS : for i in 0 to 5 generate
        DEBOUNCE : entity work.IO_DEBOUNCE
        generic map(
            STAGES      => 4,
            CLK_FACTOR  => 1200
        )
        port map(
            clk         => clk,
            rst         => rst,
            io_raw      => sys_io_i(i+2).dat,
            io_stable   => stable_sensors_i(i)
        );
    end generate;
    -----------------------------------------------------------------------------------------------



    --****MOTOR ACTIVE DETECTION****
    -----------------------------------------------------------------------------------------------
    X_MOTOR_ACTIVE : entity work.IO_DEBOUNCE
    generic map(
        STAGES      => 4,
        CLK_FACTOR  => 1200
    )
    port map(
        clk         => clk,
        rst         => rst,
        io_raw      => sys_io_o(18).dat,
        io_stable   => motor_x_step
    );


    Y_MOTOR_ACTIVE : entity work.IO_DEBOUNCE
    generic map(
        STAGES      => 4,
        CLK_FACTOR  => 1200
    )
    port map(
        clk         => clk,
        rst         => rst,
        io_raw      => sys_io_o(24).dat,
        io_stable   => motor_y_enb
    );


    Z_MOTOR_ACTIVE : entity work.IO_DEBOUNCE
    generic map(
        STAGES      => 4,
        CLK_FACTOR  => 1200
    )
    port map(
        clk         => clk,
        rst         => rst,
        io_raw      => sys_io_o(30).dat,
        io_stable   => motor_z_step
    );
    -----------------------------------------------------------------------------------------------



    --****VIRTUAL BOX MARGINS****
    -----------------------------------------------------------------------------------------------
    box_x_rst <= rst or rst_x_encoder;
    box_z_rst <= rst or rst_z_encoder;

    
    X_BOX_MARGINS : entity work.VIRTUAL_SENSOR_ARRAY
    generic map(
        INVERT          => g_enc_x_invert,
        NUMBER_SENSORS  => 10,
        SENSOR_LIMITS   => g_x_box_margins
    )
    port map(
        clk             => clk,
        rst             => rst_x_encoder,
        enc_channel_a   => x_channel_a,
        enc_channel_b   => x_channel_b,
        sensor_data_out => box_x_margins
    );


    Z_BOX_MARGINS : entity work.VIRTUAL_SENSOR_ARRAY
    generic map(
        INVERT          => g_enc_z_invert,
        NUMBER_SENSORS  => 5,
        SENSOR_LIMITS   => g_z_box_margins
    )
    port map(
        clk             => clk,
        rst             => rst_z_encoder,
        enc_channel_a   => z_channel_a,
        enc_channel_b   => z_channel_b,
        sensor_data_out => box_z_margins
    );


    --Reduce limit vectors to a limit flag that indicates if the crane is out of bounds
    x_margin_flag <= '1' when((box_x_margins'range => '0') = box_x_margins) else '0';
    z_margin_flag <= '1' when((box_z_margins'range => '0') = box_z_margins) else '0';
    -----------------------------------------------------------------------------------------------



    --****ERROR LIST****
    -----------------------------------------------------------------------------------------------
    --Multi-sensor activation sensors:
    --Error code 0 - Limit sensors left and right active
    error_list(0) <= '1' when(limit_x_neg = '1' and limit_x_pos = '1') else '0';
    --Error code 1 - Limit sensors y-Outside and y-Inside active
    error_list(1) <= '1' when(limit_y_neg = '1' and limit_y_pos = '1') else '0';
    --Error code 2 - Limit sensors bottom and top active
    error_list(2) <= '1' when(limit_z_neg = '1' and limit_z_pos = '1') else '0';

    --Model physical limits
    --Error code 3 - Motor x left active and limit left active
    error_list(3) <= '1' when(limit_x_neg = '1' and motor_x_dir = '0' and motor_x_step = '1') else '0';
    --Error code 4 - Motor x right active and limit right active
    error_list(4) <= '1' when(limit_x_pos = '1' and motor_x_dir = '1' and motor_x_step = '1') else '0';
    --Error code 5 - Motor y outside active and limit outside active
    error_list(5) <= '1' when(limit_y_neg = '1' and motor_y_out_2 = '1' and motor_y_enb = '1') else '0';
    --Error code 6 - Motor y inside active and limit inside active
    error_list(6) <= '1' when(limit_y_pos = '1' and motor_y_out_1 = '1' and motor_y_out_1 = '1') else '0';
    --Error code 7 - Motor z bottom active and limit bottom active
    error_list(7) <= '1' when(limit_z_neg = '1' and motor_z_dir = '0' and motor_z_step  = '1') else '0';
    --Error code 8 - Motor z top active and limit top active
    error_list(8) <= '1' when(limit_z_pos = '1' and motor_z_dir = '1' and motor_z_step  = '1') else '0';
    
    --Crane position error
    --Error code 9 - Out of bounds virutual box in horizontal axis and driving y
    error_list(9)  <= '1' when(motor_y_enb = '1' and x_margin_flag = '1')  else '0';
    --Error code 10 - Out of bounds virtual box in vertical axis and driving y
    error_list(10) <= '1' when(motor_y_enb = '1' and z_margin_flag = '1')  else '0';
    -- --Error code 11 - Out of bounds virtual box z axis negative direction
    error_list(11) <= '1' when(limit_y_neg = '0' and motor_z_dir = '0' and 
                               motor_z_step = '1' and z_margin_flag = '1') else '0';
    -- --Error code 12 - Out of bounds virtual box z axis positive direction
    error_list(12) <= '1' when(limit_y_neg = '0' and motor_z_dir = '1' and
                               motor_z_step = '1' and z_margin_flag = '1') else '0';
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => g_address,
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

    
end architecture;