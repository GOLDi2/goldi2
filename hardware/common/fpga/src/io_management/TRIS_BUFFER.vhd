-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Tristate Output/Input Buffer from MachXO2 library
-- Module Name:		TRIS_BUFFER
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
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
--! Use Lattice MachXO2 library
library machxo2;
--! Use custom libraries;
use work.GOLDI_IO_STANDARD.all;



--! @brief Tri-state synchronizer buffer
--! @details
--! Buffer transforms the inout signals of a FPGA into the io_o/io_i standard
--! used in the system. The incomming data is presented in to ways. A synchronizer 
--! samples the input data every rising edge of the main clock and a asyncrhonous
--! port shifts input data directly.
--!
--! **Latency(sync input): 2cyl**
entity TRIS_BUFFER is
    port(
        --General
        clk             : in    std_logic;      --! System clock
        rst             : in    std_logic;      --! Synchronous reset
        --System in/out interface
        port_out        : in    io_o;           --! System output data
        port_in_async   : out   io_i;           --! System input asynchronous data
        port_in_sync    : out   io_i;           --! System input synchronous data
        --FPGA IO
        io              : inout std_logic       --! FPGA Pin
    );
end entity TRIS_BUFFER;



--! General architecture
architecture RTL of TRIS_BUFFER is
	
    --Components
    component SYNCHRONIZER
        generic(
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
    --Buffer
    signal io_buffer    :   io_i;
    signal io_sync      :   io_i;
    signal n_enb        :   std_logic;

begin
	

    --Drive inout FPGA Pin
    BUFF : machxo2.components.BB
    port map (
        B => io,
        I => port_out.dat,
        T => n_enb,
        O => io_buffer.dat
    );
    --Invert enb signal 
    n_enb <= not port_out.enb;

    
    --Manage data input into the system
    port_in_async <= io_buffer;
    port_in_sync  <= io_sync;

    SYNC_INPUT : SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => io_buffer.dat,
        io_sync => io_sync.dat
    );
    

end RTL;