-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
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
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! MachX02 library
library machxo2;
use machxo2.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;
use work.GOLDI_MODULE_CONFIG.all;




--! @brief
--! @details
entity TOP_LEVEL is
    port(
        --General
        ClockFPGA   : in    std_logic;
        FPGA_nReset : in    std_logic;
        --Communication
        --SPI
        SPI0_SCLK   : in    std_logic;
        SPI0_MOSI   : in    std_logic;
        SPI0_MISO   : out   std_logic;
        SPI0_nCE0   : in    std_logic;
        --IO Interface
        IO_DATA     : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
    );
end entity TOP_LEVEL;




--! General architecture
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
    signal spi0_ce0             :   std_logic;
    --Internal communication
    signal master_bus_o         :   mbus_out;
    signal master_bus_i         :   mbus_in;
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_o_vector(13 downto 0);
    --Control register
    constant ctrl_default       :   data_word := x"A0";
    signal ctrl_data            :   data_word;   
       alias enc_ref_x          :   std_logic is ctrl_data(0);
       alias enc_ref_z          :   std_logic is ctrl_data(1);
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
        clk     => clk,
        rst     => '0',
        io_i    => FPGA_nReset,
        io_sync => FPGA_nReset_sync
    );
    rst <= FPGA_nReset_sync;    --Incorrect name for signal FPGA_nReset -> Signal active high


    --SPI communication sync
    SCLK_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => SPI0_SCLK,
        io_sync => spi0_sclk_sync
    );

    MOSI_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => SPI0_MOSI,
        io_sync => spi0_mosi_sync
    );

    NCE0_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => SPI0_nCE0,
        io_sync => spi0_nce0_sync
    );

    --Negate nce for use in comm module (ce - active high)
    spi0_ce0 <= not spi0_nce0_sync;


    --SPI comm module
    SPI_BUS_COMMUNICATION : entity work.SPI_TO_BUS
    port map(
        clk             => clk,
        rst             => rst,
        ce              => spi0_ce0,
        sclk            => spi0_sclk_sync,
        mosi            => spi0_mosi_sync,
        miso            => SPI0_MISO,
        master_bus_o    => master_bus_o,
        master_bus_i    => master_bus_i
    );
    -----------------------------------------------------------------------------------------------



    --****INTERNAL COMMUNICATION MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    CONTROL_REGISTER : entity work.REGISTER_UNIT
    generic map(
        ADDRESS     => CTRL_REGISTER_ADDRESS,
        DEF_VALUE   => ctrl_default
    )
    port map(
        clk         => clk,
        rst         => rst,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(0),
        data_in     => ctrl_data,
        data_out    => ctrl_data,
        read_stb    => open,
        write_stb   => open
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
        BUFF_NUMBER     => PHYSICAL_PIN_NUMBER
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
    x_encoder_rst <= rst or enc_ref_x or (external_io_i(2).dat and external_io_i(6).dat);
	 --User accessible rst to calibrate encoder internal accumulator
    z_encoder_rst <= rst or enc_ref_z or (external_io_i(2).dat and external_io_i(6).dat);
    -----------------------------------------------------------------------------------------------




    --****SENSOR DATA****
    -----------------------------------------------------------------------------------------------
    SENSORS : entity work.SENSOR_ARRAY
    generic map(
        ADDRESS         => SENSOR_ARRAY_ADDRESS,
        ENC_X_INVERT    => X_ENCODER_INVERT,
        ENC_Z_INVERT    => Z_ENCODER_INVERT,
        LIMIT_X_SENSORS => X_SENSOR_LIMITS,
        LIMIT_Z_SENSORS => Z_SENSOR_LIMITS
    )
    port map(
        clk             => clk,
        rst             => rst,
        rst_virtual_x   => enc_ref_x,
        rst_virtual_z   => enc_ref_z,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(1),
        lim_x_neg       => external_io_i(2),
        lim_x_pos       => external_io_i(3),
        lim_y_neg       => external_io_i(4),
        lim_y_pos       => external_io_i(5),
        lim_z_neg       => external_io_i(6),
        lim_z_pos       => external_io_i(7),
        inductive       => external_io_i(8),
        enc_channel_x_a => external_io_i(9),
        enc_channel_x_b => external_io_i(10),
        enc_channel_z_a => external_io_i(12),
        enc_channel_z_b => external_io_i(13)
    );
    --Configure io to input mode
    external_io_o(8 downto 2) <= (others => gnd_io_o);
    -----------------------------------------------------------------------------------------------



    --****SYSTEM PROTECTION****
    -----------------------------------------------------------------------------------------------
    PROTECTION_MASK : entity work.ACTUATOR_MASK
    generic map(
        ENC_X_INVERT    => X_ENCODER_INVERT,
        ENC_Z_INVERT    => Z_ENCODER_INVERT,
        Z_BORDER_MARGIN => Z_BORDER_MARGIN,
        LIMIT_X_SENSORS => X_PROTECTION_LIMITS,
        LIMIT_Z_SENSORS => Z_PROTECTION_LIMITS
    )
    port map(
        clk             => clk,
        rst             => rst,
        rst_virtual_x   => enc_ref_x,
        rst_virtual_z   => enc_ref_z,
        sys_io_i        => external_io_i,
        sys_io_o        => external_io_o,
        safe_io_o       => external_io_o_safe
    );


    ERROR_LIST : entity work.ERROR_DETECTOR
    generic map(
        ADDRESS         => ERROR_LIST_ADDRESS,
        ENC_X_INVERT    => X_ENCODER_INVERT,
        ENC_Z_INVERT    => Z_ENCODER_INVERT,
        LIMIT_X_SENSORS => X_PROTECTION_LIMITS,
        LIMIT_Z_SENSORS => Z_PROTECTION_LIMITS
    )
    port map(
        clk             => clk,
        rst             => rst,
        rst_virtual_x   => enc_ref_x,
        rst_virtual_z   => enc_ref_z,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(2),
        sys_io_i        => external_io_i,
        sys_io_o        => external_io_o
    );
    -----------------------------------------------------------------------------------------------



    --****INCREMENTAL ENCODERS****
    -----------------------------------------------------------------------------------------------
    X_ENCODER : entity work.INC_ENCODER
    generic map(
        ADDRESS     => X_ENCODER_ADDRESS,
        INDEX_RST   => X_ENCODER_RST_TYPE,
        INVERT      => X_ENCODER_INVERT
    )
    port map(
        clk         => clk,
        rst         => x_encoder_rst,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(3),
        channel_a   => external_io_i(9),
        channel_b   => external_io_i(10),
        channel_i   => external_io_i(11)
    );
    --Configure io to input mode
    external_io_o(11 downto 9) <= (others => gnd_io_o);



    Z_ENCODER : entity work.INC_ENCODER
    generic map(
        ADDRESS     => Z_ENCODER_ADDRESS,
        INDEX_RST   => Z_ENCODER_RST_TYPE,
        INVERT      => Z_ENCODER_INVERT
    )
    port map(
        clk         => clk,
        rst         => z_encoder_rst,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(4),
        channel_a   => external_io_i(12),
        channel_b   => external_io_i(13),
        channel_i   => external_io_i(14)
    );
    --Configure io to input mode
    external_io_o(14 downto 12) <= (others => gnd_io_o);
    -----------------------------------------------------------------------------------------------



    --****ACTUATION****
    -----------------------------------------------------------------------------------------------
    GPIO_MANAGEMENT : entity work.GPIO_DRIVER_ARRAY
    generic map(
        ADDRESS         => GPIO_DRIVER_ADDRESS,
        GPIO_NUMBER     => 2
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(5),
        gpio_i_vector   => external_io_i(1 downto 0),
        gpio_o_vector   => external_io_o(1 downto 0)
    );



    X_AXIS_MOTOR : entity work.TMC2660_DRIVER
    generic map(
        ADDRESS         => X_MOTOR_ADDRESS,
        SCLK_FACTOR     => X_MOTOR_SCLK_FACTOR,
        TMC2660_CONFIG  => X_MOTOR_CONFIGURATION
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(6),
        tmc2660_clk     => external_io_o(15),
        tmc2660_enn     => external_io_o(16),
        tmc2660_sg      => external_io_i(17),
        tmc2660_dir     => external_io_o(19),
        tmc2660_step    => external_io_o(18),
        tmc2660_sclk    => external_io_o(21),
        tmc2660_ncs     => external_io_o(20),
        tmc2660_mosi    => external_io_o(22),
        tmc2660_miso    => external_io_i(23)
    );
    --Configure io to input mode
    external_io_o(17) <= gnd_io_o;
    external_io_o(23) <= gnd_io_o;



    Y_AXIS_MOTOR : entity work.DC_MOTOR_DRIVER
    generic map(
        ADDRESS     => Y_MOTOR_ADDRESS,
        CLK_FACTOR  => Y_MOTOR_FREQUENCY
    )
    port map(
        clk         => clk,
        rst         => rst,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(7),
        DC_enb      => external_io_o(24),
        DC_out_1    => external_io_o(25),
        DC_out_2    => external_io_o(26)
    );



    Z_AXIS_MOTOR : entity work.TMC2660_DRIVER
    generic map(
        ADDRESS         => Z_MOTOR_ADDRESS,
        SCLK_FACTOR     => Z_MOTOR_SCLK_FACTOR,
        TMC2660_CONFIG  => Z_MOTOR_CONFIGURATION
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(8),
        tmc2660_clk     => external_io_o(27),
        tmc2660_enn     => external_io_o(28),
        tmc2660_sg      => external_io_i(29),
        tmc2660_dir     => external_io_o(31),
        tmc2660_step    => external_io_o(30),
        tmc2660_sclk    => external_io_o(33),
        tmc2660_ncs     => external_io_o(32),
        tmc2660_mosi    => external_io_o(34),
        tmc2660_miso    => external_io_i(35)
    );
    -- --Configure io to input mode
    external_io_o(29) <= gnd_io_o;
    external_io_o(35) <= gnd_io_o;
    -----------------------------------------------------------------------------------------------



    --****LED MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    POWER_RED : entity work.LED_DRIVER
    generic map(
        ADDRESS         => PR_LED_ADDRESS,
        CLK_FREQUENCY   => PR_LED_FREQUENCY,
        INVERTED        => PR_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(9),
        led_output      => external_io_o(36)
    );

    
    POWER_GREEN : entity work.LED_DRIVER
    generic map(
        ADDRESS         => PG_LED_ADDRESS,
        CLK_FREQUENCY   => PG_LED_FREQUENCY,
        INVERTED        => PG_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(10),
        led_output      => external_io_o(37)
    );


    ENVIRONMENT_RED : entity work.LED_DRIVER
    generic map(
        ADDRESS         => ER_LED_ADDRESS,
        CLK_FREQUENCY   => ER_LED_FREQUENCY,
        INVERTED        => ER_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(11),
        led_output      => external_io_o(38)
    );


    ENVIRONMENT_WHITE : entity work.LED_DRIVER
    generic map(
        ADDRESS         => EW_LED_ADDRESS,
        CLK_FREQUENCY   => EW_LED_FREQUENCY,
        INVERTED        => EW_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(12),
        led_output      => external_io_o(39)
    );


    ENVIRONMENT_GREEN : entity work.LED_DRIVER
    generic map(
        ADDRESS         => EG_LED_ADDRESS,
        CLK_FREQUENCY   => EG_LED_FREQUENCY,
        INVERTED        => EG_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(13),
        led_output      => external_io_o(40)
    );
    -----------------------------------------------------------------------------------------------



end RTL;