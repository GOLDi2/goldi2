-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/06/2023
-- Design Name:		LED Driver Testbench
-- Module Name:		LED_SMODULE_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> LED_SMODULE.vhd
--
-- Revisions:
-- Revision V3.00.01 - File Created
-- Additional Comments: First commit
--
-- Revision V4.00.00 - Module renaming and refactoring
-- Additional Comments: Module renamed to follow V4.00.00 naming convention.
--                      (LED_DRIVE_TB.vhd -> LED_SMODULE_TB.vhd)
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
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality Simulation
entity LED_SMODULE_TB is
end entity LED_SMODULE_TB;




--! Simulation architecture
architecture TB of LED_SMODULE_TB is

    --****DUT****
    component LED_SMODULE
        generic(
            g_address       :   natural := 1;
            g_clk_frequency :   natural := 16;
            g_inverted      :   boolean := false
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in; 
            sys_bus_o       : out   sbus_out;
            p_led_output    : out   io_o
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
    signal p_led_output     :   io_o := low_io_o;


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : LED_SMODULE
    generic map(
        g_address       => 1,
        g_clk_frequency => 16,
        g_inverted      => false
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i, 
        sys_bus_o       => sys_bus_o,
        p_led_output    => p_led_output
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST***
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test reset values**
        wait for assert_hold;
        assert(p_led_output = ('1','0'))
            report "ID01: Test reset - expecting p_led_output = ('1','0')" severity error;
        wait for post_hold;


        --**Test LED on**
        sys_bus_i <= writeBus(1,128);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        assert(p_led_output = ('1','1'))
            report "ID02: Test LED on - expecting p_led_output = ('1','1')" severity error;
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
                assert(p_led_output = ('1','1'))
                    report "ID03: Test LED blink fast - expecting p_led_output = ('1','1')" 
                    severity error;
            else
                assert(p_led_output = ('1','0'))
                    report "ID04: Test LED blink fast - expecting p_led_output = ('1','0')"
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
                assert(p_led_output = ('1','1'))
                    report "ID05: Test LED blink slow - expecting p_led_output = ('1','1')"
                    severity error;
            else
                assert(p_led_output = ('1','0'))
                    report "ID06: Test LED blink slow - expecting p_led_output = ('1','0')"
                    severity error;
            end if;
            wait for clk_period;
        end loop;
        wait for clk_period/2;


		--**End simulation**
		wait for 50 ns;
        report "LED_SMODULE_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;