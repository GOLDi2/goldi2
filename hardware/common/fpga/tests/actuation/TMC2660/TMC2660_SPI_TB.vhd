-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		TMC2660 SPI Driver testbench
-- Module Name:		TMC2660_SPI_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> TMC2660_SPI.vhd
--
-- Revisions:
-- Revision V0.01.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library 
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
use std.standard.all;




--! Functionality testbench
entity TMC2660_SPI_TB is
end entity TMC2660_SPI_TB;




--! Simulation architecture
architecture TB of TMC2660_SPI_TB is

    --CUT
    component TMC2660_SPI
        port(
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        s_transfer_i_tready : out   std_logic;
        s_transfer_i_tvalid : in    std_logic;
        s_transfer_i_tdata  : in    std_logic_vector(19 downto 0);
        m_transfer_o_tvalid : out   std_logic;
        m_transfer_o_tdata  : out   std_logic_vector(19 downto 0);
        m_spi_sclk          : out   std_logic;
        m_spi_ncs           : out   std_logic;
        m_spi_mosi          : out   std_logic;
        m_spi_miso          : in    std_logic
        );
    end component;

    component SYNCHRONIZER
        generic (
            STAGES 	: natural := 2
        );
        port (
            clk		: in	std_logic;
            rst		: in	std_logic;
            io_i	: in	std_logic;
            io_sync	: out 	std_logic
        );
    end component;


    --Intermediate signals
    --Simulation timing
	constant clk_period		    :	time := 10 ns;
    signal reset			    :	std_logic := '0';
	signal clock			    :	std_logic := '0';
	signal run_sim			    :	std_logic := '1';
	--DUT i/o
    signal s_transfer_i_tready  :   std_logic;
    signal s_transfer_i_tvalid  :   std_logic;
    signal s_transfer_i_tdata   :   std_logic_vector(19 downto 0);
    signal m_transfer_o_tvalid  :   std_logic;
    signal m_transfer_o_tdata   :   std_logic_vector(19 downto 0);
    signal m_spi_sclk           :   std_logic;
    signal m_spi_ncs            :   std_logic;
    signal m_spi_mosi           :   std_logic;
    signal m_spi_miso           :   std_logic;
    signal spi_miso_buff        :   std_logic;
    --Testbench
    signal input_data           :   std_logic_vector(19 downto 0) := "00110011001100110011";
    signal output_data          :   std_logic_vector(19 downto 0);


begin

    DUT : TMC2660_SPI
    port map(
        clk                 => clock,
        rst                 => reset, 
        s_transfer_i_tready => s_transfer_i_tready,
        s_transfer_i_tvalid => s_transfer_i_tvalid,
        s_transfer_i_tdata  => s_transfer_i_tdata,
        m_transfer_o_tvalid => m_transfer_o_tvalid,
        m_transfer_o_tdata  => m_transfer_o_tdata,
        m_spi_sclk          => m_spi_sclk,
        m_spi_ncs           => m_spi_ncs,
        m_spi_mosi          => m_spi_mosi,
        m_spi_miso          => m_spi_miso
    );

    SYNC_MISO : SYNCHRONIZER
    port map(
        clk		=> clock,
        rst		=> reset,
        io_i	=> spi_miso_buff,
        io_sync	=> m_spi_miso
    );



    --Timing
	clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 5 ns, '0' after 15 ns;



    SPI_SLAVE : process(m_spi_sclk)
        variable edge_count :   natural := 0;
    begin
        if(falling_edge(m_spi_sclk)) then
            spi_miso_buff <= input_data(19-edge_count);
        end if;

        if(rising_edge(m_spi_sclk)) then
            output_data(19-edge_count) <= m_spi_mosi;
            edge_count := edge_count + 1;
        end if;
    end process;



    TEST : process
        --Timing
		variable init_hold			:	time :=	7*clk_period/2;
    begin

        --****Initial Setup****
        s_transfer_i_tdata  <= (others => '0');
        s_transfer_i_tvalid <= '0';
        wait for init_hold;



        --****Test idle state of module****
        assert(s_transfer_i_tready = '1')
            report "line(157): Test reset - expecting s_ready = '1'" severity error;
        assert(m_transfer_o_tvalid = '1')
            report "line(159): Test reset - expecting m_valid = '1'" severity error;
        assert(m_transfer_o_tdata = (m_transfer_o_tdata'range => '0'))
            report "line(161): Test reset - expecting m_data = x00" severity error;
        assert(m_spi_sclk = '1') 
            report "line(163): Test reset - expecting m_spi_sclk = '1'" severity error;
        assert(m_spi_ncs = '1')
            report "line(163): Test reset - expecting m_spi_ncs = '1'" severity error;
        assert(m_spi_mosi = '0')
            report "line(165): Test reset - expecting m_spi_mosi = '0'" severity error;
        wait for 50 ns;



        --****Test data transaction****
        --Run multiple transfer cycles with same input and output data 
        --Expecting spi transaction to meet timing constrains as well as
        --data_in = data_out
        s_transfer_i_tdata  <= "00110011001100110011";
        s_transfer_i_tvalid <= '1';
        wait for clk_period;
        s_transfer_i_tvalid <= '0';
        wait for 125*clk_period;

		
        assert(output_data = m_transfer_o_tdata)
            report "line(182): Test operation - expecting m_data = output_data" severity error;


        --End simulation
		wait for 200 ns;
		run_sim <= '0';
		wait;

    end process;


end TB;