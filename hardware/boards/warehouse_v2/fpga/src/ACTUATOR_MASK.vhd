-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
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
--                  -> VIRTUAL_SENSOR_ARRAY.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: Release for Warehouse_V2
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




--! @brief System protection module for Warehouse_V2
--! @details
--! Module uses the sensor inputs and driver output to generate a mask that
--! blocks the driver signals in case of user error, to prevent damage to the 
--! physical model. 
entity ACTUATOR_MASK is
    generic(
        ENC_X_INVERT    :   boolean := false;                                       --! Select positive x direction [false -> CCW | true -> CC]
        ENC_Z_INVERT    :   boolean := false;                                       --! Select positive z direction [false -> CCW | true -> CC]
        Z_BORDER_MARGIN :   integer := 10;
        LIMIT_X_SENSORS :   sensor_limit_array(9 downto 0) := (others => (0,0));    --! Virtual sensor limits 
        LIMIT_Z_SENSORS :   sensor_limit_array(4 downto 0) := (others => (0,0))     --! Virtual sensor limits
    );
    port(
        --General
        clk             : in    std_logic;                                          --! System clock
        rst             : in    std_logic;                                          --! Synchronous reset
        rst_virtual_x   : in    std_logic;
        rst_virtual_z   : in    std_logic;
        --System data
        sys_io_i        : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);        --! IO data inputs (sensor data)
        sys_io_o        : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);        --! IO data outputs (actuator data)
        --Masked data
        safe_io_o       : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)         --! Masked driver outputs
    );
end entity ACTUATOR_MASK;




--! 
architecture RTL of ACTUATOR_MASK is

    --****INTERNAL SIGNALS****
    --Motor inputs
    alias motor_x_step          :   std_logic is sys_io_o(18).dat;
    alias motor_x_dir           :   std_logic is sys_io_o(19).dat;
    alias motor_y_enb           :   std_logic is sys_io_o(24).dat;
    alias motor_y_out_1         :   std_logic is sys_io_o(25).dat;
    alias motor_y_out_2         :   std_logic is sys_io_o(26).dat;
    alias motor_z_step          :   std_logic is sys_io_o(30).dat;
    alias motor_z_dir           :   std_logic is sys_io_o(31).dat;
    --Debounce
    signal stable_sensors       :   std_logic_vector(5 downto 0);
        alias limit_x_neg       :   std_logic is stable_sensors(0);
        alias limit_x_pos       :   std_logic is stable_sensors(1);
        alias limit_y_neg       :   std_logic is stable_sensors(2);
        alias limit_y_pos       :   std_logic is stable_sensors(3);
        alias limit_z_neg       :   std_logic is stable_sensors(4);
        alias limit_z_pos       :   std_logic is stable_sensors(5);
    --Virtual sensor signals
    signal x_vsensors           :   std_logic_vector(9 downto 0);
    signal x_virtual_limit      :   std_logic;
    signal z_vsensors           :   std_logic_vector(4 downto 0);
	signal z_virtual_limit		:	std_logic;
    signal z_vflag_bottom       :   std_logic_vector(4 downto 0);
    signal z_vflag_top          :   std_logic_vector(4 downto 0);

    --Actuator mask
    signal mask                 :   std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0);


