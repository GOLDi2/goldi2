-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		10/05/2023
-- Design Name:		Debounce module for input signals 
-- Module Name:		IO_DEBOUNCE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> IO_DEBOUNCE.vhd
--
-- Revisions:
-- Revision V3.00.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V3.00.01 - Default testbench
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
library std;
use std.standard.all;




--! Functionality simulation
entity IO_DEBOUNCE_TB is
end entity IO_DEBOUNCE_TB;




--! General architecture
architecture TB of IO_DEBOUNCE_TB is
  
    --****DUT****
    component IO_DEBOUNCE is
    generic(
        STAGES      :   natural := 4;
        CLK_FACTOR  :   natural := 12000
    );
    port(
        clk         : in    std_logic;
        rst         : in    std_logic;
        io_raw      : in    std_logic;
        io_stable   : out   std_logic
    );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period     :   time := 10 ns;
    signal reset            :   std_logic := '0';
    signal clock            :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    --DUT IOs
    signal io_raw           :   std_logic;
    signal io_stable        :   std_logic;


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : IO_DEBOUNCE
    generic map(
        STAGES      => 4,
        CLK_FACTOR  => 10
    )
    port map(
        clk         => clock,
        rst         => reset,
        io_raw      => io_raw,
        io_stable   => io_stable
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
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset data
        io_raw <= '0';
        wait for init_hold;


        --**Test reset contidions**
        wait for assert_hold;
        assert(io_stable = '0')
            report "line(111): Test reset - expecting io_stable = '0'" severity error;
        wait for post_hold;


        --**Test reaction to high input**
        io_raw <= '1';
        wait for assert_hold;
        assert(io_stable = '1')
            report "line(119): Test input high - expecting io_stable = '1'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test glitching reaction**
        for i in 0 to 3 loop
            io_raw <= not io_raw;
            wait for assert_hold;
            assert(io_stable = '1')
                report "line(131): Test glitching - expecting io_stable = '1'" severity error;
            wait for post_hold;
        end loop;
        io_raw <= '0';


        wait for 50*clk_period;


        --**Test hold input**
        io_raw <= '1';
        wait for clk_period;
        io_raw <= '0';
        wait for clk_period/2;
        for i in 1 to 40 loop
            assert(io_stable = '1')
                report "line(144): Test input hold - expecting io_stable = '1' [" & integer'image(i) & "]"
                severity error;
            wait for clk_period;
        end loop;

        assert(io_stable = '0')
            report "line(150): Test input hold - expecting io_stable = '0'" severity error;
        wait for post_hold;
        

        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end TB;