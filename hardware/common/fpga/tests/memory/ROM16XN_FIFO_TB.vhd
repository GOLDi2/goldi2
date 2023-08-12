-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/07/2023
-- Design Name:		Configuration ROM based FIFO testbench
-- Module Name:		ROM16XN_FIFO_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_DATA_TYPES.vhd
--                  -> ROM16XN_FIFO.vhd
--
-- Revisions:
-- Revision V3.01.00 - File Created
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
use work.GOLDI_DATA_TYPES.all;




--! Functionality simulation
entity ROM16XN_FIFO_TB is
end entity ROM16XN_FIFO_TB;




--! Simulation architecture
architecture TB of ROM16XN_FIFO_TB is

    --****DUT****
    component ROM16XN_FIFO
        generic(
            g_data_width    :   integer := 16;
            g_init_delay    :   integer := 100;
            g_init_values   :   array_16_bit := (x"00FF",x"000F")
        );
        port(
            --General 
            clk             : in    std_logic;
            rst             : in    std_logic;
            --Flag
            p_fifo_empty    : out   std_Logic;
            --Data interfece
            p_cword_tready  : in    std_logic;
            p_cword_tvalid  : out   std_logic;
            p_cword_tdata   : out   std_logic_vector(g_data_width-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    constant default_conf   :   array_16_bit(1 downto 0) := (x"0403",x"0201");
    --Simulation timing
    constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
    signal p_fifo_empty     :   std_logic := '0';
    signal p_cword_tready   :   std_logic := '0' ;
    signal p_cword_tvalid   :   std_logic := '0';
    signal p_cword_tdata    :   std_logic_vector(7 downto 0) := (others => '0');
    

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : ROM16XN_FIFO
    generic map(
        g_data_width    => 8,
        g_init_delay    => 20,
        g_init_values   => default_conf
    )
    port map(
        clk             => clock,
        rst             => reset,
        p_fifo_empty    => p_fifo_empty,
        p_cword_tready  => p_cword_tready,
        p_cword_tvalid  => p_cword_tvalid,
        p_cword_tdata   => p_cword_tdata
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
        variable init_hold      :   time := 3*clk_period/2;
        variable assert_hold    :   time := clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test initialization delay**
        for i in 0 to 19 loop
            assert(p_cword_tvalid = '0')
                report "ID01: Test reset delay - expecting p_cword_tvalid = '0'" severity error;
            assert(p_cword_tdata = (p_cword_tdata'range => '0'))
                report "ID02: Test reset delay - expecting p_cword_tdata = x00" severity error;
            wait for clk_period;
        end loop;

        
        wait for 10*clk_period;


        --**Test operation**
        for i in 1 to 4 loop
            assert(p_cword_tvalid = '1')
                report "ID03: Test fifo operation - expecting p_cword_tvalid = '1'" 
                severity error;
            assert(p_cword_tdata = std_logic_vector(to_unsigned(i,8)))
                report "ID04: Test fifo operation - expecting p_cword_tdata = " & integer'image(i)
                severity error;
            assert(p_fifo_empty = '0')
                report "ID05: Test fifo operation - expecting p_fifo_empty = '0'"
                severity error;
            
            --Transfer data
            p_cword_tready <= '1';
            wait for clk_period;
            p_cword_tready <= '0';
            
            wait for assert_hold;
            assert(p_cword_tvalid = '0')
                report "ID06: Test fifo operation - expecting p_cword_tvalid = '0'" 
                severity error;
            wait for post_hold;

            wait for 10*clk_period;
        end loop;


        --**Test empty flag**
        wait for assert_hold;
        assert(p_fifo_empty = '1')
            report "ID07: Test fifo operation - expecting p_fifo_empty = '1'"
            severity error;
        wait for post_hold;

        

        --**End simulation**
        wait for 50 ns;
        report "ROM16XN_FIFO_TB - testbench successful";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        --run_sim <= '0';
        --wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;