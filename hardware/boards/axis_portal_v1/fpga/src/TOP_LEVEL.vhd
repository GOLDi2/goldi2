-------------------------------------------------------------------------------
-- Company:			Technische UniversitÃƒÂ¤t Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Top Level - Test project 
-- Module Name:		TOP_LEVEL
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_MODULE_CONFIG.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_IO_CROSSBAR_DEFAULT.vhd
--
-- Revisions:
-- Revision V0.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V1.01.00 - Reduction of model 
-- Additional Comments: Redundant modules in the system are eliminated
--                      to simplify the model
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
--! MachX02 library
library machxo2;
use machxo2.all;



--! @brief Top Level of FPGA system for GOLDI Axis Portal V1
--! @details
--! The top module contains the drivers for the sensors and actuators 
--! of the GOLDI Axis Portal V1 system.
--!
--! <https://www.goldi-labs.net/>
entity TOP_LEVEL is
    port(
        --General
        ClockFPGA   : in    std_logic;                                        --! External system clock
        FPGA_nReset : in    std_logic;                                          --! Active high reset
        --Communication
        --SPI
        SPI0_SCLK   : in    std_logic;                                          --! SPI - Serial clock (max: system_clk/4)
        SPI0_MOSI   : in    std_logic;                                          --! SPI - Master out / Slave in
        SPI0_MISO   : out   std_logic;                                          --! SPI - Master in / Slave out
        SPI0_nCE0   : in    std_logic;                                          --! SPI - Active low chip enable
        --GPIO
        IO_DATA     : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)    --! FPGA IO pins
    );
end entity TOP_LEVEL;




architecture RTL of TOP_LEVEL is
    
--****INTRENAL SIGNALS****
    --General
    signal clk                  :   std_logic;
    signal rst                  :   std_logic;
    signal FPGA_nReset_sync     :   std_logic;
    --Communication
    signal spi0_sclk_sync       :   std_logic;
    signal spi0_mosi_sync       :   std_logic;
    signal spi0_nce0_sync       :   std_logic;
    signal spi0_ce0             :   std_logic;
    --System Internal communications
    signal master_bus_o         :   mbus_out;
    signal master_bus_i   	    :   mbus_in;
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_o_vector(14 downto 0);
    --System memory
    constant ctrl_default       :   data_word :=  x"10";
    signal ctrl_data            :   data_word;
        alias encoder_ref       :   std_logic is ctrl_data(0);
    --External data interface
    signal system_io_i        :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal system_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal system_io_o_safe   :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    --Sensor data
    signal sensor_data_vector   :   data_word_vector(1 downto 0);
    --Incremental Encoder 
    signal x_encoder_ref        :   std_logic;
    signal y_encoder_ref        :   std_logic;


