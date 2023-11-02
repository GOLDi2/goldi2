-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		Standard encoder for UART with parity bit 
-- Module Name:		UART_STD_ENCODER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none;
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief Standard encoder for UART data packet
--! @details
--! The module inputs a data word and encodes it into a standard UART data packet
--! to be transsmited. The exact format of the packet can be configured using the
--! generic parameters. The "g_encoded_length" sets the width of the encoded 
--! packet. Assuming a "0"-start-bit at the beginning of the vector and a 
--! "1"-stop-bit at the end, the minimum encoded_length is the data width + 2 bits.
--! The "g_parity_bit" generates a parity bit possition after the data in the packet.
--! Eventhough the "g_parity_bit" parameter is defined as an integer only 1 parity
--! bit is generated when the value is larger than 0. A larger value results in 
--! additional stop bits. The "g_even_pol" selects the polarity of the parity bit.
--! A true value performs an xor operation over the data word and a false value a
--! xnor.
--!
--! The data transfer occurs when both the ready and valid flags of a corresponding
--! port are asserted. 
--!
--! ###Encoding format:
--!
--!     |<-------------------------- g_encoded_length --------------------------->|    
--!     | stop-bits |  (parity-bit)     |           data_word          |start-bit |
--!     |           | [g_data_width+1]  |       [g_data_width:1]       |  [0]     |
--!
--!
--! **Latency: 1cyc**
entity UART_STD_ENCODER is
    generic(
        g_encoded_length    :   integer := 11;                                  --! Width of the encoded packet
        g_data_width        :   integer := 8;                                   --! Width of the data word
        g_parity_bit        :   integer := 1;                                   --! Use of a parity bit (0-false | 1-true)
        g_even_pol          :   boolean := true                                 --! Polarity of the parity bit
    );
    port(
        --General
        clk             : in    std_logic;                                      --! System clock
        rst             : in    std_logic;                                      --! Asynchronous reset
        --Data
        p_dword_tready  : out   std_logic;                                      --! Data word port - ready flag
        p_dword_tvalid  : in    std_logic;                                      --! Data word port - valid flag
        p_dword_tdata   : in    std_logic_vector(g_data_width-1 downto 0);      --! Data word port - data
        p_eword_tready  : in    std_logic;                                      --! Encoded packet port - ready flag
        p_eword_tvalid  : out   std_logic;                                      --! Encoded packet port - valid flag
        p_eword_tdata   : out   std_logic_vector(g_encoded_length-1 downto 0)   --! Encoded packet port - data
    );
end entity UART_STD_ENCODER;




--! General architecture
architecture RTL of UART_STD_ENCODER is
    
    --****INTERNAL SIGNALS****
    alias start_bit     :   std_logic
        is p_eword_tdata(0);
    alias data_bits     :   std_logic_vector(g_data_width-1 downto 0)
        is p_eword_tdata(g_data_width downto 1);
    alias parity_bit    :   std_logic
        is p_eword_tdata(g_data_width+1);
    alias stop_bits     :   std_logic_vector(g_encoded_length-g_data_width-g_parity_bit-2 downto 0)
        is p_eword_tdata(g_encoded_length-1 downto g_data_width+g_parity_bit+1);   
    --Flags
    signal dword_ready_i    :   std_logic;
    signal eword_valid_i    :   std_logic;


    --****FUNCTION****
    function getParity(data : std_logic_vector) return std_logic is
        variable l_parity_bit :   std_logic := '0';
    begin
        for i in data'range loop
            l_parity_bit := l_parity_bit xor data(i);
        end loop;

        if(g_even_pol) then
            return l_parity_bit;
        else
            return not l_parity_bit;
        end if;

    end function;


begin

    --****MODULE CONTROL****
    -----------------------------------------------------------------------------------------------
    WORD_ENCODING : process(clk,rst)
    begin
        if(rst = '1') then
            p_eword_tdata <= (others => '0');
            eword_valid_i <= '0';
            dword_ready_i <= '1';
            
        elsif(rising_edge(clk)) then
            if(dword_ready_i = '1' and p_dword_tvalid = '1') then
                --Encode data
                start_bit <= '0';
                data_bits <= p_dword_tdata;
                stop_bits <= (others => '1');

                --Assert parity bit
                if(g_parity_bit > 0) then 
                    parity_bit <= getParity(p_dword_tdata);
                end if;

                --Manage flags
                eword_valid_i <= '1';
                dword_ready_i <= '0';


            elsif(p_eword_tready = '1' and eword_valid_i = '1') then
                eword_valid_i <= '0';
                dword_ready_i <= '1';

            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------

    

    --****SIGNAL ROUTING****
    -----------------------------------------------------------------------------------------------
    p_dword_tready <= dword_ready_i;
    p_eword_tvalid <= eword_valid_i;
    -----------------------------------------------------------------------------------------------


end architecture;