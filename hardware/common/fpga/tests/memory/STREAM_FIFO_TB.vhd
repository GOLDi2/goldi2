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
--
-- Revision V3.01.00 - General improvements to simulation control
-- Additional Comments: Use of env library to stop simulation and
--						generalization of vector sizes to account for
--						changes in the GOLDI_COMM_STANDARD library
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation control and assertions
library std;
use std.standard.all;
use std.env.all;




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
            p_write_tready  : out   std_logic;
            p_write_tvalid  : in    std_logic;
            p_write_tdata   : in    std_logic_vector(FIFO_WIDTH-1 downto 0);        
            p_read_tready   : in    std_logic;
            p_read_tvalid   : out   std_logic;
            p_read_tdata    : out   std_logic_vector(FIFO_WIDTH-1 downto 0)        
        );
    end component;   


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period     :   time := 10 ns;
    signal clock            :   std_logic := '0';
    signal reset            :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    --DUT IOs
    signal p_write_tready   :   std_logic := '0';
    signal p_write_tvalid   :   std_logic := '0';
    signal p_write_tdata    :   std_logic_vector(7 downto 0) := (others => '0');
    signal p_read_tready    :   std_logic := '0';
    signal p_read_tvalid    :   std_logic := '0';
    signal p_read_tdata     :   std_logic_vector(7 downto 0) := (others => '0'); 


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
        p_write_tready  => p_write_tready,
        p_write_tvalid  => p_write_tvalid,
        p_write_tdata   => p_write_tdata,        
        p_read_tready   => p_read_tready,
        p_read_tvalid   => p_read_tvalid,
        p_read_tdata    => p_read_tdata        
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
        wait for init_hold;


        --**Test idle conditions**
        assert(p_write_tready = '1')
            report "ID01: Test reset - expecting p_write_tready = '1'" severity error;
        assert(p_read_tvalid = '0')
            report "ID02: Test reset - expecting p_read_tvalid = '0'" severity error;
        assert(p_read_tdata = x"00")
            report "ID03: Test reset - expecting p_read_tdata = x00" severity error;
        
        
        wait for 5*clk_period;


        --**Test write operation**
        --Expecting ready signal asserted until 4th element
        for i in 1 to 4 loop
            assert(p_write_tready = '1')
                report "ID04: Test write - expecting tready = '1' for (" & integer'image(i) & ")"
                severity error;
            
            p_write_tdata   <= std_logic_vector(to_unsigned(i,8));
            p_write_tvalid  <= '1';
            wait for clk_period;
        end loop;
        p_write_tvalid <= '0';

        wait for clk_period/2;
        assert(p_write_tready = '0')
            report "ID05: Test write - expecting tready = '0'" severity error;
        wait for clk_period/2;
        
        
        wait for 5*clk_period;


        --**Test read operation**
        for i in 1 to 4 loop
            p_read_tready <= '1';

            wait for clk_period/2;
            assert(p_read_tdata = std_logic_vector(to_unsigned(i,8)))
                report "ID06: Test read - expecting tdata = " & integer'image(i)
                severity error;
            assert(p_read_tvalid = '1')
                report "ID07: Test read - expecting tvalid = '1'" 
                severity error;
            wait for clk_period/2;
        end loop;
        p_read_tready <= '0';

        wait for clk_period/2;
        assert(p_read_tvalid = '0')
            report "ID08: Test read - expecting tvalid = '0'" severity error;
        wait for clk_period/2;

        
        --**End simulation**
        wait for 50 ns;
        report "STREAM_FIFO_TB - testbench successful";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        --run_sim <= '0';
        --wait;
    
    end process;
    -----------------------------------------------------------------------------------------------


end TB;