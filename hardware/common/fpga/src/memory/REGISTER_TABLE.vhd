-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Customizable Register Table 
-- Module Name:		REGISTER_TABLE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
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
use work.GOLDI_COMM_STANDARD.all;



--! @brief Configurable table of registers
--! @details
--! Table of registers with configurable base address, length and 
--! initialization values. BUS interface reads the internal port input
--! data and writes to the internal output data registers while
--! also flaging the internal system of the changes through the stb signals.
--! The module uses assertions for verification of proper parameters configured
--! in the GOLDI_MODULE_CONFIG package during synthesis.
--!
--! **Latency: 1**
entity REGISTER_TABLE is
	generic(
		BASE_ADDRESS		:	natural := 1;                                 --! Base address of module
		NUMBER_REGISTERS	:	natural := 3;                                 --! Length of register table
		REG_DEFAULT_VALUES	:	data_word_vector := (x"FF",x"F0",x"0F")       --! Reset default values for registers
	);
	port(
		--General
		clk				: in	std_logic;                                      --! System clock
		rst				: in	std_logic;                                      --! Synchronous reset
		--Communication
		sys_bus_i		: in	sbus_in;                                        --! BUS input signals [we,adr,dat]
		sys_bus_o		: out	sbus_out;                                       --! BUS output signals [dat,val]
		--Internal port
		reg_data_in		: in	data_word_vector(NUMBER_REGISTERS-1 downto 0);  --! Internal port input data
		reg_data_out	: out   data_word_vector(NUMBER_REGISTERS-1 downto 0);  --! BUS port input data
		reg_data_stb	: out	std_logic_vector(NUMBER_REGISTERS-1 downto 0)   --! Strobe - data change from BUS port
	);
end entity REGISTER_TABLE;



--! General architecture
architecture RTL of REGISTER_TABLE is
    --Intermediate signals
    --Constants
    constant min_address    :   unsigned(BUS_ADDRESS_WIDTH-1 downto 0) 
							    := to_unsigned(BASE_ADDRESS,BUS_ADDRESS_WIDTH);
	constant max_address	:	unsigned(BUS_ADDRESS_WIDTH-1 downto 0)
							    := to_unsigned(BASE_ADDRESS+NUMBER_REGISTERS,BUS_ADDRESS_WIDTH);


begin

    READ_OPERATION : process(clk)
        variable reg_index  :   integer;
    begin
        if(rising_edge(clk)) then
            --Decode address
            reg_index := to_integer(unsigned(sys_bus_i.adr))-BASE_ADDRESS;

            if(rst = '1') then
                sys_bus_o.dat <= (others => '0');
                sys_bus_o.val <= '0';

            elsif((min_address <= unsigned(sys_bus_i.adr))  and
                  (unsigned(sys_bus_i.adr) < max_address)   and
                  (sys_bus_i.we = '0'))                     then            
                sys_bus_o.dat <= reg_data_in(reg_index);
                sys_bus_o.val <= '1';
            
            else
                sys_bus_o.dat <= (others => '0');
                sys_bus_o.val <= '0';
            end if;
         
        end if;
    end process;



    WRITE_OPERATION : process(clk)
        variable reg_index  :   integer;
    begin
        if(rising_edge(clk)) then
            --Decode address
            reg_index := to_integer(unsigned(sys_bus_i.adr)) - BASE_ADDRESS;
            
            if(rst = '1') then
                --Reset internal port
                reg_data_out <= REG_DEFAULT_VALUES;
                reg_data_stb <= (others => '1');

            elsif((min_address <= unsigned(sys_bus_i.adr))  and 
                  (unsigned(sys_bus_i.adr) < max_address)   and
                  (sys_bus_i.we = '1'))                     then

                --Update internal port 
                reg_data_out(reg_index) <= sys_bus_i.dat;
                reg_data_stb(reg_index) <= '1';

            else
                reg_data_stb <= (others => '0'); 
            end if;

        end if;
    end process;


end RTL;