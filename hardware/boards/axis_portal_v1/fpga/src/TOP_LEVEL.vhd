-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/12/2022
-- Design Name:		Top Level - 3_axis_portal_v1
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




--! @brief Actuator drivers and protection system the for GOLDI 3 Axis Portal (V1)
--! @details
--! The module contains the drivers for the sensors and actuators of the 
--! GOLDI 3 Axis Portal (V1) system. The module constist of set of configuration
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
        IN_OUT_DATA     : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
    );
end entity TOP_LEVEL;




--! General architecture
architecture RTL of TOP_LEVEL is
    --****COMPONENTS****
    -----------------------------------------------------------------------------------------------
    component SYNCHRONIZER
        generic (
            STAGES 	: natural := 2
        );
        port (
            clk		: in	std_logic;
            rst		: in	std_logic;
            io_i	: in	std_logic;
            io_sync	: out 	std_logic
        );
    end component;

    component SPI_TO_BUS
        port(
            clk				: in	std_logic;
            rst				: in	std_logic;
            ce				: in	std_logic;
            sclk			: in	std_logic;
            mosi			: in	std_logic;
            miso			: out	std_logic;
            master_bus_o	: out	mbus_out;
            master_bus_i	: in	mbus_in
        );
    end component;
    
    component REGISTER_TABLE
        generic(
            BASE_ADDRESS		:	natural := 1;
            NUMBER_REGISTERS	:	natural := 3;
            REG_DEFAULT_VALUES	:	data_word_vector := (x"FF",x"F0",x"0F") 
        );
        port(
            clk				: in	std_logic;
            rst				: in	std_logic;
            sys_bus_i		: in	sbus_in;
            sys_bus_o		: out	sbus_out;
            reg_data_in		: in	data_word_vector(NUMBER_REGISTERS-1 downto 0);
            reg_data_out	: out   data_word_vector(NUMBER_REGISTERS-1 downto 0);
            reg_data_stb	: out	std_logic_vector(NUMBER_REGISTERS-1 downto 0)
        );
    end component;

    component TRIS_BUFFER_ARRAY
        generic(
            BUFF_NUMBER :   natural
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            port_out        : in    io_o_vector(BUFF_NUMBER-1 downto 0);
            port_in_async   : out   io_i_vector(BUFF_NUMBER-1 downto 0);
            port_in_sync    : out   io_i_vector(BUFF_NUMBER-1 downto 0);
            io_vector       : inout std_logic_vector(BUFF_NUMBER-1 downto 0)
        );
    end component;

    component IO_CROSSBAR
        generic(
            LAYOUT_BLOCKED  :   boolean := true
        );
        port(
            clk         : in    std_logic;
            rst         : in    std_logic;
            cross_bus_i : in    sbus_in;
            cross_bus_o : out   sbus_out;
            vir_io_in   : out   io_i_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
            vir_io_out  : in    io_o_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
            phy_io_in   : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            phy_io_out  : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
        );
    end component;

    component ACTUATOR_MASK
        port(
            sys_io_i    : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            sys_io_o    : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            safe_io_out : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
        );
    end component;

    component ERROR_DETECTOR 
        generic(
            ADDRESS         :   natural
        );
        port(
        clk             : in    std_logic;
        rst             : in    std_logic;
        sys_bus_i       : in    sbus_in;
        sys_bus_o       : out   sbus_out;
        sys_io_i        : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
        sys_io_o        : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
    );
    end component;

    component INC_ENCODER
        generic(
            ADDRESS		:	natural := 1;
            INDEX_RST	:	boolean := false
        );
        port(
            clk			: in	std_logic;
            rst			: in	std_logic;
            sys_bus_i	: in	sbus_in;
            sys_bus_o	: out	sbus_out;
            channel_a	: in	io_i;
            channel_b	: in	io_i;
            channel_i	: in	io_i
        );
    end component;

    component GPIO_DRIVER_ARRAY
        generic(
            ADDRESS         :   natural := 1;
            GPIO_NUMBER     :   natural := 10
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            gpio_i_vector   : in    io_i_vector(GPIO_NUMBER-1 downto 0);
            gpio_o_vector   : out   io_o_vector(GPIO_NUMBER-1 downto 0)
        );
    end component;

    component DC_MOTOR_DRIVER
        generic(
            ADDRESS		:	natural := 1;
            CLK_FACTOR	:	natural := 10
        );
        port(
            clk			: in	std_logic;
            rst			: in	std_logic;
            sys_bus_i	: in	sbus_in;
            sys_bus_o	: out	sbus_out;
            DC_enb		: out 	io_o;
            DC_out_1	: out	io_o; 
            DC_out_2	: out 	io_o
        );
    end component;

    component EMAGNET_DRIVER
        generic(
            ADDRESS		:	natural := 1;
            MAGNET_TAO	:	natural := 0;
            DEMAG_TIME	:	natural := 0
        );
        port(
            clk			: in	std_logic;
            rst			: in	std_logic;
            sys_bus_i	: in	sbus_in;
            sys_bus_o	: out	sbus_out;
            em_enb		: out	io_o;
            em_out_1	: out	io_o;
            em_out_2	: out	io_o
        );
    end component;

    component LED_DRIVER
        generic(
            ADDRESS         :   natural;
            CLK_FEQUENCY    :   natural;
            INVERTED        :   boolean
        );
        port(
            clk         : in    std_logic;
            rst         : in    std_logic;
            sys_bus_i   : in    sbus_in;
            sys_bus_o   : out   sbus_out;
            led_output  : out   io_o
        );
    end component;
    -----------------------------------------------------------------------------------------------


    --Intermediate signals
    signal FPGA_Reset           :   std_logic;
    signal Reset                :   std_logic;
    --Communication
    signal spi0_sclk_sync       :   std_logic;
    signal spi0_mosi_sync       :   std_logic;
    signal spi0_nce0_sync       :   std_logic;
    signal spi0_nce1_sync       :   std_logic;
    signal spi0_ce0_sync        :   std_logic;
    signal spi0_ce1_sync        :   std_logic;
    --System internal communication
    signal config_reg_data      :   data_word_vector(0 downto 0);
        alias selected_bus      :   std_logic is config_reg_data(0)(0);
    signal master_bus_i         :   mbus_in;
    signal master_bus_o         :   mbus_out;
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_o_vector(14 downto 0);
    signal cross_bus_i          :   sbus_in;
    signal cross_bus_o          :   sbus_o_vector(1 downto 0);
    --External data interface
    signal external_io_i        :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_i_async  :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o_safe   :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal internal_io_i        :   io_i_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    signal internal_io_o        :   io_o_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    --Sensor data
    signal sensor_data_vector   :   std_logic_vector(8 downto 0);


