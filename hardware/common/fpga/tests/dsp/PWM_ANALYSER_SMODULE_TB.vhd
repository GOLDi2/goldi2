-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/09/2023
-- Design Name:		PWM Signal Analyser Testbench 
-- Module Name:		PWM_ANALYSER_SMODULE_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> PWM_ANALYSER_SMODULE.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation control and assertions
library std;
use std.standard.all;
-- use std.env.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality simulation
entity PWM_ANALYSER_SMODULE_TB is
end entity PWM_ANALYSER_SMODULE_TB;




--! Simulation architecture
architecture TB of PWM_ANALYSER_SMODULE_TB is

    --****DUT****
    component PWM_ANALYSER_SMODULE
        generic(
            g_address           :   integer;
            g_sampling_period   :   integer
        );
        port(
            clk                 : in    std_logic;
            rst                 : in    std_logic;
            sys_bus_i           : in    sbus_in;
            sys_bus_o           : out   sbus_out;
            p_pwm_signal        : in    io_i
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
    signal p_pwm_signal     :   io_i     := gnd_io_i;
    --Testbench
    constant c_frq_520      :   integer := 96154;
    signal pwm_hd_520       :   std_logic := '0';
    signal data_buffer      :   std_logic_vector(15 downto 0) := (others => '0');
	signal input_signal		:	 std_logic_vector(2 downto 0) := (others => '0');
	signal input_selection	:	integer := 0;

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : PWM_ANALYSER_SMODULE
    generic map(
        g_address           => 1,
        g_sampling_period   => 100
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o,
        p_pwm_signal        => p_pwm_signal
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    HALF_DUTY_CYCLE_GENERATOR : process(clock)
        variable counter :  integer := 0;
    begin
        if(rising_edge(clock)) then
            if(counter = c_frq_520-1) then
                counter := 0;
            else
                counter := counter + 1;
            end if;

            if(counter < c_frq_520/2) then
                pwm_hd_520 <= '1';
            else
                pwm_hd_520 <= '0';
            end if;
        end if;
    end process;

	input_signal(0) <= pwm_hd_520;
	input_signal(1) <= '1';
	input_signal(2) <= '0';
	p_pwm_signal.dat <= input_signal(input_selection);
	
	

    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test reset state**
        sys_bus_i <= readBus(1);
        wait for assert_hold;
        assert(sys_bus_o.dat = (sys_bus_o.dat'range => '0'))
            report "ID01: Test reset - expecting reg(1) = x00"
            severity error;
        wait for post_hold;

        sys_bus_i <= readBus(2);
        wait for assert_hold;
        assert(sys_bus_o.dat = (sys_bus_o.dat'range => '0'))
            report "ID02: Test reset - expecting reg(2) = x00"
            severity error;
        wait for post_hold;

        sys_bus_i <= readBus(3);
        wait for assert_hold;
        assert(sys_bus_o.dat = (sys_bus_o.dat'range => '0'))
            report "ID03: Test reset - expecting reg(3) = x00"
            severity error;
        wait for post_hold;

        sys_bus_i <= readBus(4);
        wait for assert_hold;
        assert(sys_bus_o.dat = (sys_bus_o.dat'range => '0'))
            report "ID04: Test reset - expecting reg(4) = x00"
            severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;


        wait for 5*clk_period;


        --**Test half-duty cycle**
		input_selection <= 0;
        wait for 20 ms;

        sys_bus_i <= readBus(1);
        wait for 2*clk_period;
        data_buffer(7 downto 0)  <= sys_bus_o.dat;
        sys_bus_i <= readBus(2);
		wait for 2*clk_period;
        data_buffer(15 downto 8) <= sys_bus_o.dat;

        wait for assert_hold;
        assert(to_integer(unsigned(data_buffer)) = 480)
            report "ID05: Test 520 hz half duty signal - expecting neg_counter = 480"
            severity error;
        wait for post_hold;

        sys_bus_i <= readBus(3);
        wait for 2*clk_period;
        data_buffer(7 downto 0)  <= sys_bus_o.dat;
        sys_bus_i <= readBus(4);
		wait for 2*clk_period;
        data_buffer(15 downto 8) <= sys_bus_o.dat;

        wait for assert_hold;
        assert(to_integer(unsigned(data_buffer)) = 481)
            report "ID06: Test 520 hz half duty signal - expecting pos_counter = 481"
            severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;


        wait for 5*clk_period;


        --**Test high signal**
        input_selection <= 1;
        wait for 20 ms;

        sys_bus_i <= readBus(1);
        wait for 2*clk_period;
        data_buffer(7 downto 0)  <= sys_bus_o.dat;
        sys_bus_i <= readBus(2);
		wait for 2*clk_period;
        data_buffer(15 downto 8) <= sys_bus_o.dat;

        wait for assert_hold;
        assert(to_integer(unsigned(data_buffer)) = 0)
            report "ID07: Test 520 hs high signal - expecting neg_counter = 0"
            severity error;
        wait for post_hold;

        sys_bus_i <= readBus(3);
        wait for 2*clk_period;
        data_buffer(7 downto 0)  <= sys_bus_o.dat;
        sys_bus_i <= readBus(4);
		wait for 2*clk_period;
        data_buffer(15 downto 8) <= sys_bus_o.dat;

        wait for assert_hold;
        assert(to_integer(unsigned(data_buffer)) = 962)
            report "ID08: Test 520 hs high signal - expecting neg_counter = 962"
            severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;



        wait for 5*clk_period;


        --**Test low signal**
		input_selection <= 2;
        wait for 20 ms;

        sys_bus_i <= readBus(1);
        wait for 2*clk_period;
        data_buffer(7 downto 0)  <= sys_bus_o.dat;
        sys_bus_i <= readBus(2);
		wait for 2*clk_period;
        data_buffer(15 downto 8) <= sys_bus_o.dat;

        wait for assert_hold;
        assert(to_integer(unsigned(data_buffer)) = 962)
            report "ID09: Test 520 hs low signal - expecting neg_counter = 962"
            severity error;
        wait for post_hold;

        sys_bus_i <= readBus(3);
        wait for 2*clk_period;
        data_buffer(7 downto 0)  <= sys_bus_o.dat;
        sys_bus_i <= readBus(4);
		wait for 2*clk_period;
        data_buffer(15 downto 8) <= sys_bus_o.dat;

        wait for assert_hold;
        assert(to_integer(unsigned(data_buffer)) = 0)
            report "ID08: Test 520 hs low signal - expecting neg_counter = 0"
            severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;
    


        --**End simulation**
		wait for 50 ns;
        report "PWM_ANALYSER_SMODULE_TB - testbench successful";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        -- std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        run_sim <= '0';
        wait;
    
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;
