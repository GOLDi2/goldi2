-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Electromagnet driver testbench
-- Module Name:		EMAGNET_DRIVER_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> EMAGNET_DRIVER.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom library
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
--! Use assert library for simulation
use std.standard.all;




--! Functionality Testbench
entity EMAGNET_DRIVER_TB is
end entity EMAGNET_DRIVER_TB;




--! Simulation architecture
architecture TB of EMAGNET_DRIVER_TB is

    --****DUT****
    component EMAGNET_DRIVER
        generic(
            ADDRESS		:	natural := 1;
            MAGNET_TAO	:	natural := 10;
            DEMAG_TIME	:	natural := 5 	
        );
        port(
            clk			: in	std_logic;
            rst			: in	std_logic;
            sys_bus_i	: in	sbus_in;
            sys_bus_o	: out	sbus_out;
            em_enb		: out	io_o;
            em_out_1	: out	io_o;
            em_out_2	: out	io_o
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
    signal sys_bus_i        :   sbus_in;
    signal sys_bus_o        :   sbus_out;
    signal em_enb           :   io_o;
    signal em_out_1         :   io_o;
    signal em_out_2         :   io_o;


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : EMAGNET_DRIVER
    generic map(
        ADDRESS     => 1,
        MAGNET_TAO  => 10,
        DEMAG_TIME  => 5
    )
    port map(
        clk			=> clock,
        rst			=> reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o,
        em_enb	    => em_enb,
        em_out_1	=> em_out_1,
        em_out_2	=> em_out_2
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
        variable init_hold      :   time := 3*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset bus
        sys_bus_i <= gnd_sbus_i;
        wait for init_hold;


        --**Test reset**
        wait for clk_period/2;
        assert(em_enb.dat = '0') 
            report "ID01: Reset test - expecting em_enb = '0'" severity error;
        assert(em_out_1.dat = '0')
            report "ID02: Reset test - expecting em_out_1 = '0'" severity error;
        assert(em_out_2.dat = '0')
            report "ID03: Reset test - expecting em_out_2 = '0'" severity error;
        
        wait for 10*clk_period;

        assert(em_enb.dat = '1')
            report "ID04: Reset test - expecting em_enb = '1'" severity error;
        assert(em_out_1.dat = '0')
            report "ID05: Reset test - expecting em_out_1 = '0'" severity error;
        assert(em_out_2.dat = '1')
            report "ID06: Reset test - expecting em_out_2 = '1'" severity error;

        wait for 5*clk_period;

        assert(em_enb.dat = '0') 
            report "ID07: Reset test - expecting em_enb = '0'" severity error;
        assert(em_out_1.dat = '0')
            report "ID08: Reset test - expecting em_out_1 = '0'" severity error;
        assert(em_out_2.dat = '0')
            report "ID09: Reset test - expecting em_out_2 = '0'" severity error;
        wait for clk_period/2;


        wait for 5*clk_period;


        --**Test magnet power on**
        sys_bus_i <= writeBus(1,1);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        assert(em_enb.dat = '1') 
            report "ID10: Power on test - expecting em_enb = '1'" severity error;
        assert(em_out_1.dat = '1')
            report "ID11: Power on test - expecting em_out_1 = '1'" severity error;
        assert(em_out_2.dat = '0')
            report "ID12: Power on test - expecting em_out_2 = '0'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test magnet power off**
        sys_bus_i <= writeBus(1,0);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        assert(em_enb.dat = '0') 
            report "ID13: Power off test - expecting em_enb = '0'" severity error;
        assert(em_out_1.dat = '0')
            report "ID14: Power off test - expecting em_out_1 = '0'" severity error;
        assert(em_out_2.dat = '0')
            report "ID15: Power off test - expecting em_out_2 = '0'" severity error;
        
        wait for 10*clk_period;

        assert(em_enb.dat = '1')
            report "ID16: Power off test - expecting em_enb = '1'" severity error;
        assert(em_out_1.dat = '0')
            report "ID17: Power off test - expecting em_out_1 = '0'" severity error;
        assert(em_out_2.dat = '1')
            report "ID18: Power off test - expecting em_out_2 = '1'" severity error;

        wait for 5*clk_period;

        assert(em_enb.dat = '0') 
            report "ID19: Power off test - expecting em_enb = '0'" severity error;
        assert(em_out_1.dat = '0')
            report "ID20: Power off test - expecting em_out_1 = '0'" severity error;
        assert(em_out_2.dat = '0')
            report "ID21: Power off test - expecting em_out_2 = '0'" severity error;
        wait for post_hold;


        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end TB;