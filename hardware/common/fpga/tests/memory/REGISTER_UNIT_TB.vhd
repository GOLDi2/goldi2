-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/06/2023
-- Design Name:		Basic memory unit testbench
-- Module Name:		REGISTER_UNIT_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> REGISTER_UNIT.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
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




--! Functionality testbench
entity REGISTER_UNIT_TB is
end entity REGISTER_UNIT_TB;




--! Simulation architecture
architecture TB of REGISTER_UNIT_TB is

    --****DUT****
    component REGISTER_UNIT
        generic(
            ADDRESS     :   natural;
            DEF_VALUE   :   data_word
        );
        port(
            clk         : in    std_logic;
            rst         : in    std_logic;
            sys_bus_i   : in    sbus_in;
            sys_bus_o   : out   sbus_out;
            data_in     : in    data_word;
            data_out    : out   data_word;
            read_stb    : out   std_logic;
            write_stb   : out   std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period     :   time := 20 ns;
    signal reset            :   std_logic := '0';
    signal clock            :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    -- DUT IOs
    constant reg_default    :   data_word := std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH));
    signal sys_bus_i        :   sbus_in   := gnd_sbus_i;
    signal sys_bus_o        :   sbus_out  := gnd_sbus_o;
    signal data_in          :   data_word := (others => '0');
    signal data_out         :   data_word := (others => '0');
    signal read_stb         :   std_logic := '0';
    signal write_stb        :   std_logic := '0';


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : REGISTER_UNIT
    generic map(
        ADDRESS     => 1,
        DEF_VALUE   => reg_default
    )
    port map(
        clk         => clock,
        rst         => reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o,
        data_in     => data_in,
        data_out    => data_out,
        read_stb    => read_stb,
        write_stb   => write_stb
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
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test reset conditions**
        wait for assert_hold;
        assert(data_out = reg_default)
            report "ID01: Test reset - expecting data_out = xF0" severity error;
        assert(read_stb = '0')
            report "ID02: Test reset - expecting read_stb = '0'" severity error;
        assert(write_stb = '0')
            report "ID03: Test reset - expecting write_stb = '0'" severity error;
        assert(sys_bus_o = gnd_sbus_o)
            report "ID04: Test reset - expecting sys_bus_o = gnd_sbus_o" severity error;
        wait for post_hold;



        wait for 5*clk_period;



        --**Test read bus**
        data_in <= std_logic_vector(to_unsigned(10,SYSTEM_DATA_WIDTH));
        wait for clk_period;
        --Load address, write enable and data
        sys_bus_i.we  <= '0';
        sys_bus_i.adr <= std_logic_vector(to_unsigned(1,BUS_ADDRESS_WIDTH));
        sys_bus_i.dat <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
        
        wait for assert_hold;
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(10,SYSTEM_DATA_WIDTH)))
            report "ID05: Test bus read - expecting sys_bus_o.dat = x0A" severity error;
        assert(read_stb = '0')
            report "ID06: Test bus read - epxecting read_stb = '0'" severity error;
        wait for post_hold;

        --Enable strobe signal
        sys_bus_i.stb <= '1';        
        wait for assert_hold;
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(10,SYSTEM_DATA_WIDTH)))
            report "ID07: Test bus read - expecting sys_bus_o.dat = x0A" severity error;
        assert(read_stb = '1')
            report "ID08: Test bus read - expecting read_stb = '1'" severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;



        wait for 5*clk_period;



        --**Test write bus**
        --Load address, write enable and data
        sys_bus_i.we  <= '1';
        sys_bus_i.adr <= std_logic_vector(to_unsigned(1,BUS_ADDRESS_WIDTH));
        sys_bus_i.dat <= std_logic_vector(to_unsigned(10,SYSTEM_DATA_WIDTH));

        wait for assert_hold;
        assert(data_out = reg_default)
            report "ID09: Test bus write - expecting data_out = reg_default" severity error;
        assert(write_stb = '0')
            report "ID10: Test bus write - expecting write_stb = '0'" severity error;
        wait for post_hold;

        --Enable strobe signal
        sys_bus_i.stb <= '1';
        wait for assert_hold;
        assert(sys_bus_o.dat = (sys_bus_o.dat'range => '0'))
            report "ID11: Test bus write - expecting sys_bus_o = x00" severity error;
        assert(data_out = std_logic_vector(to_unsigned(10,SYSTEM_DATA_WIDTH)))
            report "ID12: Test bus write - expecting data_out = x0A" severity error;
        assert(write_stb = '1')
            report "ID13: Test bus write - expecting write_stb = '1'" severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;
        


        --**End simulation**
        wait for 50 ns;
        report "REGISTER_UNIT_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        --run_sim <= '0';
        --wait;

    end process;
    -----------------------------------------------------------------------------------------------


end TB;