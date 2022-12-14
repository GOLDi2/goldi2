-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Bidirectional Serial to/form Parallel converter
-- Module Name:		SP_CONVERTER
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;



--! @brief Serial <-> Parallel data converter
--! @details
--! Bidirectional serial and parallel data converter for use in SPI 
--! communication. Module transforms SPI incomming signals into parallel
--! data and the outgoing parallel data into miso serial data.
entity SP_CONVERTER is
	generic(
		WORD_LENGTH		:	natural := 8
	);
	port(
		--General
		clk				: in	std_logic;
		rst				: in	std_logic;
		--Serial interface
		ce				: in	std_logic;
		sclk			: in	std_logic;
		mosi			: in	std_logic;
		miso			: out	std_logic;
		--Parallel interface
		word_valid		: out	std_logic;
		dat_i			: in	std_logic_vector(WORD_LENGTH-1 downto 0);
		dat_o			: out	std_logic_vector(WORD_LENGTH-1 downto 0)
	);
end entity SP_CONVERTER;




--! General architecture
architecture RTL of SP_CONVERTER is
	--Signals
	signal bit_counter	:	integer range 0 to WORD_LENGTH;
	signal sclk_old		:	std_logic;
	
begin

	DATA_CONVERSION : process(clk)
	begin
		if(rising_edge(clk)) then
			if((rst = '1') or (ce /= '1')) then
				--Reset internal
				bit_counter <= 0;
				sclk_old    <= '0';
				--Reset serial interface
				miso <= '0';
				--Reset parallel
				word_valid <= '0';
				dat_o <= (others => '0');
			
			else
				--Serial to Parallel
				if((sclk = '1') and (sclk_old = '0')) then
					dat_o((WORD_LENGTH-1) - bit_counter) <= mosi;
					--Flag once the full word is converted
					if(bit_counter = WORD_LENGTH-1) then
						word_valid  <= '1';
						bit_counter <= 0;
					else
						word_valid  <= '0';
						bit_counter <= bit_counter + 1;
					end if;
				else
					word_valid <= '0';
				end if;
				
				--Parallel to Serial
				if(sclk = '0') then
					miso <= dat_i((WORD_LENGTH-1) - bit_counter);
				end if;
				
				--Register clock value to recongize rising edges
				sclk_old <= sclk;
				
			end if;
		end if;
	end process;
	
	
end RTL;	
