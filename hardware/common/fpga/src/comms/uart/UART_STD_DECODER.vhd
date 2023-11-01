-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		Standard decoder for UART with error flag 
-- Module Name:		UART_STD_DECODER
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




--! @brief Standard decoder for UART data packet
--! @details
--! The module inputs an encoded data packet and recovers the data while confirming
--! the correct placement of start, parity and stop bits in the packet. The exact format 
--! of the packet can be configured using the generic parameters. The "g_encoded_length" 
--! sets the width of the encoded packet. Assuming a "0"-start-bit at the beginning of 
--! the vector and a "1"-stop-bit at the end, the minimum encoded_length is the 
--! data width + 2 bits. The "g_parity_bit" sets the bit after the data word as a parity 
--! bit. Eventhough the "g_parity_bit" parameter is defined as an integer only 1 parity
--! bit is analysed when the value is larger than 0. A larger value results in additional 
--! stop bits. The "g_even_pol" selects the polarity of the parity bit. A true value 
--! performs an xor operation over the data word and a false value a xnor.
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
entity UART_STD_DECODER is
    generic(
        g_encoded_length    :   integer := 11;                                      --! Width of the encoded data packet
        g_data_width        :   integer := 8;                                       --! Width of the expected data word
        g_parity_bit        :   integer := 1;                                       --! Use of parity bit (values [0,1])
        g_even_pol          :   boolean := true                                     --! Polarity of parity bit (even/odd)
    );
    port(
        --General
        clk                 : in    std_logic;                                      --! System clock
        rst                 : in    std_logic;                                      --! Asynchronous reset
        --Data
        p_eword_tready      : out   std_logic;                                      --! Input encoded packet - ready flag
        p_eword_tvalid      : in    std_logic;                                      --! Input encoded packet - valid flag
        p_eword_tdata       : in    std_logic_vector(g_encoded_length-1 downto 0);  --! Input encoded packet - data 
        p_dword_tready      : in    std_logic;                                      --! Output decoded data word - ready flag
        p_dword_tvalid      : out   std_logic;                                      --! Output decoded data word - valid flag
        p_dword_tdata       : out   std_logic_vector(g_data_width-1 downto 0);      --! Output decoded data word - data
        --Flags
        p_dword_error       : out   std_logic                                       --! Error in packet format detected
    );
end entity UART_STD_DECODER;




--! General architecture
architecture RTL of UART_STD_DECODER is

    --****INTERNAL SIGNALS****
    --Alias
    alias start_bit     :   std_logic 
        is p_eword_tdata(0);
    alias data_bits     :   std_logic_vector(g_data_width-1 downto 0) 
        is p_eword_tdata(g_data_width downto 1);
    alias parity_bit    :   std_logic 
        is p_eword_tdata(g_data_width+1);
    alias stop_bits     :   std_logic_vector(g_encoded_length-g_data_width-g_parity_bit-2 downto 0) 
        is p_eword_tdata(g_encoded_length-1 downto g_data_width+g_parity_bit+1);
    --Flags
    signal eword_ready_i    :   std_logic;
    signal dword_valid_i    :   std_logic;
    

    
    --****FUNCTION****
    function getParity(data :   std_logic_vector) return std_logic is
        variable parity_bit :   std_logic := '0';
    begin
        for i in data'range loop
            parity_bit := parity_bit xor data(i);
        end loop;

        if(g_even_pol) then
            return parity_bit;
        else
            return not parity_bit;
        end if;

    end function;


begin

   --****MODULE CONTROL****
    -----------------------------------------------------------------------------------------------
    WORD_DECODING : process(clk,rst)
    begin
        if(rst = '1') then
            p_dword_tdata <= (others => '0');
            p_dword_error <= '0';
            dword_valid_i <= '0';
            eword_ready_i <= '1';

        elsif(rising_edge(clk)) then
            if(eword_ready_i = '1' and p_eword_tvalid = '1') then
                --Shift data to decoded port
                p_dword_tdata <= p_eword_tdata(g_data_width downto 1);
                p_dword_error <= '0';
                dword_valid_i <= '1';
                eword_ready_i <= '0';

                --Assert format
                if(start_bit /= '0') then
                    p_dword_tdata <= (others => '0');
                    p_dword_error <= '1';
                    dword_valid_i <= '0';
                    eword_ready_i <= '1';
                end if;

                if((g_parity_bit > 0) and (parity_bit /= getParity(data_bits))) then
                    p_dword_tdata <= (others => '0');
                    p_dword_error <= '1';
                    dword_valid_i <= '0';
                    eword_ready_i <= '1';
                end if;

                if(stop_bits /= (stop_bits'range => '1')) then
                    p_dword_tdata <= (others => '0');
                    p_dword_error <= '1';
                    dword_valid_i <= '0';
                    eword_ready_i <= '1';
                end if;
            

            elsif(p_dword_tready = '1' and dword_valid_i = '1') then
                dword_valid_i <= '0';
                eword_ready_i <= '1';

            end if;

        end if;
    end process;


    --Route flags
    p_dword_tvalid <= dword_valid_i;
    p_eword_tready <= eword_ready_i;
    ----------------------------------------------------------------------------------------------- 


end architecture;