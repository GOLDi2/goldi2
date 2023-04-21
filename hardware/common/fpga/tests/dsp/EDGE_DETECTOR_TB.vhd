-------------------------------------------------------------------------------
-- Company: 		Technische Universität Ilmenau
-- Engineer: 		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date: 	15/12/2022
-- Design Name: 	Negative and positive edge detector testbench
-- Module Name: 	EDGE_DETECTOR_TB
-- Project Name: 	GOLDi_FPGA_CORE
-- Target Devices: 	LCMXO2-7000HC-4TG144C
-- Tool versions: 	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies: 	none;
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

    --CUT 
    component EDGE_DETECTOR
        port(
            clk		: in	std_logic;
            rst		: in	std_logic;
            data_in	: in	std_logic;
            n_edge	: out	std_logic;
            p_edge	: out	std_logic
        );
    end component;


     --Intermediate signals
    --Timing
	constant clk_period	:	time := 10 ns;
	signal clock		:	std_logic := '0';
	signal reset		:	std_logic;
	signal run_sim		:	std_logic := '1';
	--DUT i/o
    signal data_in      :   std_logic;
    signal n_edge       :   std_logic;
    signal p_edge       :   std_logic;


begin

    DUT : EDGE_DETECTOR
    port map(
        clk		=> clock,
        rst		=> reset,
        data_in => data_in,
        n_edge	=> n_edge,
        p_edge	=> p_edge
    );



    --Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 0 ns, '0' after 15 ns;



    TEST : process
        --Timing
		variable init_hold		:	time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        
        --***Initial Setup***
        data_in <= '0';
        wait for init_hold;



        --***Teset risign edge***
        data_in <= '1';
        wait for assert_hold;
        assert(p_edge = '1') 
            report "line(101): Test rising edge - expecting p_edge = '1'" severity error;
        assert(n_edge = '0')
            report "line(103): Test rising edge - expecting n_edge = '0'" severity error;
        wait for post_hold;


        --***Test falling edge***
        data_in <= '0';
        wait for assert_hold;
        assert(p_edge = '0') 
            report "line(111): Test falling edge - expecting p_edge = '0'" severity error;
        assert(n_edge = '1')
            report "line(113): Test falling edge - expecting n_edge = '1'" severity error;
        wait for post_hold;

        --End simulation
        wait for 20 ns;
        run_sim <= '0';
        wait;

    end process;


end TB;