-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		31/07/2023
-- Design Name:	    Moving average filter testbenc
-- Module Name:		MAVG_2N_FILTER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:    -> MAVG_2N_FILTER.vhd
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
entity MAVG_2N_FILTER_TB is
end entity MAVG_2N_FILTER_TB;




--! Simulation architecture
architecture TB of MAVG_2N_FILTER_TB is
    
    --****DUT****
    component MAVG_2N_FILTER
        generic(
            g_data_width    :   integer := 8;
            g_length_log    :   integer := 2
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            p_sample_valid  : in    std_logic;
            p_sample_data   : in    std_logic_vector(g_data_width-1 downto 0);
            p_avg_valid     : out   std_logic;
            p_avg_data      : out   std_logic_vector(g_data_width-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal p_sample_valid   :   std_logic := '0';
    signal p_sample_data    :   std_logic_vector(7 downto 0) := (others => '0');
    signal p_avg_valid      :   std_logic := '0';
    signal p_avg_data       :   std_logic_vector(7 downto 0) := (others => '0');
    

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : MAVG_2N_FILTER
    generic map(
        g_data_width    => 8,
        g_length_log    => 2
    )
    port map(
        clk             => clock,
        rst             => reset,
        p_sample_valid  => p_sample_valid,
        p_sample_data   => p_sample_data,
        p_avg_valid     => p_avg_valid,
        p_avg_data      => p_avg_data
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


        --**Teset reset state**
        wait for assert_hold;
        assert(p_avg_valid = '0')
            report "ID01: Test reset - expecting avg_valid = '0'" 
            severity error;
        assert(p_avg_data = (p_avg_data'range => '0'))
            report "ID02: Test reset - expecting avg_data = x00"
            severity error;
        wait for post_hold;


        --**Test operation**
        for i in 1 to 4 loop
            p_sample_data  <= std_logic_vector(to_unsigned(128,p_sample_data'length));
            p_sample_valid <= '1';
            wait for clk_period;
            p_sample_valid <= '0';

            wait for assert_hold;
            assert(p_avg_valid = '1')
                report "ID03: Test operation - expecting avg_valid = '1'" 
                severity error;
            assert(p_avg_data = std_logic_vector(to_unsigned(32*i,p_avg_data'length)))
                report "ID04: Test operation - expecting avg_data = 32*" & integer'image(i)
                severity error;
            wait for post_hold;
        end loop;


        wait for 5*clk_period;


        --**Test overflow**
        p_sample_data  <= (others => '1');
        p_sample_valid <= '1';

        wait for 5*clk_period;
        wait for assert_hold;
        assert(p_avg_valid = '1')
            report "ID05: Test overflow - expecting avg_valid = '1'" 
            severity error;
        assert(p_avg_data = (p_avg_data'range => '1'))
            report "ID06: Test overflow - expecting avg_data = xFF"
            severity error;
        wait for post_hold;

        
        --**End simulation**
		wait for 50 ns;
        report "MAVG_2N_FILTER_TB - testbench successful";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;
    
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;