-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
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
--
-- Revision V4.00.00 - Moduel refactor
-- Additional Comments: Change to the entity names, generic and port signal 
--                      names to follow the V4.00.00 naming convention. Use 
--                      of the updated GOLDI SPI communication modules.
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
use work.GOLDI_MODULE_CONFIG.all;




--! @brief Top Level of FPGA system for GOLDI Axis Portal V1
--! @details
--! The top module contains the drivers for the sensors and actuators 
--! of the GOLDI Axis Portal V1 system.
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
    signal x_encoder_rst        :   std_logic;
    signal y_encoder_rst        :   std_logic;


begin
	
   --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    --External 48 MHz clock
    clk <= ClockFPGA;
    
    --Test 53.2 MHz clock
    -- INTERNAL_CLOCK : component machxo2.components.OSCH
    -- generic map(
    --     NOM_FREQ => "53.2"
    -- )
    -- port map(
    --     STDBY    => '0',
    --     OSC      => clk,
    --     SEDSTDBY => open
    -- );
    -----------------------------------------------------------------------------------------------



    --****MICROCONTROLLER INTERFACE****
    -----------------------------------------------------------------------------------------------
    --Synchronization of Reset input
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

    --SPI communication
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


    --SPI communication adaptor
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
    --Register for configuration applications
    SYSTEM_CONFIG_REG : entity work.REGISTER_UNIT
    generic map(
        g_address   => CONFIG_REG_ADDRESS,
        g_def_value => ctrl_default
    )
    port map(
        clk         => clk,
        rst         => rst,
        sys_bus_i   => master_bus_o,
        sys_bus_o   => sys_bus_o(0),
        p_data_in   => ctrl_data,
        p_data_out  => ctrl_data,
        p_read_stb  => open,
        p_write_stb => open
    );


    --Multiplexing of BUS 
    sys_bus_i <= master_bus_o;

    BUS_MUX : process(clk)
    begin
        if(rising_edge(clk)) then
            master_bus_i <= reduceBusVector2(sys_bus_o);
        end if;
    end process;
    -----------------------------------------------------------------------------------------------
    
    
    

    --****IO DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Routing IO formatted data between FPGA Pins ([io_i,io_o] <-> inout std_logic)
    FPGA_PIN_INTERFACE : entity work.TRIS_BUFFER_ARRAY
    generic map(
        g_buff_number   => PHYSICAL_PIN_NUMBER
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
        g_address       => ERROR_LIST_ADDRESS
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(1),
        p_sys_io_i      => system_io_i,
        p_sys_io_o      => system_io_o   
    );


    --Masking of actuation data to prevent damage to the physical system
    SYSTEM_PROTECTION : entity work.ACTUATOR_MASK
    port map(
        p_sys_io_i      => system_io_i,
        p_sys_io_o      => system_io_o,
        p_safe_io_o     => system_io_o_safe
    );
    -----------------------------------------------------------------------------------------------



    --****SENSOR DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    SENSOR_REGISTER : entity work.REGISTER_TABLE
    generic map(
        g_address       => SENSOR_REG_ADDRESS,
        g_reg_number    => getMemoryLength(9),
        g_def_values	=> setMemory(SENSORS_DEFAULT) 
    )
    port map(
        clk				=> clk,
        rst			    => rst,
        sys_bus_i		=> sys_bus_i,
        sys_bus_o		=> sys_bus_o(2),
        p_data_in		=> sensor_data_vector,
        p_data_out	    => open,
        p_read_stb	    => open,
        p_write_stb     => open
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
    X_ENCODER : entity work.ENCODER_SMODULE
    generic map(
        g_address   => X_ENCODER_ADDRESS,
        g_index_rst => X_ENCODER_RST_TYPE,
        g_invert    => X_ENCODER_INVERT
    )
    port map(
        clk         => clk,
        rst         => x_encoder_rst,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(4),
        p_channel_a => system_io_i(11),
        p_channel_b => system_io_i(12),
        p_channel_i => system_io_i(13)
    );
    --User accessible rst to zero encoder acumulator
    x_encoder_rst <= rst or encoder_ref;
    --Ground io_o to ensure input configuration
    system_io_o(13 downto 11) <= (others => gnd_io_o);


    Y_ENCODER : entity work.ENCODER_SMODULE
    generic map(
        g_address   => Y_ENCODER_ADDRESS,
        g_index_rst => Y_ENCODER_RST_TYPE,
        g_invert    => Y_ENCODER_INVERT
    )
    port map(
        clk         => clk,
        rst         => y_encoder_rst,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o(5),
        p_channel_a => system_io_i(14),
        p_channel_b => system_io_i(15),
        p_channel_i => system_io_i(16)
    );
    --User accesible rst to zero encoder acumulator
    y_encoder_rst <= rst or encoder_ref;
    --Ground io_o to ensure input configuration
    system_io_o(16 downto 14) <= (others => gnd_io_o);
    -----------------------------------------------------------------------------------------------

    

    --****MAIN ACTUATORS****
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
        sys_bus_o       => sys_bus_o(3),
        p_gpio_i_vector => system_io_i(1 downto 0),
        p_gpio_o_vector => system_io_o(1 downto 0)
    );


    X_AXIS_MOTOR : entity work.HBRIDGE_SMODULE
    generic map(
        g_address		=> X_MOTOR_ADDRESS,
        g_clk_factor    => X_MOTOR_FREQUENCY
    )
    port map(
        clk			    => clk,
        rst			    => rst,
        sys_bus_i	    => sys_bus_i,
        sys_bus_o	    => sys_bus_o(6),
        p_hb_enb	    => system_io_o(17),
        p_hb_out_1	    => system_io_o(18),
        p_hb_out_2	    => system_io_o(19)
    );


    Y_AXIS_MOTOR : entity work.HBRIDGE_SMODULE
    generic map(
        g_address		=> Y_MOTOR_ADDRESS,
        g_clk_factor	=> Y_MOTOR_FREQUENCY
    )
    port map(
        clk			    => clk,
        rst			    => rst,
        sys_bus_i	    => sys_bus_i,
        sys_bus_o	    => sys_bus_o(7),
        p_hb_enb		=> system_io_o(20),
        p_hb_out_1	    => system_io_o(22),
        p_hb_out_2	    => system_io_o(21)
    );


    Z_AXIS_MOTOR : entity work.HBRIDGE_SMODULE
    generic map(
        g_address		=> Z_MOTOR_ADDRESS,
        g_clk_factor	=> Z_MOTOR_FREQUENCY
    )
    port map(
        clk			    => clk,
        rst			    => rst,
        sys_bus_i	    => sys_bus_i,
        sys_bus_o	    => sys_bus_o(8),
        p_hb_enb		=> system_io_o(23),
        p_hb_out_1	    => system_io_o(24),
        p_hb_out_2	    => system_io_o(25)
    );


    CLAW_MAGNET : entity work.EMAGNET_SMODULE
    generic map(
        g_address		=> EMAG_ADDRESS,
        g_magnet_tao	=> 0,
        g_demag_time	=> 0
    )
    port map(
        clk			    => clk,
        rst			    => rst,
        sys_bus_i	    => sys_bus_i,
        sys_bus_o	    => sys_bus_o(9),
        p_em_enb		=> system_io_o(26),
        p_em_out_1      => system_io_o(27),
        p_em_out_2	    => open
    );
    -----------------------------------------------------------------------------------------------



    --****LED MANAGEMENT****
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
        sys_bus_o       => sys_bus_o(10),
        p_led_output    => system_io_o(28)
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
        sys_bus_o       => sys_bus_o(11),
        p_led_output    => system_io_o(29)
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
        sys_bus_o       => sys_bus_o(12),
        p_led_output    => system_io_o(30)
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
        sys_bus_o       => sys_bus_o(13),
        p_led_output    => system_io_o(31)
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
        sys_bus_o       => sys_bus_o(14),
        p_led_output    => system_io_o(32)
    );
    -----------------------------------------------------------------------------------------------  



    --****EXTERNAL****
	-----------------------------------------------------------------------------------------------
	system_io_o(40 downto 33) <= (others => gnd_io_o);
	-----------------------------------------------------------------------------------------------


end architecture;
