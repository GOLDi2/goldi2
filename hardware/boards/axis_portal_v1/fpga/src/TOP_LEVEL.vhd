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
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_CROSSBAR_DEFAULT.all;
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
        --ClockFPGA   : in    std_logic;                                        --! External system clock
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
    signal FPGA_nReset_sync     :   std_logic;
    signal rst                  :   std_logic;
    --Communication
    signal spi0_sclk_sync       :   std_logic;
    signal spi0_mosi_sync       :   std_logic;
    signal spi0_nce0_sync       :   std_logic;
    signal spi0_ce0             :   std_logic;
    --System Internal communications
    signal master_bus_o         :   mbus_out;
    signal master_bus_i   	    :   mbus_in;
    signal cb_bus_i             :   sbus_in;
    signal cb_bus_o             :   sbus_o_vector(1 downto 0);
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_o_vector(14 downto 0);
    --System memory
    constant REG_CONFIG_DEFAULT :   data_word_vector(0 downto 0) :=  (others => (others => '0'));
    signal config_reg_data      :   data_word_vector(0 downto 0);
        alias selected_bus      :   std_logic is config_reg_data(0)(0);
        alias encoder_ref       :   std_logic is config_reg_data(0)(1);
    --External data interface
    signal internal_io_i        :   io_i_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    signal internal_io_o        :   io_o_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    signal external_io_i        :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o_safe   :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    --Sensor data
    signal sensor_data_vector   :   data_word_vector(1 downto 0);
    --Incremental Encoder 
    signal x_encoder_ref        :   std_logic;
    signal y_encoder_ref        :   std_logic;


begin
	
   --****CLOCKING****
    -----------------------------------------------------------------------------------------------
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
    rst <= FPGA_nReset_sync;


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
    --Register to select the main communication bus or the io crossbar structure module
    SYSTEM_CONFIG_REG : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => CONFIG_REG_ADDRESS,
        NUMBER_REGISTERS    => 1,
        REG_DEFAULT_VALUES  => REG_CONFIG_DEFAULT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => master_bus_o,
        sys_bus_o           => sys_bus_o(0),
        reg_data_in         => config_reg_data,
        reg_data_out        => config_reg_data,
        reg_data_stb        => open
    );
    
    --Mirror output bus to make register accessible in both modes of operation
    cb_bus_o(0) <= sys_bus_o(0); 


    --Multiplexing of BUS 
    sys_bus_i <= master_bus_o when(selected_bus = '0') else gnd_sbus_i;
    cb_bus_i  <= master_bus_o when(selected_bus = '1') else gnd_sbus_i;

    BUS_MUX : process(clk)
    begin
        if(rising_edge(clk)) then
            if(selected_bus = '0') then
                master_bus_i <= reduceBusVector(sys_bus_o);
            elsif(selected_bus = '1') then
                master_bus_i <= reduceBusVector(cb_bus_o);
            else
                master_bus_i <= gnd_mbus_i;
            end if;
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
        port_out        => external_io_o_safe,
        port_in_async   => open,
        port_in_sync    => external_io_i,
        io_vector       => IO_DATA
    );


    --Route IO formatted data from pins tos system modules
    IO_ROUTING : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => VIRTUAL_PIN_NUMBER,
        RIGHT_PORT_LENGTH   => PHYSICAL_PIN_NUMBER,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
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
        ADDRESS         => ERROR_LIST_ADDRESS
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(1),
        sys_io_i        => external_io_i,
        sys_io_o        => external_io_o   
    );


    --Masking of actuation data to prevent damage to the physical system
    SYSTEM_PROTECTION : entity work.ACTUATOR_MASK
    port map(
        sys_io_i    => external_io_i,
        sys_io_o    => external_io_o,
        safe_io_out => external_io_o_safe
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
        reg_data_in		    => sensor_data_vector,
        reg_data_out	    => open,
        reg_data_stb	    => open
    );

    --Recover memory data form io_vector
    sensor_data_vector(0)(0) <= internal_io_i(2).dat;
    sensor_data_vector(0)(1) <= internal_io_i(3).dat;
    sensor_data_vector(0)(2) <= internal_io_i(4).dat;
    sensor_data_vector(0)(3) <= internal_io_i(5).dat;
    sensor_data_vector(0)(4) <= internal_io_i(6).dat;
    sensor_data_vector(0)(5) <= internal_io_i(7).dat;
    sensor_data_vector(0)(6) <= internal_io_i(8).dat;
    sensor_data_vector(0)(7) <= internal_io_i(9).dat;
    sensor_data_vector(1)(0) <= internal_io_i(10).dat;
    sensor_data_vector(1)(7 downto 1) <= (others => '0');
    internal_io_o(10 downto 2) <= (others => gnd_io_o);
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
        channel_a   => internal_io_i(11),
        channel_b   => internal_io_i(12),
        channel_i   => internal_io_i(13)
    );
    --User accessible rst to zero encoder acumulator
    x_encoder_ref <= rst or encoder_ref;
    --Ground io_o to ensure input configuration
    internal_io_o(13 downto 11) <= (others => gnd_io_o);


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
        channel_a   => internal_io_i(14),
        channel_b   => internal_io_i(15),
        channel_i   => internal_io_i(16)
    );
    --User accesible rst to zero encoder acumulator
    y_encoder_ref <= rst or encoder_ref;
    --Ground io_o to ensure input configuration
    internal_io_o(16 downto 14) <= (others => gnd_io_o);
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
        gpio_i_vector   => internal_io_i(1 downto 0),
        gpio_o_vector   => internal_io_o(1 downto 0)
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
        DC_enb		=> internal_io_o(17),
        DC_out_1	=> internal_io_o(18),
        DC_out_2	=> internal_io_o(19)
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
        DC_enb		=> internal_io_o(20),
        DC_out_1	=> internal_io_o(22),
        DC_out_2	=> internal_io_o(21)
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
        DC_enb		=> internal_io_o(23),
        DC_out_1	=> internal_io_o(24),
        DC_out_2	=> internal_io_o(25)
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
        em_enb		=> internal_io_o(26),
        em_out_1    => internal_io_o(27),
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
        led_output      => internal_io_o(28)
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
        led_output      => internal_io_o(29)
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
        led_output      => internal_io_o(30)
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
        led_output      => internal_io_o(31)
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
        led_output      => internal_io_o(32)
    );
    -----------------------------------------------------------------------------------------------  



    --****EXTERNAL****
	-----------------------------------------------------------------------------------------------
	internal_io_o(40 downto 33) <= (others => gnd_io_o);
	-----------------------------------------------------------------------------------------------


end architecture RTL;