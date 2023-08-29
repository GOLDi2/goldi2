-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Serial Parallel Converter for GOLDi SPI interface
-- Module Name:		SP_CONVERTER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V4.00.00 - Optimization of design and change to reset
-- Additional Comments: Small refactoring of the architecture. Change from
--						"ce" - chip enabled to "nce" - negated chip enabled.
--                      Change from synchronous to asynchronous reset
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief SPI slave Serial/Parallel converter for the custom GOLDi SPI interface
--! @details  
--! SPI slave interface for communication between the GOLDi Lattice FPGA driven 
--! control boards and the Raspberry Pi diriven control unit. The module contains
--! the shift registers used to transform the incomming and outgoing data between
--! serial und parallel formats. The module is enabled by a logic low presented in
--! the "nCE" input. It registers the "MOSI" data after a rising edge in the "SCLK"
--! input and shifts data to the "MISO" output when a logic low is presented in the
--! "SCLK" input signal. The "SCLK" signal is expected to be in a high state when
--! the SPI interface is idle. The data is shifted following the MSBF convention.
--! The maximum "SCLK" frequency is half the "clk" frequency
--!
--! **Latency: 1cyc**
entity SP_CONVERTER is
    generic(
        g_word_length   :   natural := 8                                        --! Length of shifted data word
    );    
    port(
        --General
        clk             : in    std_logic;                                      --! System clock
        rst             : in    std_logic;                                      --! Asynchronous reset
        --SPI slave interface
        p_spi_nce       : in    std_logic;                                      --! SPI Chip enable signal - logic low
        p_spi_sclk      : in    std_logic;                                      --! SPI Serial clock input signal
        p_spi_mosi      : in    std_logic;                                      --! SPI Master out / Slave in data
        p_spi_miso      : out   std_logic;                                      --! SPI Mastter in / Slave out data
        --Parallel interface
        p_word_val      : out   std_logic;                                      --! Serial to parallel conversion valid
        p_data_out      : out   std_logic_vector(g_word_length-1 downto 0);     --! Parallel incomming data word - "MOSI" data
        p_data_in       : in    std_logic_vector(g_word_length-1 downto 0)      --! Parallel outgoing data word  - "MISO" data
    );
end entity SP_CONVERTER;




--! General architecture
architecture RTL of SP_CONVERTER is

    --****INTERNAL SIGNALS****
    signal bit_counter  :   integer range 0 to g_word_length;
    signal sclk_buffer  :   std_logic;


begin

    
    DATA_CONVERSION : process(clk,rst)
    begin
        if(rst = '1') then
            p_spi_miso  <= '0';
            p_word_val  <= '0';
            p_data_out  <= (others => '0');
            bit_counter <= 0;

        elsif(rising_edge(clk)) then
            if(p_spi_nce /= '0') then
                p_spi_miso  <= '0';
                p_word_val  <= '0';
                p_data_out  <= (others => '0');
                bit_counter <= 0;
            
            else
                --Detect a rising edge in the sclk signal
                if((p_spi_sclk = '1') and (sclk_buffer = '0')) then
                    --Shift data to parallel registers
                    p_data_out((g_word_length-1) - bit_counter) <= p_spi_mosi;
                    
                    --Indicate the conversion of a seral word to parallel
                    if(bit_counter = g_word_length-1) then
                        p_word_val  <= '1';
                        bit_counter <= 0;
                    else
                        p_word_val  <= '0';
                        bit_counter <= bit_counter + 1;
                    end if;
                else
                    p_word_val <= '0';
                end if;

                --Detect a falling edge or low state in the sclk signal
                if(p_spi_sclk = '0') then
                    p_spi_miso <= p_data_in((g_word_length-1) - bit_counter);
                end if;
                
            end if;
        end if;
    end process;


    SCLK_REGISTER : process(clk,rst)
    begin
        if(rst = '1') then
            sclk_buffer <= '1';
        elsif(rising_edge(clk)) then
            if(p_spi_nce /= '0') then
                sclk_buffer <= '1';
            else
                sclk_buffer <= p_spi_sclk;
            end if;
        end if;
    end process;


end architecture;