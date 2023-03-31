-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/04/2023
-- Design Name:		Top Level - 3_axis_portal_v2
-- Module Name:		TOP_LEVEL
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom libraries
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_CROSSBAR_DEFAULT.all;




--! @brief Actuator drivers and protection system the for GOLDI 3 Axis Portal (V2)
--! @details
--! The module contains the drivers for the sensors and actuators of the 
--! GOLDI 3 Axis Portal (V2) system. The module constist of set of configuration
--! registers accessed through a SPI port. Actuator signal are generated 
--! based on the register parameters and then fed into protection module
--! that ensures the physical system isn't damaged. The error detector 
--! unit produces a list of errors for the user to analyse.
--!
--! @ref https://www.goldi-labs.net/index.php?Site=21
entity TOP_LEVEL is
    port(
        --General
        ClockFPGA       : in    std_logic;
        FPGA_nReset     : in    std_logic;
        --Communication
        --Serial
        TXD0            : in    std_logic;
        RXD0            : out   std_logic;
        --SPI
        SPI0_SCLK       : in    std_logic;
        SPI0_MOSI       : in    std_logic;
        SPI0_MISO       : out   std_logic;
        SPI0_nCE0       : in    std_logic;
        SPI0_nCE1       : in    std_logic;
        SPI1_SCLK       : in    std_logic;
        SPI1_MOSI       : in    std_logic;
        SPI1_MISO       : out   std_logic;
        SPI1_nCE0       : in    std_logic;
        SPI1_nCE1       : in    std_logic;
        --GPIO
        IO_DATA         : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
    );
end entity TOP_LEVEL;




--! General architecture
architecture RTL of TOP_LEVEL is

    --Intermediate signals
    signal FPGA_Reset           :   std_logic;
    signal Reset                :   std_logic;
    signal clk_16_MHz           :   std_logic;
    --Communication
    signal spi0_sclk_sync       :   std_logic;
    signal spi0_mosi_sync       :   std_logic;
    signal spi0_ce0             :   std_logic;
    signal spi0_ce1             :   std_logic;
    signal spi0_nce0_sync       :   std_logic;
    signal spi0_nce1_sync       :   std_logic;
    signal spi0_ce              :   std_logic;
    --System internal communication
    signal master_bus_i         :   mbus_in;
    signal master_bus_o         :   mbus_out;
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_o_vector(14 downto 0);
    signal cb_bus_i             :   sbus_in;
    signal cb_bus_o             :   sbus_o_vector(1 downto 0);
    --System memory
    signal config_reg_data      :   data_word_vector(0 downto 0);
        alias selected_bus      :   std_logic is config_reg_data(0)(0);
    --External data interface
    signal external_io_i        :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_i_async  :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o_sync   :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal internal_io_i        :   io_i_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    signal internal_io_o        :   io_o_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    --Sensor data
    signal sensor_data_vector   :   std_logic_vector(5 downto 0);
    --Actuator flags
    signal actuator_flags       :   std_logic_vector(6 downto 0);


