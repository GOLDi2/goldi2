-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		16/02/2023
-- Design Name:		IO Board - Top Module 
-- Module Name:		TOP_MODULE
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd
--					-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
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



--! @brief
--! @details
--!
entity TOP_MODULE is
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
        GPIO0           : inout std_logic;
        GPIO1           : inout std_logic;
        IN_OUT_DATA     : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
    );
end entity TOP_LEVEL;




--! General architecture
architecture RTL of TOP_MODULE is

    --****Intermeditate signals****
    -----------------------------------------------------------------------------------------------
    signal FPGA_Reset           :   std_logic;
    signal Reset                :   std_logic;
    --Communication
    signal spi0_ce0             :   std_logic;
    signal spi0_ce1             :   std_logic;
    signal spi0_nce0_sync       :   std_logic;
    signal spi0_nce1_sync       :   std_logic;
    signal spi0_sclk_sync       :   std_logic;
    signal spi0_mosi_sync       :   std_logic;
    --System internal communication
    signal master_bus_i         :   mbus_in;
    signal master_bus_o         :   mbus_out;
    signal cb_bus_i             :   sbus_in;
    signal cb_bus_o             :   sbus_o_vector(1 downto 0);
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_o_vector(9 downto 0);
    --System memory
    signal config_reg_data      :   data_word_vector(0 downto 0);
        alias selected_bus      :   std_logic is config_reg_data(0)(0);
    --External data interface
    signal external_io_i        :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_i_async  :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o_safe   :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal internal_io_i        :   io_i_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    signal internal_io_o        :   io_o_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    -----------------------------------------------------------------------------------------------


