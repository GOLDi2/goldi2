-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		31/07/2023
-- Design Name:		Incremental encoder dsp testbench
-- Module Name:		INC_ENCODER_DSP_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:    -> ENCODER_DRIVER.vhd
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
entity ENCODER_DRIVER_TB is
end entity ENCODER_DRIVER_TB;




--! Simulation architecture
architecture TB of ENCODER_DRIVER_TB is

    --****DUT****
    component ENCODER_DRIVER
        generic(
            g_invert_dir    :   boolean := false
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            enb             : in    std_logic;
            p_channel_a     : in    std_logic;
            p_channel_b     : in    std_logic;
            p_enc_count     : out   std_logic_vector(15 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    -- DUT IOs
    signal enable           :   std_logic := '0';
    signal p_enc_count      :   std_logic_vector(15 downto 0) := (others => '0');
    signal p_channel_a      :   std_logic := '0';
    signal p_channel_b      :   std_logic := '0';


begin

    --****COMPONENTS****
    -----------------------------------------------------------------------------------------------
    DUT : ENCODER_DRIVER
    generic map(
        g_invert_dir    => false
    )
    port map(
        clk             => clock,
        rst             => reset,
        enb             => enable,
        p_enc_count     => p_enc_count,
        p_channel_a     => p_channel_a,
        p_channel_b     => p_channel_b
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
        --**Initial Setup**
        wait for init_hold;


        --**Test idle state**
        wait for assert_hold;
        assert(p_enc_count = (p_enc_count'range => '0'))
            report "ID01: Test reset - expecting enc_count = x00"
            severity error;
        wait for post_hold;


        --**Test disabled module**
        p_channel_a <= '0';
        p_channel_b <= '1';
        wait for clk_period;
        --Simulate impulses in CCW direction
        for i in 0 to 4 loop
            p_channel_a <= not p_channel_a;
            wait for 2*clk_period;
            p_channel_b <= not p_channel_b;
            wait for 2*clk_period;
            p_channel_a <= not p_channel_a;
            wait for 2*clk_period;
            p_channel_b <= not p_channel_b;
            wait for 2*clk_period;
        end loop; 

        wait for assert_hold;
        assert(p_enc_count = (p_enc_count'range => '0'))
            report "ID02: Test disabled - expecting enc_count = x00"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test signal processing**
        --Test positive movement
        p_channel_a <= '0';
        p_channel_b <= '1';
        enable      <= '1';
        wait for clk_period;
        --Simulate impulses in CCW direction
        for i in 0 to 4 loop
            p_channel_a <= not p_channel_a;
            wait for 2*clk_period;
            p_channel_b <= not p_channel_b;
            wait for 2*clk_period;
            p_channel_a <= not p_channel_a;
            wait for 2*clk_period;
            p_channel_b <= not p_channel_b;
            wait for 2*clk_period;
        end loop; 

        wait for assert_hold;
        assert(p_enc_count = x"000A")
            report "ID03: Test CCW operation - expecting enc_count = x0A"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --Test negative movement
        p_channel_a <= '0';
        p_channel_b <= '0';
        wait for clk_period;
        --Simulate impulses in CCW direction
        for i in 0 to 4 loop
            p_channel_a <= not p_channel_a;
            wait for 2*clk_period;
            p_channel_b <= not p_channel_b;
            wait for 2*clk_period;
            p_channel_a <= not p_channel_a;
            wait for 2*clk_period;
            p_channel_b <= not p_channel_b;
            wait for 2*clk_period;
        end loop; 

        wait for assert_hold;
        assert(p_enc_count = x"0000")
            report "ID04: Test CCW operation - expecting enc_count = x00"
            severity error;
        wait for post_hold;



        --**End simulation**
		wait for 50 ns;
        report "ENCODER_DRIVER_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;