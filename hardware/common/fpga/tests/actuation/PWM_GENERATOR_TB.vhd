-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		PWM Signal Generator testbench
-- Module Name:		PWM_GENERATOR_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> REGISTER_TABLE.vhd
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
--! Use custom library
library work;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
--! Use assert library for simulation
use std.standard.all;




--! Functionality Simulation
entity PWM_GENERATOR_TB is
end entity PWM_GENERATOR_TB;




--! Simulation architecture
architecture RTL of PWM_GENERATOR_TB is

    --Components
    component PWM_GENERATOR
        generic(
            ADDRESS         :   natural := 1;
            PWM_FREQUENCY   :   natural := 377
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            pwm_io          : out   io_o
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
    signal pwm_io           :   io_o;


begin

    DUT : PWM_GENERATOR
    generic map(
        ADDRESS         => 1,
        PWM_FREQUENCY   => 1
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        pwm_io          => pwm_io
    );


    --Timing
    clock <= run_sim and (not clock) after clk_period/2;
    reset <= '0' after 0 ns, '1' after 5 ns, '0' after 15 ns;


    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
		variable assert_hold	:	time := 7*clk_period/2;
		variable post_hold		:	time := clk_period/2;
	begin

        --Preset bus
        sys_bus_i <= gnd_sbus_i;
        wait for init_hold;


        --Test PWM = 0/x00
        sys_bus_i.adr <= "0000001";
        sys_bus_i.dat <= x"00";
        sys_bus_i.we  <= '1';
        wait for clk_period;
        sys_bus_i     <= gnd_sbus_i;
		
		wait for assert_hold;
        for i in 1 to 255 loop
            assert(pwm_io.enb = '1') 
                report "line(118): Test PWM x00 - expecting enb = '1'" severity error;
            assert(pwm_io.dat = '0')
                report "line(120): Test PWM x00 - expecting dat = '0' [" & integer'image(i) & "]"
                severity error;
            wait for clk_period;			
        end loop;
		wait for post_hold;


        wait for 50 ns;


        --Test PWM = 127/x7F
        sys_bus_i.adr <= "0000001";
        sys_bus_i.dat <= x"7F";
        sys_bus_i.we  <= '1';
        wait for clk_period;
        sys_bus_i     <= gnd_sbus_i;

		wait for assert_hold;
        for i in 1 to 255 loop
            if(i<=127) then
                assert(pwm_io.enb = '1') 
                    report "line(140): Test PWM x7F - expecting enb = '1'" severity error;
                assert(pwm_io.dat = '1')
                    report "line(142): Test PWM x7F - expecting dat = '1' [" & integer'image(i) & "]"
                    severity error;
            else
                assert(pwm_io.enb = '1') 
                    report "line(146): Test PWM x7F - expecting enb = '1'" severity error;
                assert(pwm_io.dat = '0')
                    report "line(148): Test PWM x7F - expecting dat = '0' [" & integer'image(i) & "]"
                    severity error;
            end if;
            wait for clk_period;
        end loop;
		wait for post_hold;


        wait for 50 ns;


        --Test PWM = 255/xFF
        sys_bus_i.adr <= "0000001";
        sys_bus_i.dat <= x"FF";
        sys_bus_i.we  <= '1';
        wait for clk_period;
        sys_bus_i     <= gnd_sbus_i;
        
		wait for assert_hold;
        for i in 1 to 255 loop
            assert(pwm_io.enb = '1') 
                report "line(168): Test PWM xFF - expecting enb = '1'" severity error;
            assert(pwm_io.dat = '1')
                report "line(170): Test PWM xFF - expecting dat = '1' [" & integer'image(i) & "]"
                severity error;
            wait for clk_period;
        end loop;
		wait for post_hold;
        
        
        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;

end RTL;