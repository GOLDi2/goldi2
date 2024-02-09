-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmai.com>
--
-- Create Date:		15/06/2023
-- Design Name:		IO Crossbar Structure testbench
-- Module Name:		IO_CROSSBAR_TB
-- Project Name:	GOLDIi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd;
--                  -> GOLDI_IO_STANDARD.vhd; 
--                  -> GOLDI_CROSSBAR_DEFAULT_TEMPLATE_MOCKUP.vhd
--                  -> IO_CORSSBAR.vhd
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
--
-- Revision V4.00.00 - Module refactoring to test modifications of V4.00.00
-- Additional Comments: Changes to the DUT entity and the generic signal names.
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
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_CROSSBAR_STANDARD.all;




--! Functionality Testbench
entity IO_CROSSBAR_TB is
end entity IO_CROSSBAR_TB;




--! Simulation architecture
architecture TB of IO_CROSSBAR_TB is

    --****DUT****
    component IO_CROSSBAR
        generic(
            g_left_port_length      :   natural;
            g_right_port_length     :   natural;
            g_default_left_layout   :   cb_left_port_ram;
            g_default_right_layout  :   cb_right_port_ram 
        );
        port(
            clk                 : in    std_logic;
            rst                 : in    std_logic;
            cb_bus_i            : in    sbus_in;
            cb_bus_o            : out   sbus_out;
            left_io_i_vector    : out   io_i_vector(g_left_port_length-1 downto 0);
            left_io_o_vector    : in    io_o_vector(g_left_port_length-1 downto 0);
            right_io_i_vector   : in    io_i_vector(g_right_port_length-1 downto 0); 
            right_io_o_vector   : out   io_o_vector(g_right_port_length-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		    :	time := 20 ns;
	signal reset			    :	std_logic := '0';
	signal clock			    :	std_logic := '0';
	signal run_sim			    :	std_logic := '1';
	--DUT IOs
    signal cb_bus_i             :   sbus_in  := gnd_sbus_i;
    signal cb_bus_o             :   sbus_out := gnd_sbus_o;
    signal left_io_i_vector     :   io_i_vector(5 downto 0) := (others => gnd_io_i);
    signal left_io_o_vector     :   io_o_vector(5 downto 0) := (others => gnd_io_o);
    signal right_io_i_vector    :   io_i_vector(2 downto 0) := (others => gnd_io_i);
    signal right_io_o_vector    :   io_o_vector(2 downto 0) := (others => gnd_io_o);
    

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : IO_CROSSBAR
    generic map(
        g_left_port_length      => TB_CB_LEFT_SIZE,  --6
        g_right_port_length     => TB_CB_RIGHT_SIZE, --3
        g_default_left_layout   => TB_DEFAULT_LEFT_CB_LAYOUT,
        g_default_right_layout  => TB_DEFAULT_RIGHT_CB_LAYOUT
    )
    port map(
        clk                     => clock,
        rst                     => reset,
        cb_bus_i                => cb_bus_i,
        cb_bus_o                => cb_bus_o,
        left_io_i_vector        => left_io_i_vector,
        left_io_o_vector        => left_io_o_vector,
        right_io_i_vector       => right_io_i_vector, 
        right_io_o_vector       => right_io_o_vector
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
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
		--Preset the right port pins
        right_io_i_vector(0).dat <= '0';
        right_io_i_vector(1).dat <= '1';
        right_io_i_vector(2).dat <= '1';
        --Preset left port pins
        left_io_o_vector(0) <= (enb => '0', dat => '0');
        left_io_o_vector(1) <= (enb => '0', dat => '1');
        left_io_o_vector(2) <= (enb => '1', dat => '1');
        left_io_o_vector(3) <= (enb => '1', dat => '1');
        left_io_o_vector(4) <= (enb => '1', dat => '0');
        left_io_o_vector(5) <= (enb => '0', dat => '0');
        --Wait for initial setup
        wait for init_hold;


        --**Test reset state**
        wait for init_hold;
        assert(left_io_i_vector(0).dat = '0') 
            report "ID01: Test reset - expecting left_i(0) = '0'" severity error;
        assert(left_io_i_vector(1).dat = '1')
            report "ID02: Test reset - expecting left_i(1) = '1'" severity error;
        assert(left_io_i_vector(2).dat = '1')
            report "ID03: Test reset - expecting left_i(2) = '1'" severity error; 
        assert(right_io_o_vector(0).enb = '0' and right_io_o_vector(0).dat = '0')
            report "ID04: Test reset - expecting right_o(0) = ('0','0')" severity error;
        assert(right_io_o_vector(1).enb = '0' and right_io_o_vector(1).dat = '1')
            report "ID05: Test reset - expecting right_o(1) = ('0','1')" severity error;
        assert(right_io_o_vector(2).enb = '1' and right_io_o_vector(2).dat = '1')
            report "ID06: Test reset - expecting right_o(2) = ('1','1')" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test read operation**
        cb_bus_i <= readBus(2);
        wait for assert_hold;
        assert(cb_bus_o.dat = x"00") 
            report "ID07: Test read operation - expecting bus_o.dat = x00" severity error;
        wait for post_hold;

        cb_bus_i <= readBus(3);
        wait for assert_hold;
        assert(cb_bus_o.dat = x"01")
            report "ID08: Test read operation - expecting bus_o.dat = x01" severity error;
        wait for post_hold;

        cb_bus_i <= readBus(4);
        wait for assert_hold;
        assert(cb_bus_o.dat = x"02")
            report "ID09: Test read operation - expecting bus_o.dat = x02" severity error;
        wait for post_hold;

        
        wait for 5*clk_period;


        --**Test write operation**
        cb_bus_i <= writeBus(2,3);
        wait for clk_period;
        cb_bus_i <= writeBus(3,4);
        wait for clk_period;
        cb_bus_i <= writeBus(4,5);

        wait for assert_hold;
        assert(right_io_o_vector(0).enb = '1' and right_io_o_vector(0).dat = '1')
            report "ID10: Test write operation - expecting right_o(0) = ('1','1')" severity error;
        assert(left_io_i_vector(3).dat = '0')
            report "ID11: Test write operation - expecting left_i(3) = '0'" severity error;
        assert(right_io_o_vector(1).enb = '1' and right_io_o_vector(1).dat = '0')
            report "ID12: Test write operation - expecting right_o(1) = ('1','0')" severity error;
        assert(left_io_i_vector(4).dat = '1')
            report "ID13: Test write operation - expecting left_i(4) = '1'" severity error;
        assert(right_io_o_vector(2).enb = '0' and right_io_o_vector(2).dat = '0')
            report "ID14: Test write operation - expecting right_o(2) = ('0','0')" severity error;
        assert(left_io_i_vector(5).dat = '1')
            report "ID15: Test write operation - expecting left_i(5) = '1'" severity error;
        wait for post_hold;


		--**End simulation**
		wait for 50 ns;
        report "IO_CROSSBAR_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end TB;