begin

    --****MICROCONTROLLER INTERFACE****
    -----------------------------------------------------------------------------------------------
    --Reset: Convertion to active high reset for internal system
    FPGA_Reset <= not FPGA_nReset;
    RESET_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => '0',
        io_o    => FPGA_Reset,
        io_sync => Reset
    );

    SCLK_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_o    => SPI0_SCLK,
        io_sync => spi0_sclk_sync
    );

    MOSI_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => SPI0_MOSI,
        io_sync => spi0_mosi_sync
    );

    --Chip Enable: Convertion to active high for internal system
    spi0_ce0 <= not SPI0_nCE0;
    CE0_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => spi0_ce0,
        io_sync => spi0_ce0_sync
    );

    spi0_ce1 <= not SPI0_nCE1;
    CE1_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => ClockFPGA,
        rst     => Reset,
        io_i    => spi0_ce1,
        io_sync => spi0_ce1_sync
    );


    SPI_BUS_COMMUNICATION : entity work.SPI_TO_BUS
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        ce              => spi0_ce0_sync or spi0_ce1_sync,
        sclk            => spi0_sclk_sync,
        mosi            => spi0_mosi_sync,
        miso            => SPI0_MISO,
        master_bus_o    => master_bus_o,
        master_bus_i    => master_bus_i
    );
    -----------------------------------------------------------------------------------------------




    --****INTERNAL COMMUNICATION MANAGMENT****
    -----------------------------------------------------------------------------------------------
    --Register contains the communication bus configuration
    SYSTEM_CONFIG_REG : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => CONFIG_REG_ADDRESS,
        NUMBER_REGISTERS    => 1,
        REG_DEFAULT_VALUES  => assignMemory(REG_CONFIG_DEFAULT)
    )
    port map(
        clk                 => ClockFPGA,
        rst                 => Reset,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o(0),
        reg_data_in         => config_reg_data,
        reg_data_out        => config_reg_data,
        reg_data_stb        => open
    );
    --Mirror output bus to make register accessible in bothe modes of operation
    cb_bus_o(0) <= sys_bus_o(0);


    --Select bus based in register content
    BUS_MULTIPLEXER : process(ClockFPGA)
    begin
        if(rising_edge(ClockFPGA)) then
            case selected_bus is
            when '0' =>
                --Route communication to system registers
                sys_bus_i    <= master_bus_o;
                master_bus_i <= reduceBusVector(sys_bus_o);
                --Ground IO crossbar bus inputs
                cb_bus_i     <= gnd_sbus_i;

            when '1' =>
                --Route communication to io crossbar
                cb_bus_i     <= master_bus_o;
                master_bus_i <= reduceBusVector(cb_bus_o);
                --Ground communication bus inputs
                sys_bus_i    <= gnd_sbus_i;

            when others => null; 
            end case;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****IO MANAGMENT****
    -----------------------------------------------------------------------------------------------
    --Data conversion: Tri-State FPGA Pin Signal to/from IO formatted data   
    FPGA_PIN_INTERFACE : entity TRIS_BUFFER_ARRAY
    generic map(
        BUFF_NUMBER     => PHYSICAL_PIN_NUMBER
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        port_out        => external_io_o,
        port_in_async   => external_io_i_async,
        port_in_sync    => external_io_i,
        io_i_vector     => IN_OUT_DATA
    );


    --Route IO formatted data between FPGA pins and system modules
    IO_ROUTING : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => VIRTUAL_PIN_NUMBER,
        RIGHT_PORT_LENGTH   => PHYSICAL_PIN_NUMBER,
        LAYOUT_BLOCKED      => false,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => ClockFPGA,
        rst                 => Reset,
        cb_bus_i            => cb_bus_i,
        cb_bus_o            => cb_bus_o,
        left_io_i_vector    => internal_io_i,
        left_io_o_vector    => internal_io_o,
        right_io_i_vector   => external_io_i,
        right_io_o_vector   => external_io_o
    );
    -----------------------------------------------------------------------------------------------




    --****BOARD ACTUATION****
    -----------------------------------------------------------------------------------------------
    GPIO_MANAGMENT : entity work.GPIO_DRIVER_ARRAY
    generic map(
        ADDESS          => GPIO_DRIVER_ADDRESS,
        GPIO_NUMBER     => 64
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(1),
        gpio_i_vector   => internal_io_i(63 downto 0),
        gpio_o_vector   => internal_io_o(63 downto 0)
    );  
    -----------------------------------------------------------------------------------------------




    --****LED MANAGMENT****
    -----------------------------------------------------------------------------------------------
    POWER_RED_LED : entity work.LED_DRIVER
    generic map(
        ADDRESS         => POW_R_LED_ADDRESS,
        CLK_FREQUENCY   => POW_R_LED_FREQUENCY,
        INVERTED        => POW_R_LED_INVERTED
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(2),
        led_output      => internal_io_o(64)
    );


    POWER_GREEN_LED : entity work.LED_DRIVER
    generic map(
        ADDRESS         => POW_G_LED_ADDRESS,
        CLK_FREQUNCY    => POW_G_LED_FREQUENCY,
        INVERTED        => POW_G_LED_INVERTED
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(3),
        led_output      => internal_io_o(65)
    );
    -----------------------------------------------------------------------------------------------



    --****PWM GENERATORS****
    -----------------------------------------------------------------------------------------------
    ANALOG_DRIVER_1 : entity work.PWM_GENERATOR
    generic map(
        ADDRESS         => ANALOG_DRIVER_1_ADDRESS,
        PWM_FREQUENCY   => ANALOG_DRIVER_1_FREQUENCY
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(4),
        pwm_io          => internal_io_o(66)
    );


    ANALOG_DRIVER_2 : entity work.PWM_GENERATOR
    generic map(
        ADDRESS         => ANALOG_DRIVER_2_ADDRESS,
        PWM_FREQUENCY   => ANALOG_DRIVER_2_FREQUENCY
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(5),
        pwm_io          => internal_io_o(67)
    );


    ANALOG_DRIVER_3 : entity work.PWM_GENERATOR
    generic map(
        ADDRESS         => ANALOG_DRIVER_3_ADDRESS,
        PWM_FREQUENCY   => ANALOG_DRIVER_3_FREQUENCY
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(6),
        pwm_io          => internal_io_o(68)
    );


    ANALOG_DRIVER_4 : entity work.PWM_GENERATOR
    generic map(
        ADDRESS         => ANALOG_DRIVER_4_ADDRESS,
        PWM_FREQUENCY   => ANALOG_DRIVER_4_FREQUENCY
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(7),
        pwm_io          => internal_io_o(69)
    );

    
    ANALOG_DRIVER_5 : entity work.PWM_GENERATOR
    generic map(
        ADDRESS         => ANALOG_DRIVER_5_ADDRESS,
        PWM_FREQUENCY   => ANALOG_DRIVER_5_FREQUENCY
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(8),
        pwm_io          => internal_io_o(70)
    );


    ANALOG_DRIVER_6 : entity work.PWM_GENERATOR
    generic map(
        ADDRESS         => ANALOG_DRIVER_6_ADDRESS,
        PWM_FREQUENCY   => ANALOG_DRIVER_6_FREQUENCY
    )
    port map(
        clk             => ClockFPGA,
        rst             => Reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(9),
        pwm_io          => internal_io_o(71)
    );
    -----------------------------------------------------------------------------------------------


end RTL;