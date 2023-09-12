-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Electromagnet driver testbench
-- Module Name:		EMAGNET_SMODULE_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--                  -> EMAGNET_SMODULE.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V4.00.00 - Module renaming and refactoring
-- Additional Comments: Module renamed to follow V4.00.00 naming convention.
--                      (EMAGNET_DRIVER_TB.vhd -> EMAGNET_SMODULE_TB.vhd)
--						Changes to the DUT entity and the port signal names.
--						Use of env library to stop simulation.
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
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;





--! Functionality Testbench
entity EMAGNET_SMODULE_TB is
end entity EMAGNET_SMODULE_TB;




--! Simulation architecture
architecture TB of EMAGNET_SMODULE_TB is

    --****DUT****
    component EMAGNET_SMODULE
        generic(
            g_address   	:	natural := 1;
            g_magnet_tao	:	natural := 10;
            g_demag_time	:	natural := 5 	
        );
        port(
            clk			    : in	std_logic;
            rst			    : in	std_logic;
            sys_bus_i	    : in	sbus_in;
            sys_bus_o	    : out	sbus_out;
            p_em_enb	    : out	io_o;
            p_em_out_1	    : out	io_o;
            p_em_out_2	    : out	io_o
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
    signal sys_bus_i        :   sbus_in  := gnd_sbus_i;
    signal sys_bus_o        :   sbus_out := gnd_sbus_o;
    signal p_em_enb           :   io_o := low_io_o;
    signal p_em_out_1         :   io_o := low_io_o;
    signal p_em_out_2         :   io_o := low_io_o;


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : EMAGNET_SMODULE
    generic map(
        g_address       => 1,
        g_magnet_tao    => 10,
        g_demag_time    => 5
    )
    port map(
        clk			    => clock,
        rst			    => reset,
        sys_bus_i	    => sys_bus_i,
        sys_bus_o	    => sys_bus_o,
        p_em_enb	    => p_em_enb,
        p_em_out_1	    => p_em_out_1,
        p_em_out_2	    => p_em_out_2
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
        variable init_hold      :   time := 3*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test reset**
        wait for clk_period/2;
        assert(p_em_enb.dat = '0') 
            report "ID01: Reset test - expecting p_em_enb = '0'" severity error;
        assert(p_em_out_1.dat = '0')
            report "ID02: Reset test - expecting p_em_out_1 = '0'" severity error;
        assert(p_em_out_2.dat = '0')
            report "ID03: Reset test - expecting p_em_out_2 = '0'" severity error;
        
        wait for 10*clk_period;

        assert(p_em_enb.dat = '1')
            report "ID04: Reset test - expecting p_em_enb = '1'" severity error;
        assert(p_em_out_1.dat = '0')
            report "ID05: Reset test - expecting p_em_out_1 = '0'" severity error;
        assert(p_em_out_2.dat = '1')
            report "ID06: Reset test - expecting p_em_out_2 = '1'" severity error;

        wait for 5*clk_period;

        assert(p_em_enb.dat = '0') 
            report "ID07: Reset test - expecting p_em_enb = '0'" severity error;
        assert(p_em_out_1.dat = '0')
            report "ID08: Reset test - expecting p_em_out_1 = '0'" severity error;
        assert(p_em_out_2.dat = '0')
            report "ID09: Reset test - expecting p_em_out_2 = '0'" severity error;
        wait for clk_period/2;


        wait for 5*clk_period;


        --**Test magnet power on**
        sys_bus_i <= writeBus(1,1);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        assert(p_em_enb.dat = '1') 
            report "ID10: Power on test - expecting p_em_enb = '1'" severity error;
        assert(p_em_out_1.dat = '1')
            report "ID11: Power on test - expecting p_em_out_1 = '1'" severity error;
        assert(p_em_out_2.dat = '0')
            report "ID12: Power on test - expecting p_em_out_2 = '0'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test magnet power off**
        sys_bus_i <= writeBus(1,0);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        assert(p_em_enb.dat = '0') 
            report "ID13: Power off test - expecting p_em_enb = '0'" severity error;
        assert(p_em_out_1.dat = '0')
            report "ID14: Power off test - expecting p_em_out_1 = '0'" severity error;
        assert(p_em_out_2.dat = '0')
            report "ID15: Power off test - expecting p_em_out_2 = '0'" severity error;
        
        wait for 10*clk_period;

        assert(p_em_enb.dat = '1')
            report "ID16: Power off test - expecting p_em_enb = '1'" severity error;
        assert(p_em_out_1.dat = '0')
            report "ID17: Power off test - expecting p_em_out_1 = '0'" severity error;
        assert(p_em_out_2.dat = '1')
            report "ID18: Power off test - expecting p_em_out_2 = '1'" severity error;

        wait for 5*clk_period;

        assert(p_em_enb.dat = '0') 
            report "ID19: Power off test - expecting p_em_enb = '0'" severity error;
        assert(p_em_out_1.dat = '0')
            report "ID20: Power off test - expecting p_em_out_1 = '0'" severity error;
        assert(p_em_out_2.dat = '0')
            report "ID21: Power off test - expecting p_em_out_2 = '0'" severity error;
        wait for post_hold;


		--**End simulation**
		wait for 50 ns;
        report "EMAGNET_SMODULE_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;