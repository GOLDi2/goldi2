-------------------------------------------------------------------------------
-- Company: 		Technische Universitaet Ilmenau
-- Engineer: 		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date: 	15/12/2022
-- Design Name: 	Negative and positive edge detector testbench
-- Module Name: 	EDGE_DETECTOR_TB
-- Project Name: 	GOLDi_FPGA_CORE
-- Target Devices: 	LCMXO2-7000HC-4TG144C
-- Tool versions: 	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies: 	EDGE_DETECTOR.vhd;
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
use std.standard.all;




--! Functionality simulation
entity EDGE_DETECTOR_TB is
end entity EDGE_DETECTOR_TB;




--! Simulation architecture
architecture TB of EDGE_DETECTOR_TB is

    --****DUT**** 
    component EDGE_DETECTOR
        port(
            clk		: in	std_logic;
            rst		: in	std_logic;
            data_in	: in	std_logic;
            n_edge	: out	std_logic;
            p_edge	: out	std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period	:	time := 10 ns;
	signal clock		:	std_logic := '0';
	signal reset		:	std_logic := '0';
	signal run_sim		:	std_logic := '1';
	--DUT IOs
    signal data_in      :   std_logic;
    signal n_edge       :   std_logic;
    signal p_edge       :   std_logic;


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : EDGE_DETECTOR
    port map(
        clk		=> clock,
        rst		=> reset,
        data_in => data_in,
        n_edge	=> n_edge,
        p_edge	=> p_edge
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 5 ns, '0' after 15 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
		variable init_hold		:	time := 5*clk_period/2;
        variable assert_hold    :   time := 5*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --**Initial Setup**
        data_in <= '0';
        wait for init_hold;


        --**Test reset state**
        wait for assert_hold;
        assert(p_edge = '0')
            report "ID01: Test reset - expecting p_edge = '0'" severity error;
        assert(n_edge = '0')
            report "ID02: Test reset - expecting n_edge = '0'" severity error;
        wait for post_hold;


        --**Teset risign edge**
        data_in <= '1';
        wait for assert_hold;
        assert(p_edge = '1') 
            report "ID03: Test rising edge - expecting p_edge = '1'" severity error;
        assert(n_edge = '0')
            report "ID04: Test rising edge - expecting n_edge = '0'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test falling edge**
        data_in <= '0';
        wait for assert_hold;
        assert(p_edge = '0') 
            report "ID05: Test falling edge - expecting p_edge = '0'" severity error;
        assert(n_edge = '1')
            report "ID06: Test falling edge - expecting n_edge = '1'" severity error;
        wait for post_hold;


        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------
    

end TB;