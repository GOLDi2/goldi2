-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		KED
--
-- Create Date:		16/09/2024
-- Design Name:		Clock divider testbench 
-- Module Name:		CLOCK_DIVIDER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COM
--
-- Revisions:
-- Revision V1.00.00 - File Created
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
--! Use custom packages
library work;


--! Functionality simulation
entity CLOCK_DIVIDER_TB is
end entity CLOCK_DIVIDER_TB;


--! Simulation architecture
architecture TB of CLOCK_DIVIDER_TB is

    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period	    :	time := 25 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:   std_logic := '1';
    --DUT IOs
    signal p_clk_enb_out_1      :   std_logic := '0';
    signal p_clk_enb_out_2      :   std_logic := '0';
    signal p_clk_enb_out_4      :   std_logic := '0';

begin


    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT_1 : entity work.Clock_Divider
    generic map(
        gDivideFactor   => 1
    )
    port map(
        clk             => clock,
        reset           => reset,
        clock_enb_out   => p_clk_enb_out_1
    );

    DUT_2 : entity work.Clock_Divider
    generic map(
        gDivideFactor   => 2
    )
    port map(
        clk             => clock,
        reset           => reset,
        clk_enb_out     => p_clk_enb_out_2
    );

    DUT_4 : entity work.Clock_Divider
    generic map(
        gDivideFactor   => 4
    )
    port map(
        clk             => clock,
        reset           => reset,
        clk_enb_out     => p_clk_enb_out_4
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
        variable init_hold  :   time := 5*clk_period/2;
    begin
        --**Initial Setup**
        wait for init_hold;

        wait for 5 ms;

        --**End simulation**
		wait for 50 ns;
        report "CLOCK_DIVIDER_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------

end architecture;