begin

    --****SENSOR DEBOUNCE****
    -----------------------------------------------------------------------------------------------
    --Sensor debounce removes signal jitter by holding the signal until a logic low is detected
    --for at least 1ms (clk(48*10^6)/stages(4)*clk_factor(12000))
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


    --****VIRTUAL BOX LIMITS****
    -----------------------------------------------------------------------------------------------    
    X_VIRTUAL_SENSORS : entity work.VIRTUAL_SENSOR_ARRAY
    generic map(
        INVERT              => ENC_X_INVERT,
        NUMBER_SENSORS      => 10,
        SENSOR_LIMITS       => LIMIT_X_SENSORS
    )
    port map(
        clk                 => clk,
        rst                 => rst_virtual_x,
        enc_channel_a       => sys_io_i(9).dat,
        enc_channel_b       => sys_io_i(10).dat,
        sensor_data_out     => x_vsensors
    );

    Z_VIRTUAL_SENSORS : entity work.VIRTUAL_LIMIT_ARRAY
    generic map(
        INVERT              => ENC_Z_INVERT,
        NUMBER_SENSORS      => 5,
        BORDER_MARGIN       => Z_BORDER_MARGIN,
        SENSOR_LIMITS       => LIMIT_Z_SENSORS
    )
    port map(
        clk                 => clk,
        rst                 => rst_virtual_z,
        enc_channel_a       => sys_io_i(12).dat,
        enc_channel_b       => sys_io_i(13).dat,
        sensor_data_out     => z_vsensors,
        sensor_flag_neg     => z_vflag_bottom,
        sensor_flag_pos     => z_vflag_top
    );

    x_virtual_limit <= '1' when(x_vsensors /= (x_vsensors'range => '0')) else '0';
	z_virtual_limit <= '1' when(z_vsensors /= (z_vsensors'range => '0')) else '0';
    -----------------------------------------------------------------------------------------------


    --****MASK GENERATION****
    -----------------------------------------------------------------------------------------------
    mask(17 downto 0) <= (others => '1');

    --X motor protection
    --TMC2660 step signal blocked to avoid damage
    mask(18) <= '0' when((limit_x_neg = '1' and limit_x_pos = '1')      or
                          (limit_x_neg = '1' and motor_x_dir = '0')      or
                          (limit_x_pos = '1' and motor_x_dir = '1')      or
                          (limit_y_neg = '0'))                            else
                '1';
    
    mask(23 downto 19) <= (others => '1');
    
    --Y motor protection
    --H-Bridge enable signal blocked to avoid damage
    mask(24) <= '0' when((limit_y_neg = '1' and limit_y_pos   = '1')    or
                          (limit_y_neg = '1' and motor_y_out_2 = '1')    or
                          (limit_y_pos = '1' and motor_y_out_1 = '1')    or
                          (x_virtual_limit = '0')                         or
						  (z_virtual_limit = '0'))						   else
                '1';

    mask(29 downto 25) <= (others => '1');

    --Z motor protection
    --TMC2660 step signal blocked to avoid damage
    mask(30) <= '0' when((limit_z_neg = '1' and limit_z_pos = '1')     or
                         (limit_z_neg = '1' and motor_z_dir = '0')      or
                         (limit_z_pos = '1' and motor_z_dir = '1')      or
                        --Z Axis virtual box limits 
                        --Outside of virtual boxes
                         (limit_y_neg = '0' and z_vsensors = (z_vsensors'range => '0'))                                  or
                        --Box 1
                         (limit_y_neg = '0' and z_vsensors(0) = '1' and z_vflag_bottom(0)  = '1' and motor_z_dir = '0') or
                         (limit_y_neg = '0' and z_vsensors(0) = '1' and z_vflag_top(0)     = '1' and motor_z_dir = '1') or 
                        --Box 2
                         (limit_y_neg = '0' and z_vsensors(1) = '1' and z_vflag_bottom(1)  = '1' and motor_z_dir = '0') or
                         (limit_y_neg = '0' and z_vsensors(1) = '1' and z_vflag_top(1)     = '1' and motor_z_dir = '1') or
                        --Box 3
                         (limit_y_neg = '0' and z_vsensors(2)  = '1' and z_vflag_bottom(2) = '1' and motor_z_dir = '0') or
                         (limit_y_neg = '0' and z_vsensors(2) = '1' and z_vflag_top(2)     = '1' and motor_z_dir = '1') or
                        --Box 4
                         (limit_y_neg = '0' and z_vsensors(3) = '1' and z_vflag_bottom(3)  = '1' and motor_z_dir = '0') or
                         (limit_y_neg = '0' and z_vsensors(3) = '1' and z_vflag_top(3)     = '1' and motor_z_dir = '1') or
                        --Box 5
                         (limit_y_neg = '0' and z_vsensors(4) = '1' and z_vflag_bottom(4)  = '1' and motor_z_dir = '0') or
                         (limit_y_neg = '0' and z_vsensors(4) = '1' and z_vflag_top(4)     = '1' and motor_z_dir = '1'))else
                '1';

    mask(mask'left downto 31) <= (others => '1');
    -----------------------------------------------------------------------------------------------



    --****SAFE IO GENERATION****
    -----------------------------------------------------------------------------------------------
    SIGNAL_PROTECTON : for i in 0 to PHYSICAL_PIN_NUMBER-1 generate
        safe_io_o(i).enb <= sys_io_o(i).enb;
        safe_io_o(i).dat <= sys_io_o(i).dat and mask(i);
    end generate;
    -----------------------------------------------------------------------------------------------

end RTL;