begin

    --****TIMING****
    -----------------------------------------------------------------------------------------------
    CLOCK_16_MHZ : entity work.PLL_16MHz
    port map (
        CLKI    => ClockFPGA,
        CLKOP   => clk_16_MHz
    );
    -----------------------------------------------------------------------------------------------



    --****RASPBERRYPIE SPI INTERFACE****
    -----------------------------------------------------------------------------------------------
    --Reset: Convertion to active high reset for system
    FPGA_Reset <= not FPGA_nReset;
    RESET_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => '0',
        io_i    => FPGA_Reset,
        io_sync => Reset
    );

    --SPI communication
    SCLK_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => SPI0_SCLK,
        io_sync => spi0_sclk_sync
    );

    MOSI_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => SPI0_MOSI,
        io_sync => spi0_mosi_sync
    );
    
    NCE0_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => SPI0_nCE0,
        io_sync => spi0_nce0_sync
    );
    spi0_ce <= not spi0_nce0_sync;


    NCE1_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => SPI0_nCE1,
        io_sync => spi0_nce1_sync
    );
    spi0_ce1 <= not spi0_nce1_sync;


    spi0_ce <= spi0_ce0 or spi0_ce1;
    SPI_BUS_COMMUNICATION : entity work.SPI_TO_BUS
    port map(
        clk				=> ClockFPGA,
        rst				=> Reset,
        ce				=> spi0_ce,
        sclk		    => spi0_sclk_sync,
        mosi			=> spi0_mosi_sync,
        miso			=> SPI0_MISO,
        master_bus_o	=> master_bus_o,
        master_bus_i	=> master_bus_i
    );
    -----------------------------------------------------------------------------------------------



    --****INTERAL COMMUNICATION MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Register to select the main communication bus or the io crossbar structure module
    SYSTEM_CONFIG_REG : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS		=> CONFIG_REG_ADDRESS,
        NUMBER_REGISTERS	=> 1,
        REG_DEFAULT_VALUES	=> assignMemory(REG_CONFIG_DEFAULT) 
    )
    port map(
        clk				=> ClockFPGA,
        rst				=> Reset,
        sys_bus_i		=> master_bus_o,
        sys_bus_o		=> sys_bus_o(0),
        reg_data_in		=> config_reg_data,
        reg_data_out	=> config_reg_data,
        reg_data_stb    => open
    );
    --Mirror output bus to make register accessible in both modes of operation
    cb_bus_o(0) <= sys_bus_o(0);     


    --Selection of correct bus based on current configuration
    sys_bus_i 	 <= master_bus_o when(selected_bus = '0') else gnd_sbus_i;
	cb_bus_i  	 <= master_bus_o when(selected_bus = '1') else gnd_sbus_i;
	master_bus_i <= reduceBusVector(sys_bus_o) when(selected_bus = '0') else
					reduceBusVector(cb_bus_o)  when(selected_bus = '1') else
					gnd_mbus_i;
    -----------------------------------------------------------------------------------------------



    --****IO DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Routing IO formatted data to and from FPGA Pins ([io_i,io_o] <-> inout std_logic)
    FPGA_PIN_INTERFACE : entity work.TRIS_BUFFER_ARRAY
    generic map(
        BUFF_NUMBER     => PHYSICAL_PIN_NUMBER
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        port_out        => external_io_o_sync,
        port_in_async   => external_io_i_async,
        port_in_sync    => external_io_i,
        io_vector       => IO_DATA
    );

    --Route IO formatted data from pins to system modules
    IO_ROUTING : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => VIRTUAL_PIN_NUMBER,
        RIGHT_PORT_LENGTH   => PHYSICAL_PIN_NUMBER,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => ClockFPGA,
        rst                 => Reset,
        cb_bus_i            => cb_bus_i,
        cb_bus_o            => cb_bus_o(1),
        left_io_i_vector    => internal_io_i,
        left_io_o_vector    => internal_io_o,
        right_io_i_vector   => external_io_i,
        right_io_o_vector   => external_io_o
    );
    -----------------------------------------------------------------------------------------------



    --****SYSTEM PROTECTION****
    -----------------------------------------------------------------------------------------------
    --Module to flag the possible errors based on the mechanical sensor inputs and actuator 
    --output data.
    ERROR_LIST : entity work.ERROR_DETECTOR 
    generic map(
        ADDRESS             => ERROR_LIST_ADDRESS
    )
    port map(
        clk                 => ClockFPGA,
        rst                 => Reset,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o(2),
        sys_io_i            => external_io_i_async,
        actuator_driver_i   => actuator_flags   
    );

    --Masking of actuation data to prevent damage to the physical system
    SYTEM_PROTECTION : entity work.ACTUATOR_MASK
    port map(
        sys_io_i            => external_io_i_async,
        sys_io_o            => external_io_o,
        actuator_driver_i   => actuator_flags,
        safe_io_out         => external_io_o_sync
    );
    -----------------------------------------------------------------------------------------------



    --****SENSOR DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    SENSOR_REGISTER : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS		=> SENSOR_REG_ADDRESS,
        NUMBER_REGISTERS	=> getMemoryLength(7),
        REG_DEFAULT_VALUES	=> assignMemory(SENSORS_DEFAULT) 
    )
    port map(
        clk				=> ClockFPGA,
        rst			    => Reset,
        sys_bus_i		=> sys_bus_i,
        sys_bus_o		=> sys_bus_o(1),
        reg_data_in		=> assignMemory(sensor_data_vector),
        reg_data_out	=> open,
        reg_data_stb	=> open
    );

    --Recover memory data form io_vector
    sensor_data_vector <= getIOInData(internal_io_i)(8 downto 2);
    internal_io_o(8 downto 2) <= (others => gnd_io_o);
    -----------------------------------------------------------------------------------------------



    --****INCREMENTAL ENCODERS****
    -----------------------------------------------------------------------------------------------
    X_ENCODER : entity work.INC_ENCODER
    generic map(
        ADDRESS		=> X_ENCODER_ADDRESS,
        INDEX_RST	=> X_ENCODER_RST_TYPE
    )
    port map(
        clk			=> ClockFPGA,
        rst			=> Reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(8),
        channel_a	=> internal_io_i(9),
        channel_b   => internal_io_i(10),
        channel_i	=> internal_io_i(11)
    );
    --Ground io_o to ensure input configuration
    internal_io_o(11 downto 9) <= (others => gnd_io_o);


    Y_ENCODER : entity work.INC_ENCODER
    generic map(
        ADDRESS		=> Y_ENCODER_ADDRESS,
        INDEX_RST	=> Y_ENCODER_RST_TYPE
    )
    port map(
        clk			=> ClockFPGA,
        rst			=> Reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(9),
        channel_a	=> internal_io_i(12),
        channel_b   => internal_io_i(13),
        channel_i	=> gnd_io_i
    );
    --Ground io_o to ensure input configuration
    internal_io_o(13 downto 12) <= (others => gnd_io_o);
    -----------------------------------------------------------------------------------------------



    --****MAIN ACTUATORS****
    -----------------------------------------------------------------------------------------------
    GPIO_MANAGEMENT : GPIO_DRIVER_ARRAY
    generic map(
        ADDRESS         => GPIO_DRIVER_ADDRESS,
        GPIO_NUMBER     => 2
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(3),
        gpio_i_vector   => internal_io_i(1 downto 0),
        gpio_o_vector   => internal_io_o(1 downto 0)
    );



    X_AXIS_MOTOR : entity work.TMC2660
    generic map(    
        ADDRESS             => X_MOTOR_ADDRESS
    )
    port map(
        clk                 => ClockFPGA,
        rst                 => Reset,
        clk_16_MHz          => clk_16_MHz,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o(4),
        sdi_neg_valid       => actuator_flags(0),
        sdi_pos_valid       => actuator_flags(1),
        tmc2660_clk         => internal_io_o(14),
        tmc2660_enn         => internal_io_o(15),
        tmc2660_sg          => internal_io_i(16),
        tmc2660_spi_sclk    => internal_io_o(17),
        tmc2660_spi_ncs     => internal_io_o(18),
        tmc2660_spi_mosi    => internal_io_o(19),
        tmc2660_spi_miso    => internal_io_i(20),
        tmc2660_dir         => internal_io_o(21),
        tmc2660_step        => internal_io_o(22)
    );
    internal_io_o(16) <= gnd_io_o;
    internal_io_o(20) <= gnd_io_o;



    Y_AXIS_MOTOR : entity work.TMC2660
    generic map(    
        ADDRESS             => Y_MOTOR_ADDRESS
    )
    port map(
        clk                 => ClockFPGA,
        rst                 => Reset,
        clk_16_MHz          => clk_16_MHz,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o(5),
        sdi_neg_valid       => actuator_flags(2),
        sdi_pos_valid       => actuator_flags(3),
        tmc2660_clk         => internal_io_o(23),
        tmc2660_enn         => internal_io_o(24),
        tmc2660_sg          => internal_io_i(25),
        tmc2660_spi_sclk    => internal_io_o(26),
        tmc2660_spi_ncs     => internal_io_o(27),
        tmc2660_spi_mosi    => internal_io_o(28),
        tmc2660_spi_miso    => internal_io_i(29),
        tmc2660_dir         => internal_io_o(30),
        tmc2660_step        => internal_io_o(31)
    );
    internal_io_o(25) <= gnd_io_o;
    internal_io_o(29) <= gnd_io_o;



    Z_AXIS_MOTOR : entity work.DC_MOTOR_DRIVER
    generic map(
        ADDRESS		=> Z_MOTOR_ADDRESS,
        CLK_FACTOR	=> Z_MOTOR_FREQUENCY
    )
    port map(
        clk			=> ClockFPGA,
        rst			=> Reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(6),
        DC_enb		=> internal_io_o(32),
        DC_out_1	=> internal_io_o(33),
        DC_out_2	=> internal_io_o(34)
    );
    actuator_flags(4) <= internal_io_o(32).dat;
    actuator_flags(5) <= internal_io_o(33).dat;
    actuator_flags(6) <= internal_io_o(34).dat;



    CLAW_MAGNET : entity work.EMAGNET_DRIVER
    generic map(
        ADDRESS		=> EMAG_ADDRESS,
        MAGNET_TAO	=> EMAG_TAO,
        DEMAG_TIME	=> EMAG_DEMAG_TIME
    )
    port map(
        clk			=> ClockFPGA,
        rst			=> Reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(7),
        em_enb		=> internal_io_o(35),
        em_out_1    => internal_io_o(36),
        em_out_2	=> internal_io_o(37)
    );
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
        clk         => ClockFPGA,
        rst         => Reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(10),
        led_output  => internal_io_o(38)
    );

    POWER_GREEN : entity work.LED_DRIVER
    generic map(
        ADDRESS         => PG_LED_ADDRESS,
        CLK_FREQUENCY   => PG_LED_FREQUENCY,
        INVERTED        => PG_LED_INVERTED
    )
    port map(
        clk         => ClockFPGA,
        rst         => Reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(11),
        led_output  => internal_io_o(39)
    );

    ENVIRONMENT_RED : entity work.LED_DRIVER
    generic map(
        ADDRESS         => ER_LED_ADDRESS,
        CLK_FREQUENCY   => ER_LED_FREQUENCY,
        INVERTED        => ER_LED_INVERTED
    )
    port map(
        clk         => ClockFPGA,
        rst         => Reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(12),
        led_output  => internal_io_o(40)
    );

    ENVIRONMENT_WHITE : entity work.LED_DRIVER
    generic map(
        ADDRESS         => EW_LED_ADDRESS,
        CLK_FREQUENCY   => EW_LED_FREQUENCY,
        INVERTED        => EW_LED_INVERTED
    )
    port map(
        clk         => ClockFPGA,
        rst         => Reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(13),
        led_output  => internal_io_o(41)
    );

    ENVIRONMENT_GREEN : entity work.LED_DRIVER
    generic map(
        ADDRESS         => EG_LED_ADDRESS,
        CLK_FREQUENCY   => EG_LED_FREQUENCY,
        INVERTED        => EG_LED_INVERTED
    )
    port map(
        clk         => ClockFPGA,
        rst         => Reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(14),
        led_output  => internal_io_o(42)
    );
    -----------------------------------------------------------------------------------------------

end RTL;


