-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		GPIO Driver Array Testbench
-- Module Name:		GPIO_DRIVER_ARRAY_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GPIO_DRIVER_ARRAY.vhd
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
use std.standard.all;
--! Use custom libraries
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality simulation
entity GPIO_DRIVER_ARRAY_TB is
end entity GPIO_DRIVER_ARRAY_TB;




--! Simulation architecture
architecture TB of GPIO_DRIVER_ARRAY_TB is

    --****DUT****
    component GPIO_DRIVER_ARRAY
        generic(
            ADDRESS         :   natural := 1;
            GPIO_NUMBER     :   natural := 1
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            gpio_i_vector   : in    io_i_vector(GPIO_NUMBER-1 downto 0);
            gpio_o_vector   : out   io_o_vector(GPIO_NUMBER-1 downto 0)
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
    signal gpio_i_vector    :   io_i_vector(1 downto 0);
    signal gpio_o_vector    :   io_o_vector(1 downto 0);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : GPIO_DRIVER_ARRAY
    generic map(
        ADDRESS         => 1,
        GPIO_NUMBER     => 2 
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        gpio_i_vector   => gpio_i_vector,
        gpio_o_vector   => gpio_o_vector
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
		variable init_hold			:	time :=	5*clk_period/2;
		variable assert_hold		:	time := 3*clk_period/2;
		variable post_hold			:	time := clk_period/2;
    begin
        --**Initial setup**
        sys_bus_i     <= gnd_sbus_i;
		gpio_i_vector <= (others => gnd_io_i);
        wait for init_hold;


        --**Test input mode**
        gpio_i_vector(0).dat <= '1';
        wait for clk_period;

        sys_bus_i <= readBus(1);
        wait for assert_hold;
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(1,SYSTEM_DATA_WIDTH)))
            report "ID01: Test input mode - expecting bus.dat = x01" severity error;
        assert(gpio_o_vector(0).enb = '0')
            report "ID02: Test input mode - expecting enb(0) = '0'" severity error;
        assert(gpio_o_vector(0).dat = '0')
            report "ID03: Test input mode - expecting dat(0) = '0'" severity error;
        wait for post_hold;

        sys_bus_i <= readBus(2);
        wait for assert_hold;
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH)))
            report "ID04: Test input mode - expecting bus.dat = x00" severity error;
        assert(gpio_o_vector(1).enb = '0')
            report "ID05: Test input mode - expecting enb(1) = '0'" severity error;
        assert(gpio_o_vector(1).dat = '0')
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
        assert(gpio_o_vector(0).enb = '1')
            report "ID08: Test output mode - expecting enb(0) = '1'" severity error;
        assert(gpio_o_vector(0).dat = '0')
            report "ID09: Test output mode - expecting dat(0) = '0'" severity error;
        wait for post_hold;

        sys_bus_i <= writeBus(2,3);
        wait for clk_period;

        sys_bus_i <= readBus(2);
        wait for assert_hold;
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(3,SYSTEM_DATA_WIDTH)))
            report "ID10: Test output mode - expecting bus.dat = x01" severity error;
        assert(gpio_o_vector(1).enb = '1')
            report "ID11: Test output mode - expecting enb(1) = '1'" severity error;
        assert(gpio_o_vector(1).dat = '1')
            report "ID12: Test output mode - expecting dat(1) = '1'" severity error;
        wait for post_hold;


        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;