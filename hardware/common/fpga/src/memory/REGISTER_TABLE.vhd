-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Customizable Register Table 
-- Module Name:		REGISTER_TABLE
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V0.01.02 - Changes to the code stye, performance and documentation
-- Additional Comments: Refactor of code to reduce code indents and complexity.
--                      Addition of module header and comments.
--                      Elimination of some module generics to introduce
--						the GOLDI_COMM_STANDARD package which sets a
--						unified standard for all communication modules
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for synthesis
use std.standard.all;
--! Use custom library
use work.GOLDI_COMM_STANDARD.all;



--! @brief Configurable table of registers
--! @details
--! Table of registers with configurable base address, length and 
--! initialization values. BUS interface reads the internal port input
--! data and writes directly to the internal outut data registers while
--! also flaging the internal system of the changes through the stb signals.
--!
--! **Latency: 1**
entity REGISTER_TABLE is
	generic(
		BASE_ADDRESS		:	natural := 1;
		NUMBER_REGISTERS	:	natural := 3;
		REG_DEFAULT_VALUES	:	data_word_vector := (x"00",x"00",x"00")
	);
	port(
		--General
		clk				: in	std_logic;
		rst				: in	std_logic;
		--Communication
		sys_bus_i		: in	bus_in;
		sys_bus_o		: out	bus_out;
		--Internal port
		reg_data_in		: in	data_word_vector(NUMBER_REGISTERS-1 downto 0);
		reg_data_out	: out   data_word_vector(NUMBER_REGISTERS-1 downto 0);
		reg_data_stb	: out	std_logic_vector(NUMBER_REGISTERS-1 downto 0)
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
    --Buffers
    signal reg_buff         :   data_word_vector(NUMBER_REGISTERS-1 downto 0);


begin
    --**Synthesis checks**
    --**
    assert(BASE_ADDRESS < 2**BUS_ADDRESS_WIDTH)
        report "Synthesis error - BASE_ADDRESS excedes BUS_ADDRESS bounds" severity failure;
    assert(NUMBER_REGISTERS < 2**BUS_ADDRESS_WIDTH)
        report "Synthesis error - Number of registers excedes BUS_ADDRESS bounds" severity failure;
    assert(BASE_ADDRESS+NUMBER_REGISTERS < 2**BUS_ADDRESS_WIDTH)
        report "Synthesis error - Selected register addresses out of bounds" severity failure;
    assert(REG_DEFAULT_VALUES'length = NUMBER_REGISTERS)
        report "Synthesis error - REG_DEFAULT_VALUES expects " & integer'image(NUMBER_REGISTERS) & " elements" 
        severity failure;
    --**



    BUS_READ_OPERATION : process(clk)
        variable reg_index  :   natural := 0;
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                sys_bus_o.dat <= (others => '0');
            
            elsif((min_address <= unsigned(sys_bus_i.adr)) and
                  (unsigned(sys_bus_i.adr) < max_address)  and
                  (sys_bus_i.we = '0')) then

                reg_index := to_integer(unsigned(sys_bus_i.adr))-BASE_ADDRESS;
                sys_bus_o.dat <= reg_buff(reg_index);

            else
                reg_index := 0;
                sys_bus_o.dat <= (others => '0');
            end if;

        end if;
    end process;


    BUS_WRITE_OPERATION : process(clk)
        variable reg_index : natural;
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then 
                --Reset internal port of register table
                reg_data_out <= REG_DEFAULT_VALUES;
                --Strobe to indicate reset of registers
                reg_data_stb <= (others => '1');

            elsif((min_address <= unsigned(sys_bus_i.adr)) and
                  (unsigned(sys_bus_i.adr) < max_address)  and
                  (sys_bus_i.we = '1')) then
                
                reg_index := to_integer(unsigned(sys_bus_i.adr))-BASE_ADDRESS;
                reg_data_out(reg_index) <= sys_bus_i.dat;
                reg_data_stb(reg_index) <= '1';
            
            else
                reg_index := 0;
                reg_data_stb <= (others => '0');
            end if;
        
        end if;
    end process;


    INTERNAL_READ_OPERATION : process(clk)
    begin
        if(rising_edge(clk)) then
            reg_buff <= reg_data_in;
        end if;
    end process;


end RTL;