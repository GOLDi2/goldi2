-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		SPI to BUS converter
-- Module Name:		SPI_TO_BUS
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd
--					-> GOLDI_COMM_STANDARD.vhd
--					-> SP_CONVERTER.vhd
--					-> BUS_CONVERTER.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
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




--! @brief SPI to internal BUS standard
--! @details
--! Module acts as a SPI slave interface and a BUS master
--! interface. The moduel manages the communication between 
--! the FPGA system and the microcontroller based on the 
--! configuration parameters set in the GOLDI_MODULE_CONFIG
--! package (default: adr -> 7bit, dat -> 8 bit)
--!
--! ###Data format:
--! 
--! |Byte  				|Bit 7|Bit 6|Bit 5|Bit 4|Bit 3|Bit 2|Bit 1|Bit 0|
--! |:------------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
--! |Byte 1	[in]		|we	  | ADDRESS[6:0]|||||||
--! |Byte 2	[in/out]	| DATA[7:0] ||||||||
--! |Byte + [in/out]	| DATA[7:0] -> ADDRESS+1||||||||
--!
--! **Latency:2**
entity SPI_TO_BUS is
	port(
		--General
		clk				: in	std_logic;	--! System clock
		rst				: in	std_logic;	--! Synchronous reset
		--SPI interface
		ce				: in	std_logic;	--! SPI - Chip enable
		sclk			: in	std_logic;	--! SPI - Serial clock
		mosi			: in	std_logic;	--! SPI - Master out; Slave in
		miso			: out	std_logic;	--! SPI - Master in; Slave out
		--BUS interface
		master_bus_o	: out	mbus_out;	--! BUS master interface output signals [we,adr,dat]
		master_bus_i	: in	mbus_in		--! BUS master interface input signals [dat,val]
	);
end entity SPI_TO_BUS;




--! General architecture
architecture RTL of SPI_TO_BUS is
	
	--****INTERNAL SIGNALS****
	signal config_word		:	std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
	signal data_word_in		:	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
	signal data_word_out	:	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
	--Mux and Demux
	signal converter_select :	std_logic;
	signal ce_demux			:	std_logic_vector(1 downto 0);
	signal word_valid_mux	:	std_logic_vector(1 downto 0);
	signal word_valid_buff	:	std_logic;
	
	
begin

	--Converter selection
	ce_demux(0) <= ce when(converter_select = '0') else '0';
	ce_demux(1) <= ce when(converter_select = '1') else '0';
	--Word valid mux
	word_valid_buff <= word_valid_mux(0) or word_valid_mux(1);
	
	
	
	CE_ROUTING : process(clk)
	begin
		if(rising_edge(clk)) then
			if((rst = '1') or (ce /= '1')) then
				converter_select <= '0';
			elsif(word_valid_mux /= "00") then
				converter_select <= '1';
			else null;
			end if;
		end if;
	end process;
	
	
	
	BUS_MANAGER : entity work.BUS_CONVERTER
	port map(
		clk				=> clk,
		rst				=> rst,
		ce				=> ce,
		word_valid		=> word_valid_buff,
		config_word		=> config_word,
		data_word_in	=> data_word_in,
		data_word_out	=> data_word_out,
		master_bus_o	=> master_bus_o,
		master_bus_i	=> master_bus_i
	);
	
	
	CONFIG_WORD_CONVERTER : entity work.SP_CONVERTER
	generic map(
		WORD_LENGTH		=> BUS_ADDRESS_WIDTH+1
	)
	port map(
		clk				=> clk,
		rst				=> rst,
		ce				=> ce_demux(0),
		sclk			=> sclk,
		mosi			=> mosi,
		miso			=> open,
		word_valid		=> word_valid_mux(0),
		dat_i			=> (others => '0'),
		dat_o			=> config_word
	);
	
	DATA_WORD_CONVERTER : entity work.SP_CONVERTER
	generic map(
		WORD_LENGTH		=> SYSTEM_DATA_WIDTH
	)
	port map(
		clk				=> clk,
		rst				=> rst,
		ce				=> ce_demux(1),
		sclk			=> sclk,
		mosi			=> mosi,
		miso			=> miso,
		word_valid		=> word_valid_mux(1),
		dat_i			=> data_word_out,
		dat_o			=> data_word_in
	);
	
	
end RTL;