begin
	
   --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    --External 48 MHz clock
    --clk <= ClockFPGA;
    
    --Test 53.2 MHz clock
    INTERNAL_CLOCK : component machxo2.components.OSCH
    generic map(
        NOM_FREQ => "53.2"
    )
    port map(
        STDBY    => '0',
        OSC      => clk,
        SEDSTDBY => open
    );
    -----------------------------------------------------------------------------------------------



    --****MICROCONTROLLER INTERFACE****
    -----------------------------------------------------------------------------------------------
    --Synchronization of Reset input
    RESET_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => '0',
        io_i    => FPGA_nReset,
        io_sync => FPGA_nReset_sync
    );
    rst <= FPGA_nReset_sync;    --Incorrect name for signal FPGA_nReset -> Signal active high


    --SPI communication
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
    
    --Negate nce for use in comm modules
    spi0_ce0 <= not spi0_nce0_sync;


    --SPI comm modules
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
    --Register for configuration applications
    SYSTEM_CONFIG_REG : entity work.REGISTER_UNIT
    generic map(
        ADDRESS         => CONFIG_REG_ADDRESS,
        DEF_VALUE       => ctrl_default
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => master_bus_o,
        sys_bus_o       => sys_bus_o(0),
        data_in         => ctrl_data,
        data_out        => ctrl_data,
        read_stb        => open,
        write_stb       => open
    );


    --Multiplexing of BUS 
    sys_bus_i <= master_bus_o;

    BUS_MUX : process(clk)
    begin
        if(rising_edge(clk)) then
            master_bus_i <= reduceBusVector(sys_bus_o);
        end if;
    end process;
    -----------------------------------------------------------------------------------------------
    
    
    

    --****IO DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Routing IO formatted data between FPGA Pins ([io_i,io_o] <-> inout std_logic)
    FPGA_PIN_INTERFACE : entity work.TRIS_BUFFER_ARRAY
    generic map(
        BUFF_NUMBER     => PHYSICAL_PIN_NUMBER
    )
    port map(
        clk             => clk,
        rst             => rst,
        port_out        => system_io_o_safe,
        port_in_async   => open,
        port_in_sync    => system_io_i,
        io_vector       => IO_DATA
    );
    -----------------------------------------------------------------------------------------------

    

    --****SYSTEM PROTECTION****
    -----------------------------------------------------------------------------------------------
    --Module to flag the possible errors based on the mechanical sensor inputs and actuator 
    --output data.
    ERROR_LIST : entity work.ERROR_DETECTOR 
    generic map(
        ADDRESS         => ERROR_LIST_ADDRESS
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(1),
        sys_io_i        => system_io_i,
        sys_io_o        => system_io_o   
    );


    --Masking of actuation data to prevent damage to the physical system
    SYSTEM_PROTECTION : entity work.ACTUATOR_MASK
    port map(
        sys_io_i    => system_io_i,
        sys_io_o    => system_io_o,
        safe_io_out => system_io_o_safe
    );
    -----------------------------------------------------------------------------------------------



    --****SENSOR DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    SENSOR_REGISTER : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS		=> SENSOR_REG_ADDRESS,
        NUMBER_REGISTERS	=> getMemoryLength(9),
        REG_DEFAULT_VALUES	=> setMemory(SENSORS_DEFAULT) 
    )
    port map(
        clk				    => clk,
        rst			        => rst,
        sys_bus_i		    => sys_bus_i,
        sys_bus_o		    => sys_bus_o(2),
        data_in		        => sensor_data_vector,
        data_out	        => open,
        read_stb	        => open,
        write_stb           => open
    );

    --Recover memory data form io_vector
    sensor_data_vector(1)(0) <= system_io_i(2).dat;
    sensor_data_vector(1)(1) <= system_io_i(3).dat;
    sensor_data_vector(1)(2) <= system_io_i(4).dat;
    sensor_data_vector(1)(3) <= system_io_i(5).dat;
    sensor_data_vector(1)(4) <= system_io_i(6).dat;
    sensor_data_vector(1)(5) <= system_io_i(7).dat;
    sensor_data_vector(1)(6) <= system_io_i(8).dat;
    sensor_data_vector(1)(7) <= system_io_i(9).dat;
    sensor_data_vector(0)(0) <= system_io_i(10).dat;
    sensor_data_vector(0)(7 downto 1) <= (others => '0');
    system_io_o(10 downto 2) <= (others => gnd_io_o);
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
        rst         => x_encoder_ref,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(4),
        channel_a   => system_io_i(11),
        channel_b   => system_io_i(12),
        channel_i   => system_io_i(13)
    );
    --User accessible rst to zero encoder acumulator
    x_encoder_ref <= rst or encoder_ref;
    --Ground io_o to ensure input configuration
    system_io_o(13 downto 11) <= (others => gnd_io_o);


    Y_ENCODER : entity work.INC_ENCODER
    generic map(
        ADDRESS     => Y_ENCODER_ADDRESS,
        INDEX_RST   => Y_ENCODER_RST_TYPE,
        INVERT      => Y_ENCODER_INVERT
    )
    port map(
        clk         => clk,
        rst         => y_encoder_ref,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(5),
        channel_a   => system_io_i(14),
        channel_b   => system_io_i(15),
        channel_i   => system_io_i(16)
    );
    --User accesible rst to zero encoder acumulator
    y_encoder_ref <= rst or encoder_ref;
    --Ground io_o to ensure input configuration
    system_io_o(16 downto 14) <= (others => gnd_io_o);
    -----------------------------------------------------------------------------------------------

    

    --****MAIN ACTUATORS****
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
        sys_bus_o       => sys_bus_o(3),
        gpio_i_vector   => system_io_i(1 downto 0),
        gpio_o_vector   => system_io_o(1 downto 0)
    );


    X_AXIS_MOTOR : entity work.DC_MOTOR_DRIVER
    generic map(
        ADDRESS		=> X_MOTOR_ADDRESS,
        CLK_FACTOR	=> X_MOTOR_FREQUENCY
    )
    port map(
        clk			=> clk,
        rst			=> rst,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(6),
        DC_enb		=> system_io_o(17),
        DC_out_1	=> system_io_o(18),
        DC_out_2	=> system_io_o(19)
    );


    Y_AXIS_MOTOR : entity work.DC_MOTOR_DRIVER
    generic map(
        ADDRESS		=> Y_MOTOR_ADDRESS,
        CLK_FACTOR	=> Y_MOTOR_FREQUENCY
    )
    port map(
        clk			=> clk,
        rst			=> rst,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(7),
        DC_enb		=> system_io_o(20),
        DC_out_1	=> system_io_o(22),
        DC_out_2	=> system_io_o(21)
    );


    Z_AXIS_MOTOR : entity work.DC_MOTOR_DRIVER
    generic map(
        ADDRESS		=> Z_MOTOR_ADDRESS,
        CLK_FACTOR	=> Z_MOTOR_FREQUENCY
    )
    port map(
        clk			=> clk,
        rst			=> rst,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(8),
        DC_enb		=> system_io_o(23),
        DC_out_1	=> system_io_o(24),
        DC_out_2	=> system_io_o(25)
    );


    CLAW_MAGNET : entity work.EMAGNET_DRIVER
    generic map(
        ADDRESS		=> EMAG_ADDRESS,
        MAGNET_TAO	=> 0,
        DEMAG_TIME	=> 0
    )
    port map(
        clk			=> clk,
        rst			=> rst,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o(9),
        em_enb		=> system_io_o(26),
        em_out_1    => system_io_o(27),
        em_out_2	=> open
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
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(10),
        led_output      => system_io_o(28)
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
        sys_bus_o       => sys_bus_o(11),
        led_output      => system_io_o(29)
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
        sys_bus_o       => sys_bus_o(12),
        led_output      => system_io_o(30)
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
        sys_bus_o       => sys_bus_o(13),
        led_output      => system_io_o(31)
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
        sys_bus_o       => sys_bus_o(14),
        led_output      => system_io_o(32)
    );
    -----------------------------------------------------------------------------------------------  



    --****EXTERNAL****
	-----------------------------------------------------------------------------------------------
	system_io_o(40 downto 33) <= (others => gnd_io_o);
	-----------------------------------------------------------------------------------------------


end architecture RTL;
