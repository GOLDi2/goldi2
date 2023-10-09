-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		10/05/2023
-- Design Name:		Top level - Warehouse V2
-- Module Name:		TOP_LEVEL
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDRD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: Release for Warehouse_V2
--
-- Revision V4.00.00 - Module refactor
-- Additional Comments: Change to the entity names, generic and port signal 
--                      names to follow the V4.00.00 naming convention. Use 
--                      of the updated GOLDI SPI communication modules.
--                      Introduction of improved TMC2660, ACTUATOR_MASK and
--                      ERROR_DETECTOR modules
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! MachX02 library
library machxo2;
use machxo2.all;
--! Custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;
use work.GOLDI_MODULE_CONFIG.all;




--! @brief Top Level of FPGA system for GOLDI Warehouse V2
--! @details
--! The top module contains the drivers for the sensors and actuators 
--! of the GOLDI Warehouse V2 system.
--!
--! <https://www.goldi-labs.net/>
entity TOP_LEVEL is
    port(
        --General
        ClockFPGA   : in    std_logic;                                          --! External system clock
        FPGA_nReset : in    std_logic;                                          --! Active high reset
        --Communication
        --SPI
        SPI0_SCLK   : in    std_logic;                                          --! SPI - Serial clock
        SPI0_MOSI   : in    std_logic;                                          --! SPI - Master out / Slave in
        SPI0_MISO   : out   std_logic;                                          --! SPI - Master in / Slave out
        SPI0_nCE0   : in    std_logic;                                          --! SPI - Active low chip enable
        --IO Interface
        IO_DATA     : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)    --! FPGA IO pins
    );
end entity TOP_LEVEL;




--! GOLDi Warehouse V2 Top Level architecture
architecture RTL of TOP_LEVEL is

    --****INTERNAL SIGNALS****
    --General
    signal clk                  :   std_logic;
    signal rst                  :   std_logic;
    signal FPGA_nReset_sync     :   std_logic;
    --External communication
    signal spi0_sclk_sync       :   std_logic;
    signal spi0_mosi_sync       :   std_logic;
    signal spi0_nce0_sync       :   std_logic;
    --Internal communication
    signal master_bus_o         :   mbus_out;
    signal master_bus_i         :   mbus_in;
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_o_vector(14 downto 0);
    --Control register
    constant ctrl_default       :   data_word := x"40";
    signal ctrl_data            :   data_word;   
        alias enc_ref_x         :   std_logic is ctrl_data(0);
        alias enc_ref_z         :   std_logic is ctrl_data(1);
        alias mask_unblock      :   std_logic is ctrl_data(2);
        -- alias hold_x_motor      :   std_logic is ctrl_data(2);
	    -- alias hold_z_motor		:	std_logic is ctrl_data(3);
        -- alias unblock_y_axis    :   std_logic is ctrl_data(4);  
    --External data interface
    signal external_io_i        :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o_safe   :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    --Sensor data
    --Independent reset
    signal x_encoder_rst        :   std_logic;
    signal z_encoder_rst        :   std_logic;


