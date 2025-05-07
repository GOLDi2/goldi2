-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:	    10/08/2023
-- Design Name:		Frequency analyser testbench 
-- Module Name:		FREQUENCY_ANALYSER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> FREQUENCY_ANALYSER.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
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
entity FREQUENCY_ANALYSER_TB is
end entity FREQUENCY_ANALYSER_TB;




--! Simulation architecture
architecture TB of FREQUENCY_ANALYSER_TB is

    --****DUT****
    component FREQUENCY_ANALYSER
        generic(
            g_sampling_period   :   integer
        );
        port(
            clk                 : in    std_logic;
            rst                 : in    std_logic;
            p_data_in           : in    std_logic;
            p_data_period       : out   std_logic_vector(31 downto 0)   
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal p_data_in        :   std_logic := '0';
    signal p_data_period    :   std_logic_vector(31 downto 0) := (others => '1');
    --Testbench
    constant c_frq_5000     :   integer := 10000;
    constant c_frq_520      :   integer := 96154;


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : FREQUENCY_ANALYSER
    generic map(
        g_sampling_period   => 1
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_data_in           => p_data_in,
        p_data_period       => p_data_period   
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

        
        --**Test reset conditions**
        wait for assert_hold;
        assert(p_data_period = (p_data_period'range => '1'))
            report "ID01: Test reset - expecting p_data_period = xFFFFFFFF"
            severity error;
        wait for post_hold;


        --**Test detection of 5000Hz signal****
        for i in 0 to 6 loop
            p_data_in <= '1';
            wait for c_frq_5000*clk_period/2;
            p_data_in <= '0';
            wait for c_frq_5000*clk_period/2;
        end loop;

        wait for assert_hold;
        assert(p_data_period = std_logic_vector(to_unsigned(10000,p_data_period'length)))
            report "ID02: Test frequency 5000 Hz - expecting p_data_period = 10000"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test detection of 520 Hz signal****
        for i in 0 to 6 loop
            p_data_in <= '1';
            wait for c_frq_520*clk_period/2;
            p_data_in <= '0';
            wait for c_frq_520*clk_period/2;
        end loop;

        wait for assert_hold;
        assert(p_data_period = std_logic_vector(to_unsigned(96154,p_data_period'length)))
            report "ID02: Test frequency 5000 Hz - expecting p_data_period = 96154"
            severity error;
        wait for post_hold;


        --**End simulation**
		wait for 50 ns;
        report "FREQUENCY_ANALYSER_TB - testbench successful";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;