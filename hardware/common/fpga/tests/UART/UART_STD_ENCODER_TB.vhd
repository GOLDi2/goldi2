-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		UART standard encoder testbench 
-- Module Name:		UART_STD_ENCODER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> UART_STD_ENCODER.vhd
--
-- Revisions:
-- Revision V3.01.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
library std;
use std.standard.all;




--! Functionality testbenh
entity UART_STD_ENCODER_TB is
end entity UART_STD_ENCODER_TB;




--! Simulation architecture
architecture TB of UART_STD_ENCODER_TB is
    
    --****DUT****
    component UART_STD_ENCODER is
    generic(
        g_data_width    :   integer := 8;
        g_stop_bits     :   integer := 1
    );
    port(
        clk             : in    std_logic;
        rst             : in    std_logic;
        o_dword_tready  : out   std_logic;
        i_dword_tvalid  : in    std_logic;
        i_dword_tdata   : in    std_logic_vector(g_data_width-1 downto 0);
        i_eword_tready  : in    std_logic;
        o_eword_tvalid  : out   std_logic;
        o_eword_tdata   : out   std_logic_vector((g_data_width+g_stop_bits) downto 0)
    );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal o_dword_tready   :   std_logic := '1';
    signal i_dword_tvalid   :   std_logic := '0';
    signal i_dword_tdata    :   std_logic_vector(7 downto 0) := (others => '0');
    signal i_eword_tready   :   std_logic := '0';
    signal o_eword_tvalid   :   std_logic := '0';
    signal o_eword_tdata    :   std_logic_vector(8 downto 0) := (others => '0');


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : UART_STD_ENCODER
    generic map(
        g_data_width    => 8,
        g_stop_bits     => 0
    )
    port map(
        clk             => clock,
        rst             => reset,
        o_dword_tready  => o_dword_tready,
        i_dword_tvalid  => i_dword_tvalid,
        i_dword_tdata   => i_dword_tdata,
        i_eword_tready  => i_eword_tready,
        o_eword_tvalid  => o_eword_tvalid,
        o_eword_tdata   => o_eword_tdata
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after  5 ns, '0' after 15 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Initial setup
        wait for init_hold;


        --**Test reset conditions**
        wait for assert_hold;
        assert(o_dword_tready = '1')
            report "ID01: Test reset - expecting dword_tready = '1'" severity error;
        assert(o_eword_tvalid = '0')
            report "ID02: Test reset - expecting eword_tvalid = '0'" severity error;
        assert(o_eword_tdata = (o_eword_tdata'range => '0'))
            report "ID03: Test reset - expecting eword_tvalid = x00" severity error;
        wait for post_hold;



        --**Test operation**
        --Test encoding
        i_dword_tdata  <= x"07";
        i_dword_tvalid <= '1';

        wait for assert_hold;
        assert(o_dword_tready = '0')
            report "ID04: Test operation - expecting dword_tready = '0'" severity error;
        assert(o_eword_tvalid = '1')
            report "ID05: Test operation - expecting eword_tvalid = '1'" severity error;
        assert(o_eword_tdata = "100000111")
            report "ID06: Test operation - expecting eword_tdata x107" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --Test transmission
        i_dword_tvalid <= '0';
        wait for clk_period;
        i_eword_tready <= '1';

        wait for assert_hold;
        assert(o_dword_tready = '1')
            report "ID07: Test operation - expecting dword_tready = '1'" severity error;
        assert(o_eword_tvalid = '0')
            report "ID08: Test operation - expecting eword_tvalid = '0'" severity error;
        assert(o_eword_tdata = "100000111")
            report "ID09: Test operation - expecting eword_tdata = x107" severity error;
        wait for post_hold;


        --**End simulation**
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;