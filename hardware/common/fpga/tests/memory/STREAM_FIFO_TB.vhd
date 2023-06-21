-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/06/2023
-- Design Name:		Streaming FIFO Testbench 
-- Module Name:		STREAM_FIFO_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:    -> STREAM_FIFO.vhd
--
-- Revisions:
-- Revision V3.00.02 - File Created
-- Additional Comments: First commitment  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
library std;
use std.standard.all;




--! Functionality simulation
entity STREAM_FIFO_TB is
end entity STREAM_FIFO_TB;




--! Simulation architecture
architecture TB of STREAM_FIFO_TB is

    --****DUT****
    component STREAM_FIFO
        generic(
            FIFO_WIDTH      :   natural := 16;
            FIFO_DEPTH      :   natural := 16
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            s_write_tready  : out   std_logic;
            s_write_tvalid  : in    std_logic;
            s_write_tdata   : in    std_logic_vector(FIFO_WIDTH-1 downto 0);        
            m_read_tready   : in    std_logic;
            m_read_tvalid   : out   std_logic;
            m_read_tdata    : out   std_logic_vector(FIFO_WIDTH-1 downto 0)        
        );
    end component;   


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period     :   time := 10 ns;
    signal clock            :   std_logic := '0';
    signal reset            :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    --DUT IOs
    signal s_write_tready   :   std_logic;
    signal s_write_tvalid   :   std_logic;
    signal s_write_tdata    :   std_logic_vector(7 downto 0);
    signal m_read_tready    :   std_logic;
    signal m_read_tvalid    :   std_logic;
    signal m_read_tdata     :   std_logic_vector(7 downto 0); 


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : STREAM_FIFO
    generic map(
        FIFO_WIDTH      => 8,
        FIFO_DEPTH      => 4
    )
    port map(
        clk             => clock,
        rst             => reset,
        s_write_tready  => s_write_tready,
        s_write_tvalid  => s_write_tvalid,
        s_write_tdata   => s_write_tdata,        
        m_read_tready   => m_read_tready,
        m_read_tvalid   => m_read_tvalid,
        m_read_tdata    => m_read_tdata        
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
        variable init_hold  :   time := 5*clk_period/2;
    begin
        --Preset module
        s_write_tdata   <= (others => '0');
        s_write_tvalid  <= '0';
        m_read_tready   <= '0';
        wait for init_hold;


        --**Test idle conditions**
        assert(s_write_tready = '1')
            report "line(119): Test reset - expecting s_write_tready = '1'" severity error;
        assert(m_read_tvalid = '0')
            report "line(121): Test reset - expecting m_read_tvalid = '0'" severity error;
        assert(m_read_tdata = x"00")
            report "line(123): Test reset - expecting m_read_tdata = x00" severity error;
        wait for 5*clk_period;


        --**Test write operation**
        --Expecting ready signal asserted until 4th element
        for i in 1 to 4 loop
            assert(s_write_tready = '1')
                report "line(131): Test write - expecting tready = '1' for (" & integer'image(i) & ")"
                severity error;
            
            s_write_tdata   <= std_logic_vector(to_unsigned(i,8));
            s_write_tvalid  <= '1';
            wait for clk_period;
        end loop;
        s_write_tvalid <= '0';

        wait for clk_period/2;
        assert(s_write_tready = '0')
            report "line(142): Test write - expecting tready = '0'" severity error;
        wait for clk_period/2;
        wait for 5*clk_period;


        --**Test read operation**
        for i in 1 to 4 loop
            m_read_tready <= '1';

            wait for clk_period/2;
            assert(m_read_tdata = std_logic_vector(to_unsigned(i,8)))
                report "line(153): Test read - expecting tdata = " & integer'image(i)
                severity error;
            assert(m_read_tvalid = '1')
                report "line(156): Test read - expecting tvalid = '1'" 
                severity error;
            wait for clk_period/2;
        end loop;
        m_read_tready <= '0';

        wait for clk_period/2;
        assert(m_read_tvalid = '0')
            report "line(164): Test read - expecting tvalid = '0'" severity error;
        wait for clk_period/2;

        
        --**End simulation**
        wait for 5*clk_period;
        run_sim <= '0';
        wait;
    
    end process;
    -----------------------------------------------------------------------------------------------


end TB;