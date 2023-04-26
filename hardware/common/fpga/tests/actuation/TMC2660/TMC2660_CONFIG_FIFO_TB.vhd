-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Configuration FIFO testbench
-- Module Name:		CONFIGURATION_FIFO_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_DATA_TYPES.all;
--! Use assert library for simulation
library std;
use std.standard.all;




--! Functionality simulation
entity TMC2660_CONFIG_FIFO_TB is
end entity TMC2660_CONFIG_FIFO_TB;




--! Simulation architecture
architecture TB of TMC2660_CONFIG_FIFO_TB is

    --****DUT****
    component TMC2660_CONFIG_FIFO
        generic(
            ROM             :   tmc2660_rom
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            m_read_tready   : in    std_logic;
            m_read_tvalid   : out   std_logic;
            m_read_tdata    : out   std_logic_vector(19 downto 0)       
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period     :   time := 10 ns;
    signal clock            :   std_logic := '0';
    signal reset            :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    --DUT IO
    constant rom            :   tmc2660_rom(7 downto 0) :=(
        0 => x"00001",
        1 => x"00002",
        2 => x"00003",
        3 => x"00004",
        4 => x"00005",
        5 => x"00006",
        6 => x"00007",
        7 => x"00008"
    );
    signal m_read_tready    :   std_logic;
    signal m_read_tvalid    :   std_logic;
    signal m_read_tdata     :   std_logic_vector(19 downto 0);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : TMC2660_CONFIG_FIFO
    generic map(
        ROM             => rom
    )
    port map(
        clk             => clock,
        rst             => reset,
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
        variable init_hold  :   time := 5*clk_period/2;
    begin
        --Preset signals
        m_read_tready <= '0';
        wait for init_hold;


   
        --**Test normal operation**
        for i in 1 to 8 loop
            m_read_tready <= '1';
            wait for clk_period/2;
            assert(m_read_tvalid = '1')
                report "line(125): Test operation - expecting read_valid = '1'" severity error;
            assert(m_read_tdata = std_logic_vector(to_unsigned(i,20)))
                report "line(127): Test operation - expecting read_data = " & integer'image(i)
                severity error;
            wait for clk_period/2;
            m_read_tready <= '0';

            wait for 2*clk_period;
        end loop;

        wait for clk_period/2;
        assert(m_read_tvalid = '0')
            report "line(135): Test operation - expecting read_valid = '0'" severity error;
        assert(m_read_tdata = x"00008")
            report "line(137): Test operation - expecting read_data = 8" severity error;
        wait for clk_period/2;



        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;        


    end process;
    -----------------------------------------------------------------------------------------------


end TB;
