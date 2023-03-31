-------------------------------------------------------------------------------
-- Company: 		Technische Universität Ilmenau
-- Engineer: 		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/03/2023
-- Design Name: 	Axi fifo test bench
-- Module Name: 	AXI_FIFO_TB
-- Project Name: 	GOLDi_FPGA_CORE
-- Target Devices: 	LCMXO2-7000HC-4TG144C
-- Tool versions: 	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies: 	none
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
use std.standard.all;




--! Functionality simulation
entity AXI_FIFO_TB is
end entity AXI_FIFO_TB;




architecture TB of AXI_FIFO_TB is

    --DUT
    component AXI_FIFO
        generic(
            FIFO_WIDTH      :   natural := 16;
            FIFO_DEPTH      :   natural := 16
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            s_write_tdata   : in    std_logic_vector(FIFO_WIDTH-1 downto 0);
            s_write_tvalid  : in    std_logic;
            s_write_tready  : out   std_logic;
            m_read_tdata    : out   std_logic_vector(FIFO_WIDTH-1 downto 0);
            m_read_tvalid   : out   std_logic;
            m_read_tready   : in    std_logic
        );
    end component;



    --Testbench signals
    --Simulation timing
    constant clk_period     :   time := 10 ns;
    signal clk              :   std_logic := '0';
    signal rst              :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    --DUT i/o
    signal s_write_tdata    :   std_logic_vector(7 downto 0);
    signal s_write_tvalid   :   std_logic;
    signal s_write_tready   :   std_logic;
    signal m_read_tdata     :   std_logic_vector(7 downto 0);
    signal m_read_tvalid    :   std_logic;
    signal m_read_tready    :   std_logic;


begin

    DUT : AXI_FIFO
    generic map(
        FIFO_WIDTH      => 8,
        FIFO_DEPTH      => 4
    )
    port map(
        clk             => clk,
        rst             => rst,
        s_write_tdata   => s_write_tdata,
        s_write_tvalid  => s_write_tvalid,
        s_write_tready  => s_write_tready,
        m_read_tdata    => m_read_tdata,
        m_read_tvalid   => m_read_tvalid,
        m_read_tready   => m_read_tready
    );


    
    --Timing
    clk <= run_sim and (not clk) after clk_period/2;
    rst <= '1' after 5 ns, '0' after 15 ns;



    TEST : process
        --Timing 
        variable init_hold  :   time := 5*clk_period/2;
    begin
        --Preset module
        s_write_tdata   <= (others => '0');
        s_write_tvalid  <= '0';
        m_read_tready   <= '0';
        wait for init_hold;



        --****Test reset conditions****
        assert(s_write_tready = '1') 
            report "line(113): Test reset - expecting s_write_tready = '1'"  severity error;
        assert(m_read_tdata = (m_read_tdata'range => '0'))
            report "line(115): Test reset - expecting m_read_tdata = x00" severity error;
        assert(m_read_tvalid = '0')
            report "line(117): Test reset - expecting m_read_tvalid = '0'" severity error;
        wait for 50 ns;



        --****Test fill operation**** 
        --Expecting ready signal asserted until 4th element
        for i in 1 to 4 loop
            assert(s_write_tready = '1')
                report "line(125): Test fill - expecting tready = '1' for " & integer'image(i) severity error;

            s_write_tdata  <= std_logic_vector(to_unsigned(i,8));
            s_write_tvalid <= '1';
            wait for clk_period;
        end loop; 
        s_write_tvalid <= '0';


        wait for clk_period/2;
        assert(s_write_tready = '0')
            report "line(136): Test fill - expecting tready = '0'" severity error;
        wait for clk_period/2;
        wait for 50 ns;



        --****Test emtpying operation****
        for i in 1 to 4 loop
            m_read_tready  <= '1';

            wait for clk_period/2;
            assert(m_read_tdata = std_logic_vector(to_unsigned(i,8)))
                report "line(147): Test emptying - expecting tdata = " & integer'image(i) & 
                "(" & integer'image(to_integer(unsigned(m_read_tdata))) & ")";
            wait for clk_period/2;
        end loop; 
        m_read_tready <= '0';

        wait for clk_period/2;
        assert(m_read_tvalid = '0') 
            report "line(160): Test emptying - expecting tvalid = '0'" severity error;
        wait for clk_period/2;

		
        
        
        --End simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;

    end process;


end TB;