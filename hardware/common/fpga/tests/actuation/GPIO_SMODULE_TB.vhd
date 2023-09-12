-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		GPIO Driver Array Testbench
-- Module Name:		GPIO_SMODULE_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GPIO_SMODULE.vhd
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
--
-- Revision V4.00.00 - Module renaming and refactoring
-- Additional Comments: Module renamed to follow V4.00.00 naming convention.
--                      (GPIO_DRIVER_ARRAY_TB.vhd -> GPIO_SMODULE_TB.vhd)
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
--! Use custom libraries
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality simulation
entity GPIO_SMODULE_TB is
end entity GPIO_SMODULE_TB;




--! Simulation architecture
architecture TB of GPIO_SMODULE_TB is

    --****DUT****
    component GPIO_SMODULE
        generic(
            g_address       :   natural;
            g_gpio_number   :   natural
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            p_gpio_i_vector : in    io_i_vector(g_gpio_number-1 downto 0);
            p_gpio_o_vector : out   io_o_vector(g_gpio_number-1 downto 0)
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
    signal p_gpio_i_vector  :   io_i_vector(1 downto 0) := (others => gnd_io_i);
    signal p_gpio_o_vector  :   io_o_vector(1 downto 0) := (others => gnd_io_o);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : GPIO_SMODULE
    generic map(
        g_address       => 1,
        g_gpio_number   => 2 
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_gpio_i_vector => p_gpio_i_vector,
        p_gpio_o_vector => p_gpio_o_vector
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
		variable init_hold			:	time :=	5*clk_period/2;
		variable assert_hold		:	time := 3*clk_period/2;
		variable post_hold			:	time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test input mode**
        p_gpio_i_vector(0).dat <= '1';
        wait for clk_period;

        sys_bus_i <= readBus(1);
        wait for assert_hold;
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(1,SYSTEM_DATA_WIDTH)))
            report "ID01: Test input mode - expecting bus.dat = x01" severity error;
        assert(p_gpio_o_vector(0).enb = '0')
            report "ID02: Test input mode - expecting enb(0) = '0'" severity error;
        assert(p_gpio_o_vector(0).dat = '0')
            report "ID03: Test input mode - expecting dat(0) = '0'" severity error;
        wait for post_hold;

        sys_bus_i <= readBus(2);
        wait for assert_hold;
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH)))
            report "ID04: Test input mode - expecting bus.dat = x00" severity error;
        assert(p_gpio_o_vector(1).enb = '0')
            report "ID05: Test input mode - expecting enb(1) = '0'" severity error;
        assert(p_gpio_o_vector(1).dat = '0')
            report "ID06: Test input mode - expecting dat(1) = '0'" severity error;
        wait for post_hold;


        wait for 5*clk_period;
        
        
        --**Test output mode** 
        sys_bus_i <= writeBus(1,2);
        wait for clk_period;

        sys_bus_i <= readBus(1);
        wait for assert_hold;
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(2,SYSTEM_DATA_WIDTH)))
            report "ID07: Test output mode - expecting bus.dat = x00" severity error;
        assert(p_gpio_o_vector(0).enb = '1')
            report "ID08: Test output mode - expecting enb(0) = '1'" severity error;
        assert(p_gpio_o_vector(0).dat = '0')
            report "ID09: Test output mode - expecting dat(0) = '0'" severity error;
        wait for post_hold;

        sys_bus_i <= writeBus(2,3);
        wait for clk_period;

        sys_bus_i <= readBus(2);
        wait for assert_hold;
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(3,SYSTEM_DATA_WIDTH)))
            report "ID10: Test output mode - expecting bus.dat = x01" severity error;
        assert(p_gpio_o_vector(1).enb = '1')
            report "ID11: Test output mode - expecting enb(1) = '1'" severity error;
        assert(p_gpio_o_vector(1).dat = '1')
            report "ID12: Test output mode - expecting dat(1) = '1'" severity error;
        wait for post_hold;


		--**End simulation**
		wait for 50 ns;
        report "GPIO_SMODULE_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;