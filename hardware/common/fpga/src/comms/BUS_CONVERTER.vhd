-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Parallel data to BUS standard
-- Module Name:		BUS_CONVERTER
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_BUS_STANDARD.vhd
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
entity BUS_CONVERTER is
	generic(
		CONFIG_WORD_WIDTH	:	natural := 8;
		DATA_WORD_WIDTH		:	natural := 8
	);
	port(
		--General
		clk				: in	std_logic;
		rst				: in	std_logic;
		ce				: in	std_logic;
		--Parallel data
		word_valid		: in	std_logic;
		config_word		: in	std_logic_vector(CONFIG_WORD_WIDTH-1 downto 0);
		data_word_in	: in	std_logic_vector(DATA_WORD_WIDTH-1 downto 0);
		data_word_out	: out	std_logic_vector(DATA_WORD_WIDTH-1 downto 0);
		--BUS
		sys_bus_i		: out	bus_in;
		sys_bus_o		: in	bus_out
	);end entity BUS_CONVERTER;




--! General architecture
architecture RTL of BUS_CONVERTER is
	
	--Signals
	--Buffers
	signal address_buff			:	std_logic_vector(CONFIG_WORD_WIDTH-2 downto 0);
	signal write_enb_buff		:	std_logic;
	signal data_word_buff		:	std_logic_vector(DATA_WORD_WIDTH-1 downto 0);
	--Flags
	signal bus_write_valid		:	std_logic;
	signal multi_transaction	:	std_logic;
	--State machine
	type state	is (CONFIG,DATA);
	signal PS	:	state := CONFIG;	
	
	
begin

	--Input routing
	data_word_out <= sys_bus_o.dat;
	--Output routing
	sys_bus_i.we  <= write_enb_buff when(bus_write_valid = '1') else '0';
	sys_bus_i.adr <= address_buff;
	sys_bus_i.dat <= data_word_buff;
	
	
	
	BUS_ROUTING : process(clk)
	begin
		if(rising_edge(clk)) then
			if((rst = '1') or (ce /= '1')) then
				--Reset buffers
				write_enb_buff	<= '0';
				address_buff	<= (others => '0');
				data_word_buff	<= (others => '0');
				--Reset flags
				bus_write_valid	  <= '0';
				multi_transaction <= '0';
				--Reset state machine
				PS <= CONFIG;
				
			else
				case PS is
				when CONFIG =>
					--Buffers
					write_enb_buff	<= '0';
					address_buff	<= (others => '0');
					data_word_buff	<= (others => '0');
					--Flags
					bus_write_valid   <= '0';
					multi_transaction <= '0';
					
					if(word_valid = '1') then
						write_enb_buff	<= config_word(CONFIG_WORD_WIDTH-1);
						address_buff 	<= config_word(CONFIG_WORD_WIDTH-2 downto 0);
						PS <= DATA;
					else
						PS <= CONFIG;
					end if;
				
				
				when DATA =>
					--State machine
					PS <= DATA;
					
					if(word_valid = '1') then
						--Flags
						bus_write_valid   <= '1';
						multi_transaction <= '1';
						data_word_buff	  <= data_word_in;
						
					elsif(multi_transaction = '1') then
						address_buff <= std_logic_vector(unsigned(address_buff) + to_unsigned(1,CONFIG_WORD_WIDTH-2));
						multi_transaction <= '0';
						bus_write_valid   <= '0';
					
					else null;
					end if;						
				end case;
			
			end if;
		end if;
	end process;
	
	
end RTL;