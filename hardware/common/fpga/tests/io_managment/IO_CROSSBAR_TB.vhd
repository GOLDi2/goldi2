-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmai.com>
--
-- Create Date:		01/01/2023
-- Design Name:		IO Crossbar Structure testbench
-- Module Name:		IO_CROSSBAR_TB
-- Project Name:	GOLDIi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd;
--                  -> GOLDI_COMM_STANDARD.vhd;
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
--! Use custom libraries
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_CROSSBAR_DEFAULT.all;




--! Functionality Testbench
entity IO_CROSSBAR_TB is
end entity IO_CROSSBAR_TB;



--! Simulation architecture
architecture TB of IO_CROSSBAR_TB is

    --CUT
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


    --Intermediate Signals
    --Simulation timing
    constant clk_period		    :	time := 10 ns;
	signal reset			    :	std_logic;
	signal clock			    :	std_logic := '0';
	signal run_sim			    :	std_logic := '1';
	--DUT i/o
    signal cb_bus_i             :   sbus_in;
    signal cb_bus_o             :   sbus_out;
    --
    signal left_io_i_vector     :   io_i_vector(5 downto 0);
    signal left_io_o_vector     :   io_o_vector(5 downto 0);
    signal right_io_i_vector    :   io_i_vector(2 downto 0);
    signal right_io_o_vector    :   io_o_vector(2 downto 0);
    

begin

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



    --Timing
	clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 0 ns, '0' after 15 ns;



    TEST : process
        variable init_hold      :   time := 4*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        
		--Preset master interface of bus
        cb_bus_i.we <= '0';
        cb_bus_i.adr <= (others => '0');
        cb_bus_i.dat <= (others => '0');
		--Preset the right port pins
        right_io_i_vector(0).dat <= '0';
        right_io_i_vector(1).dat <= '1';
        right_io_i_vector(2).dat <= '1';
        --Preset left port pins
        left_io_o_vector(0) <= (enb => '0', dat => '0');
        left_io_o_vector(1) <= (enb => '0', dat => '1');
        left_io_o_vector(2) <= (enb => '1', dat => '1');
        left_io_o_vector(3) <= (enb => '1', dat => '1');
        left_io_o_vector(4) <= (enb => '0', dat => '1');
        left_io_o_vector(5) <= (enb => '0', dat => '0');

        wait for init_hold;


        --Test reset state
        assert(left_io_i_vector(0).dat = '0') 
            report "line(138): Test reset - expecting left_i(0) = '0'" severity error;
        assert(left_io_i_vector(1).dat = '1')
            report "line(140): Test reset - expecting left_i(1) = '1'" severity error;
        assert(left_io_i_vector(2).dat = '1')
            report "line(142): Test reset - expecting left_i(2) = '1'" severity error; 
        assert(right_io_o_vector(0).enb = '0' and right_io_o_vector(0).dat = '0')
            report "line(144): Test reset - expecting right_o(0) = ('0','0')" severity error;
        assert(right_io_o_vector(1).enb = '0' and right_io_o_vector(1).dat = '1')
            report "line(146): Test reset - expecting right_o(1) = ('0','1')" severity error;
        assert(right_io_o_vector(2).enb = '1' and right_io_o_vector(2).dat = '1')
            report "line(148): Test reset - expecting right_o(2) = ('1','1')" severity error;
        --



        --Test read operation
        wait for 50 ns;
        cb_bus_i.adr <= "0000011";
        wait for assert_hold;
        assert(cb_bus_o.dat = x"01") 
            report "line(158): Test read operation - expecting bus_o.dat = x01" severity error;
        assert(cb_bus_o.val = '1')
            report "line(160): Test read operation - expecting bus_o.val = '1'" severity error;
        wait for post_hold;
        --
        

        --Test write operation
        wait for 50 ns;
        cb_bus_i.we <= '1';
        cb_bus_i.adr <= "0000100";
        cb_bus_i.dat <= x"05";
        wait for assert_hold;
        assert(right_io_o_vector(2).enb = '0' and right_io_o_vector(2).dat = '0')
            report "line(172): Test write operation - expecting right_o(2) = ('0','0')" severity error;
        assert(left_io_i_vector(5).dat = '1')
            report "line(174): Test write operation - expecting left_i(2) = '1'" severity error;
        wait for post_hold;
        --


        --End simulation
        wait for 50 ns;
		run_sim <= '0';
        wait;

    end process;


end TB;