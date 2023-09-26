-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/09/2023
-- Design Name:		Error list for warehouse (dynamic)
-- Module Name:		ERROR_DETECTOR_D
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--                  -> ENCODER_DRIVER.vhd
--                  -> REGISTER_TABLE.vhd
--                  -> HIGH_DEBOUNCE.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_MODULE_CONFIG.all;




--! @brief Dynamic error list for the Warehouse_v2 model
--! @details
--! The dynamic error detector is an alternate approach to the error communication
--! of the Warehouse_V2 model. Instead of using PLU memory units and a large set of
--! logic conditions like the ERROR_DETECTOR used in V3.00.00. The new module uses
--! memory units to detect the movement of the Warehouse_V2's crane.
--!
--! The module uses four 16-bit unsigned values corresponding to the lower and upper
--! limits of the X- and Z-Axis. An internal dsp unit processes the data gathered by 
--! the incremental encoders and tracks the crane's position and an error list is 
--! generated based on the position of the crane. The limit values configured to the
--! ACTUATOR_MASK_D are mirroed in the ERROR_DETECTOR_D.
--!
--! Additionaly the physical limit switches block the crane's movement if pressed.
--! A debounce module holds a valid high signal for 2.5 us to prevent glitching.
entity ERROR_DETECTOR_D is
    generic(
        g_address       :   natural := 4;                                       --! Module's base address
        g_am_address    :   natural := 1;                                       --! Address of actuator mask to mirror limit data
        g_enc_x_invert  :   boolean := false;                                   --! Select x encoder positive direction [false -> CCW | true -> CC]
        g_enc_z_invert  :   boolean := false                                    --! Select z encoder positive direction [false -> CCW | true -> CC]
    );
    port(
        --General 
        clk             : in    std_logic;                                      --! System clock
        rst             : in    std_logic;                                      --! Asynchronous reset
        ref_x_encoder   : in    std_logic;                                      --! Reset for x encoder dsp  
        ref_z_encoder   : in    std_logic;                                      --! Reset for z encoder dsp
        --Slave BUS interface
        sys_bus_i       : in    sbus_in;                                        --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;                                       --! BUS output signals [dat,tag,mux]
        --IO Data
        p_sys_io_i      : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System synchronous input data (sensors)
        p_sys_io_o      : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)    --! System output data (drivers)
    );
end entity ERROR_DETECTOR_D;




--! General architecture
architecture RTL of ERROR_DETECTOR_D is

    --****INTERNAL SIGNALS****
    --**Memory**
    constant am_memory_length   :   natural := getMemoryLength(64);
    constant ed_memory_length   :   natural := getMemoryLength(15);
    constant am_reg_default     :   data_word_vector(am_memory_length-1 downto 0) := (others => (others => '0'));
    constant ed_reg_default     :   data_word_vector(ed_memory_length-1 downto 0) := (others => (others => '0'));
    signal am_reg_data          :   data_word_vector(am_memory_length-1 downto 0);
    signal ed_reg_data          :   data_word_vector(ed_memory_length-1 downto 0);
    signal vlimit_x_neg      	:   std_logic_vector(15 downto 0);
    signal vlimit_x_pos      	:   std_logic_vector(15 downto 0);
    signal vlimit_z_neg      	:   std_logic_vector(15 downto 0);
    signal vlimit_z_pos      	:   std_logic_vector(15 downto 0);
    --**Errors**
    signal error_list           :   std_logic_vector(14 downto 0);
    --**Position data**
    signal rst_x_encoder        :   std_logic;
    signal rst_z_encoder        :   std_logic;
    signal enc_x_counter        :   std_logic_vector(15 downto 0);
    signal enc_z_counter        :   std_logic_vector(15 downto 0);    
    --**Inputs**
    signal stable_sensors_i     :   std_logic_vector(5 downto 0);
    alias limit_x_neg           :   std_logic is stable_sensors_i(0);
    alias limit_x_pos           :   std_logic is stable_sensors_i(1);
    alias limit_y_neg           :   std_logic is stable_sensors_i(2);
    alias limit_y_pos           :   std_logic is stable_sensors_i(3);
    alias limit_z_neg           :   std_logic is stable_sensors_i(4);
    alias limit_z_pos           :   std_logic is stable_sensors_i(5);
    --Incremental encoders
    alias x_channel_a           :   std_logic is p_sys_io_i(9).dat;
    alias x_channel_b           :   std_logic is p_sys_io_i(10).dat;
    alias z_channel_a           :   std_logic is p_sys_io_i(12).dat;
    alias z_channel_b           :   std_logic is p_sys_io_i(13).dat;
	--Motor inputs
    signal motor_x_step         :   std_logic;         
    signal motor_y_enb          :   std_logic;
    signal motor_z_step         :   std_logic;
    alias motor_x_dir           :   std_logic is p_sys_io_o(19).dat;
    alias motor_y_out_1         :   std_logic is p_sys_io_o(25).dat;
    alias motor_y_out_2         :   std_logic is p_sys_io_o(26).dat;
    alias motor_z_dir           :   std_logic is p_sys_io_o(31).dat;


