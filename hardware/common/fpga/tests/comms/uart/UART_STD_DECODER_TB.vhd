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




--! Functionality testbench
entity UART_STD_DECODER_TB is
end entity UART_STD_DECODER_TB;




--! Simulation architecture
architecture TB of UART_STD_DECODER_TB is

    --****DUT****
    component UART_STD_DECODER
        generic(
            g_encoded_length    :   integer;
            g_data_width        :   integer;
            g_parity_bit        :   integer;         
            g_even_pol          :   boolean
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            p_eword_tready  : out   std_logic;
            p_eword_tvalid  : in    std_logic;
            p_eword_tdata   : in    std_logic_vector(g_encoded_length-1 downto 0);
            p_dword_tready  : in    std_logic;
            p_dword_tvalid  : out   std_logic;
            p_dword_tdata   : out   std_logic_vector(g_data_width-1 downto 0);
            p_dword_error   : out   std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal p_eword_tready   :   std_logic := '1';
    signal p_eword_tvalid   :   std_logic := '0';
    signal p_eword_tdata    :   std_logic_vector(10 downto 0) := (others => '0');
    signal p_dword_tready   :   std_logic := '0';
    signal p_dword_tvalid   :   std_logic := '0';
    signal p_dword_tdata    :   std_logic_vector(7 downto 0) := (others => '0');
    signal p_dword_error    :   std_logic := '0';  


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : UART_STD_DECODER
    generic map(
        g_encoded_length    => 11,
        g_data_width        => 8,
        g_parity_bit        => true,         
        g_even_pol          => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_eword_tready      => p_eword_tready,
        p_eword_tvalid      => p_eword_tvalid,
        p_eword_tdata       => p_eword_tdata,
        p_dword_tready      => p_dword_tready,
        p_dword_tvalid      => p_dword_tvalid,
        p_dword_tdata       => p_dword_tdata,
        p_dword_error       => p_dword_error
    );
    -----------------------------------------------------------------------------------------------
    


    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after  10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --Initial setup
        wait for init_hold;


        --**Test reset condition**
        wait for assert_hold;
        assert(p_eword_tready = '1')
            report "ID01: Test reset - expecting eword_tready = '1'" severity error;
        assert(p_dword_tvalid = '0')
            report "ID02: Test reset - expecting dword_tvalid = '0'" severity error;
        assert(p_dword_tdata = (p_dword_tdata'range => '0'))
            report "ID03: Test reset - expecting dword_tdata = x00" severity error;
        assert(p_dword_error = '0')
            report "ID04: Test reset - expecting dword_error = '0'" severity error;
        wait for post_hold;


        --**Test operation**
        --Test valid decode operation
        p_eword_tdata  <= "10000011110";
        p_eword_tvalid <= '1';

        wait for assert_hold;
        assert(p_eword_tready = '0')
            report "ID05: Test operation - expecting eword_tready = '0'" severity error;
        assert(p_dword_tvalid = '1')
            report "ID06: Test operation - expecting dword_tvalid = '1'" severity error;
        assert(p_dword_tdata = x"0F")
            report "ID07: Test operation - expecting dword_tdata = x0F" severity error;
        assert(p_dword_error = '0')
            report "ID08: Test operation - expecting dword_error = '0'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --Test transmission
        p_eword_tvalid <= '0';
        wait for clk_period;
        p_dword_tready <= '1';

        wait for assert_hold;
        assert(p_eword_tready = '1')
            report "ID09: Test operation - expecting eword_tready = '1'" severity error;
        assert(p_dword_tvalid = '0')
            report "ID10: Test operation - expecting dword_tvalid = '0'" severity error;
        assert(p_dword_tdata = x"0F")
            report "ID11: Test operation - expecting dword_tdata = x0F" severity error;
        assert(p_dword_error = '0')
            report "ID12: Test operation - expecting dword_error = '0'" severity error;
        wait for post_hold;
        p_dword_tready <= '0';
        

        wait for 5*clk_period;


        --**Test error cases**
        --Parity error
        p_eword_tdata  <= "10000001110";
        p_eword_tvalid <= '1';

        wait for assert_hold;
        assert(p_dword_tdata = x"00")
            report "ID13: Test parity error - expecting dword_tdata = x00" severity error;
        assert(p_dword_error = '1')
            report "ID14: Test parity error - expecting dword_error = '1'" severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --Stop-bit error
        p_eword_tdata  <= "01000001110";
        p_eword_tvalid <= '1';

        wait for assert_hold;
        assert(p_dword_tdata = x"00")
            report "ID15: Test stop-bit error - expecting dword_tdata = x00" severity error;
        assert(p_dword_error = '1')
            report "ID16: Test stop-bit error - expecting dword_error = '1'" severity error;
        wait for post_hold;



        --**End simulation**
        wait for 50 ns;
        report"UART_STD_ENCODER_TB - testbench completed";
        --Simulation end using vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries not supported)
        -- run_sim <= '0';
        -- wait; 

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;