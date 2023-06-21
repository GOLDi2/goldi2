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
--                  -> GOLDI_CROSSBAR_STANDARD.vhd
--                  -> IO_CORSSBAR.vhd
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
library std;
use std.standard.all;
--! Use custom libraries
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_CROSSBAR_DEFAULT.all;




--! Functionality Testbench
entity IO_CROSSBAR_TB is
end entity IO_CROSSBAR_TB;




--! Simulation architecture
architecture TB of IO_CROSSBAR_TB is

    --****DUT****
    component IO_CROSSBAR
        generic(
            LEFT_PORT_LENGTH    :   natural := 6;
            RIGHT_PORT_LENGTH   :   natural := 3;
            LAYOUT_BLOCKED      :   boolean := false;
            DEFAULT_CB_LAYOUT   :   cb_right_port_ram := DEFAULT_CROSSBAR_LAYOUT 
        );
        port(
            clk                 : in    std_logic;
            rst                 : in    std_logic;
            cb_bus_i            : in    sbus_in;
            cb_bus_o            : out   sbus_out;
            left_io_i_vector    : out   io_i_vector(LEFT_PORT_LENGTH-1 downto 0);
            left_io_o_vector    : in    io_o_vector(LEFT_PORT_LENGTH-1 downto 0);
            right_io_i_vector   : in    io_i_vector(RIGHT_PORT_LENGTH-1 downto 0); 
            right_io_o_vector   : out   io_o_vector(RIGHT_PORT_LENGTH-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		    :	time := 10 ns;
	signal reset			    :	std_logic := '0';
	signal clock			    :	std_logic := '0';
	signal run_sim			    :	std_logic := '1';
	--DUT IOs
    signal cb_bus_i             :   sbus_in;
    signal cb_bus_o             :   sbus_out;
    signal left_io_i_vector     :   io_i_vector(5 downto 0);
    signal left_io_o_vector     :   io_o_vector(5 downto 0);
    signal right_io_i_vector    :   io_i_vector(2 downto 0);
    signal right_io_o_vector    :   io_o_vector(2 downto 0);
    

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => 6,
        RIGHT_PORT_LENGTH   => 3,
        LAYOUT_BLOCKED      => false,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT 
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        cb_bus_i            => cb_bus_i,
        cb_bus_o            => cb_bus_o,
        left_io_i_vector    => left_io_i_vector,
        left_io_o_vector    => left_io_o_vector,
        right_io_i_vector   => right_io_i_vector, 
        right_io_o_vector   => right_io_o_vector
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
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        
		--Preset master interface of bus
        cb_bus_i <= gnd_sbus_i;
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


        --**Test read operation**
        wait for 50 ns;
        cb_bus_i <= readBus(2);
        wait for assert_hold;
        assert(cb_bus_o.dat = x"00") 
            report "ID07: Test read operation - expecting bus_o.dat = x00" severity error;
        assert(cb_bus_o.val = '1')
            report "ID08: Test read operation - expecting bus_o.val = '1'" severity error;
        wait for post_hold;
        
        cb_bus_i <= readBus(3);
        wait for assert_hold;
        assert(cb_bus_o.dat = x"01")
            report "ID09: Test read operation - expecting bus_o.dat = x01" severity error;
        assert(cb_bus_o.val = '1')
            report "ID10: Test read operation - expecting bus_o.dat = '1'" severity error;
        wait for post_hold;

        cb_bus_i <= readBus(4);
        wait for assert_hold;
        assert(cb_bus_o.dat = x"02")
            report "ID11: Test read operation - expecting bus_o.dat = x02" severity error;
        assert(cb_bus_o.val = '1')
            report "ID12: Test read operation - expecting bus_o.val = '1'" severity error;
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
            report "ID13: Test write operation - expecting right_o(0) = ('1','1')" severity error;
        assert(left_io_i_vector(3).dat = '0')
            report "ID14: Test write operation - expecting left_i(3) = '0'" severity error;
        assert(right_io_o_vector(1).enb = '1' and right_io_o_vector(1).dat = '0')
            report "ID15: Test write operation - expecting right_o(1) = ('1','0')" severity error;
        assert(left_io_i_vector(4).dat = '1')
            report "ID16: Test write operation - expecting left_i(4) = '1'" severity error;
        assert(right_io_o_vector(2).enb = '0' and right_io_o_vector(2).dat = '0')
            report "ID17: Test write operation - expecting right_o(2) = ('0','0')" severity error;
        assert(left_io_i_vector(5).dat = '1')
            report "ID18: Test write operation - expecting left_i(5) = '1'" severity error;
        wait for post_hold;


        --End simulation
        wait for 50 ns;
		run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end TB;