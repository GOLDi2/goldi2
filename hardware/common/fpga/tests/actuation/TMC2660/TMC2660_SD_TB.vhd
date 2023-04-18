-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		TMC2660 Step/Direction interface testbench
-- Module Name:		TMC2660_SD_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:    -> TMC2660_SD.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard libary
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
library std;
use std.standard.all;




--! Functionality testbench
entity TMC2660_SD_TB is
end entity TMC2660_SD_TB;




--! Simulation architecture
architecture TB of TMC2660_SD_TB is

    --****DUT****
    component TMC2660_SD
        generic(
            SPEED_FACTOR            : natural
        );
        port(
            clk                     : in    std_logic;
            rst                     : in    std_logic;
            sd_enable_neg           : in    std_logic;
            sd_enable_pos           : in    std_logic;
            sd_nominal_frequency    : in    std_logic_vector(7 downto 0);
            sd_configuration_valid  : in    std_logic;
            step                    : out   std_logic;
            direction               : out   std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		        :	time := 10 ns;
	signal reset			        :	std_logic := '0';
	signal clock			        :	std_logic := '0';
	signal run_sim			        :   std_logic := '1';
    --DUT io
    signal sd_enable_neg            :   std_logic;
    signal sd_enable_pos            :   std_logic;
    signal sd_nominal_frequency     :   std_logic_vector(7 downto 0);
    signal sd_configuration_valid   :   std_logic;
    signal step                     :   std_logic;
    signal direction                :   std_logic;
    

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : TMC2660_SD
    generic map(
        SPEED_FACTOR            => 10
    )
    port map(
        clk                     => clock,
        rst                     => reset,
        sd_enable_neg           => sd_enable_neg,
        sd_enable_pos           => sd_enable_pos,
        sd_nominal_frequency    => sd_nominal_frequency,
        sd_configuration_valid  => sd_configuration_valid,
        step                    => step,
        direction               => direction
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
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 5*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset signals
        sd_enable_neg           <= '0';
        sd_enable_pos           <= '0';
        sd_nominal_frequency    <= (others => '0');
        sd_configuration_valid  <= '0';
        wait for init_hold;


        --Test idle state
        wait for assert_hold;
        assert(step = '0') 
            report "line(124): Test reset - expecting step = '0'" severity error;
        assert(direction = '0')
            report "line(126): Test reset - expecting direction = '0'" severity error;
        wait for post_hold;



        --Test fastest configuration in positive direction
        --Expecting a step signal with a period of 10 cyc and direction = '0'
        sd_nominal_frequency   <= x"FF";
        sd_configuration_valid <= '1';
        wait for clk_period;
        sd_configuration_valid <= '0';
        sd_enable_pos          <= '1';
        wait for assert_hold;
        for i in 1 to 10 loop
            for j in 1 to 10 loop
                if(j<6) then
                    assert(step = '0') 
                        report("line(144): Test fast/pos - expecting step = '0' (" & integer'image(i) & "|" & integer'image(j) & ")")
                        severity error;
                else
                    assert(step = '1')
                        report("line(148): Test fast/pos - expecting step = '1' (" & integer'image(i) & "|" & integer'image(j) & ")") 
                        severity error;
                end if;

                assert(direction = '0')
                    report "line(153): Test fast/pos - expecting direction = '0'" severity error;
                wait for clk_period;
            end loop;
        end loop;
        wait for post_hold;



        --Test slow configuration in negative direction
        --Expecting a step signal with a period of 200 cyc and direction = '1'
        sd_nominal_frequency   <= x"EC";
        sd_configuration_valid <= '1';
        wait for clk_period;
        sd_configuration_valid <= '0';
        sd_enable_pos          <= '0';
        sd_enable_neg          <= '1';
        wait for assert_hold;
        for i in 1 to 10 loop
            for j in 1 to 200 loop
                if(j<101) then
                    assert(step = '0')
                        report("line(174): Test slow/neg - expecting step = '0' (" & integer'image(i) & "|" & integer'image(j) & ")")
                        severity error;
                else
                    assert(step = '1')
                        report("line(178): Test slow/neg - expecting step = '1'(" & integer'image(i) & "|" & integer'image(j) & ")")
                        severity error;
                end if;

                assert(direction = '1')
                    report "line(183): Test slow/neg - expecting direction = '1'" severity error;
                wait for clk_period;
            end loop;
        end loop;
        sd_enable_neg <= '0';


        --End simulation
        wait for 5*clk_period;
        run_sim <= '0';
        wait;


    end process;
    -----------------------------------------------------------------------------------------------


end TB;