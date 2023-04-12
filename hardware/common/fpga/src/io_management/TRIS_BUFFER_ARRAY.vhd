-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Tristate Output/Input Buffer Array
-- Module Name:		TRIS_BUFFER_ARRAY
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_IO_STANDARD.vhd
--                  -> TRIS_BUFFER.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_IO_STANDARD.all;


--! @brief Array of Tri-state buffers
--! @details
--! Array of Tri-state buffers for a simplified instantiation
--! and routing.
entity TRIS_BUFFER_ARRAY is
    generic(
        BUFF_NUMBER :   natural := 10                                       --! Number of buffers
    );
    port(
        --General
        clk             : in    std_logic;                                  --! System clock
        rst             : in    std_logic;                                  --! Sychronous clock
        --System In/Out
        port_out        : in    io_o_vector(BUFF_NUMBER-1 downto 0);        --! System output data vector
        port_in_async   : out    io_i_vector(BUFF_NUMBER-1 downto 0);       --! System input asynchronous data vector
        port_in_sync    : out    io_i_vector(BUFF_NUMBER-1 downto 0);       --! System input synchronous data vector
        --FPGA IO
        io_vector       : inout std_logic_vector(BUFF_NUMBER-1 downto 0)    --! FPGA Pins
    );
end entity TRIS_BUFFER_ARRAY;



--! General architecture
architecture RTL of TRIS_BUFFER_ARRAY is
begin

    BUFF_ARRAY : for i in 0 to BUFF_NUMBER-1 generate
        BUFF : entity work.TRIS_BUFFER
        port map(
            clk             => clk,
            rst             => rst,
            port_out        => port_out(i),
            port_in_async   => port_in_async(i),
            port_in_sync    => port_in_sync(i),
            io              => io_vector(i)
        );
    end generate; 


end RTL;
