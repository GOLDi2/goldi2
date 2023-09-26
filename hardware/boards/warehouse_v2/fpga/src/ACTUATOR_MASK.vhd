-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Actuator mask for damage prevention 
-- Module Name:		ACTUATOR_MASK
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--                  -> HIGH_DEBOUNCE.vhd
--                  -> VIRTUAL_LIMIT_ARRAY.vhd
--                  -> VIRTUAL_SENSOR_ARRAY.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: Release for Warehouse_V2
--
-- Revision V4.00.00 - Optimized mask and general refactoring
-- Additional Comments: Simplification of entity and protection cases.
--                      Change to the generic and port signal names to follow
--                      V4.00.00 naming convention. Correction of the 
--                      instantiated entities.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;
use work.GOLDI_MODULE_CONFIG.all;




--! @brief System protection module
--! @details
--! The module uses sensor inputs and driver outputs to generate a mask that blocks
--! the driver signals in case of user error to prevent damage to the physical model.
entity ACTUATOR_MASK is
    generic(
        g_enc_x_invert      :   boolean := false;                                       --! Select x encoder positive direction [false -> CCW | true -> CC]
        g_enc_z_invert      :   boolean := false;                                       --! Select z encoder positive direction [false -> CCW | true -> CC]
        g_x_box_margins     :   sensor_limit_array(9 downto 0) := (others => (0,0));    --! X-axis loading bays position values (GOLDI_MODULE_CONFIG)
        g_z_box_margins     :   sensor_limit_array(4 downto 0) := (others => (0,0))     --! Z-axis loading bays position values (GOLDI_MODULE_CONFIG)
    );
    port(
        --General
        clk                 : in    std_logic;                                          --! System clock
        rst                 : in    std_logic;                                          --! Asynchronous reset
        ref_x_encoder       : in    std_logic;                                          --! Reset for x virtual sensor array
        ref_z_encoder       : in    std_logic;                                          --! Reset for z virtual sensor array
        --Flags
        p_block_x_margin    : in    std_logic;                                          --! Block x movement when next loading bay is reached
        p_block_z_margin    : in    std_logic;                                          --! Block z movement when next loading bay is reached
        p_unblock_y_axis    : in    std_logic;                                          --! Unblock y movement inside loading bay for debbuging
        --System data
        p_sys_io_i          : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);        --! System synchronous input data (sensors)
        p_sys_io_o          : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);        --! System output data (drivers)
        --Masked data
        p_safe_io_o         : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)         --! Safe output data (drivers)
    );
end entity ACTUATOR_MASK;




--! General architecture
architecture RTL of ACTUATOR_MASK is

    --****INTERNAL SIGNALS****
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
    alias x_channel_a           :   std_logic is p_sys_io_i(9).dat;
    alias x_channel_b           :   std_logic is p_sys_io_i(10).dat;
    alias z_channel_a           :   std_logic is p_sys_io_i(12).dat;
    alias z_channel_b           :   std_logic is p_sys_io_i(13).dat;
	--Motor inputs
    alias motor_x_step          :   std_logic is p_sys_io_o(18).dat;
    alias motor_x_dir           :   std_logic is p_sys_io_o(19).dat;
    alias motor_y_enb           :   std_logic is p_sys_io_o(24).dat;
    alias motor_y_out_1         :   std_logic is p_sys_io_o(25).dat;
    alias motor_y_out_2         :   std_logic is p_sys_io_o(26).dat;
    alias motor_z_step          :   std_logic is p_sys_io_o(30).dat;
    alias motor_z_dir           :   std_logic is p_sys_io_o(31).dat;
    --Box margin signals
    signal box_x_rst            :   std_logic;
    signal box_z_rst            :   std_logic;
    signal box_x_margins        :   std_logic_vector(9 downto 0);
    signal box_z_margins        :   std_logic_vector(4 downto 0);
    signal box_z_lmargin        :   std_logic_vector(4 downto 0); 
    signal box_z_umargin        :   std_logic_vector(4 downto 0);
    signal x_margin_flag        :   std_logic;
    signal z_margin_flag        :   std_logic;


