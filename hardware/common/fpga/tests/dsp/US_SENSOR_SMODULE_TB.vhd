-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:	    10/08/2023
-- Design Name:		Ultrasonic Sensor Processing Unit Testbench
-- Module Name:		US_SENSOR_SMODULE_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> US_SENSOR_SMODULE.vhd
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
use std.env.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality simulation
entity US_SENSOR_SMODULE_TB is
end entity US_SENSOR_SMODULE_TB;




--! Simulation architecture
architecture TB of US_SENSOR_SMODULE_TB is

    --****DUT****
    component US_SENSOR_SMODULE
        generic(
            g_address       :   integer := 1;
            g_clk_frequency :   integer := 48000000
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            p_us_trigger    : out   io_o;
            p_us_echo       : in    io_i
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
    signal p_us_trigger     :   io_o := gnd_io_o;
    signal p_us_echo        :   io_i := gnd_io_i;
    --Testbench
    --Time calculated using sound speed = 340 m/s 
    constant t_echo_2cm     :   integer := 5900; 
    constant t_echo_2m      :   integer := 588200;
    constant t_echo_4m      :   integer := 1176450;        
    signal test_case        :   integer := 0;
    
    signal reg_buffer       :   std_logic_vector(2*SYSTEM_DATA_WIDTH-1 downto 0) := (others => '0');
        alias reg_1         :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0)
            is reg_buffer(SYSTEM_DATA_WIDTH-1 downto 0);
        alias reg_2         :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0)
            is reg_buffer(reg_buffer'high downto SYSTEM_DATA_WIDTH);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : US_SENSOR_SMODULE
        generic map(
            g_address       => 1,
            g_clk_frequency => 50000000
        )
        port map(
            clk             => clock,
            rst             => reset,
            sys_bus_i       => sys_bus_i,
            sys_bus_o       => sys_bus_o,
            p_us_trigger    => p_us_trigger,
            p_us_echo       => p_us_echo
        );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    SENSOR_EMULATOR : process(clock)
        variable counter        :   integer := 0;
        variable old_trigger    :   std_logic := '0';
        variable valid_trigger  :   std_logic := '0';
    begin
        if(rising_edge(clock)) then
            if(old_trigger = '1' and p_us_trigger.dat = '0') then
                valid_trigger := '1';
            elsif(old_trigger = '0' and p_us_trigger.dat = '1') then
                valid_trigger := '0';
            end if;


            if(valid_trigger = '1') then
                counter := counter + 1;
            else
                counter := 0;
            end if;


            case test_case is
            when 1 =>
                if(valid_trigger = '1' and counter < t_echo_2cm) then
                    p_us_echo.dat <= '1';
                else
                    p_us_echo.dat <= '0';
                end if;

            when 2 =>
                if(valid_trigger = '1' and counter < t_echo_2m) then
                    p_us_echo.dat <= '1';
                else
                    p_us_echo.dat <= '0';
                end if;
            
            when 3 =>
                if(valid_trigger = '1' and counter < t_echo_4m) then
                    p_us_echo.dat <= '1';
                else
                    p_us_echo.dat <= '0';
                end if;

            when others => null;
            end case;

            old_trigger := p_us_trigger.dat;
        end if;
    end process;
    

    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test reset conditions**
        assert(p_us_trigger = low_io_o)
            report "ID01: Test reset - expecting ps_us_trigger = '0'"
            severity error;
        
        sys_bus_i <= readBus(1);
        wait for assert_hold;
        assert(sys_bus_o.dat = (sys_bus_o.dat'range => '0'))
            report "ID02: Test reset - expecting reg[1] = x00"
            severity error;
        wait for post_hold;

        sys_bus_i <= readBus(2);
        wait for assert_hold;
        assert(sys_bus_o.dat = (sys_bus_o.dat'range => '0'))
            report "ID03: Test reset - expecting reg[2] = x00"
            severity error;       
        wait for post_hold;


        wait for 5*clk_period;


        --**Test minimum distance meassured**
        --Expecting distance = 20mm
        test_case <= 1;
        wait for 300 ms;
        
        sys_bus_i <= readBus(1);
        wait for assert_hold;
        reg_1 <= sys_bus_o.dat;
        wait for post_hold;

        sys_bus_i <= readBus(2);
        wait for assert_hold;
        reg_2 <= sys_bus_o.dat;
        wait for post_hold;

        assert(reg_buffer = std_logic_vector(to_unsigned(118,reg_buffer'length)))
            report "ID04: Test minimum range - expecting meassured distance = x14 (20mm)"
            severity error;

            

        wait for 5*clk_period;



        --**Test medium distance range**
        --Expecting distance = 2000mm
        test_case <= 2;
        wait for 300 ms;
        
        sys_bus_i <= readBus(1);
        wait for assert_hold;
        reg_1 <= sys_bus_o.dat;
        wait for post_hold;

        sys_bus_i <= readBus(2);
        wait for assert_hold;
        reg_2 <= sys_bus_o.dat;
        wait for post_hold;

        assert(reg_buffer = std_logic_vector(to_unsigned(23529,reg_buffer'length)))
            report "ID05: Test medium range - expecting meassured distance = x7D0 (2000mm)"
            severity error;

            

        wait for 5*clk_period;



        --**Test maximum sensor range**
        --Expecting distance = 4000mm
        test_case <= 3;
        wait for 300 ms;
        
        sys_bus_i <= readBus(1);
        wait for assert_hold;
        reg_1 <= sys_bus_o.dat;
        wait for post_hold;

        sys_bus_i <= readBus(2);
        wait for assert_hold;
        reg_2 <= sys_bus_o.dat;
        wait for post_hold;

        assert(reg_buffer = std_logic_vector(to_unsigned(4000,reg_buffer'length)))
            report "ID06: Test medium range - expecting meassured distance = xFA0 (4000mm)"
            severity error;


        --End simulation
		wait for 50 ns;
        report "US_SENSOR_SMODULE_TB - testbench successful";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;
    
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;