-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Test design for Breakout-board
-- Module Name:		TOP_LEVEL
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
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




entity TOP_LEVEL is
    port(
        --General
        FPGA_nReset : in    std_logic;   
        --Communication
        --SPI
        SPI0_SCLK   : in    std_logic;
        SPI0_MOSI   : in    std_logic;
        SPI0_MISO   : out   std_logic;
        SPI0_nCE0   : in    std_logic;
        --IO
        IO_DATA     : inout std_logic_vector(15 downto 0);
    );
end entity TOP_LEVEL;




--! General architecture
architecture RTL of TOP_LEVEL is
    
    --****INTERNAL SIGNALS****
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
    --Data interface
    signal sys_io_i             :   io_i_vector(15 downto 0);
    signal sys_io_o             :   io_o_vector(15 downto 0);


begin

    --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    --clk <= ClockFPGA;
    OSCInst0 : component machxo2.components.OSCH
    generic map(
        NOM_FREQ => "133.00"
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
    rst <=  not FPGA_nReset_sync;


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




    --****IO DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    FPGA_PIN_INTERFACE : entity work.TRIS_BUFFER_ARRAY
    generic map(
        BUFF_NUMBER     => 16
    )
    port map(
        clk             => clk,
        rst             => rst,
        port_out        => sys_io_o,
        port_in_async   => open,
        port_in_sync    => sys_io_i,
        io_vector       => IO_DATA
    );
    -----------------------------------------------------------------------------------------------




    --****DUT****
    -----------------------------------------------------------------------------------------------
    -----------------------------------------------------------------------------------------------


end architecture RTL;
