-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		GPIO Driver Array
-- Module Name:		GPIO_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V1.01.00 - Memory unit change
-- Additional Comments: New memory modules introduced
--
-- Revision V4.00.00 - Module renaming
-- Additional Comments: Renaming of module to follow V4.00.00 conventions.
--                      (GPIO_DRIVER_ARRAY.vhd -> GPIO_SMODULE.vhd)
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief Standard IO driver array
--! @details
--! Module contanins a list of registers to set and get the values of gpio 
--! pins. The individual pins can be configured as input or output depending 
--! on the desired function.
--!
--! #### Register structure:
--!
--! |g_address    |Bit 7  |Bit 6  |Bit 5  |Bit 4  |Bit 3  |Bit 1  |Bit 0|
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! |+0         |       |       |       |       |       |enb    |data   |
--! |+1         |       |       |       |       |       |enb    |data   |
--!
--! + enb: ['1' - output mode | '0' - input mode]
--! + data: in output mode the data bit is the value driving the pin
--!         in input mode the data bit is the value presented to the pin
--!
--! ***Latency: 1cyc***
entity GPIO_SMODULE is
    generic(
        g_address       :   natural := 1;                               --! Module's base address
        g_gpio_number   :   natural := 10                               --! Number of pins/registers
    );
    port(
        --General
        clk             : in    std_logic;                              --! System clock
        rst             : in    std_logic;                              --! Asynchronous reset
        --BUS slave interface
        sys_bus_i       : in    sbus_in;                                --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;                               --! BUS output signals [dat,tag]
        --GPIO data
        p_gpio_i_vector : in    io_i_vector(g_gpio_number-1 downto 0);  --! GPIO Input data vector
        p_gpio_o_vector : out   io_o_vector(g_gpio_number-1 downto 0)   --! GPIO Output data vector
    );
end entity GPIO_SMODULE;




--! General architecture
architecture RTL of GPIO_SMODULE is

    --****INTERNAL SIGNALS****
    --Memory
	constant reg_default	:	data_word_vector(g_gpio_number-1 downto 0) := (others => (others => '0'));			
    signal reg_data_o       :   data_word_vector(g_gpio_number-1 downto 0);
    signal reg_data_i       :   data_word_vector(g_gpio_number-1 downto 0);


begin

    --****GPIO SIGNALS****
    -----------------------------------------------------------------------------------------------
    GPIO_ROUTING : for i in 0 to g_gpio_number-1 generate
        --Route register outputs
        p_gpio_o_vector(i).enb <= reg_data_o(i)(1);
        p_gpio_o_vector(i).dat <= reg_data_o(i)(0);
        --Route register inputs
        reg_data_i(i)(7 downto 2) <= reg_data_o(i)(7 downto 2);
        reg_data_i(i)(1)          <= reg_data_o(i)(1);
        reg_data_i(i)(0)          <= reg_data_o(i)(0) when(reg_data_o(i)(1) = '1') else 
                                     p_gpio_i_vector(i).dat;
    end generate;
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE(BH)
	generic map(
		g_address		=> g_address,
		g_reg_number	=> g_gpio_number,
		g_def_values	=> reg_default
	)
	port map(
		clk				=> clk,
		rst				=> rst,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o,
		p_data_in	    => reg_data_i,
		p_data_out	    => reg_data_o,
		p_read_stb	    => open,
        p_write_stb     => open
    );
    -----------------------------------------------------------------------------------------------
    

end RTL;