begin

    --****SENSOR DEBOUNCE****
    -----------------------------------------------------------------------------------------------
    --Sensor debounce removes signal jitter by holding the signal until a logic low is detected
    --for at least 1ms (clk(48*10^6)/stages(4)*clk_factor(12000))
    STABILIZERS : for i in 0 to 5 generate
        DEBOUNCE : entity work.HIGH_DEBOUNCE
        generic map(
            g_stages        => 4,
            g_clk_factor    => 1200
        )
        port map(
            clk             => clk,
            rst             => rst,
            p_io_raw        => p_sys_io_i(i+2).dat,
            p_io_stable     => stable_sensors_i(i)
        );
    end generate;
    -----------------------------------------------------------------------------------------------



    --****VIRTUAL BOX MARGINS****
    -----------------------------------------------------------------------------------------------
    box_x_rst <= rst or ref_x_encoder;
    box_z_rst <= rst or ref_z_encoder;

    X_BOX_MARGINS : entity work.VIRTUAL_SENSOR_ARRAY
    generic map(
        g_invert            => g_enc_x_invert,
        g_number_sensors    => 10,
        g_sensor_limits     => g_x_box_margins
    )
    port map(
        clk                 => clk,
        rst                 => box_x_rst,
        p_channel_a         => x_channel_a,
        p_channel_b         => x_channel_b,
        p_sensor_data       => box_x_margins
    );


    Z_BOX_MARGINS : entity work.VIRTUAL_LIMIT_ARRAY
    generic map(
        g_invert            => g_enc_z_invert,
        g_number_sensors    => 5,
        g_border_margin     => 5,
        g_sensor_limits     => g_z_box_margins
    )
    port map(
        clk                 => clk,
        rst                 => box_z_rst,
        p_channel_a         => z_channel_a,
        p_channel_b         => z_channel_b,
        p_sensor_data       => box_z_margins,
        p_flag_neg          => box_z_lmargin,
        p_flag_pos          => box_z_umargin
    );


    x_margin_flag <= '1' when(box_x_margins /= (box_x_margins'range => '0')) else '0';
    z_margin_flag <= '1' when(box_z_margins /= (box_z_margins'range => '0')) else '0';
    -----------------------------------------------------------------------------------------------
    
    

    --****MASK GENERATOR****
    -----------------------------------------------------------------------------------------------
    p_safe_io_o(17 downto 0) <= p_sys_io_o(17 downto 0);


    --X motor protection
    --TMC2660 step signal blocked to avoid damage
    p_safe_io_o(18).enb <= p_sys_io_o(18).enb;
    p_safe_io_o(18).dat <= '0' when((limit_x_neg      = '1' and limit_x_pos   = '1') or
                                    (limit_x_neg      = '1' and motor_x_dir   = '0') or
                                    (limit_x_pos      = '1' and motor_x_dir   = '1') or
                                    (p_block_x_margin = '1' and x_margin_flag = '1') or
                                    (limit_y_neg      = '0'))                        else
                           p_sys_io_o(18).dat;


    p_safe_io_o(23 downto 19) <= p_sys_io_o(23 downto 19);


    --Y motor protection
    --H-Bridge enable signal blocked to avoid damage
    p_safe_io_o(24).enb <= p_sys_io_o(24).enb;
    p_safe_io_o(24).dat <= '0' when((limit_y_neg      = '1' and limit_y_pos   = '1')  or
                                    (limit_y_neg      = '1' and motor_y_out_2 = '1')  or
                                    (limit_y_pos      = '1' and motor_y_out_1 = '1')  or
                                    (p_unblock_y_axis = '0' and x_margin_flag = '0')  or
                                    (p_unblock_y_axis = '0' and z_margin_flag = '0')) else
                           p_sys_io_o(24).dat;

    p_safe_io_o(29 downto 25) <= p_sys_io_o(29 downto 25);


    --Z motor protection
    --TMC2660 step signal blocked to avoid damage
    p_safe_io_o(30).enb <= p_sys_io_o(30).enb;
    p_safe_io_o(30).dat <= '0' when((limit_z_neg      = '1' and limit_z_pos   = '1')  or
                                    (limit_z_neg      = '1' and motor_z_dir   = '0')  or
                                    (limit_z_pos      = '1' and motor_z_dir   = '1')  or
                                    (p_block_z_margin = '1' and z_margin_flag = '1')  or
                                    (z_margin_flag    = '0'                        )  or
                                    --Box 1 margins
                                    (limit_y_neg = '0' and box_z_margins(0) = '1' and box_z_lmargin(0) = '1' and motor_z_dir = '0')  or
                                    (limit_y_neg = '0' and box_z_margins(0) = '1' and box_z_umargin(0) = '1' and motor_z_dir = '1')  or
                                    --Box 2 margins
                                    (limit_y_neg = '0' and box_z_margins(1) = '1' and box_z_lmargin(1) = '1' and motor_z_dir = '0')  or
                                    (limit_y_neg = '0' and box_z_margins(1) = '1' and box_z_umargin(1) = '1' and motor_z_dir = '1')  or
                                    --Box 3 margins
                                    (limit_y_neg = '0' and box_z_margins(2) = '1' and box_z_lmargin(2) = '1' and motor_z_dir = '0')  or
                                    (limit_y_neg = '0' and box_z_margins(2) = '1' and box_z_umargin(2) = '1' and motor_z_dir = '1')  or
                                    --Box 4 margins
                                    (limit_y_neg = '0' and box_z_margins(3) = '1' and box_z_lmargin(3) = '1' and motor_z_dir = '0')  or
                                    (limit_y_neg = '0' and box_z_margins(3) = '1' and box_z_umargin(3) = '1' and motor_z_dir = '1')  or
                                    --Box 5 margins
                                    (limit_y_neg = '0' and box_z_margins(4) = '1' and box_z_lmargin(4) = '1' and motor_z_dir = '0')  or
                                    (limit_y_neg = '0' and box_z_margins(4) = '1' and box_z_umargin(4) = '1' and motor_z_dir = '1')) else
                           p_sys_io_o(30).dat;

    p_safe_io_o(p_safe_io_o'left downto 31) <= p_sys_io_o(p_sys_io_o'left downto 31);
    -----------------------------------------------------------------------------------------------


end architecture;