-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		10/05/2023
-- Design Name:		PWM Signal Generator Testbench
-- Module Name:		PWM_SMODULE_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> PWM_SMODULE.vhd
--
-- Revisions:
-- Revision V0.01.04 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
--
-- Revision V4.00.00 - Module renaming and refactoring
-- Additional Comments: Renaming of module to follow V4.00.00 naming convetion
--                      (PWM_GENERATOR_UNIT_TB.vhd -> PWM_SMODULE_TB.vhd)
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
entity PWM_SMODULE_TB is
end entity PWM_SMODULE_TB;




--! Simulation architecture
architecture TB of PWM_SMODULE_TB is

    --****DUT****
    component PWM_SMODULE
        generic(
            g_address       :   integer := 1;
            g_sys_freq      :   natural := 100000000;
            g_pwm_freq      :   natural := 5000
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            p_pwm_output    : out   io_o 
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_frequency  :   integer := 50000000;
    constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal sys_bus_i        :   sbus_in  := gnd_sbus_i;
    signal sys_bus_o        :   sbus_out := gnd_sbus_o;
    signal p_pwm_output     :   io_o     := low_io_o;
    --Testbench
    constant pwm_delay      :   integer := clk_frequency/(255*25000);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : PWM_SMODULE
    generic map(
        g_address       => 1,
        g_sys_freq      => clk_frequency,
        g_pwm_freq      => 25000
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_pwm_output    => p_pwm_output
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
        variable assert_hold    :   time := 5*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial Setup**
        wait for init_hold;


        --**Test PWM = 0/x00**
        sys_bus_i <= writeBus(1,0);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 1 to 255 loop
            assert(p_pwm_output = ('1','0'))
                report "ID01: Test PWM=x00 - expecting dat = '0' [" & integer'image(i) & "]"
                severity error;
            wait for clk_period*pwm_delay;
        end loop;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test PWM = 255/xFF**
        sys_bus_i <= writeBus(1,255);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 1 to 255 loop
            assert(p_pwm_output = ('1','1'))
                report "ID02: Test PWM=xFF - expecting dat = '1' [" & integer'image(i) & "]"
                severity error;
            wait for clk_period*pwm_delay;
        end loop;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test PWM = 128/x80**
        sys_bus_i <= writeBus(1,128);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 1 to 255 loop
            if(i<=128) then
                assert(p_pwm_output = ('1','1'))
                    report "ID03: Test PWM=x80 - expecting dat = '1' [" & integer'image(i) & "]"
                    severity error;
            else
                assert(p_pwm_output = ('1','0'))
                    report "ID04: Test PWM=x80 - expecting dat = '0' [" & integer'image(i) & "]"
                    severity error;
            end if;
            wait for clk_period*pwm_delay;        
        end loop;
        wait for post_hold;


		--**End simulation**
		wait for 50 ns;
        report "PWM_SMODULE_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;