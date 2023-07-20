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
entity UART_STD_ENCODER is
    generic(
        g_data_width    :   integer := 8;
        g_stop_bits     :   integer := 2
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --Data
        o_dword_tready  : out   std_logic;
        i_dword_tvalid  : in    std_logic;
        i_dword_tdata   : in    std_logic_vector(g_data_width-1 downto 0);
        i_eword_tready  : in    std_logic;
        o_eword_tvalid  : out   std_logic;
        o_eword_tdata   : out   std_logic_vector((g_data_width+g_stop_bits) downto 0)
    );
end entity UART_STD_ENCODER;




--! General architecture
architecture RTL of UART_STD_ENCODER is
    
    --****INTERNAL SIGNALS****
    constant sbit_vector    :   std_logic_vector(g_stop_bits-1 downto 0) := (others => '1');
    --Flags
    signal dword_ready_i    :   std_logic;
    signal eword_valid_i    :   std_logic;

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
            dword_ready_i <= '1';
            eword_valid_i <= '0';
        elsif(rising_edge(clk)) then
            --Register data word when both input flags are high
            if(dword_ready_i = '1' and i_dword_tvalid = '1') then
                dword_ready_i <= '0';
                eword_valid_i <= '1';
            end if;

            --Transmit encoded word when both output flags are high
            if(i_eword_tready = '1' and eword_valid_i = '1') then
                dword_ready_i <= '1';
                eword_valid_i <= '0';
            end if;
        end if;
    end process;


    WORD_ENCODING : process(clk,rst)
    begin
        if(rst = '1') then
            o_eword_tdata <= (others => '0');
        elsif(rising_edge(clk)) then
            if(dword_ready_i = '1' and i_dword_tvalid = '1') then
                o_eword_tdata <= sbit_vector & getParity(i_dword_tdata) & i_dword_tdata;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------

    

    --****SIGNAL ROUTING****
    -----------------------------------------------------------------------------------------------
    o_dword_tready <= dword_ready_i;
    o_eword_tvalid <= eword_valid_i;
    -----------------------------------------------------------------------------------------------


end architecture;