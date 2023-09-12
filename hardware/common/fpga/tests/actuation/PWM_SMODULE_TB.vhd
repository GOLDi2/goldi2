-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		10/05/2023
-- Design Name:		PWM Signal Generator testbench
-- Module Name:		PWM_GENERATOR_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> PWM_GENERATOR_UNIT.vhd
--
-- Revisions:
-- Revision V0.01.04 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
--! Use assert library for simulation
library std;
use std.standard.all;




--! Functionality Simulation
entity PWM_GENERATOR_UNIT_TB is
end entity PWM_GENERATOR_UNIT_TB;




--! Simulation architecture
architecture TB of PWM_GENERATOR_UNIT_TB is

    --****DUT****
    component PWM_GENERATOR_UNIT
        generic(
            ADDRESS         :   integer := 1;
            FRQ_SYSTEM      :   natural := 100000000;
            FRQ_PWM         :   natural := 5000
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            pwm_out         : out   io_o 
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
    signal pwm_out          :   io_o;
    --Testbench
    constant pwm_delay      :   integer := 100000000/(255*25000);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : PWM_GENERATOR_UNIT
    generic map(
        ADDRESS         => 1,
        FRQ_SYSTEM      => 100000000,
        FRQ_PWM         => 25000
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        pwm_out         => pwm_out
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
        variable assert_hold    :   time := 5*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset bus
        sys_bus_i <= gnd_sbus_i;
        wait for init_hold;


        --**Test PWM = 0/x00**
        sys_bus_i <= writeBus(1,0);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 1 to 255 loop
            assert(pwm_out = ('1','0'))
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
            assert(pwm_out = ('1','1'))
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
                assert(pwm_out = ('1','1'))
                    report "ID03: Test PWM=x80 - expecting dat = '1' [" & integer'image(i) & "]"
                    severity error;
            else
                assert(pwm_out = ('1','0'))
                    report "ID04: Test PWM=x80 - expecting dat = '0' [" & integer'image(i) & "]"
                    severity error;
            end if;
            wait for clk_period*pwm_delay;        
        end loop;
        wait for post_hold;


        --End Simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;