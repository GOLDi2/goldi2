-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		UART Dynamic Reciver Testbench
-- Module Name:		UART_RX_DDRIVER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> UART_RX_DDRIVER.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation flow control and assertions
library std;
use std.standard.all;
use std.env.all;




--! Functionality Simulation
entity UART_RX_DDRIVER_TB is
end entity UART_RX_DDRIVER_TB;




--! Simulation architecture
architecture TB of UART_RX_DDRIVER_TB is

    --****DUT****
    component UART_RX_DDRIVER
        generic(
            g_clk_frequency :   integer;
            g_packet_width  :   integer;
            g_msbf          :   boolean
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            p_drate_tready  : out   std_logic;
            p_drate_tvalid  : in    std_logic;
            p_drate_tdata   : in    std_logic_vector(2 downto 0);
            p_dword_tready  : in    std_logic;
            p_dword_tvalid  : out   std_logic;
            p_dword_tdata   : out   std_logic_vector(g_packet_width-1 downto 0);
            p_rx            : in    std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal p_drate_tready   :   std_logic := '0';
    signal p_drate_tvalid   :   std_logic := '0';
    signal p_drate_tdata    :   std_logic_vector(2 downto 0) := (others => '0');
    signal p_dword_tready   :   std_logic := '0';
    signal p_dword_tvalid   :   std_logic := '0';
    signal p_dword_tdata    :   std_logic_vector(10 downto 0) := (others => '0');
    signal p_rx             :   std_logic := '1';
    --Testbench
    constant c9600          :   integer := 5208;
    constant c921600        :   integer := 54;
    signal rx_data          :   std_logic_vector(10 downto 0) := "11010101010";


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : UART_RX_DDRIVER
    generic map(
        g_clk_frequency => 50000000,
        g_packet_width  => 11,
        g_msbf          => false
    )
    port map(
        clk             => clock,
        rst             => reset,
        p_drate_tready  => p_drate_tready,
        p_drate_tvalid  => p_drate_tvalid,
        p_drate_tdata   => p_drate_tdata,
        p_dword_tready  => p_dword_tready,
        p_dword_tvalid  => p_dword_tvalid,
        p_dword_tdata   => p_dword_tdata,
        p_rx            => p_rx
    );
    -----------------------------------------------------------------------------------------------


    
    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test reset state**
        wait for assert_hold;
        assert(p_drate_tready = '1')
            report "ID01: Test reset - expecting drate_tready = '1'"
            severity error;
        assert(p_dword_tvalid = '0')
            report "ID02: Test reset - expecting dword_tvalid = '0'"
            severity error;
        assert(p_dword_tdata = (p_dword_tdata'range => '0'))
            report "ID03: Test reset - expecting dword_tdata = x000"
            severity error;
        wait for post_hold;



        --**Test defualt rate 9600Baud signle transaction**
        for i in 0 to 10 loop
            p_rx <= rx_data(i);

            wait for c9600*clk_period/2;
            assert(p_dword_tvalid = '0')
                report "ID04: Test 9600 transaction - expecting dword_tvalid = '0'"
                severity error;
            wait for c9600*clk_period/2;

        end loop;
        
        wait for assert_hold;
        assert(p_dword_tvalid = '1')
            report "ID05: Test 9600 transaction - expecting dword_tvalid = '1'"
            severity error;
        assert(p_dword_tdata = rx_data)
            report "ID06: Test 9600 transaction - expecting dword_tdata = rx_data"
            severity error;
        wait for post_hold;

        p_dword_tready <= '1';

        wait for assert_hold;
        assert(p_dword_tvalid = '0')
            report "ID07: Test 9600 transaction - expecting dword_tvalid = '0'"
            severity error;
        assert(p_dword_tdata = rx_data)
            report "ID08: Test 9600 transaction - expecting dword_tdata = rx_data"
            severity error;
        wait for post_hold;

        p_dword_tready <= '0';


        wait for 5*clk_period;


        --**Test 921600Baud single transaction**
        p_drate_tdata  <= "111";
        p_drate_tvalid <= '1';
        wait for clk_period;
        p_drate_tvalid <= '0';

        for i in 0 to 10 loop
            p_rx <= rx_data(i);

            wait for c921600*clk_period/2;
            assert(p_dword_tvalid = '0')
                report "ID09: Test 921600 transaction - expecting dword_tvalid = '0'"
                severity error;
            wait for c921600*clk_period/2;

        end loop;
        
        wait for assert_hold;
        assert(p_dword_tvalid = '1')
            report "ID10: Test 921600 transaction - expecting dword_tvalid = '1'"
            severity error;
        assert(p_dword_tdata = rx_data)
            report "ID11: Test 921600 transaction - expecting dword_tdata = rx_data"
            severity error;
        wait for post_hold;

        p_dword_tready <= '1';

        wait for assert_hold;
        assert(p_dword_tvalid = '0')
            report "ID12: Test 921600 transaction - expecting dword_tvalid = '0'"
            severity error;
        assert(p_dword_tdata = rx_data)
            report "ID13: Test 921600 transaction - expecting dword_tdata = rx_data"
            severity error;
        wait for post_hold;

        p_dword_tready <= '0';


        wait for 5*clk_period;


        --**Test multi-transaction**
        rx_data <= "10001100110";
        wait for clk_period;

        for i in 0 to 1 loop
            for j in 0 to 10 loop
                p_rx <= rx_data(j);

                wait for c921600*clk_period/2;
                assert(p_dword_tvalid = '0')
                    report "ID14: Test multi-transaction - expecting dword_tvalid = '0'"
                    severity error;
                wait for c921600*clk_period/2; 
            end loop;
            p_rx <= '0';

            wait for assert_hold;
            assert(p_dword_tvalid = '1')
                report "ID15: Test multi-transaction - expecting dword_tvalid = '1'"
                severity error;
            assert(p_dword_tdata = rx_data)
                report "ID16: Test multi-transaction - expecting dword_tdata = rx_data"
                severity error;
            wait for post_hold;

            p_dword_tready <= '1';

            wait for assert_hold;
            assert(p_dword_tvalid = '0')
                report "ID17: Test multi-transaction - expecting dword_tvalid = '0'"
                severity error;
            assert(p_dword_tdata = rx_data)
                report "ID18: Test multi-transaction - expecting dword_tdata = rx_data"
                severity error;
            wait for post_hold;

            p_dword_tready <= '0';
            rx_data <= "10110011000";

        end loop;


        
        --**End simulation**
        wait for 50 ns;
        report"UART_RX_DDRIVER_TB - testbench completed";
        --Simulation end using vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries not supported)
        -- run_sim <= '0';
        -- wait;        

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;