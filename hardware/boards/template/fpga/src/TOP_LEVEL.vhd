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
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_MODULE_CONFIG.all;
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
    signal sys_bus_o            :   sbus_o_vector(9 downto 0) := (others => gnd_sbus_i);
    --System memory
    constant ctrl_default       :   data_word :=  x"A0";
    signal ctrl_data            :   data_word;
        alias selected_bus      :   std_logic is ctrl_data(0);
        alias encoder_ref       :   std_logic is ctrl_data(1);
    --External data interface
    signal internal_io_i        :   io_i_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    signal internal_io_o        :   io_o_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    signal external_io_i        :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o_safe   :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);


begin
	
   --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    --External 48 MHz clock used in the models
    clk <= ClockFPGA;
    
    --Internal clock for testing ["53.2"/"44.33"]
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
        clk     => clk,
        rst     => '0',
        io_i    => FPGA_nReset,
        io_sync => FPGA_nReset_sync
    );
    --Reset routing for use in the models
    rst <= FPGA_nReset_sync;    --Incorrect port name for signal FPGA_nReset -> Signal active high
    --Reset routing for use in the test Breakoutboard
    -- rst <= not FPAG_nReset_sycn


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
    SYSTEM_CONFIG_REG : entity work.REGISTER_UNIT
    generic map(
        ADDRESS         => CTRL_REG_ADDRESS,
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
    -- IO_ROUTING : entity work.IO_CROSSBAR
    -- generic map(
    --     LEFT_PORT_LENGTH    => VIRTUAL_PIN_NUMBER,
    --     RIGHT_PORT_LENGTH   => PHYSICAL_PIN_NUMBER,
    --     LAYOUT_BLOCKED      => block_layout,
    --     DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    -- )
    -- port map(
    --     clk                 => clk,
    --     rst                 => rst,
    --     cb_bus_i            => cb_bus_i,
    --     cb_bus_o            => cb_bus_o(1),
    --     left_io_i_vector    => internal_io_i,
    --     left_io_o_vector    => internal_io_o,
    --     right_io_i_vector   => external_io_i,
    --     right_io_o_vector   => external_io_o
    -- );
    -----------------------------------------------------------------------------------------------


end architecture RTL;
