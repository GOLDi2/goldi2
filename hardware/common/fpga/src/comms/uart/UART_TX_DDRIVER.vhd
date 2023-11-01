-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/06/2023
-- Design Name:		Universal Asynchronous Transmitter - Dynamic
-- Module Name:		UART_TX_DDRIVER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief UART transmitter module with configurable transfer rate
--! @details
--! The UART transmitter module takes an encoded data packet and transfer the
--! information through the "p_tx" serial port. The data in the "p_dword_tdata"
--! is registered in a shift regiser when the "p_dword_tready" and "p_dword_tvalid" 
--! signal are both asserted and then shifted to the serial port at a pre-configured
--! data rate. To allow continous data transfers the "ready" signal is asserted before
--! the ongoing transfer cycle is finised, after the last bit of the data packet begins,
--! specifically at the begining of the last bit period.
--!
--! When the module is in an idle state the transmission rate i.e. the sampling
--! rate of the module can be selected from a list of common used values using
--! the "drate" port. A simultaneous "tready" and "tvalid" high value transfers
--! the data.
--!
--! ### Transfer rates:
--! + 000 - 9600
--! + 001 - 19200
--! + 010 - 38400
--! + 011 - 57600
--! + 100 - 115200
--! + 101 - 230400
--! + 110 - 460800
--! + 111 - 921600
--!
--! **Latency: 2cyc**
entity UART_TX_DDRIVER is
    generic(
        g_clk_frequency     :   integer := 48000000;                                --! System clock frequency in Hz
        g_packet_width      :   integer := 11;                                      --! Width of the encoded UART packet
        g_msbf              :   boolean := false                                    --! Data formatted as most-significant-bit-first
    );
    port(
        --General
        clk                 : in    std_logic;                                      --! System clock
        rst                 : in    std_logic;                                      --! Asynchronous reset
        --Baud rate configuration
        p_drate_tready      : out   std_logic;                                      --! Transfer rate configuration port - ready flag
        p_drate_tvalid      : in    std_logic;                                      --! Transfer rate configuration port - valid flag
        p_drate_tdata       : in    std_logic_vector(2 downto 0);                   --! Transfer rate configuration port - data 
        --Parallel data interface
        p_dword_tready      : out   std_logic;                                      --! Parallel port transfer data word - ready flag
        p_dword_tvalid      : in    std_logic;                                      --! Parallel port transfer data word - valid flag
        p_dword_tdata       : in    std_logic_vector(g_packet_width-1 downto 0);    --! Parallel port transfer data word - data
        --Serial interface
        p_tx                : out   std_logic                                       --! UART TX input port
    );
end entity UART_TX_DDRIVER;




--! General architecture
architecture RTL of UART_TX_DDRIVER is

    --****INTERNAL SIGNALS****
    type ref_table is array (natural range <>) of integer;
    constant baud_table     :   ref_table(7 downto 0) :=(
        0 => g_clk_frequency/9600,        --   9600 Baud
        1 => g_clk_frequency/19200,       --  19200 Baud
        2 => g_clk_frequency/38400,       --  38400 Baud
        3 => g_clk_frequency/57600,       --  57600 Baud
        4 => g_clk_frequency/115200,      -- 115200 Baud
        5 => g_clk_frequency/230400,      -- 230400 Baud
        6 => g_clk_frequency/460800,      -- 460800 Baud
        7 => g_clk_frequency/921600       -- 921600 Baud
    );

    --Data buffers
    signal drate_buffer_i   :   std_logic_vector(2 downto 0);
    signal dword_buffer_i   :   std_logic_vector(g_packet_width-1 downto 0);
    --Counter
    signal tx_clk_period    :   integer;
    signal tx_clk_counter   :   integer;
    signal tx_cyc_counter   :   integer range 0 to g_packet_width;
    --Flags
    signal drate_ready_i    :   std_logic;
    signal dword_ready_i    :   std_logic;
    --State machine
    type tx_state is (s_idle, s_transfer, s_buffer, s_hold);
    signal ps_tx            :   tx_state;