begin

    --****MICROCONTROLLER INTERFACE****
    -----------------------------------------------------------------------------------------------
    --Reset: Convertion to active high reset for system
    FPGA_Reset <= not FPGA_nReset;
    RESET_SYNC : SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => FPGA_Reset,
        io_i    => FPGA_Reset,
        io_sync => Reset
    );

    --SPI communication
    SCLK_SYNC : SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => SPI0_SCLK,
        io_sync => spi0_sclk_sync
    );

    MOSI_SYNC : SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => SPI0_MOSI,
        io_sync => spi0_mosi_sync
    );

    NCE0_SYNC : SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => SPI0_nCE0,
        io_sync => spi0_nce0_sync
    );
    spi0_ce0_sync <= not spi0_nce0_sync;

    NCE1_SYNC : SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => SPI0_nCE1,
        io_sync => spi0_nce1_sync
    );
    spi0_ce1_sync <= not spi0_nce1_sync;

    SPI_BUS_COMMUNICATION : SPI_TO_BUS
    port map(
        clk				=> ClockFPGA,
        rst				=> Reset,
        ce				=> spi0_ce0_sync or spi0_ce1_sync,
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
    SYSTEM_CONFIG_REG : REGISTER_TABLE
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
    cross_bus_o(0) <= sys_bus_o(0);     


    --Selection of correct bus based on current configuration
    BUS_MULTIPLEXER : process(ClockFPGA)
    begin
        if(rising_edge(ClockFPGA)) then
            case selected_bus is
            when '0' =>
                --Route communication to system registers
                sys_bus_i    <= master_bus_o;
                master_bus_i <= reduceBusVector(sys_bus_o);
                --Ground IO crossbar bus
                cross_bus_i  <= bus_disabled;
            
            when '1' =>
                --Route communication to io crossbar
                cross_bus_i  <= master_bus_o;
                master_bus_i <= reduceBusVector(cross_bus_o);
                --Ground communication bus
                sys_bus_i    <= bus_disabled;

            when others => null;
            end case;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****IO DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Routing IO formatted data to and from FPGA Pins ([io_i,io_o] <-> inout std_logic)
    FPGA_PIN_INTERFACE : TRIS_BUFFER_ARRAY
    generic map(
        BUFF_NUMBER     => PHYSICAL_PIN_NUMBER
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        port_out        => external_io_o_safe,
        port_in_async   => external_io_i_async,
        port_in_sync    => external_io_i,
        io_vector       => IN_OUT_DATA
    );

    --Route IO formatted data from pins to system modules
    IO_ROUTING : IO_CROSSBAR
    generic map(
        LAYOUT_BLOCKED  => block_layout
    )
    port map(
        clk         => ClockFPGA,
        rst         => Reset,
        cross_bus_i => cross_bus_i,
        cross_bus_o => cross_bus_o(1),
        vir_io_in   => internal_io_i,
        vir_io_out  => internal_io_o,
        phy_io_in   => external_io_i,
        phy_io_out  => external_io_o
    );

    --Grounded Pin provides a way to disconnect Extenal[7:0] or others
    internal_io_o(VIRTUAL_PIN_NUMBER-1) <= gnd_io_o;
    -----------------------------------------------------------------------------------------------



    --****SYSTEM PROTECTION****
    -----------------------------------------------------------------------------------------------
    --Module to flag the possible errors based on the mechanical sensor inputs and actuator 
    --output data.
    ERROR_LIST : ERROR_DETECTOR 
    generic map(
        ADDRESS         => ERROR_LIST_ADDRESS
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(2),
        sys_io_i        => external_io_i_async,
        sys_io_o        => external_io_o   
    );

    --Masking of actuation data to prevent damage to the physical system
    SYTEM_PROTECTION : ACTUATOR_MASK
    port map(
        sys_io_i    => external_io_i_async,
        sys_io_o    => external_io_o,
        safe_io_out => external_io_o_safe
    );
    -----------------------------------------------------------------------------------------------



    --****SENSOR DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    SENSOR_REGISTER : REGISTER_TABLE
    generic map(
        BASE_ADDRESS		=> SENSOR_REG_ADDRESS,
        NUMBER_REGISTERS	=> getMemoryLength(9),
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
    sensor_data_vector <= getIOInData(internal_io_i)(10 downto 2);
    internal_io_o(10 downto 2) <= (others => gnd_io_o);
    -----------------------------------------------------------------------------------------------



    --****INCREMENTAL ENCODERS****
    -----------------------------------------------------------------------------------------------
    X_ENCODER : INC_ENCODER
    generic map(
        ADDRESS		=> X_ENCODER_ADDRESS,
        INDEX_RST	=> X_ENCODER_RST_TYPE
    )
    port map(
        clk			=> ClockFPGA,
        rst			=> Reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(8),
        channel_a	=> internal_io_i(11),
        channel_b   => internal_io_i(12),
        channel_i	=> internal_io_i(13)
    );
    --Ground io_o to ensure input configuration
    internal_io_o(13 downto 11) <= (others => gnd_io_o);


    Y_ENCODER : INC_ENCODER
    generic map(
        ADDRESS		=> Y_ENCODER_ADDRESS,
        INDEX_RST	=> Y_ENCODER_RST_TYPE
    )
    port map(
        clk			=> ClockFPGA,
        rst			=> Reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(9),
        channel_a	=> internal_io_i(14),
        channel_b   => internal_io_i(15),
        channel_i	=> internal_io_i(16)
    );
    --Ground io_o to ensure input configuration
    internal_io_o(16 downto 14) <= (others => gnd_io_o);
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

    X_AXIS_MOTOR : DC_MOTOR_DRIVER
    generic map(
        ADDRESS		=> X_MOTOR_ADDRESS,
        CLK_FACTOR	=> X_MOTOR_FREQUENCY
    )
    port map(
        clk			=> ClockFPGA,
        rst			=> Reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(4),
        DC_enb		=> internal_io_o(17),
        DC_out_1	=> internal_io_o(18),
        DC_out_2	=> internal_io_o(19)
    );

    Y_AXIS_MOTOR : DC_MOTOR_DRIVER
    generic map(
        ADDRESS		=> Y_MOTOR_ADDRESS,
        CLK_FACTOR	=> Y_MOTOR_FREQUENCY
    )
    port map(
        clk			=> ClockFPGA,
        rst			=> Reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(5),
        DC_enb		=> internal_io_o(20),
        DC_out_1	=> internal_io_o(21),
        DC_out_2	=> internal_io_o(22)
    );

    Z_AXIS_MOTOR : DC_MOTOR_DRIVER
    generic map(
        ADDRESS		=> Z_MOTOR_ADDRESS,
        CLK_FACTOR	=> Z_MOTOR_FREQUENCY
    )
    port map(
        clk			=> ClockFPGA,
        rst			=> Reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(6),
        DC_enb		=> internal_io_o(23),
        DC_out_1	=> internal_io_o(24),
        DC_out_2	=> internal_io_o(25)
    );

    CLAW_MAGNET : EMAGNET_DRIVER
        generic map(
            ADDRESS		=> EMAG_ADDRESS,
            MAGNET_TAO	=> 0,
            DEMAG_TIME	=> 0
        )
        port map(
            clk			=> ClockFPGA,
            rst			=> Reset,
            sys_bus_i	=> sys_bus_i,
            sys_bus_o	=> sys_bus_o(7),
            em_enb		=> internal_io_o(26),
            em_out_1    => internal_io_o(27),
            em_out_2	=> open
        );
    -----------------------------------------------------------------------------------------------



    --****LED MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    POWER_RED : LED_DRIVER
    generic map(
        ADDRESS         => PR_LED_ADDRESS,
        CLK_FEQUENCY    => PR_LED_FREQUENCY,
        INVERTED        => PR_LED_INVERTED
    )
    port map(
        clk         => ClockFPGA,
        rst         => Reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(10),
        led_output  => internal_io_o(28)
    );

    POWER_GREEN : LED_DRIVER
    generic map(
        ADDRESS         => PG_LED_ADDRESS,
        CLK_FEQUENCY    => PG_LED_FREQUENCY,
        INVERTED        => PG_LED_INVERTED
    )
    port map(
        clk         => ClockFPGA,
        rst         => Reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(11),
        led_output  => internal_io_o(29)
    );

    ENVIRONMENT_RED : LED_DRIVER
    generic map(
        ADDRESS         => ER_LED_ADDRESS,
        CLK_FEQUENCY    => ER_LED_FREQUENCY,
        INVERTED        => ER_LED_INVERTED
    )
    port map(
        clk         => ClockFPGA,
        rst         => Reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(12),
        led_output  => internal_io_o(30)
    );

    ENVIRONMENT_WHITE : LED_DRIVER
    generic map(
        ADDRESS         => EW_LED_ADDRESS,
        CLK_FEQUENCY    => EW_LED_FREQUENCY,
        INVERTED        => EW_LED_INVERTED
    )
    port map(
        clk         => ClockFPGA,
        rst         => Reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(13),
        led_output  => internal_io_o(31)
    );

    ENVIRONMENT_GREEN : LED_DRIVER
    generic map(
        ADDRESS         => EG_LED_ADDRESS,
        CLK_FEQUENCY    => EG_LED_FREQUENCY,
        INVERTED        => EG_LED_INVERTED
    )
    port map(
        clk         => ClockFPGA,
        rst         => Reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(14),
        led_output  => internal_io_o(32)
    );
    -----------------------------------------------------------------------------------------------



	--****EXTERNAL****
	-----------------------------------------------------------------------------------------------
	internal_io_o(40 downto 33) <= (others => gnd_io_o);
	-----------------------------------------------------------------------------------------------

end RTL;


