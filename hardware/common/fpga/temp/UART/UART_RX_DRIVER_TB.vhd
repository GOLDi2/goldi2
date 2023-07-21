-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		Universal Asynchronous Reciver Module Testbench
-- Module Name:		UART_RX_DRIVER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	UART_RX_DRIVER.vhd
--
-- Revisions:
-- Revision V3.00.01 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
library std;
use std.standard.all;




--! Functionality simulation
entity UART_RX_DRIVER_TB is
end entity UART_RX_DRIVER_TB;




--! Simulation architecture
architecture TB of UART_RX_DRIVER_TB is

    --****DUT****
    component UART_RX_DRIVER
        generic(
            g_clk_frequency :   integer;
            g_packet_width  :   integer;
            g_msbf          :   boolean
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            o_trate_tready  : out   std_logic;
            i_trate_tvalid  : in    std_logic;
            i_trate_tdata   : in    std_logic_vector(3 downto 0);
            o_dword_tvalid  : out   std_logic;
            o_dword_tdata   : out   std_logic_vector(g_packet_width-1 downto 0);
            i_rx            : in    std_logic;
            o_half_duplex   : out   std_logic
        ); 
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal o_trate_tready   :   std_logic := '0';
    signal i_trate_tvalid   :   std_logic := '0';
    signal i_trate_tdata    :   std_logic_vector(3 downto 0) := (others => '0');
    signal o_dword_tvalid   :   std_logic := '0';
    signal o_dword_tdata    :   std_logic_vector(10 downto 0) := (others => '0');
    signal i_rx             :   std_logic := '1';
    signal o_half_duplex    :   std_logic := '0';
    --Testbench
    constant c9600          :   integer := 5208;
    constant c1500000       :   integer := 33;
    signal rx_data          :   std_logic_vector(10 downto 0) := "11001100110";
    signal packet_buffer    :   std_logic_vector(10 downto 0) := (others => '0');


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : UART_RX_DRIVER
    generic map(
        g_clk_frequency => 50000000,
        g_packet_width  => 11,
        g_msbf          => false
    )
    port map(
        clk             => clock,
        rst             => reset,
        o_trate_tready  => o_trate_tready,
        i_trate_tvalid  => i_trate_tvalid,
        i_trate_tdata   => i_trate_tdata,
        o_dword_tvalid  => o_dword_tvalid,
        o_dword_tdata   => o_dword_tdata,
        i_rx            => i_rx,
        o_half_duplex   => o_half_duplex
    ); 
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    DATA_SHIFTING : process(clock)
    begin
        if(rising_edge(clock)) then
            if(o_dword_tvalid = '1') then
                packet_buffer <= o_dword_tdata;
            end if;
        end if;
    end process;


   
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 5*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Initial setup
        wait for init_hold;


        --**Test reset state**
        wait for assert_hold;
        assert(o_trate_tready = '1')
            report "ID01: Test reset - expecting trate_tready = '1'"
            severity error;
        assert(o_dword_tvalid = '0')
            report "ID02: Test reset - expecting dword_tvalid = '0'"
            severity error;
        assert(o_dword_tdata = (o_dword_tdata'range => '0'))
            report "ID03: Test reset - expecting dword_tdata = x00"
            severity error;
        assert(o_half_duplex = '0')
            report "ID04: Test reset - expecting half_duplex = '0'"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test transfer with default configuration (9600 Baud)**
        for i in 0 to 10 loop
            i_rx <= rx_data(i);
            wait for c9600*clk_period/2;
            assert(o_half_duplex = '1')
                report "ID05: Test 9600 transaction - expecting o_half_duplex = '1'"
                severity error;
            wait for c9600*clk_period/2;
        end loop;
        i_rx <= '1';

        wait for assert_hold;
        assert(packet_buffer = "11001100110")
            report "ID06: Test 9600 transaction - expecting packet_buffer = rx_data"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test transfer with fast configuration (115200 Baud)**
        i_trate_tdata  <= x"9";
        i_trate_tvalid <= '1';
        wait for clk_period;
        i_trate_tvalid <= '0';
        rx_data <= "00110011000";
        wait for 2*clk_period;

        for i in 0 to 10 loop
            i_rx <= rx_data(i);
            wait for c1500000*clk_period/2;
            assert(o_half_duplex = '1')
                report "ID07: Test 1500000 transaction - expecting o_half_duplex = '1'"
                severity error;
            wait for c1500000*clk_period/2;
        end loop;
        i_rx <= '1';

        wait for assert_hold;
        assert(packet_buffer = rx_data)
            report "ID08: Test 1500000 transaction - expecting packet_buffer = rx_data"
            severity error;
        wait for post_hold;
    

        --**End simulation**
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;