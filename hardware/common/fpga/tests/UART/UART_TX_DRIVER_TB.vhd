-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/06/2023
-- Design Name:		Universal Asynchronous Transmitter Module Testbench
-- Module Name:		UART_TX_DRIVER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	UART_TX_DRIVER.vhd
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
entity UART_TX_DRIVER_TB is
end entity UART_TX_DRIVER_TB;




--! Simulation architecture
architecture TB of UART_TX_DRIVER_TB is

    --****DUT****
    component UART_TX_DRIVER
    generic(
        g_clk_frequency     :   integer;
        g_packet_width      :   integer;
        g_msbf              :   boolean
    );
    port(
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        o_trate_tready      : out   std_logic;
        i_trate_tvalid      : in    std_logic;
        i_trate_tdata       : in    std_logic_vector(3 downto 0);
        o_dword_tready      : out   std_logic;
        i_dword_tvalid      : in    std_logic;
        i_dword_tdata       : in    std_logic_vector(g_packet_width-1 downto 0);
        o_tx                : out   std_logic;
        i_half_duplex       : in    std_logic 
    );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal o_trate_tready   :   std_logic := '1';
    signal i_trate_tvalid   :   std_logic := '0';
    signal i_trate_tdata    :   std_logic_vector(3 downto 0) := (others => '0');
    signal o_dword_tready   :   std_logic := '1';
    signal i_dword_tvalid   :   std_logic := '0';
    signal i_dword_tdata    :   std_logic_vector(8 downto 0) := (others => '0');
    signal o_tx             :   std_logic := '0';
    signal i_half_duplex    :   std_logic := '0';
    --Testbench
    constant c9600          :   integer := 5208;
    constant c1500000       :   integer := 33;
    signal tx_data          :   std_logic_vector(10 downto 0) := "11010101010";


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : UART_TX_DRIVER
    generic map(
        g_clk_frequency     => 50000000,
        g_packet_width      => 9,
        g_msbf              => false
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        o_trate_tready      => o_trate_tready,
        i_trate_tvalid      => i_trate_tvalid,
        i_trate_tdata       => i_trate_tdata,
        o_dword_tready      => o_dword_tready,
        i_dword_tvalid      => i_dword_tvalid,
        i_dword_tdata       => i_dword_tdata,
        o_tx                => o_tx,
        i_half_duplex       => i_half_duplex
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
        variable post_hold      :   time := clk_period/2;
    begin
        --Initial setup
        wait for init_hold;



        --**Test reset state**
        wait for assert_hold;
        assert(o_trate_tready = '1')
            report "ID01: Test reset - expecting trate_tready = '1'" 
            severity error;
        assert(o_dword_tready = '1')
            report "ID02: Test reset - expecting dword_tready = '1'" 
            severity error;
        assert(o_tx = '1')
            report "ID03: Test reset - expecting o_tx = '1'"
            severity error;
        wait for post_hold;



        --**Test default transmission**
        i_dword_tdata  <= tx_data(9 downto 1);
        i_dword_tvalid <= '1';
        wait for clk_period;
        i_dword_tvalid <= '0';

        wait for assert_hold;
        for i in 0 to 10 loop
            assert(o_trate_tready = '0')
                report "ID04: Test 9600 transaction - expecting trate_tready = '0'"
                severity error;
            assert(o_tx = tx_data(i))
                report "ID05: Test 9600 transaction - expecting o_tx = " & integer'image(i) 
                severity error;

            if(i<10) then
                assert(o_dword_tready = '0')
                report "ID06: Test 9600 transaction - expecting dword_tready = '0'" 
                severity error;
            else
                assert(o_dword_tready = '1')
                report "ID07: Test 9600 transaction - expecting dword_tready = '1'"
                severity error;
            end if;

            wait for c9600*clk_period;
        end loop;
        wait for post_hold;

        
        wait for 5*clk_period;


        --**Test 115200 transaction**
        tx_data        <= "10101010100";
        i_trate_tdata  <= x"9";
        i_trate_tvalid <= '1';
        wait for 2*clk_period;
        i_trate_tvalid <= '0';
        i_dword_tvalid <= '1';
        i_dword_tdata  <= tx_data(9 downto 1);
        wait for clk_period;
        i_dword_tvalid <= '0';

        wait for assert_hold;
        for i in 0 to 10 loop
            assert(o_trate_tready = '0')
                report "ID08: Test 1500000 transaction - expecting trate_tready = '0'"
                severity error;
            assert(o_tx = tx_data(i))
                report "ID09: Test 1500000 transaction - expecting o_tx = " & integer'image(i) 
                severity error;

            if(i<10) then
                assert(o_dword_tready = '0')
                report "ID10: Test 1500000 transaction - expecting dword_tready = '0'" 
                severity error;
            else
                assert(o_dword_tready = '1')
                report "ID11: Test 1500000 transaction - expecting dword_tready = '1'"
                severity error;
            end if;
            
            wait for c1500000*clk_period;
        end loop;
        wait for post_hold;


        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;