begin

    --****SENSOR DEBOUNCE****
    -----------------------------------------------------------------------------------------------
    --Physical sensor debounce removes signal jitter by holding the signal until a logic low is 
    --detected for at least 500us (clk(48*10^6)/stages(4)*clk_factor())
    STABILIZERS : for i in 0 to 5 generate
        DEBOUNCE : entity work.HIGH_DEBOUNCE
        generic map(
            g_stages      => 4,
            g_clk_factor  => 1200
        )
        port map(
            clk         => clk,
            rst         => rst,
            p_io_raw    => p_sys_io_i(i+2).dat,
            p_io_stable => stable_sensors_i(i)
        );
    end generate;
    -----------------------------------------------------------------------------------------------



    --****MOTOR ACTIVE DETECTION****
    -----------------------------------------------------------------------------------------------
    X_MOTOR_ACTIVE : entity work.HIGH_DEBOUNCE
    generic map(
        g_stages        => 4,
        g_clk_factor    => 1200
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_io_raw        => p_sys_io_o(18).dat,
        p_io_stable     => motor_x_step
    );


    Y_MOTOR_ACTIVE : entity work.HIGH_DEBOUNCE
    generic map(
        g_stages        => 4,
        g_clk_factor    => 1200
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_io_raw        => p_sys_io_o(24).dat,
        p_io_stable     => motor_y_enb
    );


    Z_MOTOR_ACTIVE : entity work.HIGH_DEBOUNCE
    generic map(
        g_stages        => 4,
        g_clk_factor    => 1200
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_io_raw        => p_sys_io_o(30).dat,
        p_io_stable     => motor_z_step
    );
    -----------------------------------------------------------------------------------------------



    --****VIRTUAL LIMIT CONTROL****
    -----------------------------------------------------------------------------------------------
    --Reset encoders through global reset and local reset in register
    rst_x_encoder <= rst or ref_x_encoder;
    rst_z_encoder <= rst or ref_z_encoder;


    X_ENCODER_DSP : entity work.ENCODER_DRIVER
    generic map(
        g_invert_dir    => g_enc_x_invert
    )
    port map(
        clk             => clk,
        rst             => rst_x_encoder,
        enb             => '1',
        p_channel_a     => x_channel_a,
        p_channel_b     => x_channel_b,
        p_enc_count     => enc_x_counter
    );

    Z_ENCODER_DSP : entity work.ENCODER_DRIVER
    generic map(
        g_invert_dir    => g_enc_z_invert
    )
    port map(
        clk             => clk,
        rst             => rst_z_encoder,
        enb             => '1',
        p_channel_a     => z_channel_a,
        p_channel_b     => z_channel_b,
        p_enc_count     => enc_z_counter
    );
    -----------------------------------------------------------------------------------------------



    --****ERROR LIST****
    -----------------------------------------------------------------------------------------------
    --X-Axis physical switches
    --Error code 0 - Limit sensors negative and positive active
    error_list(0)  <= '1' when(limit_x_neg = '1' and limit_x_pos = '1') else '0';
    --Error code 1 - Motor active in negative direction and negative sensor active
    error_list(1)  <= '1' when(limit_x_neg = '1' and motor_x_dir = '0' and motor_x_step = '1') else '0';
    --Error code 2 - Motor active in positive direction and positive sensor active
    error_list(2)  <= '1' when(limit_x_pos = '1' and motor_x_dir = '1' and motor_x_step = '1') else '0';

    --Y-Axis physical switches
    --Error code 3 - Limit sensors negative and positive active
    error_list(3)  <= '1' when(limit_y_neg = '1' and limit_y_pos = '1') else '0';
    --Error code 4 - Motor active in negative direction and negative sensor active
    error_list(4)  <= '1' when(limit_y_neg = '1' and motor_y_out_2 = '1' and motor_y_enb = '1') else '0';
    --Error code 2 - Motor active in positive direction and positive sensor active
    error_list(5)  <= '1' when(limit_y_pos = '1' and motor_y_out_1 = '1' and motor_y_enb = '1') else '0';
    
    --Z-Axis physical switches
    --Error code 6 - Limit sensors negative and positive active
    error_list(6)  <= '1' when(limit_z_neg = '1' and limit_z_pos = '1') else '0';
    --Error code 7 - Motor active in negative direction and negative sensor active
    error_list(7)  <= '1' when(limit_z_neg = '1' and motor_z_dir = '0' and motor_z_step = '1') else '0';
    --Error code 8 - Motor active in positive direction and positive sensor active
    error_list(8)  <= '1' when(limit_z_pos = '1' and motor_z_dir = '1' and motor_z_step = '1') else '0';

    --X-Axis virtual limit errors
    --Error code 9 - Virtual negative limit reached and motor active in negative direction
    error_list(9)  <= '1' when((unsigned(enc_x_counter) <= unsigned(vlimit_x_neg)) and (motor_x_dir = '0') and (motor_x_step = '1')) else '0';
    --Error code 10 - Virtual positive limit reached and motor active in positive direction
    error_list(10) <= '1' when((unsigned(enc_x_counter) >= unsigned(vlimit_x_pos)) and (motor_x_dir = '1') and (motor_x_step = '1')) else '0';
    --Error code 11 - Virtual negative limit higher than virtual positive limit
    error_list(11) <= '1' when((unsigned(vlimit_x_neg) > unsigned(vlimit_x_pos))) else '0';

    --Z-Axis virtual limit errors
    --Error code 12 - Virtual negative limit reached and motor active in negative direction
    error_list(12) <= '1' when((unsigned(enc_z_counter) <= unsigned(vlimit_z_neg)) and (motor_z_dir = '0') and (motor_z_step = '1')) else '0';
    --Error code 13 - Virtual positive limit reached and motor active in positive direction
    error_list(13) <= '1' when((unsigned(enc_z_counter) >= unsigned(vlimit_z_pos)) and (motor_z_dir = '1') and (motor_z_step = '1')) else '0';
    --Error code 14 - Virtual negative limit higher than virtual positive limit
    error_list(14) <= '1' when((unsigned(vlimit_z_neg) > unsigned(vlimit_z_pos))) else '0';
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    LIMIT_MEMORY : entity work.REGISTER_TABLE
    generic map(
        g_address       => g_am_address,
        g_reg_number    => am_memory_length,
        g_def_values    => am_reg_default
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => open,
        p_data_in       => (others => (others => '0')),
        p_data_out      => am_reg_data,
        p_read_stb      => open,
        p_write_stb     => open
    );
	
	vlimit_x_neg <= am_reg_data(1) & am_reg_data(0);
	vlimit_x_pos <= am_reg_data(3) & am_reg_data(2);
	vlimit_z_neg <= am_reg_data(5) & am_reg_data(4);
	vlimit_z_pos <= am_reg_data(7) & am_reg_data(6);


    ERROR_MEMORY : entity work.REGISTER_TABLE
    generic map(
        g_address       => g_address,
        g_reg_number    => ed_memory_length,
        g_def_values    => ed_reg_default
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_data_in       => ed_reg_data,
        p_data_out      => open,
        p_read_stb      => open,
        p_write_stb     => open
    );

    ed_reg_data <= setMemory(error_list);
    -----------------------------------------------------------------------------------------------


end architecture;