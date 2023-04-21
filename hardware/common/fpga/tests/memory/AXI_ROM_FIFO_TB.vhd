-------------------------------------------------------------------------------
-- Company: 		Technische Universität Ilmenau
-- Engineer: 		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/03/202
-- Design Name: 	ROM FIFO Testbench
-- Module Name: 	AXI_ROM_FIFO
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



--! Functionality testbench
entity AXI_ROM_FIFO_TB is
end entity AXI_ROM_FIFO_TB;




--! Simulation architecture
architecture TB of AXI_ROM_FIFO_TB is

    --****DUT****
    component AXI_ROM_FIFO
        generic(
            FIFO_WIDTH      :   natural := 8;
            FIFO_DEPTH      :   natural := 16
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            m_read_tready   : in    std_logic;
            m_read_tvalid   : out   std_logic;
            m_read_tdata    : out   std_logic_vector(FIFO_WIDTH-1 downto 0)
        );
    end component;


    --****Internal signals****
    --Simulation timing
    constant clk_period     :   time := 10 ns;
    signal clk              :   std_logic := '0';
    signal rst              :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    --DUT i/o
    signal m_read_tready    :   std_logic;
    signal m_read_tvalid    :   std_logic;
    signal m_read_tdata     :   std_logic_vector(7 downto 0);
    signal read_data_buff   :   std_logic_vector(7 downto 0);


begin

    DUT : AXI_ROM_FIFO
    port map(
        clk             => clk,
        rst             => rst,
        m_read_tready   => m_read_tready,
        m_read_tvalid   => m_read_tvalid,
        m_read_tdata    => m_read_tdata
    );


    
    --Timing
    clk <= run_sim and (not clk) after clk_period/2;
    rst <= '1' after 5 ns, '0' after 15 ns;



    TEST : process
        variable init_hold  :   time := 5*clk_period/2;
    begin
        --Setup
        m_read_tready <= '0';
        wait for init_hold;


        m_read_tready  <= '1';
        wait for clk_period;
        for i in 0 to 14 loop
            read_data_buff <= m_read_tdata;
            
            wait for clk_period/2;
            assert(m_read_tvalid = '1')
                report "line(100): Test operation - expecting read_valid = '1'" severity error;
            assert(read_data_buff = std_logic_vector(to_unsigned(i,8)))
                report "line(102): Test operation - expecting read_buff = " & integer'image(i)
                severity error;
            wait for clk_period/2;
        end loop;
        
        wait for clk_period/2;
        assert(m_read_tvalid = '0')
            report "line(109): Test operation - expecting read_valid = '0'" severity error;
        assert(m_read_tdata = x"0F")
            report "line(111): Test operation - expecting read_buff = x0F" severity error;
        wait for clk_period/2;


        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;
    end process;


end TB;