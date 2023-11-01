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
-- Dependencies: 	-> EDGE_DETECTOR.vhd;
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: - 
--
-- Revision V4.00.00 - Module refactoring
-- Additional Comments: Use of env library to stop simulation. 
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation control and assertions
library std;
use std.standard.all;
use std.env.all;




--! Functionality simulation
entity EDGE_DETECTOR_TB is
end entity EDGE_DETECTOR_TB;




--! Simulation architecture
architecture TB of EDGE_DETECTOR_TB is

    --****DUT**** 
    component EDGE_DETECTOR
        port(
            clk		    : in	std_logic;
            rst		    : in	std_logic;
            data_in	    : in	std_logic;
            p_f_edge	: out	std_logic;
            p_r_edge    : out	std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period	:	time := 20 ns;
	signal clock		:	std_logic := '0';
	signal reset		:	std_logic := '0';
	signal run_sim		:	std_logic := '1';
	--DUT IOs
    signal data_in      :   std_logic := '0';
    signal p_f_edge       :   std_logic := '0';
    signal p_r_edge       :   std_logic := '0';


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : EDGE_DETECTOR
    port map(
        clk		    => clock,
        rst		    => reset,
        data_in     => data_in,
        p_f_edge	=> p_f_edge,
        p_r_edge	=> p_r_edge
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
		variable init_hold		:	time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial Setup**
        wait for init_hold;


        --**Test reset state**
        wait for assert_hold;
        assert(p_r_edge = '0')
            report "ID01: Test reset - expecting p_r_edge = '0'" severity error;
        assert(p_f_edge = '0')
            report "ID02: Test reset - expecting p_f_edge = '0'" severity error;
        wait for post_hold;


        --**Teset risign edge**
        data_in <= '1';
        wait for assert_hold;
        assert(p_r_edge = '1') 
            report "ID03: Test rising edge - expecting p_r_edge = '1'" severity error;
        assert(p_f_edge = '0')
            report "ID04: Test rising edge - expecting p_f_edge = '0'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test falling edge**
        data_in <= '0';
        wait for assert_hold;
        assert(p_r_edge = '0') 
            report "ID05: Test falling edge - expecting p_r_edge = '0'" severity error;
        assert(p_f_edge = '1')
            report "ID06: Test falling edge - expecting p_f_edge = '1'" severity error;
        wait for post_hold;


        --**End simulation**
		wait for 50 ns;
        report "EDGE_DETECTOR_TB - testbench successful";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------
    

end TB;