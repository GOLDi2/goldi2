-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		GPIO Driver Array
-- Module Name:		GPIO_DRIVER_ARRAY
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
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief Standard IO driver array
--! @details
--! Module contanins a list of registers to set the values of 
--! gpio pins. The individual pins can be configured as input or output
--! depending on the desired function.
--!
--! #### Register structure:
--!
--! |Address    |Bit 7  |Bit 6  |Bit 5  |Bit 4  |Bit 3  |Bit 1  |Bit 0  |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! |+0         |       |       |       |       |       |enb    |data   |
--!
--! + enb: [1 - output mode | 0 - input mode]
--! + data: output value when output mode selected;
--!         input value when input mode selected
--!
--! **Latency: 1cyl**
entity GPIO_DRIVER_ARRAY is
    generic(
        ADDRESS         :   natural := 1;                               --! Module's base address
        GPIO_NUMBER     :   natural := 10                               --! Number of pins/registers
    );
    port(
        --General
        clk             : in    std_logic;                              --! System clock
        rst             : in    std_logic;                              --! Synchronous reset
        --BUS slave interface
        sys_bus_i       : in    sbus_in;                                --! BUS slave input signals [we,adr,dat]
        sys_bus_o       : out   sbus_out;                               --! BUS slave output signals [dat,val]
        --GPIO data
        gpio_i_vector   : in    io_i_vector(GPIO_NUMBER-1 downto 0);    --! Input data vector
        gpio_o_vector   : out   io_o_vector(GPIO_NUMBER-1 downto 0)     --! Output data vector
    );
end entity GPIO_DRIVER_ARRAY;




--! General architecture
architecture RTL of GPIO_DRIVER_ARRAY is

    --****INTERNAL SIGNALS****
    --Memory
	constant reg_default	:	data_word_vector(GPIO_NUMBER-1 downto 0) := (others => (others => '0'));			
    signal reg_data_o   :   data_word_vector(GPIO_NUMBER-1 downto 0);
    signal reg_data_i   :   data_word_vector(GPIO_NUMBER-1 downto 0);


begin

    --****GPIO SIGNALS****
    -----------------------------------------------------------------------------------------------
    GPIO_ROUTING : for i in 0 to GPIO_NUMBER-1 generate
        --Route register outputs
        gpio_o_vector(i).enb <= reg_data_o(i)(1);
        gpio_o_vector(i).dat <= reg_data_o(i)(0);
        --Route register inputs
        reg_data_i(i)(7 downto 2) <= reg_data_o(i)(7 downto 2);
        reg_data_i(i)(1) <= reg_data_o(i)(1);
        reg_data_i(i)(0) <= reg_data_o(i)(0) when(reg_data_o(i)(1) = '1') else 
                            gpio_i_vector(i).dat;
    end generate;
    -----------------------------------------------------------------------------------------------




    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE(EXPERIMENTAL)
	generic map(
		BASE_ADDRESS		=> ADDRESS,
		NUMBER_REGISTERS	=> GPIO_NUMBER,
		REG_DEFAULT_VALUES	=> reg_default
	)
	port map(
		clk				    => clk,
		rst				    => rst,
		sys_bus_i		    => sys_bus_i,
		sys_bus_o		    => sys_bus_o,
		data_in		        => reg_data_i,
		data_out	        => reg_data_o,
		read_stb	        => open,
        write_stb           => open
    );
    -----------------------------------------------------------------------------------------------
    
end RTL;