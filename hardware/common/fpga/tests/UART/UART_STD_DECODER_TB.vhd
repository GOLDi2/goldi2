-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		UART standard dencoder testbench 
-- Module Name:		UART_STD_DECODER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> UART_STD_DENCODER.vhd
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




--! Functionality testbench
entity UART_STD_DECODER_TB is
end entity UART_STD_DECODER_TB;




--! Simulation architecture
architecture TB of UART_STD_DECODER_TB is

    --****DUT****
    component UART_STD_DECODER
        generic(
            g_data_width    :   integer := 8;
            g_stop_bits     :   integer := 2
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            o_eword_tready  : out   std_logic;
            i_eword_tvalid  : in    std_logic;
            i_eword_tdata   : in    std_logic_vector((g_data_width+g_stop_bits+1) downto 0);
            i_dword_tready  : in    std_logic;
            o_dword_tvalid  : out   std_logic;
            o_dword_tdata   : out   std_logic_vector(g_data_width-1 downto 0);
            o_dword_error   : out   std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal o_eword_tready   :   std_logic := '1';
    signal i_eword_tvalid   :   std_logic := '0';
    signal i_eword_tdata    :   std_logic_vector(10 downto 0) := (others => '0');
    signal i_dword_tready   :   std_logic := '0';
    signal o_dword_tvalid   :   std_logic := '0';
    signal o_dword_tdata    :   std_logic_vector(7 downto 0) := (others => '0');
    signal o_dword_error    :   std_logic := '0';  


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : UART_STD_DECODER
    generic map(
        g_data_width    => 8,
        g_stop_bits     => 1
    )
    port map(
        clk             => clock,
        rst             => reset,
        o_eword_tready  => o_eword_tready,
        i_eword_tvalid  => i_eword_tvalid,
        i_eword_tdata   => i_eword_tdata,
        i_dword_tready  => i_dword_tready,
        o_dword_tvalid  => o_dword_tvalid,
        o_dword_tdata   => o_dword_tdata,
        o_dword_error   => o_dword_error
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


        --**Test reset condition**
        wait for assert_hold;
        assert(o_eword_tready = '1')
            report "ID01: Test reset - expecting eword_tready = '1'" severity error;
        assert(o_dword_tvalid = '0')
            report "ID02: Test reset - expecting dword_tvalid = '0'" severity error;
        assert(o_dword_tdata = (o_dword_tdata'range => '0'))
            report "ID03: Test reset - expecting dword_tdata = x00" severity error;
        assert(o_dword_error = '0')
            report "ID04: Test reset - expecting dword_error = '0'" severity error;
        wait for post_hold;


        --**Test operation**
        --Test decoder
        i_eword_tdata  <= "10000011110";
        i_eword_tvalid <= '1';

        wait for assert_hold;
        assert(o_eword_tready = '0')
            report "ID05: Test operation - expecting eword_tready = '0'" severity error;
        assert(o_dword_tvalid = '1')
            report "ID06: Test operation - expecting dword_tvalid = '1'" severity error;
        assert(o_dword_tdata = x"0F")
            report "ID07: Test operation - expecting dword_tdata = x0F" severity error;
        assert(o_dword_error = '0')
            report "ID08: Test operation - expecting dword_error = '0'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --Test transmission
        i_eword_tvalid <= '0';
        wait for clk_period;
        i_dword_tready <= '1';

        wait for assert_hold;
        assert(o_eword_tready = '1')
            report "ID09: Test operation - expecting eword_tready = '1'" severity error;
        assert(o_dword_tvalid = '0')
            report "ID10: Test operation - expecting dword_tvalid = '0'" severity error;
        assert(o_dword_tdata = x"0F")
            report "ID11: Test operation - expecting dword_tdata = x0F" severity error;
        assert(o_dword_error = '0')
            report "ID12: Test operation - expecting dword_error = '0'" severity error;
        wait for post_hold;
        i_dword_tready <= '0';
        

        wait for 5*clk_period;


        --**Test error cases**
        --Parity error
        i_eword_tdata  <= "10000001110";
        i_eword_tvalid <= '1';

        wait for assert_hold;
        assert(o_dword_tdata = x"07")
            report "ID13: Test parity error - expecting dword_tdata = x07" severity error;
        assert(o_dword_error = '1')
            report "ID14: Test parity error - expecting dword_error = '1'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --Stop-bit error
        i_dword_tready <= '1';
        wait for clk_period;
        i_dword_tready <= '0';
        i_eword_tdata  <= "01000001110";
        i_eword_tvalid <= '1';

        wait for assert_hold;
        assert(o_dword_tdata = x"07")
            report "ID15: Test stop-bit error - expecting dword_tdata = x07" severity error;
        assert(o_dword_error = '1')
            report "ID16: Test stop-bit error - expecting dword_error = '1'" severity error;
        wait for post_hold;


        --**End simulation**
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;