begin

    --****MODULE CONTROL****
    -------------------------------------------------------------------------------------------------------------------
    STATE_MACHINE : process(clk,rst)
    begin
        if(rst = '1') then
            ps_tx <= s_idle;
        elsif(rising_edge(clk)) then
            --State machine control
            case ps_tx is
            when s_idle     =>  --Module in idle state waits for a valid/ready flag to initiate
                if(p_dword_tvalid = '1') then ps_tx <= s_transfer;
                else ps_tx <= s_idle;
                end if;
                
            when s_transfer =>  --Transfer state shifts the codified serial data
                if(tx_clk_counter = 0 and tx_cyc_counter = g_packet_width-1) then ps_tx <= s_buffer;
                else ps_tx <= s_transfer;
                end if;

            when s_buffer   =>  --Enable ready flag after last data bit to allow data queuing
                if(tx_clk_counter = tx_clk_period-1 and tx_cyc_counter = g_packet_width-1) then ps_tx <= s_idle;
                elsif(p_dword_tvalid = '1') then ps_tx <= s_hold;
                else ps_tx <= s_buffer;
                end if;

            when s_hold     =>  --Wait for current data transfer to finish to initiate next one
                if(tx_clk_counter = tx_clk_period-1 and tx_cyc_counter = g_packet_width-1) then ps_tx <= s_transfer;
                else ps_tx <= s_hold;
                end if;

            when others     =>
                ps_tx <= s_idle;
        
            end case;
        
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------



    --****PARALLEL DATA INTERFACE****
    -------------------------------------------------------------------------------------------------------------------
    PARALLEL_DATA_INTERFACE : process(clk,rst)
    begin
        if(rst = '1') then
            dword_buffer_i <= (others => '0');
        elsif(rising_edge(clk)) then
            --Buffer data
            if(dword_ready_i = '1' and p_dword_tvalid = '1') then
                dword_buffer_i <= p_dword_tdata;
            end if;
        end if;
    end process;


    DWORD_READY_FLAG : process(rst,ps_tx)
    begin
        if(rst = '1') then
            dword_ready_i <= '0';
        elsif(ps_tx = s_idle or ps_tx = s_buffer) then
            dword_ready_i <= '1';
        else
            dword_ready_i <= '0';
        end if;
    end process;


    DATA_RATE_INTERFACE : process(clk,rst)
    begin
        if(rst = '1') then
            drate_buffer_i <= (others => '0');
        elsif(rising_edge(clk)) then
            --Buffer data
            if(drate_ready_i = '1' and p_drate_tvalid = '1') then
                drate_buffer_i <= p_drate_tdata;
            end if;
        end if;
    end process;


    DRATE_READY_FLAG : process(rst,ps_tx)
    begin
        if(rst = '1') then
            drate_ready_i <= '0';
        elsif(ps_tx = s_idle) then
            drate_ready_i <= '1';
        else
            drate_ready_i <= '0';
        end if; 
    end process;


    --Flag routing
    p_dword_tready <= dword_ready_i;
    p_drate_tready <= drate_ready_i;
    -------------------------------------------------------------------------------------------------------------------



    --****CLOCK PERIOD MULTIPLEXING****
    -------------------------------------------------------------------------------------------------------------------
    with drate_buffer_i select
        tx_clk_period   <=  baud_table(0) when "000",
                            baud_table(1) when "001",
                            baud_table(2) when "010",
                            baud_table(3) when "011",
                            baud_table(4) when "100",
                            baud_table(5) when "101",
                            baud_table(6) when "110",
                            baud_table(7) when "111",
                            baud_table(0) when others;
    -------------------------------------------------------------------------------------------------------------------



    --****UART INTERFACE****
    -------------------------------------------------------------------------------------------------------------------
    TX_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            p_tx <= '1';
        elsif(rising_edge(clk)) then
            if(ps_tx = s_idle) then
                p_tx <= '1';
            elsif((tx_clk_counter = 0) and (g_msbf = true)) then
                p_tx <= dword_buffer_i((g_packet_width-1)-tx_cyc_counter);
            elsif((tx_clk_counter = 0) and (g_msbf = false)) then
                p_tx <= dword_buffer_i(tx_cyc_counter);
            end if;
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------



    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
    CLK_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            tx_clk_counter <= 0;
        elsif(rising_edge(clk)) then
            if(ps_tx = s_idle) then
                tx_clk_counter <= 0;
            elsif(tx_clk_counter = tx_clk_period-1) then
                tx_clk_counter <= 0;
            else
                tx_clk_counter <= tx_clk_counter + 1;
            end if;
        end if;
    end process;


    CYCLE_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            tx_cyc_counter <= 0;
        elsif(rising_edge(clk)) then
            if(ps_tx = s_idle) then
                tx_cyc_counter <= 0;
            elsif(tx_clk_counter = tx_clk_period-1 and tx_cyc_counter = g_packet_width-1) then
                tx_cyc_counter <= 0;
            elsif(tx_clk_counter = tx_clk_period-1) then
                tx_cyc_counter <= tx_cyc_counter + 1;
            end if;
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------


end architecture;