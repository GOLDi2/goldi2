-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		GPIO Driver - Array
-- Module Name:		GPIO_DRIVER_ARRAY
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> REGISTER_TABLE.vhd
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
--! Use custom libraries
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief Standard IO driver
--! @details
--! Module contanins a list of registers to set the values of 
--! gpio pins. The individual pins can be configured as input or output
--! depending on the desired function.
--!
--! #### Register structure:
--!
--! |Address    |Bit 7  |Bit 6  |Bit 5  |Bit 4  |Bit 3  |Bit 1  |Bit 0  |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! |+0         |       |       |       |       |enb    |data_o |data_i |
--!
--! + enb: [1 - output mode | 0 - input mode]
--! + data_o: write only value - sets output value when output mode selected
--! + data_i: read only value - input data in input mode output data in output mode
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

    --Components
    component REGISTER_TABLE
        generic(
            BASE_ADDRESS		:	natural;
            NUMBER_REGISTERS	:	natural;
            REG_DEFAULT_VALUES	:	data_word_vector
        );
        port(
            clk				: in	std_logic;
            rst				: in	std_logic;
            sys_bus_i		: in	sbus_in;
            sys_bus_o		: out	sbus_out;
            reg_data_in		: in	data_word_vector(NUMBER_REGISTERS-1 downto 0);
            reg_data_out	: out   data_word_vector(NUMBER_REGISTERS-1 downto 0);
            reg_data_stb	: out	std_logic_vector(NUMBER_REGISTERS-1 downto 0)
        );
    end component;


    --Intermediate signals
    --Constant
	constant reg_default	:	data_word_vector(GPIO_NUMBER-1 downto 0)	--Use of larger constant due to problems with generics
		:= (others => (others => '0'));			
	--Registers
    signal reg_data_o   :   data_word_vector(GPIO_NUMBER-1 downto 0);
    signal reg_data_i   :   data_word_vector(GPIO_NUMBER-1 downto 0);


begin

    GPIO_ROUTING : for i in 0 to GPIO_NUMBER-1 generate
        reg_data_i(i)(0)  <= gpio_i_vector(i).dat;
        reg_data_i(i)(1)  <= reg_data_o(i)(1);
		reg_data_i(i)(2)  <= reg_data_o(i)(2);
		reg_data_i(i)(7 downto 3) <= (others => '0');
		gpio_o_vector(i).enb <= reg_data_o(i)(2);
        gpio_o_vector(i).dat <= reg_data_o(i)(1);
    end generate;



    MEMORY : REGISTER_TABLE
	generic map(
		BASE_ADDRESS		=> ADDRESS,
		NUMBER_REGISTERS	=> GPIO_NUMBER,
		REG_DEFAULT_VALUES	=> reg_default
	)
	port map(
		clk				=> clk,
		rst				=> rst,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o,
		reg_data_in		=> reg_data_i,
		reg_data_out	=> reg_data_o,
		reg_data_stb	=> open
	);

    
end RTL;