-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/06/2023
-- Design Name:		UART Dynamic Transmitter Testbench
-- Module Name:		UART_TX_SDRIVER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> UART_TX_DDRIVER.vhd
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




--! Functionality simulation
entity UART_TX_DDRIVER_TB is
end entity UART_TX_DDRIVER_TB;




--! Simulation architecture
architecture TB of UART_TX_DDRIVER_TB is

    --****DUT****
    component UART_TX_DDRIVER
    generic(
        g_clk_frequency     :   integer;
        g_packet_width      :   integer;
        g_msbf              :   boolean
    );
    port(
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        p_drate_tready      : out   std_logic;
        p_drate_tvalid      : in    std_logic;
        p_drate_tdata       : in    std_logic_vector(2 downto 0);
        p_dword_tready      : out   std_logic;
        p_dword_tvalid      : in    std_logic;
        p_dword_tdata       : in    std_logic_vector(g_packet_width-1 downto 0);
        p_tx                : out   std_logic   
    );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal p_drate_tready   :   std_logic := '1';
    signal p_drate_tvalid   :   std_logic := '0';
    signal p_drate_tdata    :   std_logic_vector(2 downto 0) := (others => '0');
    signal p_dword_tready   :   std_logic := '1';
    signal p_dword_tvalid   :   std_logic := '0';
    signal p_dword_tdata    :   std_logic_vector(10 downto 0) := (others => '0');
    signal p_tx             :   std_logic := '0';
    --Testbench
    constant c9600          :   integer := 5208;
    constant c921600        :   integer := 54;
    signal tx_data          :   std_logic_vector(10 downto 0) := "11010101010";


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : UART_TX_DDRIVER
    generic map(
        g_clk_frequency     => 50000000,
        g_packet_width      => 11,
        g_msbf              => false
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_drate_tready      => p_drate_tready,
        p_drate_tvalid      => p_drate_tvalid,
        p_drate_tdata       => p_drate_tdata,
        p_dword_tready      => p_dword_tready,
        p_dword_tvalid      => p_dword_tvalid,
        p_dword_tdata       => p_dword_tdata,
        p_tx                => p_tx
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
        --Initial setup
        wait for init_hold;


        --**Test reset state**
        wait for assert_hold;
        assert(p_drate_tready = '1')
            report "ID01: Test reset - expecting drate_tready = '1'" 
            severity error;
        assert(p_dword_tready = '1')
            report "ID02: Test reset - expecting dword_tready = '1'" 
            severity error;
        assert(p_tx = '1')
            report "ID03: Test reset - expecting p_tx = '1'"
            severity error;
        wait for post_hold;



        --**Test default rate single transaction**
        p_dword_tdata  <= tx_data;
        p_dword_tvalid <= '1';
        wait for clk_period;
        p_dword_tvalid <= '0';

        wait for assert_hold;
        for i in 0 to 10 loop

            assert(p_tx = tx_data(i))
                report "ID04: Test 9600 single transaction - expecting p_tx = " & integer'image(i) 
                severity error;
            assert(p_drate_tready = '0')
                report "ID05: Test 9600 single transaction - expecting drate_tready = '0'"
                severity error;

            wait for c9600*clk_period/2;
            if(i<10) then
                assert(p_dword_tready = '0')
                report "ID06: Test 9600 single transaction - expecting dword_tready = '0'" 
                severity error;
            else
                assert(p_dword_tready = '1')
                report "ID07: Test 9600 single transaction - expecting dword_tready = '1'"
                severity error;
            end if;
            wait for c9600*clk_period/2;
        
        end loop;
        wait for post_hold;

        
        wait for 5*clk_period;


        --**Test default multi transaction**
        tx_data <= "11011100000";
        wait for clk_period;
        p_dword_tdata  <= tx_data;
        p_dword_tvalid <= '1';
        wait for clk_period;


        wait for assert_hold;
        for i in 0 to 1 loop
            for j in 0 to 10 loop
                p_dword_tvalid <= '0';

                assert(p_tx = tx_data(j))
                    report "ID08: Test 9600 multi-transaction - expecting p_tx = " & integer'image(i)
                    severity error;
                assert(p_drate_tready = '0')
                    report "ID09: Test 9600 multi-transaction - expecting drate_tready = '0'"
                    severity error;
                
                wait for c9600*clk_period/2;
                if(j<10) then
                    assert(p_dword_tready = '0')
                        report "ID10: Test 9600 multi-transaction - expecting dword_tready = '0'"
                        severity error;
                elsif(i<1) then
                    assert(p_dword_tready = '1')
                        report "ID11: Test 9600 multi-transaction - expecting dword_tready = '1'"
                        severity error;
                        p_dword_tvalid <= '1';
                else
                    assert(p_dword_tready = '1')
                        report "ID12: Test 9600 multi-transaction - expecting dword_tready = '1'"
                        severity error;
                end if;
                wait for c9600*clk_period/2;

            end loop;
        end loop;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test 921600 transaction**
        tx_data        <= "10101010100";
        p_drate_tdata  <= "111";
        p_drate_tvalid <= '1';
        wait for clk_period;
        p_drate_tvalid <= '0';
        p_dword_tvalid <= '1';
        p_dword_tdata  <= tx_data;
        wait for clk_period;
        p_dword_tvalid <= '0';


        wait for assert_hold;
        for i in 0 to 10 loop

            assert(p_tx = tx_data(i))
                report "ID13: Test 921600 transaction - expecting p_tx = " & integer'image(i) 
                severity error;
            assert(p_drate_tready = '0')
                report "ID14: Test 921600 transaction - expecting drate_tready = '0'"
                severity error;
            

            wait for c921600*clk_period/2;
            if(i<10) then
                assert(p_dword_tready = '0')
                report "ID15: Test 921600 transaction - expecting dword_tready = '0'" 
                severity error;
            else
                assert(p_dword_tready = '1')
                report "ID16: Test 921600 transaction - expecting dword_tready = '1'"
                severity error;
            end if;
            wait for c921600*clk_period/2;

        end loop;
        wait for post_hold;


        --**End simulation**
        wait for 50 ns;
        report"UART_TX_DDRIVER_TB - testbench completed";
        --Simulation end using vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries not supported)
        -- run_sim <= '0';
        -- wait;   

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;