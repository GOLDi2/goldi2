-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		Universal Asynchronous Reciver Module 
-- Module Name:		UART_RX_DRIVER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V3.00.01 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief
--! @details
--!
entity UART_RX_DRIVER is
    generic(
        g_clk_frequency :   integer := 48000000;
        g_packet_width  :   integer := 11;
        g_msbf          :   boolean := false
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --Configuration interface
        o_trate_tready  : out   std_logic;
        i_trate_tvalid  : in    std_logic;
        i_trate_tdata   : in    std_logic_vector(3 downto 0);
        --Data interface
        o_dword_tvalid  : out   std_logic;
        o_dword_tdata   : out   std_logic_vector(g_packet_width-1 downto 0);
        --Serial interface
        i_rx            : in    std_logic;
        o_half_duplex   : out   std_logic
    ); 
end entity UART_RX_DRIVER;




--! General architecture
architecture RTL of UART_RX_DRIVER is

    --****INTERNAL SIGNALS****
    --Transmission rate table
    type ref_table is array(natural range <>) of natural;
    constant baud_table :   ref_table(9 downto 0) := (
        0 => g_clk_frequency/9600,        --   9600 Baud
        1 => g_clk_frequency/19200,       --  19200 Baud
        2 => g_clk_frequency/38400,       --  38400 Baud
        3 => g_clk_frequency/57600,       --  57600 Baud
        4 => g_clk_frequency/115200,      -- 115200 Baud
        5 => g_clk_frequency/230400,      -- 230400 Baud
        6 => g_clk_frequency/460800,      -- 460800 Baud
        7 => g_clk_frequency/921600,      -- 921600 Baud
        8 => g_clk_frequency/1000000,     --1000000 Baud
        9 => g_clk_frequency/1500000      --1500000 Baud
    );

    --Data buffers
    signal trate_buffer_i   :   std_logic_vector(3 downto 0);
    --Counters
    signal rx_clk_period    :   integer;
    signal rx_clk_counter   :   integer;
    signal rx_cyc_counter   :   integer;
    --Flags
    signal trate_tready_i   :   std_logic;
    --State machine
    type rx_state is (s_idle, s_detect, s_sample, s_stop);
    signal ps_rx    :   rx_state;


begin

    --****MODULE CONTROL****
    -----------------------------------------------------------------------------------------------
    STATE_MACHINE : process(clk,rst)
    begin
        if(rst = '1') then
            ps_rx <= s_idle;
        elsif(rising_edge(clk)) then
            case ps_rx is
            when s_idle =>      
                if(i_rx = '0') then ps_rx <= s_detect;
                else ps_rx <= s_idle;
                end if;
            
            when s_detect =>    
                if(i_rx = '1') then ps_rx <= s_idle;
                elsif(rx_clk_counter = rx_clk_period/2-1) then ps_rx <= s_sample;
                else ps_rx <= s_detect;
                end if;
            
            when s_sample =>    
                if(rx_cyc_counter = g_packet_width-1 and rx_clk_counter = rx_clk_period-1) then ps_rx <= s_stop;
                else ps_rx <= s_sample;
                end if;    

            when s_stop => 
                if(i_rx = '0') then ps_rx <= s_detect;
                else ps_rx <= s_idle;
                end if;

            when others =>
                ps_rx <= s_idle;
            end case;
        end if;
    end process;


    CONFIGURATION_INTERFACE : process(clk,rst)
    begin
        if(rst = '1') then
            trate_buffer_i <= (others => '0');
        elsif(rising_edge(clk)) then
            if(trate_tready_i = '1' and i_trate_tvalid = '1' and unsigned(i_trate_tdata) < x"A") then
                trate_buffer_i <= i_trate_tdata;
            end if;
        end if;
    end process;


    FLAG_CONTROL : process(rst,ps_rx,i_rx)
    begin
        if(rst = '1') then
            trate_tready_i <= '0';
            o_half_duplex  <= '0';
        elsif(ps_rx = s_idle and i_rx = '1') then
            trate_tready_i <= '1';
            o_half_duplex  <= '0';
        else
            trate_tready_i <= '0';
            o_half_duplex  <= '1';
        end if;
    end process;

    o_trate_tready <= trate_tready_i;
    -----------------------------------------------------------------------------------------------



    --****TRANSFER RATE MULTIPLEXING****
    -----------------------------------------------------------------------------------------------
    rx_clk_period <= baud_table(to_integer(unsigned(trate_buffer_i)));
    -----------------------------------------------------------------------------------------------



    --****RX INTERFACE****
    -----------------------------------------------------------------------------------------------
    RX_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            o_dword_tdata  <= (others => '0');
            o_dword_tvalid <= '0';
        elsif(rising_edge(clk)) then
            if(rx_clk_counter = rx_clk_period/2-1 and g_msbf = true) then
                o_dword_tdata((g_packet_width-1)-rx_cyc_counter) <= i_rx;
            elsif(rx_clk_counter = rx_clk_period/2-1 and g_msbf = false) then
                o_dword_tdata(rx_cyc_counter) <= i_rx;
            end if;

            if(rx_cyc_counter = g_packet_width-1 and rx_clk_counter = rx_clk_period-1) then
                o_dword_tvalid <= '1';
            else
                o_dword_tvalid <= '0';
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
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
            if(ps_rx /= s_sample) then
                rx_cyc_counter <= 0;
            elsif(rx_cyc_counter = rx_clk_period-1 and rx_cyc_counter = g_packet_width-1) then
                rx_cyc_counter <= 0;
            elsif(rx_clk_counter = rx_clk_period-1) then
                rx_cyc_counter <= rx_cyc_counter + 1; 
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;