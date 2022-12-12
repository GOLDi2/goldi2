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
-- Dependencies:	-> GOLDI_DATA_TYPES.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commit
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for synthesis
use std.standard.all;
--! Use custom library
use work.GOLDI_DATA_TYPES.all;




--! @brief
--! @details
--!
--! **Latency: 1**
entity REGISTER_TABLE is
	generic(
		BASE_ADDRESS		:	natural := 1;
		REGISTER_NUMBER		:	natural := 3;
		BUS_ADDRESS_WIDTH	:	natural := 8;
		REG_CONFIGURATION	:	reg_type_array := (BI, W, R);
		REG_DEFAULT_VALUES	:	word_8_bit_array := (x"00",x"00",x"00")
	);
	port(
		--General
		clk				: in	std_logic;
		rst				: in	std_logic;
		--Communication
		sys_bus_i		: in	bus_in;
		sys_bus_o		: out	bus_out;
		--Internal port
		reg_data_in		: in	word_8_bit_array(REGISTER_NUMBER-1 downto 0);
		reg_data_out	: out	word_8_bit_array(REGISTER_NUMBER-1 downto 0);
		reg_data_stb	: out	std_logic_vector(REGISTER_NUMBER-1 downto 0)
	);
end entity REGISTER_TABLE;




--! General architecture
architecture RTL of REGISTER_TABLE is
	
	--Intermediate signals
	--Constants
	constant min_address	:	unsigned(BUS_ADDRESS_WIDTH-1 downto 0) 
							:= to_unsigned(BASE_ADDRESS,BUS_ADDRESS_WIDTH);
	constant max_address	:	unsigned(BUS_ADDRESS_WIDTH-1 downto 0)
							:= to_unsigned(BUS_ADDRESS_WIDTH+REGISTER_NUMBER,BUS_ADDRESS_WIDTH);
	--Buffer
	signal reg_buff			:	word_8_bit_array(REGISTER_NUMBER-1 downto 0);
	signal reg_stb_buff		:	std_logic_vector(REGISTER_NUMBER-1 downto 0);
	
	
begin
	--*****************************************************************************************************************
	--Synthesis checks
	assert(BASE_ADDRESS > 0)
		report "BASE_ADDRESS out of bounds - Expecting BASE_ADDRESS > 0" severity failure;
	assert(REGISTER_NUMBER >= 1)
		report "REGISTER_NUMBER out of bounds - Expecting REGISTER_NUMBER > 1" severity failure;
	assert(REGISTER_NUMBER < 2**BUS_ADDRESS_WIDTH)
		report "sys_bus_adr_i unable to access all registers - Expecting REGISTER_NUMBER < 2**BUS_ADDRESS_WIDTH"
		severity failure;
	assert(REG_CONFIGURATION'length = REGISTER_NUMBER)
		report("REG_CONFIGURATION expects [" & integer'image(REGISTER_NUMBER) & "] elements")
		severity failure;
	assert(REG_DEFAULT_VALUES'length = REGISTER_NUMBER)
		report("REG_DEFAULT_VALUES expects [" & integer'image(REGISTER_NUMBER) & "] elements")
		severity failure;
	--*****************************************************************************************************************

	
	--Output routing
	reg_data_out <= reg_buff;
	reg_data_stb <= reg_stb_buff;
	
	
	--! Communication process
	DATA_TRANSFER : process(clk)
		--Decoding variables
		variable reg_index		:	natural;
		
	begin
		if(rising_edge(clk)) then
			if(rst = '1') then
				--Reset BUS signals
				sys_bus_o.dat <= (others => '0');
				sys_bus_o.err <= '0';
				
				--Reset register to default values
				REG_RESET : for i in 0 to REGISTER_NUMBER-1 loop
					reg_buff(i) <= REG_DEFAULT_VALUES(i);
				end loop;
				reg_stb_buff <= (others => '1');
				
				
			else
				--Register internal port values independent of BUS operation
				INTERNAL_PORT : for i in 0 to REGISTER_NUMBER-1 loop
					if((REG_CONFIGURATION(i) = R) or (REG_CONFIGURATION(i) = BI)) then
						reg_buff(i) <= reg_data_in(i);
					end if;
				end loop;
				
				
				--BUS transaction
				--Pre-set bus signals 
				sys_bus_o.dat <= (others => '0');
				sys_bus_o.err <= '0';
				reg_stb_buff  <= (others => '0');
				
				if( (min_address <= unsigned(sys_bus_i.adr)) and
					(unsigned(sys_bus_i.adr) < max_address)) then
					--Decode register
					reg_index := to_integer(unsigned(sys_bus_i.adr)) - BASE_ADDRESS;
					
					--Read/Write operation
					case sys_bus_i.we is
						when '1' =>
							if(REG_CONFIGURATION(reg_index) = R) then
								sys_bus_o.err <= '1';
							--Register data but flag stb only if diffrent to avoid constant stb pulses
							elsif(reg_buff(reg_index) /= sys_bus_i.dat) then
								reg_buff(reg_index) <=  sys_bus_i.dat;
								reg_stb_buff(reg_index) <= '1';
							else
								reg_buff(reg_index) <=  sys_bus_i.dat;
								reg_stb_buff(reg_index) <= '0';
							end if;
							
						when '0' =>
							sys_bus_o.dat <= reg_buff(reg_index);
						
						when others => null;
					end case;
				else null;
				end if;
				
			end if;
		end if;
	end process;
	
	
end RTL;