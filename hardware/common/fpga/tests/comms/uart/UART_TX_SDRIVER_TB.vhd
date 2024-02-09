-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/06/2023
-- Design Name:		UART Static Transmitter Testbench
-- Module Name:		UART_TX_SDRIVER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> UART_TX_SDRIVER.vhd
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
entity UART_TX_SDRIVER_TB is
end entity UART_TX_SDRIVER_TB;




--! Simulation architecture
architecture TB of UART_TX_SDRIVER_TB is

    --****DUT****
    component UART_TX_SDRIVER
    generic(
        g_clk_frequency     :   integer;
        g_baud_rate         :   integer;
        g_packet_width      :   integer;
        g_msbf              :   boolean
    );
    port(
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        p_dword_tready      : out   std_logic;
        p_dword_tvalid      : in    std_logic;
        p_dword_tdata       : in    std_logic_vector(g_packet_width-1 downto 0);
        p_tx                : out   std_logic
    );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 20 ns;
	signal run_sim			:	std_logic := '1';
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
    --DUT IOs
    signal p_dword_tready   :   std_logic := '0';
    signal p_dword_tvalid   :   std_logic := '0';
    signal p_dword_tdata    :   std_logic_vector(10 downto 0) := (others => '0');
    signal p_tx             :   std_logic := '1';
    --Testbench
    constant c115200        :   integer := 434;
    signal tx_data          :   std_logic_vector(10 downto 0) := "10111100000";


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : UART_TX_SDRIVER
    generic map(
        g_clk_frequency     => 50000000,
        g_baud_rate         => 115200,
        g_packet_width      => 11,
        g_msbf              => false
    )
    port map(
        clk                 => clock,
        rst                 => reset,
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
        --**Initial setup**
        wait for init_hold;


        --**Test reset state**
        wait for assert_hold;
        assert(p_dword_tready = '1')
            report "ID01: Test reset - expecting dword_tready = '1'"
            severity error;
        assert(p_tx = '1')
            report "ID02: Test reset - expecting p_tx = '1'"
            severity error;
        wait for post_hold;



        --**Test single transmission**
        p_dword_tdata  <= tx_data;
        p_dword_tvalid <= '1';
        wait for clk_period;
        p_dword_tvalid <= '0';

        wait for assert_hold;
        for i in 0 to 10 loop
            assert(p_tx = tx_data(i))
                report "ID03: Test single transmission - expecting p_tx = tx_data("& integer'image(i)&")"
                severity error;

            wait for c115200*clk_period/2;
            if(i<10) then
                assert(p_dword_tready = '0')
                    report "ID04: Test single transmission - expecting dword_tready = '0'"
                    severity error;
            else
                assert(p_dword_tready = '1')
                    report "ID05: Test single transmission - expecting dword_tready = '1'"
                    severity error;
            end if;
            wait for c115200*clk_period/2;
            
        end loop;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test multiple transmissions**
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
                    report "ID06: Test multi transmission - expecting p_tx = tx_data("&integer'image(j)&")"
                    severity error;
            
                wait for c115200*clk_period/2;

                if(j<10) then
                    assert(p_dword_tready = '0')
                        report "ID07: Test multi transmission - expecting dword_tready = '0'"
                        severity error;
                elsif(i<1) then
                    assert(p_dword_tready = '1')
                        report "ID08: Test multi transmission - expecting dword_tready = '1'"
                        severity error;
                        p_dword_tvalid <= '1';
                else
                    assert(p_dword_tready = '1')
                        report "ID09: Test multi transmission - expecting dword_tready = '1'"
                        severity error;
                end if;

                wait for c115200*clk_period/2;
            end loop;
        end loop;



        --**End simulation**
        wait for 50 ns;
        report"UART_TX_SDRIVER_TB - testbench completed";
        --Simulation end using vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries not supported)
        --run_sim <= '0';
        --wait;        

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;