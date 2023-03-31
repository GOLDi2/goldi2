-------------------------------------------------------------------------------
-- Company:			Technische Universit�t Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/04/2022
-- Design Name:		Top Level - Test project 
-- Module Name:		TOP_LEVEL
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V0.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

library machxo2;
use machxo2.all;

library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




entity TOP_LEVEL is
    port(
        --General
        FPGA_nReset     : in    std_logic;
        --Communication
        --SPI
        SPI0_SCLK       : in    std_logic;
        SPI0_MOSI       : in    std_logic;
        SPI0_MISO       : out   std_logic;
        SPI0_nCE0       : in    std_logic
    );
end entity TOP_LEVEL;




architecture RTL of top_level is
    
    --Internal signals
    signal clk                  :   std_logic;
    signal FPGA_Reset           :   std_logic;
    signal rst                  :   std_logic;
    --Communication
    signal spi0_sclk_sync       :   std_logic;
    signal spi0_mosi_sync       :   std_logic;
    signal spi0_ce0             :   std_logic;
    signal spi0_nce0_sync       :   std_logic;
    signal spi0_ce    		    :   std_logic;
    --System internal communication
    signal master_bus_i         :   mbus_in;
    signal master_bus_o         :   mbus_out;
    constant const_reg_data     :   data_word_vector(1 downto 0) := (others => x"F0"); 
    signal def_reg_data         :   data_word_vector(1 downto 0);
    		
begin
	
    --****GENERAL****
    -----------------------------------------------------------------------------------------------
    OSCInst0 : component machxo2.components.OSCH
    generic map(
        NOM_FREQ => "44.33"
    )
    port map(
        STDBY    => '0',
        OSC      => clk,
        SEDSTDBY => open
    );
    -----------------------------------------------------------------------------------------------



    --****MICROCONTROLLER INTERFACE****
    -----------------------------------------------------------------------------------------------
    --Reset: Convertion to active high reset for system
    rst <= FPGA_Reset;
    RESET_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => '0',
        io_i    => FPGA_nReset,
        io_sync => FPGA_Reset
    );

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

    spi0_ce0 <= not spi0_nce0_sync;
    NCE0_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => SPI0_nCE0,
        io_sync => spi0_nce0_sync
    );


    spi0_ce <= spi0_ce0;
    SPI_BUS_COMMUNICATION : entity work.SPI_TO_BUS
    port map(
        clk				=> clk,
        rst				=> rst,
        ce				=> spi0_ce,
        sclk		    => spi0_sclk_sync,
        mosi			=> spi0_mosi_sync,
        miso			=> SPI0_MISO,
        master_bus_o	=> master_bus_o,
        master_bus_i	=> master_bus_i
    );

    -----------------------------------------------------------------------------------------------
    


    SENSOR_REGISTER : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS		=> 1,
        NUMBER_REGISTERS	=> 2,
        REG_DEFAULT_VALUES	=> const_reg_data 
    )
    port map(
        clk				=> clk,
        rst			    => rst,
        sys_bus_i		=> master_bus_o,
        sys_bus_o		=> master_bus_i,
        reg_data_in		=> def_reg_data,
        reg_data_out	=> def_reg_data,
        reg_data_stb	=> open
    );

end architecture RTL;
