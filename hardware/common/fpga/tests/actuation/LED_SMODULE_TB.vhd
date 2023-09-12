-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/06/2023
-- Design Name:		LED Driver Testbench
-- Module Name:		LED_DRIVER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> LED_DRIVER.vhd
--
-- Revisions:
-- Revision V3.00.01 - File Created
-- Additional Comments: First commit
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
library std;
use std.standard.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality Simulation
entity LED_DRIVER_TB is
end entity LED_DRIVER_TB;




--! Simulation architecture
architecture TB of LED_DRIVER_TB is

    --****DUT****
    component LED_DRIVER
        generic(
            ADDRESS         :   natural := 1;
            CLK_FREQUENCY   :   natural := 16;
            INVERTED        :   boolean := false
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in; 
            sys_bus_o       : out   sbus_out;
            led_output      : out   io_o
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
    signal sys_bus_i        :   sbus_in;
    signal sys_bus_o        :   sbus_out;
    signal led_output       :   io_o;


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : LED_DRIVER
    generic map(
        ADDRESS         => 1,
        CLK_FREQUENCY   => 16,
        INVERTED        => false
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i, 
        sys_bus_o       => sys_bus_o,
        led_output      => led_output
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 5 ns, '0' after 15 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST***
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset bus
        sys_bus_i <= gnd_sbus_i;
        wait for init_hold;


        --**Test reset values**
        wait for assert_hold;
        assert(led_output = ('1','0'))
            report "ID01: Test reset - expecting led_output = ('1','0')" severity error;
        wait for post_hold;


        --**Test LED on**
        sys_bus_i <= writeBus(1,128);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        assert(led_output = ('1','1'))
            report "ID02: Test LED on - expecting led_output = ('1','1')" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test LED Blinking Fast**
        --Fastest blinking rate 8*clk_period
        sys_bus_i <= writeBus(1,192);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for clk_period/2;
        for i in 1 to 8 loop
            if(i<5) then
                assert(led_output = ('1','1'))
                    report "ID03: Test LED blink fast - expecting led_output = ('1','1')" 
                    severity error;
            else
                assert(led_output = ('1','0'))
                    report "ID04: Test LED blink fast - expecting led_output = ('1','0')"
                    severity error;
            end if;
            wait for clk_period;
        end loop;
        wait for clk_period/2;


        wait for 6*clk_period;


        --**Test LED Blinking Slow**
        --Normal blinking rate tested
        sys_bus_i <= writeBus(1,219);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for clk_period/2;
        for i in 1 to 32 loop
            if(i<17) then
                assert(led_output = ('1','1'))
                    report "ID05: Test LED blink slow - expecting led_output = ('1','1')"
                    severity error;
            else
                assert(led_output = ('1','0'))
                    report "ID06: Test LED blink slow - expecting led_output = ('1','0')"
                    severity error;
            end if;
            wait for clk_period;
        end loop;
        wait for clk_period/2;


        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;