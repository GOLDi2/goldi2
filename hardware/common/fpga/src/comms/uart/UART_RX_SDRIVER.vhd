-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		Universal Asynchronous Reciver - Static 
-- Module Name:		UART_RX_DRIVER
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
--! Use standard libarary
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief UART reciver with a fix transfer rate
--! @details
--! The module detects a UART data transmission and recovers the serially
--! transfered data into a shift register that is the presented as an 
--! encoded data packet in parallel form. The module is enabled by a logic
--! low value in the "p_rx" port and samples the data at a pre-configured
--! data rate. The inital input is sampled additional 2 times to prevent
--! a false trigger of the sampling process. Once the entire data word has
--! been registered the data is shifted to the parallel "p_dword_tdata" port
--! and the "p_dword_tvalid" is enabled. The data transfer occurs when both 
--! theready and valid signals are asserted, at which point the ready flag 
--! is grounded until a new data packet is available.
entity UART_RX_SDRIVER is
    generic(
        g_clk_frequency :   integer := 48000000;                                --! System clock frequency in Hz
        g_baud_rate     :   integer := 9600;                                    --! UART transfer rate in bit/s (baud)
        g_packet_width  :   integer := 11;                                      --! Width of the encoded UART packet
        g_msbf          :   boolean := false                                    --! Data formatted as most-significant-bit-first
    );
    port(
        --General
        clk             : in    std_logic;                                      --! System clock
        rst             : in    std_logic;                                      --! Asynchronous reset
        --Parallel data interface
        p_dword_tready  : in    std_logic;                                      --! Parallel port recived data word - ready flag
        p_dword_tvalid  : out   std_logic;                                      --! Parallel port recived data word - valid flag
        p_dword_tdata   : out   std_logic_vector(g_packet_width-1 downto 0);    --! Parallel port recived data word - data
        --Seiral interface
        p_rx            : in    std_logic                                       --! UART RX input port
    );
end entity UART_RX_SDRIVER;




--! General architecture
architecture RTL of UART_RX_SDRIVER is

    --****INTERNAL SIGNALS****
    constant rx_clk_period  :   integer := g_clk_frequency/g_baud_rate;
    --Timing counters
    signal rx_clk_counter   :   integer range 0 to rx_clk_period;
    signal rx_cyc_counter   :   integer range 0 to g_packet_width;
    --State machine
    type rx_state is (s_idle, s_detect, s_sample);
    signal ps_rx            :   rx_state;


begin

    --****MODULE CONTROL****
    -------------------------------------------------------------------------------------------------------------------
    STATE_MACHINE : process(clk,rst)
    begin
        if(rst = '1') then
            ps_rx <= s_idle;
        elsif(rising_edge(clk)) then
            case ps_rx is
            when s_idle     => --Module in idle states reacts to a logic low in uart port
                if(p_rx = '0') then ps_rx <= s_detect;
                else ps_rx <= s_idle;
                end if;

            when s_detect   => --Sample uart port a second time to ensure valid transaction
                if(rx_clk_counter = rx_clk_period/4 and p_rx = '0') then ps_rx <= s_sample;
                elsif(rx_clk_counter = rx_clk_period/4) then ps_rx <= s_idle;
                else ps_rx <= s_detect;
                end if;

            when s_sample   => --Sample data at the middle of the uart period
                if(rx_clk_counter = rx_clk_period-1 and rx_cyc_counter = g_packet_width-1 and p_rx = '0') then ps_rx <= s_detect;
                elsif(rx_clk_counter = rx_clk_period-1 and rx_cyc_counter = g_packet_width-1) then ps_rx <= s_idle;
                else ps_rx <= s_sample;
                end if;

            when others => 
                ps_rx <= s_idle;

            end case;
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------



    --****PARALLEL INTERFACE****
    -------------------------------------------------------------------------------------------------------------------
    DWORD_VALID_FLAG : process(clk,rst)
    begin
        if(rst = '1') then
            p_dword_tvalid <= '0';
        elsif(rising_edge(clk)) then
            if(rx_clk_counter = rx_clk_period-1 and rx_cyc_counter = g_packet_width-1) then
                p_dword_tvalid <= '1';
            elsif(p_dword_tready = '1') then
                p_dword_tvalid <= '0';
            end if;
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------



    --****UART INTERFACE****
    -------------------------------------------------------------------------------------------------------------------
    RX_SAMPLING : process(clk,rst)
    begin
        if(rst = '1') then
            p_dword_tdata <= (others => '0');
        elsif(rising_edge(clk)) then
            if(rx_clk_counter = rx_clk_period/2 and g_msbf = true) then
                p_dword_tdata((g_packet_width-1)-rx_cyc_counter) <= p_rx;
            elsif(rx_clk_counter = rx_clk_period/2) then
                p_dword_tdata(rx_cyc_counter) <= p_rx;
            else null;
            end if;
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------



    --****COUNTERS****
    -------------------------------------------------------------------------------------------------------------------
    CLK_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            rx_clk_counter <= 0;
        elsif(rising_edge(clk)) then
            if(ps_rx = s_idle) then
                rx_clk_counter <= 0;
            elsif(rx_clk_counter = rx_clk_period-1) then
                rx_clk_counter <= 0;
            else
                rx_clk_counter <= rx_clk_counter + 1;
            end if;
        end if;
    end process;


    CYCLE_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            rx_cyc_counter <= 0;
        elsif(rising_edge(clk)) then
            if(ps_rx = s_idle) then
                rx_cyc_counter <= 0;
            elsif(rx_clk_counter = rx_clk_period-1 and rx_cyc_counter = g_packet_width-1) then
                rx_cyc_counter <= 0;
            elsif(rx_clk_counter = rx_clk_period-1) then
                rx_cyc_counter <= rx_cyc_counter + 1;
            end if;
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------


end architecture;