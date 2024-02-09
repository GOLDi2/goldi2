-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		Universal Asynchronous Reciver - Dynamic
-- Module Name:		UART_RX_DDRIVER
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




--! @brief UART reciver with configurable transfer rate
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
--!
--! When the module is in an idle state the transmission rate i.e. the sampling
--! rate of the module can be selected from a list of common used values using
--! the "drate" port. A simultaneous "tready" and "tvalid" high value transfers
--! the data rate configuration.
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
entity UART_RX_DDRIVER is
    generic(
        g_clk_frequency :   integer := 48000000;                                --! System clock frequency in Hz
        g_packet_width  :   integer := 11;                                      --! Width of the encoded UART packet
        g_msbf          :   boolean := false                                    --! Data formatted as most-significant-bit-first
    );
    port(
        --General
        clk             : in    std_logic;                                      --! System clock
        rst             : in    std_logic;                                      --! Asynchronous reset
        --Baud rate configuration
        p_drate_tready  : out   std_logic;                                      --! Transfer rate configuration port - ready flag
        p_drate_tvalid  : in    std_logic;                                      --! Transfer rate configuration port - valid flag
        p_drate_tdata   : in    std_logic_vector(2 downto 0);                   --! Transfer rate configuration port - data 
        --Parallel data interface
        p_dword_tready  : in    std_logic;                                      --! Parallel port recived data word - ready flag
        p_dword_tvalid  : out   std_logic;                                      --! Parallel port recived data word - valid flag
        p_dword_tdata   : out   std_logic_vector(g_packet_width-1 downto 0);    --! Parallel port recived data word - data
        --Seiral interface
        p_rx            : in    std_logic                                       --! UART RX input port
    );
end entity UART_RX_DDRIVER;




--! General architecture
architecture RTL of UART_RX_DDRIVER is

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
    --Timing counters
    signal rx_clk_period    :   integer;
    signal rx_clk_counter   :   integer;
    signal rx_cyc_counter   :   integer range 0 to g_packet_width;
    --Flag
    signal drate_ready_i    :   std_logic;
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


    DRATE_READY_FLAG : process(rst,ps_rx)
    begin
        if(rst = '1') then
            drate_ready_i <= '0';
        elsif(ps_rx = s_idle) then
            drate_ready_i <= '1';
        else
            drate_ready_i <= '0';
        end if; 
    end process;


    --Flag routing
    p_drate_tready <= drate_ready_i;
    -------------------------------------------------------------------------------------------------------------------



    --****CLOCK PERIOD MULTIPLEXING****
    -------------------------------------------------------------------------------------------------------------------
    with drate_buffer_i select
        rx_clk_period   <=  baud_table(0) when "000",
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