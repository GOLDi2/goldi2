-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Parallel data to BUS standard
-- Module Name:		BUS_CONVERTER
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd
--					-> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom communication library
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;



--! @brief BUS Master interface
--! @details
--! Module routes the incomming parallel data and performs the 
--! communication operations with the slave modules in the system.
--! 
--! ###Data format:
--!
--! |      		|Bit 7|Bit 6|Bit 5|Bit 4|Bit 3|Bit 2|Bit 1|Bit 0|
--! |:----------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
--! |config_word|we	  | ADDRESS[6:0]|||||||
--! |data_word	| DATA[7:0] ||||||||
--!
--! **Latency:1**
entity BUS_CONVERTER is
	port(
		--General
		clk				: in	std_logic;											--! System clock
		rst				: in	std_logic;											--! Synchronous reset
		ce				: in	std_logic;											--! Chip enable
		--Parallel data
		word_valid		: in	std_logic;											--! Parallel data available 
		config_word		: in	std_logic_vector(BUS_ADDRESS_WIDTH downto 0);		--! Configuration word
		data_word_in	: in	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);		--! Input data word
		data_word_out	: out	std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);		--! Output data word
		--BUS
		master_bus_o	: out	mbus_out;											--! BUS master interface output signals [we,adr,dat]
		master_bus_i	: in	mbus_in												--! BUS master interface input signals [dat,val]
	);
end entity BUS_CONVERTER;




--! General architecture
architecture RTL of BUS_CONVERTER is
	
	--Signals
	--Buffers
	signal write_enb_buff		:	std_logic;
	signal address_buff			:	address_word;
	signal data_word_buff		:	data_word;
	--Flags
	signal bus_write_valid		:	std_logic;
	signal multi_transaction	:	std_logic;
	--State machine
	type state	is (CONFIG,DATA);
	signal PS	:	state := CONFIG;	
	
	
begin

	--Input routing
	data_word_out <= master_bus_i.dat;
	--Output routing
	master_bus_o.we  <= write_enb_buff when(bus_write_valid = '1') else '0';
	master_bus_o.adr <= address_buff;
	master_bus_o.dat <= data_word_buff;
	
	
	
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
						write_enb_buff	<= config_word(BUS_ADDRESS_WIDTH);
						address_buff 	<= config_word(BUS_ADDRESS_WIDTH-1 downto 0);
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
						address_buff <= std_logic_vector(unsigned(address_buff) + to_unsigned(1,BUS_ADDRESS_WIDTH));
						multi_transaction <= '0';
						bus_write_valid   <= '0';
					
					else null;
					end if;						
				end case;
			
			end if;
		end if;
	end process;
	
	
end RTL;