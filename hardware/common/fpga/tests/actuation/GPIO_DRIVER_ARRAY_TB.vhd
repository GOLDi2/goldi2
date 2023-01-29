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




--! @brief
--! @details
--!
entity GPIO_DRIVER_ARRAY_TB is
end entity GPIO_DRIVER_ARRAY_TB;



--! Functionality architecture
architecture TB of GPIO_DRIVER_ARRAY_TB is

    --CUT
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


    --Intermeidate signals
	--Simulation timing
	constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic;
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
    signal sys_bus_i        :   sbus_in;
    signal sys_bus_o        :   sbus_out;
    signal gpio_i_vector    :   io_i_vector(0 downto 0);
    signal gpio_o_vector    :   io_o_vector(0 downto 0);


begin

    DUT : GPIO_DRIVER_ARRAY
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        gpio_i_vector   => gpio_i_vector,
        gpio_o_vector   => gpio_o_vector
    );


    --Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 0 ns, '0' after 15 ns;


    TEST : process
        --Timing
		variable init_hold			:	time :=	5*clk_period/2;
		variable assert_hold		:	time := 3*clk_period/2;
		variable post_hold			:	time := clk_period/2;
    begin
        --Initial setup
        sys_bus_i.we  <= '0';
        sys_bus_i.adr <= (others => '0');
        sys_bus_i.dat <= (others => '0');
		gpio_i_vector <= (others => gnd_io_i);
        wait for init_hold;


        --Test reset values
        sys_bus_i.adr <= "0000001";
        wait for assert_hold;
        assert(sys_bus_o.dat = x"00")
            report "line(113): Test reset - expecting bus.dat = x00" severity error;
        assert(gpio_o_vector(0).enb = '0')
            report "line(115): Test reset - expecting enb = '0'" severity error;
        assert(gpio_o_vector(0).dat = '0')
            report "line(117): Test reset - expecting dat = '0'" severity error;
        wait for post_hold;


        wait for 5*clk_period;
        
        
        --Test functionality
        sys_bus_i.we <= '1';
        sys_bus_i.dat <= x"06";
        gpio_i_vector(0).dat <= '1';
        wait for assert_hold;
        assert(gpio_o_vector(0).enb = '1')
            report "line(130): Functionality test - expecting enb = '1'" severity error;
        assert(gpio_o_vector(0).dat = '1')
            report "line(132): Functionality test - expecting dat = '1'" severity error;
        wait for post_hold;

        sys_bus_i.we <= '0';
        wait for assert_hold;
        assert(sys_bus_o.dat = x"07")
            report "line(138): Functionality test - expecting bus.dat = x07" severity error;
        wait for post_hold;


        --End simulation
        wait for 10 ns;
        run_sim <= '0';
        wait;

    end process;


end architecture;