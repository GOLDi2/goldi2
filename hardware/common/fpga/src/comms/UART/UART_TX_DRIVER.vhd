-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/06/2023
-- Design Name:		Universal Asynchronous Transmitter Module
-- Module Name:		UART_TX_DRIVER
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




entity UART_TX_DRIVER is
    generic(
        g_clk_frequency     :   integer := 48000000;
        g_packet_width      :   integer := 9;
        g_msbf              :   boolean := false
    );
    port(
        --General
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        --Configuration interface
        o_trate_tready      : out   std_logic;
        i_trate_tvalid      : in    std_logic;
        i_trate_tdata       : in    std_logic_vector(3 downto 0);
        --Data interface
        o_dword_tready      : out   std_logic;
        i_dword_tvalid      : in    std_logic;
        i_dword_tdata       : in    std_logic_vector(g_packet_width-1 downto 0);
        --Serial interface
        o_tx                : out   std_logic;
        i_half_duplex       : in    std_logic 
    );
end entity UART_TX_DRIVER;




--! General architecture
architecture RTL of UART_TX_DRIVER is
    
    --****INTERNAL SIGNALS****
    type ref_table is array (natural range <>) of integer;
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
    signal dword_buffer_i   :   std_logic_vector(g_packet_width downto 0);
    --Counter
    signal tx_clk_period    :   integer;
    signal tx_clk_counter   :   integer;
    signal tx_cyc_counter   :   integer;
    --Flags
    signal trate_ready_i    :   std_logic;
    signal dword_ready_i    :   std_logic;
    --State machine
    type tx_state is (s_idle, s_stransfer, s_stop, s_mtransfer);
    signal ps_tx    :   tx_state;

    
begin

    --****MODULE CONTROL****
    -----------------------------------------------------------------------------------------------
    STATE_MACHINE : process(clk,rst)
        variable tx_clk_period  :   integer;
    begin
        if(rst = '1') then
            ps_tx <= s_idle;
        elsif(rising_edge(clk)) then
            --Typecast baud rate period
            tx_clk_period := baud_table(to_integer(unsigned(trate_buffer_i)));

            --State machine
            case ps_tx is
            when s_idle => 
                if(i_dword_tvalid = '1' and i_half_duplex = '0') then ps_tx <= s_stransfer;
                else ps_tx <= s_idle;
                end if;

            when s_stransfer => 
                if(tx_cyc_counter = g_packet_width and tx_clk_counter = tx_clk_period-1) then ps_tx <= s_stop;
                else ps_tx <= s_stransfer;
                end if;

            when s_stop      =>
                if(tx_clk_counter = tx_clk_counter-1 and i_dword_tvalid = '1') then ps_tx <= s_stransfer;
                elsif(tx_clk_counter = tx_clk_period-1) then ps_tx <= s_idle;
                elsif(i_dword_tvalid = '1') then ps_tx <= s_idle;
                else ps_tx <= s_stop;
                end if;

            when s_mtransfer =>
                if(tx_clk_counter = tx_clk_period-1) then ps_tx <= s_stransfer;
                else ps_tx <= s_mtransfer;
                end if;

            when others =>
                ps_tx <= s_idle;

            end case;

        end if;
    end process;


    PARALLEL_INTERFACE : process(clk,rst)
    begin
        if(rst = '1') then
            trate_buffer_i <= (others => '0');
            dword_buffer_i <= (others => '0');
        elsif(rising_edge(clk)) then
            --Manage transfer rate selection
            if(trate_ready_i = '1' and i_trate_tvalid = '1' and unsigned(i_trate_tdata) < x"A") then
                trate_buffer_i <= i_trate_tdata;
            end if;

            --Manage transfer data buffer
            if(dword_ready_i = '1' and i_dword_tvalid = '1' and g_msbf = false) then
                dword_buffer_i <= i_dword_tdata & "0";
            elsif(dword_ready_i = '1' and i_dword_tvalid = '1' and g_msbf = true) then
                dword_buffer_i <= "0" & i_dword_tdata;
            end if;
        end if;
    end process;


    TRATE_FLAG : process(rst,ps_tx)
    begin
        if(rst = '1') then
            trate_ready_i <= '0';
        elsif(ps_tx = s_idle) then
            trate_ready_i <= '1';
        else
            trate_ready_i <= '0';
        end if;
    end process;


    DWORD_FLAG : process(rst,ps_tx)
    begin
        if(rst = '1') then
            dword_ready_i <= '0';
        elsif(ps_tx = s_stransfer or ps_tx = s_mtransfer) then
            dword_ready_i <= '0';
        else
            dword_ready_i <= '1';
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****MULTIPLEXING CLK PERIOD****
    -----------------------------------------------------------------------------------------------
    tx_clk_period <= baud_table(to_integer(unsigned(trate_buffer_i)));
    -----------------------------------------------------------------------------------------------


    --****SIGNAL ROUTING****
    -----------------------------------------------------------------------------------------------
    o_trate_tready <= trate_ready_i;
    o_dword_tready <= dword_ready_i;
    -----------------------------------------------------------------------------------------------



    --****TX INTERFACE****
    -----------------------------------------------------------------------------------------------
    TX_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            o_tx <= '1';
        elsif(rising_edge(clk)) then
            if(ps_tx /= s_stransfer) then
                o_tx <= '1';
            elsif(g_msbf = true) then
                o_tx <= dword_buffer_i((g_packet_width-1)-tx_cyc_counter);
            else
                o_tx <= dword_buffer_i(tx_cyc_counter);
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
    CLK_COUNTER : process(clk,rst)
        -- variable tx_clk_period  :   integer;
    begin
        if(rst = '1') then
            tx_clk_counter <= 0;
        elsif(rising_edge(clk)) then
            --Typecast baud rate period
            -- tx_clk_period := baud_table(to_integer(unsigned(trate_buffer_i)));

            --Counter
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
        -- variable tx_clk_period  :   integer;
    begin
        if(rst = '1') then
            tx_cyc_counter <= 0;
        elsif(rising_edge(clk)) then
            --Typecast baud rate period
            -- tx_clk_period := baud_table(to_integer(unsigned(trate_buffer_i)));
            
            --Counter
            if(ps_tx = s_idle) then
                tx_cyc_counter <= 0;
            elsif(tx_clk_counter = tx_clk_period-1 and tx_cyc_counter = g_packet_width+1) then
                tx_cyc_counter <= 0;
            elsif(tx_clk_counter = tx_clk_period-1) then
                tx_cyc_counter <= tx_cyc_counter + 1;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;