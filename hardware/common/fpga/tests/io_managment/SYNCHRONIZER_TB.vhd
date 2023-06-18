-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/06/2023
-- Design Name:		FF Chain Synchronizer testbench
-- Module Name:		SYNCHRONIZER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> SYNCHRONIZER.vhd
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




--! Functionality testbench
entity SYNCHRONIZER_TB is
end entity SYNCHRONIZER_TB;




--! Simulation architecture
architecture TB of SYNCHRONIZER_TB is

    --****DUT****
    component SYNCHRONIZER
        generic (
            STAGES 	: natural := 2
        );
        port (
            clk		: in	std_logic;
            rst		: in	std_logic;
            io_i	: in	std_logic;
            io_sync	: out 	std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period     :   time := 10 ns;
    signal reset            :   std_logic := '0';
    signal clock            :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    --DUT IOs
    signal io_i             :   std_logic;
    signal io_sync          :   std_logic;
    signal data_in          :   std_logic_vector(3 downto 0);
    signal data_out         :   std_logic_vector(3 downto 0);


begin


    --****COMPONENT****
	-----------------------------------------------------------------------------------------------
    DUT : SYNCHRONIZER
    generic map(
        STAGES      => 2
    )
    port map(
        clk         => clock,
        rst         => reset,
        io_i        => io_i,
        io_sync     => io_sync
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
        variable assert_hold    :   time := clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset data
        data_in  <= x"A";
        data_out <= (others => '0');
        io_i     <= '0';
        wait for init_hold;


        --**Test reset conditions**
        wait for assert_hold;
        assert(io_sync = '0')
            report "line(111): Test reset - expecting io_sync = '0'" severity error;
        wait for post_hold;


        --**Test operation**
        for i in 0 to 3 loop
            io_i <= data_in(i);
            wait for 3*clk_period;
            data_out(i) <= io_sync;
        end loop;

        wait for assert_hold;
        assert(data_in = data_out)
            report "line(127): Test operation - expecting data_in = data_out" severity error;
        wait for post_hold;


        --End simulation**
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end TB;