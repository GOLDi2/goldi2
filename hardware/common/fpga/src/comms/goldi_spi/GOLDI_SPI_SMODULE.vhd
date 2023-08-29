-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		SPI to GOLDi BUS adaptor
-- Module Name:		GOLDI_SPI_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> SP_CONVERTER.vhd
--					-> BUS_ADAPTOR.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V4.00.00 - Extension of BUS protocol and renaming
-- Additional Comments: Introduction of "stb" signal to the GOLDi BUS master
--                      interface to prevent continuous read and write 
--                      operations. Addition of tags to the BUS interfaces
--                      to extend BUS flexibility. Renaming form SPI_TO_BUS
--                      to GOLDI_SPI_SMODULE.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! @brief SPI to custom GOLDi BUS protocol 
--! @details
--! Module acts as the main SPI slave interface and the GOLDi BUS master
--! interface. The module manages the communication between the FPGA system
--! and the microcontoller driven control unit. The BUS protocol is defined
--! in the GOLDI_COMM_STANDAR package.
--!
--! ### GOLDi BUS Protocol
--!	|Configuration Word										||||
--! |:--:|:--:|:-------------------:|:------------------------:|
--! | WE | SE | TAG[BUS_TAG_BITS:0] | ADR[BUS_ADDRESS_WIDTH:0] |
--!	
--! The SPI data consists of a configuration word and one or more data words 
--! transfered in an SPI communication cycle i.e "nCE" remains in a low state 
--! during the entier data transfer.
--!
--! Two default modes of communication have been implemented in the  BUS_ADAPTOR 
--! module for the transfer of multiple data word: 
--! "multi-register"-communication and "stream"-communication. In multi-register
--! mode the data is arranged following the MSBF (most-significnat-bit-first) 
--! convention. The first data word is stored in the explicitly addressed register
--! and the following data words are stored in decreasing addresses. This mode
--! simplifies transfer of data to a sub-module with multiple registers and data
--! formats.
--! In the "stream"-mode the data is writen to the register addressed. This mode
--! facilitates the transfer of large data packets to secondary communication 
--! sub-modules
--!
--! **Latency: 2cyc**
entity GOLDI_SPI_SMODULE is
    port(
        --General
        clk             : in    std_logic;      --! System clock
        rst             : in    std_logic;      --! Asynchronous clock
        --SPI slave interface
        p_spi_nce       : in    std_logic;      --! SPI Chip enable signal - logic low
        p_spi_sclk      : in    std_logic;      --! SPI Serial clock input signal
        p_spi_mosi      : in    std_logic;      --! SPI Master out / Slave in data
        p_spi_miso      : out   std_logic;      --! SPI Mastter in / Slave out data
        --BUS master interface
        p_master_bus_o  : out   mbus_out;       --! BUS master interface output signals [stb,we,adr,dat,tag]
        p_master_bus_i  : in    mbus_in         --! BUS master interface input signals [dat,tag]
    );
end entity GOLDI_SPI_SMODULE;




--! General architecture
architecture RTL of GOLDI_SPI_SMODULE is

    --****INTERNAL SIGNALS****
    signal config_word_i    :   std_logic_vector(CONFIGURATION_WORD-1 downto 0);
    signal data_word_in     :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
    signal data_word_out    :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
    signal nce_demux_i      :   std_logic_vector(1 downto 0);
    signal sp_valid_i       :   std_logic_vector(1 downto 0);
    signal word_valid_i     :   std_logic;
    --State machine
    type module_state is (s_config,s_data);
    signal ps_module    :   module_state;


begin

    --****SP SELECTOR****
    -----------------------------------------------------------------------------------------------
    SP_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            ps_module <= s_config;
        elsif(rising_edge(clk)) then
            case ps_module is
            when s_config => if(p_spi_nce /= '0') then ps_module <= s_config;
                             elsif(sp_valid_i(0) = '1') then ps_module <= s_data;
                             else ps_module <= s_config;
                             end if;

            when s_data   => if(p_spi_nce /= '0') then ps_module <= s_config;
                             else ps_module <= s_data;
                             end if;

            when others   => ps_module <= s_config;
            end case;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****SIGNAL ROUTING****
    -----------------------------------------------------------------------------------------------
    nce_demux_i(0) <= p_spi_nce when(ps_module = s_config) else '1';
    nce_demux_i(1) <= p_spi_nce when(ps_module = s_data)   else '1';
    word_valid_i   <= sp_valid_i(1) or sp_valid_i(0); 
    -----------------------------------------------------------------------------------------------



    --****SERIAL PARALLEL CONVERSION****
    -----------------------------------------------------------------------------------------------
    CONFIGURATION_SP_CONVERTER : entity work.SP_CONVERTER
    generic map(
        g_word_length   => CONFIGURATION_WORD 
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_spi_nce       => nce_demux_i(0),
        p_spi_sclk      => p_spi_sclk,
        p_spi_mosi      => p_spi_mosi,
        p_spi_miso      => open,
        p_word_val      => sp_valid_i(0),
        p_data_out      => config_word_i,
        p_data_in       => (others => '0')
    );


    DATA_SP_CONVERTER : entity work.SP_CONVERTER
    generic map(
        g_word_length   => SYSTEM_DATA_WIDTH 
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_spi_nce       => nce_demux_i(1),
        p_spi_sclk      => p_spi_sclk,
        p_spi_mosi      => p_spi_mosi,
        p_spi_miso      => p_spi_miso,
        p_word_val      => sp_valid_i(1),
        p_data_out      => data_word_out,
        p_data_in       => data_word_in
    );
    -----------------------------------------------------------------------------------------------



    --****BUS MASTER INTERFACE****
    -----------------------------------------------------------------------------------------------
    BUS_INTERFACE : entity work.BUS_ADAPTOR
    port map(
        clk             => clk,
        rst             => rst,
        p_nce           => p_spi_nce,
        p_word_val      => word_valid_i,
        p_config_word_i => config_word_i,
        p_data_word_i   => data_word_out,
        p_data_word_o   => data_word_in,
        p_master_bus_o  => p_master_bus_o,
        p_master_bus_i  => p_master_bus_i
    );
    -----------------------------------------------------------------------------------------------


end architecture;