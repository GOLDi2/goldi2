-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
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

    --CUT
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


    --Intermediate Signals
    --Simulation timing
    constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic;
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
    signal sys_bus_i        :   sbus_in;
    signal sys_bus_o        :   sbus_out;
    signal em_enb           :   io_o;
    signal em_out_1         :   io_o;
    signal em_out_2         :   io_o;


begin

    DUT : EMAGNET_DRIVER
    port map(
        clk			=> clock,
        rst			=> reset,
        sys_bus_i	=> sys_bus_i,
        sys_bus_o	=> sys_bus_o,
        em_enb	    => em_enb,
        em_out_1	=> em_out_1,
        em_out_2	=> em_out_2
    );


    --Timing
	clock <= run_sim and (not clock) after clk_period/2;


    TEST : process
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Initial setup
        sys_bus_i.we  <= '0';
        sys_bus_i.adr <= "0000000";
        sys_bus_i.dat <= x"00";
        wait for init_hold;


        --Test reset
        reset <= '1';
        wait for clk_period;
        reset <= '0';

        wait for assert_hold;
        assert(em_enb.dat = '0') 
            report "line(113): Reset test - expecting em_enb.dat = '0'" severity error;
        assert(em_out_1.dat = '0')
            report "line(115): Reset test - expecting em_out_1.dat = '0'" severity error;
        assert(em_out_2.dat = '0')
            report "line(117): Reset test - expecting em_out_2.dat = '0'" severity error;
        
        wait for 10*clk_period;
        assert(em_enb.dat = '1')
            report "line(121): Reset test - expecting em_enb.dat = '1'" severity error;
        assert(em_out_1.dat = '0')
            report "line(123): Reset test - expecting em_out_1.dat = '0'" severity error;
        assert(em_out_2.dat = '1')
            report "line(125): Reset test - expecting em_out_2.dat = '1'" severity error;

        wait for 5*clk_period;
        assert(em_enb.dat = '0') 
            report "line(129): Reset test - expecting em_enb.dat = '0'" severity error;
        assert(em_out_1.dat = '0')
            report "line(131): Reset test - expecting em_out_1.dat = '0'" severity error;
        assert(em_out_2.dat = '0')
            report "line(133): Reset test - expecting em_out_2.dat = '0'" severity error;
        wait for post_hold;



        --Test magnet power on
        sys_bus_i.we <= '1';
        sys_bus_i.adr <= "0000001";
        sys_bus_i.dat <= x"01";
        wait for clk_period;
        sys_bus_i.we <= '0';


        wait for assert_hold;
        assert(em_enb.dat = '1') 
            report "line(148): Power on test - expecting em_enb.dat = '1'" severity error;
        assert(em_out_1.dat = '1')
            report "line(150): Power on test - expecting em_out_1.dat = '1'" severity error;
        assert(em_out_2.dat = '0')
            report "line(152): Power on test - expecting em_out_2.dat = '0'" severity error;
        wait for post_hold;



        --Test magnet power off
        sys_bus_i.we  <= '1';
        sys_bus_i.dat <= x"00";
        wait for clk_period;
        sys_bus_i.we  <= '0';

        wait for assert_hold;
        assert(em_enb.dat = '0') 
            report "line(165): Power off test - expecting em_enb.dat = '0'" severity error;
        assert(em_out_1.dat = '0')
            report "line(167): Power off test - expecting em_out_1.dat = '0'" severity error;
        assert(em_out_2.dat = '0')
            report "line(169): Power off test - expecting em_out_2.dat = '0'" severity error;
        
        wait for 10*clk_period;
        assert(em_enb.dat = '1')
            report "line(173): Power off test - expecting em_enb.dat = '1'" severity error;
        assert(em_out_1.dat = '0')
            report "line(175): Power off test - expecting em_out_1.dat = '0'" severity error;
        assert(em_out_2.dat = '1')
            report "line(177): Power off test - expecting em_out_2.dat = '1'" severity error;

        wait for 5*clk_period;
        assert(em_enb.dat = '0') 
            report "line(181): Power off test - expecting em_enb.dat = '0'" severity error;
        assert(em_out_1.dat = '0')
            report "line(183): Power off test - expecting em_out_1.dat = '0'" severity error;
        assert(em_out_2.dat = '0')
            report "line(185): Power off test - expecting em_out_2.dat = '0'" severity error;
        wait for post_hold;



        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;

end TB;