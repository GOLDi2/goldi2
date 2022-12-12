-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		SPI to BUS converter
-- Module Name:		SPI_TO_BUS
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_BUS_STANDARD.vhd
--					-> SP_CONVERTER.vhd
--					-> BUS_CONVERTER.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom communication library
use work.GOLDI_BUS_STANDARD.all;




--! @brief
--! @details
--!
entity SPI_TO_BUS is
	generic(
		BUS_ADDRESS_WIDTH	:	natural := 7;
		BUS_DATA_WIDTH		:	natural := 8
	);
	port(
		--General
		clk			: in	std_logic;
		rst			: in	std_logic;
		--SPI interface
		ce			: in	std_logic;
		sclk		: in	std_logic;
		mosi		: in	std_logic;
		miso		: out	std_logic;
		--BUS interface
		sys_bus_i	: out	bus_in;
		sys_bus_o	: in	bus_out
	);
end entity SPI_TO_BUS;




--! General architecture
architecture RTL of SPI_TO_BUS is
	
	--Components
	component SP_CONVERTER
		generic(
			WORD_LENGTH		:	natural
		);
		port(
			clk				: in	std_logic;
			rst				: in	std_logic;
			ce				: in	std_logic;
			sclk			: in	std_logic;
			mosi			: in	std_logic;
			miso			: out	std_logic;
			word_valid		: out	std_logic;
			dat_i			: in	std_logic_vector(WORD_LENGTH-1 downto 0);
			dat_o			: out	std_logic_vector(WORD_LENGTH-1 downto 0)
		);
	end component;
	
	component BUS_CONVERTER
		generic(
			CONFIG_WORD_WIDTH	:	natural;
			DATA_WORD_WIDTH		:	natural
		);
		port(
			clk				: in	std_logic;
			rst				: in	std_logic;
			ce				: in	std_logic;
			word_valid		: in	std_logic;
			config_word		: in	std_logic_vector(CONFIG_WORD_WIDTH-1 downto 0);
			data_word_in	: in	std_logic_vector(DATA_WORD_WIDTH-1 downto 0);
			data_word_out	: out	std_logic_vector(DATA_WORD_WIDTH-1 downto 0);
			sys_bus_i		: out	bus_in;
			sys_bus_o		: in	bus_out
		);
	end component;
	
	
	--Signals
	signal config_word		:	std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
	signal data_word_in		:	std_logic_vector(BUS_DATA_WIDTH-1 downto 0);
	signal data_word_out	:	std_logic_vector(BUS_DATA_WIDTH-1 downto 0);
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
	
	
	
	CE_ROUTING : process(rst,ce,word_valid_mux)
	begin
		if((rst = '1') or (ce /= '1')) then
			converter_select <= '0';
		elsif(word_valid_mux /= "00") then
			converter_select <= '1';
		else null;
		end if;
	end process;
	
	
	
	BUS_MANAGER : BUS_CONVERTER
	generic map(
		CONFIG_WORD_WIDTH	=> BUS_ADDRESS_WIDTH+1,
		DATA_WORD_WIDTH		=> BUS_DATA_WIDTH
	)
	port map(
		clk				=> clk,
		rst				=> rst,
		ce				=> ce,
		word_valid		=> word_valid_buff,
		config_word		=> config_word,
		data_word_in	=> data_word_in,
		data_word_out	=> data_word_out,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o
	);
	
	
	CONFIG_WORD_CONVERTER : SP_CONVERTER
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
	
	DATA_WORD_CONVERTER : SP_CONVERTER
	generic map(
		WORD_LENGTH		=> BUS_DATA_WIDTH
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