begin

    --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    --External 48 MHz clk
    clk <= ClockFPGA;

    -- INTERNAL_CLOCK : component machxo2.components.OSCH
    -- generic map(
    --     NOM_FREQ => "44.33"
    -- )
    -- port map(
    --     STDBY    => '0',
    --     OSC      => clk,
    --     SEDSTDBY => open
    -- );
    -----------------------------------------------------------------------------------------------



    --****MICROCONTROLLER INTERFACE****
    -----------------------------------------------------------------------------------------------
    --Synchronization of reset input
    RESET_SYNC : entity work.SYNCHRONIZER
    port map(
        clk         => clk,
        rst         => '0',
        p_io_i      => FPGA_nReset,
        p_io_sync   => FPGA_nReset_sync
    );

    --Reset routing for use in the models
    rst <= FPGA_nReset_sync;    --Incorrect name for signal FPGA_nReset -> Signal active high
    --Reset routing for use in the test Breakoutboard
    --rst <= not FPGA_nReset_sync;


    --SPI communication sync
    SCLK_SYNC : entity work.SYNCHRONIZER
    port map(
        clk         => clk,
        rst         => rst,
        p_io_i      => SPI0_SCLK,
        p_io_sync   => spi0_sclk_sync
    );

    MOSI_SYNC : entity work.SYNCHRONIZER
    port map(
        clk         => clk,
        rst         => rst,
        p_io_i      => SPI0_MOSI,
        p_io_sync   => spi0_mosi_sync
    );

    NCE0_SYNC : entity work.SYNCHRONIZER
    port map(
        clk         => clk,
        rst         => rst,
        p_io_i      => SPI0_nCE0,
        p_io_sync   => spi0_nce0_sync
    );


    --SPI comm modules
    SPI_BUS_COMMUNICATION : entity work.GOLDI_SPI_SMODULE
    port map(
        clk             => clk,
        rst             => rst,
        p_spi_nce       => spi0_nce0_sync,
        p_spi_sclk      => spi0_sclk_sync,
        p_spi_mosi      => spi0_mosi_sync,
        p_spi_miso      => SPI0_MISO,
        p_master_bus_o  => master_bus_o,
        p_master_bus_i  => master_bus_i
    );
    -----------------------------------------------------------------------------------------------



    --****INTERNAL COMMUNICATION MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    CONTROL_REGISTER : entity work.REGISTER_UNIT
    generic map(
        g_address   => CTRL_REGISTER_ADDRESS,
        g_def_value => ctrl_default
    )
    port map(
        clk         => clk,
        rst         => rst,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(0),
        p_data_in   => ctrl_data,
        p_data_out  => ctrl_data,
        p_read_stb  => open,
        p_write_stb => open
    );


    --Demultiplexer for master BUS interface used when crossbar structure is employed
    sys_bus_i <= master_bus_o;

    --Multiplexer for slave BUS interface
    BUS_MUX : process(clk)
    begin
        if(rising_edge(clk)) then
            master_bus_i <= reduceBusVector(sys_bus_o);
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****IO DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    FPGA_PIN_INTERFACE : entity work.TRIS_BUFFER_ARRAY
    generic map(
        g_buff_number   => PHYSICAL_PIN_NUMBER
    )
    port map(
        clk             => clk,
        rst             => rst,
        port_out        => external_io_o_safe,
        port_in_async   => open,
        port_in_sync    => external_io_i,
        io_vector       => IO_DATA
    );
	
	--Encoder system resets
	--User accessible rst to calibrate encoder internal accumulator
    x_encoder_rst <= rst or enc_ref_x; --or (external_io_i(2).dat and external_io_i(6).dat);
	 --User accessible rst to calibrate encoder internal accumulator
    z_encoder_rst <= rst or enc_ref_z; --or (external_io_i(2).dat and external_io_i(6).dat);
    -----------------------------------------------------------------------------------------------




    --****SENSOR DATA****
    -----------------------------------------------------------------------------------------------
    SENSORS : entity work.WH_SENSOR_ARRAY
    generic map(
        g_address           => SENSOR_ARRAY_ADDRESS,
        g_enc_x_invert      => X_ENCODER_INVERT,
        g_enc_z_invert      => Z_ENCODER_INVERT,
        g_x_limit_sensors   => X_SENSOR_LIMITS,
        g_z_limit_sensors   => Z_SENSOR_LIMITS
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        ref_virtual_x       => enc_ref_x,
        ref_virtual_z       => enc_ref_z,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o(1),
        p_lim_x_neg         => external_io_i(2),
        p_lim_x_pos         => external_io_i(3),
        p_lim_y_neg         => external_io_i(4),
        p_lim_y_pos         => external_io_i(5),
        p_lim_z_neg         => external_io_i(6),
        p_lim_z_pos         => external_io_i(7),
        p_inductive         => external_io_i(8),
        p_channel_x_a       => external_io_i(9),
        p_channel_x_b       => external_io_i(10),
        p_channel_z_a       => external_io_i(12),
        p_channel_z_b       => external_io_i(13)
    );
    
    --Configure io to input mode
    external_io_o(8 downto 2) <= (others => gnd_io_o);
    -----------------------------------------------------------------------------------------------



    --****SYSTEM PROTECTION****
    -----------------------------------------------------------------------------------------------
    --#########################################################################
    -- OLD
    --#########################################################################
    -- PROTECTION_MASK : entity work.ACTUATOR_MASK
    -- generic map(
    --     g_enc_x_invert  => X_ENCODER_INVERT,
    --     g_enc_z_invert  => Z_ENCODER_INVERT,
    --     g_x_box_margins => X_PROTECTION_LIMITS,
    --     g_z_box_margins => Z_PROTECTION_LIMITS
    -- )
    -- port map(
    --     clk                 => clk,
    --     rst                 => rst,
    --     ref_x_encoder       => enc_ref_x,
    --     ref_z_encoder       => enc_ref_z,
    --     p_block_x_margin    => hold_x_motor,
    --     p_block_z_margin    => hold_z_motor,
    --     p_unblock_y_axis    => unblock_y_axis,
    --     p_sys_io_i          => external_io_i,
    --     p_sys_io_o          => external_io_o,
    --     p_safe_io_o         => external_io_o_safe
    -- );


    -- ERROR_LIST : entity work.ERROR_DETECTOR
    -- generic map(
    --     g_address       => ERROR_LIST_ADDRESS,
    --     g_enc_x_invert  => X_ENCODER_INVERT,
    --     g_enc_z_invert  => Z_ENCODER_INVERT,
    --     g_x_box_margins => X_SENSOR_LIMITS,
    --     g_z_box_margins => Z_SENSOR_LIMITS
    -- )
    -- port map(
    --     clk             => clk,
    --     rst             => rst,
    --     ref_x_encoder   => enc_ref_x,
    --     ref_z_encoder   => enc_ref_z,
    --     sys_bus_i       => sys_bus_i,
    --     sys_bus_o       => sys_bus_o(2),
    --     p_sys_io_i      => external_io_i,
    --     p_sys_io_o      => external_io_o
    -- );
    --#########################################################################


    --Dynamic System
    PROTECTION_MASK : entity work.ACTUATOR_MASK_D
    generic map(
        g_address       => ACTUATOR_MASK_ADDRESS,
        g_enc_x_invert  => X_ENCODER_INVERT,
        g_enc_z_invert  => Z_ENCODER_INVERT 
    )
    port map(
        clk             => clk,
        rst             => rst,
        ref_unblock     => mask_unblock,
        ref_x_encoder   => enc_ref_x,
        ref_z_encoder   => enc_ref_z,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(14),
        p_sys_io_i      => external_io_i,
        p_sys_io_o      => external_io_o,
        p_safe_io_o     => external_io_o_safe 
    );


    ERROR_LIST  : entity work.ERROR_DETECTOR_D
    generic map(
        g_address       => ERROR_LIST_ADDRESS,
        g_am_address    => ACTUATOR_MASK_ADDRESS,
        g_enc_x_invert  => X_ENCODER_INVERT,
        g_enc_z_invert  => Z_ENCODER_INVERT 
    )
    port map(
        clk             => clk,
        rst             => rst,
        ref_x_encoder   => enc_ref_x,
        ref_z_encoder   => enc_ref_z,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(2),
        p_sys_io_i      => external_io_i,
        p_sys_io_o      => external_io_o
    );
    -----------------------------------------------------------------------------------------------



    --****INCREMENTAL ENCODERS****
    -----------------------------------------------------------------------------------------------
    X_ENCODER : entity work.ENCODER_SMODULE
    generic map(
        g_address       => X_ENCODER_ADDRESS,
        g_index_rst     => X_ENCODER_RST_TYPE,
        g_invert        => X_ENCODER_INVERT
    )
    port map(
        clk             => clk,
        rst             => x_encoder_rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(3),
        p_channel_a     => external_io_i(9),
        p_channel_b     => external_io_i(10),
        p_channel_i     => external_io_i(11)
    );
    --Configure io to input mode
    external_io_o(11 downto 9) <= (others => gnd_io_o);



    Z_ENCODER : entity work.ENCODER_SMODULE
    generic map(
        g_address       => Z_ENCODER_ADDRESS,
        g_index_rst     => Z_ENCODER_RST_TYPE,
        g_invert        => Z_ENCODER_INVERT
    )
    port map(
        clk             => clk,
        rst             => z_encoder_rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(4),
        p_channel_a     => external_io_i(12),
        p_channel_b     => external_io_i(13),
        p_channel_i     => external_io_i(14)
    );
    --Configure io to input mode
    external_io_o(14 downto 12) <= (others => gnd_io_o);
    -----------------------------------------------------------------------------------------------



    --****ACTUATION****
    -----------------------------------------------------------------------------------------------
    GPIO_MANAGEMENT : entity work.GPIO_SMODULE
    generic map(
        g_address       => GPIO_DRIVER_ADDRESS,
        g_gpio_number   => 2
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(5),
        p_gpio_i_vector => external_io_i(1 downto 0),
        p_gpio_o_vector => external_io_o(1 downto 0)
    );



    --#########################################################################
    -- OLD
    --#########################################################################
    -- X_AXIS_MOTOR : entity work.TMC2660_DRIVER
    -- generic map(
    --     ADDRESS         => X_MOTOR_ADDRESS,
    --     SCLK_FACTOR     => X_MOTOR_SCLK_FACTOR,
    --     TMC2660_CONFIG  => X_MOTOR_CONFIGURATION
    -- )
    -- port map(
    --     clk             => clk,
    --     rst             => rst,
    --     sys_bus_i       => sys_bus_i,
    --     sys_bus_o       => sys_bus_o(6),
    --     tmc2660_clk     => external_io_o(15),
    --     tmc2660_enn     => external_io_o(16),
    --     tmc2660_sg      => external_io_i(17),
    --     tmc2660_dir     => external_io_o(19),
    --     tmc2660_step    => external_io_o(18),
    --     tmc2660_sclk    => external_io_o(21),
    --     tmc2660_ncs     => external_io_o(20),
    --     tmc2660_mosi    => external_io_o(22),
    --     tmc2660_miso    => external_io_i(23)
    -- );
    --#########################################################################

    X_AXIS_MOTOR : entity work.TMC2660_SMODULE
    generic map(
        g_address           => X_MOTOR_ADDRESS,
        g_sclk_factor       => X_MOTOR_SCLK_FACTOR,
        g_rst_delay         => X_MOTOR_RST_DELAY,
        g_tmc2660_config    => X_MOTOR_CONFIG_16BIT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o(6),
        p_tmc2660_clk       => external_io_o(15),
        p_tmc2660_enn       => external_io_o(16),
        p_tmc2660_sg        => external_io_i(17),
        p_tmc2660_dir       => external_io_o(19),
        p_tmc2660_step      => external_io_o(18),
        p_tmc2660_ncs       => external_io_o(20),
        p_tmc2660_sclk      => external_io_o(21),
        p_tmc2660_mosi      => external_io_o(22),
        p_tmc2660_miso      => external_io_i(23)
    );

    --Configure io to input mode
    external_io_o(17) <= gnd_io_o;
    external_io_o(23) <= gnd_io_o;



    Y_AXIS_MOTOR : entity work.HBRIDGE_SMODULE
    generic map(
        g_address       => Y_MOTOR_ADDRESS,
        g_clk_factor    => Y_MOTOR_FREQUENCY
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(7),
        p_hb_enb        => external_io_o(24),
        p_hb_out_1      => external_io_o(25),
        p_hb_out_2      => external_io_o(26)
    );


    --#########################################################################
    -- OLD
    --#########################################################################
    -- Z_AXIS_MOTOR : entity work.TMC2660_DRIVER
    -- generic map(
    --     ADDRESS         => Z_MOTOR_ADDRESS,
    --     SCLK_FACTOR     => Z_MOTOR_SCLK_FACTOR,
    --     TMC2660_CONFIG  => Z_MOTOR_CONFIGURATION
    -- )
    -- port map(
    --     clk             => clk,
    --     rst             => rst,
    --     sys_bus_i       => sys_bus_i,
    --     sys_bus_o       => sys_bus_o(8),
    --     tmc2660_clk     => external_io_o(27),
    --     tmc2660_enn     => external_io_o(28),
    --     tmc2660_sg      => external_io_i(29),
    --     tmc2660_dir     => external_io_o(31),
    --     tmc2660_step    => external_io_o(30),
    --     tmc2660_sclk    => external_io_o(33),
    --     tmc2660_ncs     => external_io_o(32),
    --     tmc2660_mosi    => external_io_o(34),
    --     tmc2660_miso    => external_io_i(35)
    -- );
    --#########################################################################

    Z_AXIS_MOTOR : entity work.TMC2660_SMODULE
    generic map(
        g_address           => Z_MOTOR_ADDRESS,
        g_sclk_factor       => Z_MOTOR_SCLK_FACTOR,
        g_rst_delay         => Z_MOTOR_RST_DELAY,
        g_tmc2660_config    => Z_MOTOR_CONFIG_16BIT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o(8),
        p_tmc2660_clk       => external_io_o(27),
        p_tmc2660_enn       => external_io_o(28),
        p_tmc2660_sg        => external_io_i(29),
        p_tmc2660_dir       => external_io_o(31),
        p_tmc2660_step      => external_io_o(30),
        p_tmc2660_ncs       => external_io_o(32),
        p_tmc2660_sclk      => external_io_o(33),
        p_tmc2660_mosi      => external_io_o(34),
        p_tmc2660_miso      => external_io_i(35)
    );

    -- --Configure io to input mode
    external_io_o(29) <= gnd_io_o;
    external_io_o(35) <= gnd_io_o;
    -----------------------------------------------------------------------------------------------



    --****LED MAAGEMENT****
    -----------------------------------------------------------------------------------------------
    POWER_RED : entity work.LED_SMODULE
    generic map(
        g_address       => PR_LED_ADDRESS,
        g_clk_frequency => PR_LED_FREQUENCY,
        g_inverted      => PR_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(9),
        p_led_output    => external_io_o(36)
    );

    
    POWER_GREEN : entity work.LED_SMODULE
    generic map(
        g_address       => PG_LED_ADDRESS,
        g_clk_frequency => PG_LED_FREQUENCY,
        g_inverted      => PG_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(10),
        p_led_output    => external_io_o(37)
    );


    ENVIRONMENT_RED : entity work.LED_SMODULE
    generic map(
        g_address       => ER_LED_ADDRESS,
        g_clk_frequency => ER_LED_FREQUENCY,
        g_inverted      => ER_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(11),
        p_led_output    => external_io_o(38)
    );


    ENVIRONMENT_WHITE : entity work.LED_SMODULE
    generic map(
        g_address       => EW_LED_ADDRESS,
        g_clk_frequency => EW_LED_FREQUENCY,
        g_inverted      => EW_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(12),
        p_led_output    => external_io_o(39)
    );


    ENVIRONMENT_GREEN : entity work.LED_SMODULE
    generic map(
        g_address       => EG_LED_ADDRESS,
        g_clk_frequency => EG_LED_FREQUENCY,
        g_inverted      => EG_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(13),
        p_led_output    => external_io_o(40)
    );
    -----------------------------------------------------------------------------------------------


end architecture;