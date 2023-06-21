-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/06/2023
-- Design Name:		Basic memory unit testbench
-- Module Name:		REGISTER_UNIT_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> REGISTER_UNIT.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V3.00.02 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
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
            ADDRESS     :   natural := 1;
            DEF_VALUE   :   data_word := (others => '0')
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
    constant clk_period     :   time := 10 ns;
    signal reset            :   std_logic := '0';
    signal clock            :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    -- DUT IOs
    constant reg_default    :   data_word := x"F0";
    signal sys_bus_i        :   sbus_in;
    signal sys_bus_o        :   sbus_out;
    signal data_in          :   data_word := x"00";
    signal data_out         :   data_word;
    signal read_stb         :   std_logic;
    signal write_stb        :   std_logic;


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
    reset <= '1' after 5 ns, '0' after 15 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset bus
        sys_bus_i <= gnd_sbus_i;
        --Wait for initial setup
        wait for init_hold;


        --**Test reset conditions**
        wait for assert_hold;
        assert(data_out = reg_default)
            report "line(123): Test reset - expecting data_out = xF0" severity error;
        assert(read_stb = '0')
            report "line(125): Test reset - expecting read_stb = '0'" severity error;
        assert(write_stb = '0')
            report "line(127): Test reset - expecting write_stb = '0'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test read bus**
        data_in <= x"0A";
        wait for clk_period;
        sys_bus_i <= readBus(1);
        
        wait for assert_hold;
        assert(sys_bus_o.dat = x"0A")
            report "line(141): Test bus read - expecting sys_bus_o.dat = x0A" severity error;
        assert(sys_bus_o.val = '1')
            report "line(143): Test bus read - expecting sys_bus_o.val = '1'" severity error;
        assert(read_stb = '1')
            report "line(145): Test bus read - expecting read_stb = '1'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test write bus**
        sys_bus_i <= writeBus(1,10);
        
        wait for assert_hold;
        assert(sys_bus_o.dat = x"00")
            report "line(156): Test bus write - expecting sys_bus_o.dat = x00" severity error;
        assert(data_out = x"0A")
            report "line(159): Test bus write - expecting data_out = x0A" severity error;
        assert(write_stb = '1')
            report "line(161): Test bus write - expecting write_stb = '1'" severity error;
        wait for post_hold;


        --**End simulation**
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end TB;