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
-- Revision V3.01.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief
--! @details
--!
entity UART_STD_DECODER is
    generic(
        g_data_width    :   integer := 8;
        g_stop_bits     :   integer := 2
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --Data
        o_eword_tready  : out   std_logic;
        i_eword_tvalid  : in    std_logic;
        i_eword_tdata   : in    std_logic_vector((g_data_width+g_stop_bits+1) downto 0);
        i_dword_tready  : in    std_logic;
        o_dword_tvalid  : out   std_logic;
        o_dword_tdata   : out   std_logic_vector(g_data_width-1 downto 0);
        --Flags
        o_dword_error   : out   std_logic
    );
end entity UART_STD_DECODER;




--! General architecture
architecture RTL of UART_STD_DECODER is
  
    --****INTERNAL SIGNALS****
    constant stop_vector    :   std_logic_vector(g_stop_bits-1 downto 0) := (others => '1');
    --Flags
    signal eword_ready_i    :   std_logic;
    signal dword_valid_i    :   std_logic;

    --****FUNCTION****
    function getParity(data : std_logic_vector) return std_logic is
        variable parity_bit :   std_logic := '0';
    begin
        for i in data'range loop
            parity_bit := parity_bit xor data(i);
        end loop;

        return parity_bit;
    end function;


begin

    --****MODULE CONTROL****
    -----------------------------------------------------------------------------------------------
    FLAG_MANAGEMENT : process(clk,rst)
    begin
        if(rst = '1') then
            eword_ready_i <= '1';
            dword_valid_i <= '0';
        elsif(rising_edge(clk)) then
            --Register encoded data word when both input flags are high
            if(eword_ready_i = '1' and i_eword_tvalid = '1') then
                eword_ready_i <= '0';
                dword_valid_i <= '1';
            end if;

            --Transmit decoded data word when both flags are high
            if(i_dword_tready = '1' and dword_valid_i = '1') then
                eword_ready_i <= '1';
                dword_valid_i <= '0';
            end if;
        end if;
    end process;


    WORD_DECODING : process(clk,rst)
    begin
        if(rst = '1') then
            o_dword_tdata <= (others => '0');
            o_dword_error <= '0';
        elsif(rising_edge(clk)) then
            if(eword_ready_i = '1' and i_eword_tvalid = '1') then
                --Recover data word from package 
                o_dword_tdata <= i_eword_tdata(g_data_width downto 1);

                --Flag error when incorrect packet format is detected
                if((i_eword_tdata(g_data_width+1) /= getParity(i_eword_tdata(g_data_width downto 1))) or
                   (i_eword_tdata(i_eword_tdata'high downto g_data_width+2) /= stop_vector)) then
                    
                    o_dword_error <= '1';
                else
                    o_dword_error <= '0';
                end if;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****SIGNAL ROUTING****
    -----------------------------------------------------------------------------------------------
    o_eword_tready <= eword_ready_i;
    o_dword_tvalid <= dword_valid_i;
    -----------------------------------------------------------------------------------------------



end architecture;