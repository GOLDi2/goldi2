-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		TMC2660 Step Interface driver testbench
-- Module Name:		TMC2660_STEP_DRIVER_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> TMC2660_STEP_DRIVER.vhd
--
-- Revisions:
-- Revision V0.01.01 - File Created
-- Additional Comments: First commitment
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




--! Functionality Simulation
entity TMC2660_STEP_DRIVER_TB is
end entity TMC2660_STEP_DRIVER_TB;




--! Simulation architecture
architecture TB of TMC2660_STEP_DRIVER_TB is

    --CUT
    component TMC2660_STEP_DRIVER
        port(
            clk                     : in    std_logic;
            rst                     : in    std_logic;
            sd_move_negative_valid  : in    std_logic;
            sd_move_positive_valid  : in    std_logic;
            sd_nominal_frequency    : in    std_logic_vector(7 downto 0);
            sd_configuration_valid  : in    std_logic;
            tmc2660_step            : out   std_logic;
            tmc2660_dir             : out   std_logic
        );
    end component;


    --Intermediate Signals
    constant clk_period		        :	time := 10 ns;
    signal reset			        :  	std_logic;
	signal clock			        :	std_logic := '0';
	signal run_sim			        :	std_logic := '1';
	--DUT i/o
    signal sd_move_negative_valid   :   std_logic;
    signal sd_move_positive_valid   :   std_logic;
    signal sd_nominal_frequency     :   std_logic_vector(7 downto 0);
    signal sd_configuration_valid   :   std_logic;
    signal tmc2660_step             :   std_logic;
    signal tmc2660_dir              :   std_logic;


begin

    DUT : TMC2660_STEP_DRIVER
    port map(
        clk                     => clock,
        rst                     => reset,
        sd_move_negative_valid  => sd_move_negative_valid,
        sd_move_positive_valid  => sd_move_positive_valid,
        sd_nominal_frequency    => sd_nominal_frequency,
        sd_configuration_valid  => sd_configuration_valid,
        tmc2660_step            => tmc2660_step,
        tmc2660_dir             => tmc2660_dir
    );



    --Timing
	clock <= run_sim and (not clock) after clk_period/2;
    reset <= '0' after 0 ns, '1' after 5 ns, '0' after 15 ns;




    TEST : process
        --Timing
		variable init_hold			:	time :=	5*clk_period/2;
    begin

        --****Initial Setup****
        sd_move_negative_valid <= '0';
        sd_move_positive_valid <= '0';
        sd_nominal_frequency   <= (others => '0');
        sd_configuration_valid <= '0';
        wait for init_hold;



        --****Reconfigure step speed****
        sd_nominal_frequency   <= (others => '0');
        sd_configuration_valid <= '1';
        wait for clk_period;
        sd_configuration_valid <= '0';



        --****Test step interface****
        sd_move_negative_valid <= '1';
        wait for 1538*clk_period;
        wait for clk_period/2;
        assert(tmc2660_dir = '1') 
            report "line(120): Test operation - expecting dir = '1'" severity error;
        assert(tmc2660_step = '0')
            report "line(122): Test operation - expecting step = '0'" severity error;
        wait for 3*clk_period;
        assert(tmc2660_dir = '1')
            report "line(125): Test operation - expecting dir = '1'" severity error;
        assert(tmc2660_step = '1')
            report "line(127): Test operation - expecting step = '1'" severity error;
        
        wait for 1535*clk_period;

        assert(tmc2660_dir = '1') 
            report "line(132): Test operation - expecting dir = '1'" severity error;
        assert(tmc2660_step = '0')
            report "line(134): Test operation - expecting step = '0'" severity error;
        wait for 3*clk_period;
        assert(tmc2660_dir = '1')
            report "line(137): Test operation - expecting dir = '1'" severity error;
        assert(tmc2660_step = '1')
            report "line(139): Test operation - expecting step = '1'" severity error;
        wait for clk_period/2;
        sd_move_negative_valid <= '0';


        
        --End simulation
		wait for 200 ns;
		run_sim <= '0';
		wait;

    end process;
end TB;