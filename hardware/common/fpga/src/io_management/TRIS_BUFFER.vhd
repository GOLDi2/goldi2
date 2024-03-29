-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Tristate Output/Input Buffer from MachXO2 library
-- Module Name:		TRIS_BUFFER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_IO_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
--! Lattice MachXO2 library
library machxo2;
--! Custom packages
library work;
use work.GOLDI_IO_STANDARD.all;




--! @brief Tri-state synchronizer buffer
--! @details
--! The buffer transforms the tri-state signals of a FPGA pin into the io_o/io_i 
--! standard defined in the GOLDI_IO_STANDARD and used internaly by the GOLDi system.
--! The incomming data is presented in two ways. A SYNCHRONIZER samples the input data
--! and synchronizes the input to the system clock to use in sequential logic, and an
--! asynchronous port shifts the input data directly to use in combinatorial logic.
--!
--! ***Latency(sync input): 2cyl***
entity TRIS_BUFFER is
    port(
        --General
        clk             : in    std_logic;      --! System clock
        rst             : in    std_logic;      --! Asynchronous reset
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
	
    --****INTERNAL SIGNALS****
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

    SYNC_INPUT : entity work.SYNCHRONIZER
    port map(
        clk         => clk,
        rst         => rst,
        p_io_i      => io_buffer.dat,
        p_io_sync   => io_sync.dat
    );
    

end RTL;