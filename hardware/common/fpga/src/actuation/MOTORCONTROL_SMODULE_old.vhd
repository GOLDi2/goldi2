-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		KED <kevin-etienne.drenkhahn@tu-ilmenau.de>
--
-- Create Date:		22/08/2024
-- Design Name:		Navigation driver
-- Module Name:		NAVIGATION_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation flow control and assertions
library std;
use std.standard.all;
use std.env.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;

--! @brief Navigation driver module based on Encoder positioning
--! @details
--! The module is 
--!
--!
--! ### Register:
--! | g_address | Bit 7 | Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! | +0		| target_encoder [8:0]	                                 ||||||||
--! | +1		| target_encoder [15:9]	                                 ||||||||
--! | +2        | acceleration_value [8:0]                               ||||||||

entity NAVIGATION_SMODULE is
    generic(
        g_address           :   integer := 1;       --! Module's base address
        position            :   integer := 0        --! Electromagnet time constant
    );
    port(
        --General
        clk                 : in    std_logic;      --! System clock
        rst                 : in    std_logic;      --! Asynchronous reset
        --BUS interface
        sys_bus_i           : in    sbus_in;        --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o           : out   sbus_out        --! BUS output signals [dat,tag,mux]
    );
end entity NAVIGATION_SMODULE;




--! General architecture
architecture RTL of NAVIGATION_SMODULE is

    --****INTERNAL SIGNALS****
    --Memory
    constant c_reg_default      :   data_word := (others => '0');
    signal reg_data             :   data_word;

begin

    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_UNIT
    generic map(
        g_address   => g_address,
        g_def_value => c_reg_default
    )
    port map(
        clk         => clk,
        rst         => rst,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o,
        p_data_in   => reg_data,
        p_data_out  => reg_data,
        p_read_stb  => open,
        p_write_stb => open
    );
    -----------------------------------------------------------------------------------------------


end architecture;