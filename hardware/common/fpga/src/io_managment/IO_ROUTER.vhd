-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmai.com>
--
-- Create Date:		15/12/2022
-- Design Name:		IO configurable router 
-- Module Name:		IO_ROUTER
-- Project Name:	GOLDIi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> IO_ROUTER_CONFIGURATION.vhd
--					-> DATA_TYPES.vhd
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
--! Use custom libraries
use work.GOLDI_DATA_TYPES.all;
use work.IO_ROUTER_CONFIGURATION.all;




--! @brief
--! @details
--!
entity IO_ROUTER is
	generic(
		LAYOUT_INDEX		:	natural := 0	
	);
	port(
		--General
		clk				: in	std_logic;
		rst				: in	std_logic;
		layout_valid	: out	std_logic;
		--Communication
		config_bus_i	: in 	bus_in;
		config_bus_o	: out	bus_out;
		--System interface io's
		sys_io_dat_i	: out	io_i_array((2**SYS_IO_ADDRESS_WIDTH)-1 downto 0);
		sys_io_dat_o	: in	io_o_array((2**SYS_IO_ADDRESS_WIDTH)-1 downto 0);
		--Pin interface io'select
		pin_io_dat_i	: in 	io_i_array(PIN_IO_NUMBER-1 downto 0);
		pin_io_dat_o	: out	io_o_array(PIN_IO_NUMBER-1 downto 0)
	);
end entity IO_ROUTER;




--! General architecture
architecture RTL of IO_ROUTER is
	
	--Intermediate signals
	--RAM
	signal ram_pin_layout_buff	:	pin_io_layout_table(1 downto 0);
	signal ram_sys_layout_buff	:	sys_io_layout_table(1 downto 0);
	--Flags
	signal layout_blocked		:	natural range 0 to 1;
	signal layout_valid_buff	:	std_logic_vector(1 downto 0);
	--constant io values
	constant empty_io_o			:	io_o := (
		enb   => '0',
		dat   => '0',
		z_enb => '0'
	);
	constant empty_io_i			:	io_i := (
		dat => '0'
	);
	
	
begin
	--*****************************************************************************************************************
	--Synthesis checks
	assert(BUS_DATA_WIDTH >= SYS_IO_ADDRESS_WIDTH)
		report("BUS unable to address full IO_ROUTER memory - expecting BUS_DATA_WIDTH >= SYS_IO_ADDRESS_WIDTH")
		severity failure;
	assert(PIN_IO_NUMBER <= ((2**PIN_IO_ADDRESS_WIDTH)-1))
		report "IO_ROUTER can not manage all fpga pins - expecting PIN_IO_NUMBER <= max(val(PIN_IO_ADDRESS_WIDTH)-1)"
		severity failure;
	--*****************************************************************************************************************
	
	
	
	--Asynchronous system routing
	--Flags
	layout_valid <= layout_valid_buff(1) or layout_valid_buff(0);
	
	--IO
	ROUTING_OUTPUT : for i in 0 to PIN_IO_NUMBER-1 generate
		with ram_pin_layout_buff(layout_blocked)(i) select
			pin_io_dat_o(i)	<= 	empty_io_o when (ram_pin_layout_buff(layout_blocked)(i)'range => '0'),
								empty_io_o when (ram_pin_layout_buff(layout_blocked)(i)'range => 'U'),			--Line added for simulation
								sys_io_dat_o(to_integer(unsigned(ram_pin_layout_buff(layout_blocked)(i))))
								when others;
	end generate;
	
	ROUTING_INPUT : for i in 0 to (2**SYS_IO_ADDRESS_WIDTH)-1 generate
		with ram_sys_layout_buff(layout_blocked)(i) select
			sys_io_dat_i(i)	<=	empty_io_i when (ram_sys_layout_buff(layout_blocked)(i)'range => '0'),
								empty_io_i when (ram_sys_layout_buff(layout_blocked)(i)'range => 'U'),			--Line added for simulation
								pin_io_dat_i(to_integer(unsigned(ram_sys_layout_buff(layout_blocked)(i))))
								when others;
	end generate;
	
	
	
	
	--Synchonous system communication
	CUSTOM_PIN_LAYOUT_UPDATE : process(clk)
	begin
		if(rising_edge(clk)) then
			if(layout_blocked /= 0) then
				--Block bus
				config_bus_o.dat <= (others => '0');
				config_bus_o.err <= '1';
				layout_valid_buff(0) <= '0';
				
			elsif(rst = '1') then
				--Reset pin and system ram and disconnect all pins
				ram_pin_layout_buff(0) <= (others => (others => '0'));
				ram_sys_layout_buff(0) <= (others => (others => '0'));
				--Reset bus
				config_bus_o.dat <= (others => '0');
				config_bus_o.err <= '0';
				--Flags
				layout_valid_buff(0) <= '0';
				
			elsif((to_integer(unsigned(config_bus_i.adr)) > 1) and
				  (to_integer(unsigned(config_bus_i.adr)) < PIN_IO_NUMBER + 2)) then
				--Flags
				layout_valid_buff(0) <= '1';
				
				--Set new pin based on the bus data value
				--Physical pin layout
				ram_pin_layout_buff(0)(to_integer(unsigned(config_bus_i.adr))-2)
					<= 	config_bus_i.dat(SYS_IO_ADDRESS_WIDTH-1 downto 0);
				--System pin layout
				ram_sys_layout_buff(0)(to_integer(unsigned(config_bus_i.dat)))	
					<= 	std_logic_vector(unsigned(config_bus_i.adr(PIN_IO_ADDRESS_WIDTH-1 downto 0)) -
						to_unsigned(2,PIN_IO_ADDRESS_WIDTH));
					
				--Return value of old pin_layout
				config_bus_o.dat <= (config_bus_o.dat'left downto PIN_IO_ADDRESS_WIDTH+1 => '0')
									& ram_pin_layout_buff(0)(to_integer(unsigned(config_bus_i.adr))-2);
				config_bus_o.err <= '0';
				
			else
				--Clear bus
				config_bus_o.dat <= (others => '0');
				config_bus_o.err <= '0';
				
			end if;				
		end if;
	end process;
	
	
	
	--Pin layout selection
	PIN_IO_LAYOUT_SELECTION : process(clk)
	begin
		if(rising_edge(clk)) then
			if(LAYOUT_INDEX = 0) then
				layout_blocked 		 <=  0;
				layout_valid_buff(1) <= '0';
				
				ram_pin_layout_buff(1) <= (others => (others =>'0'));
				ram_sys_layout_buff(1) <= (others => (others =>'0'));
				
			else
				--Load pre-set user physical pin layout from ROM
				ram_pin_layout_buff(1) <= LAYOUT_ROM(LAYOUT_INDEX); 
				
				--Load pre-set user system pin layout from ROM
				for i in 0 to (2**SYS_IO_ADDRESS_WIDTH)-1 loop
					--Pre-set the register to unconected
					ram_sys_layout_buff(1)(i) <= (others => '0');
					--Invert ROM matrix
					for j in 2 to PIN_IO_NUMBER+1 loop
						if(i = to_integer(unsigned(LAYOUT_ROM(LAYOUT_INDEX)(j)))) then
							ram_sys_layout_buff(1)(i) <= std_logic_vector(to_unsigned(j,PIN_IO_ADDRESS_WIDTH));
							exit;
						end if;
					end loop;
				end loop;
				
				--Disable registering of BUS data
				layout_blocked		 <=  1;
				layout_valid_buff(1) <= '1';
			
			end if;
		end if;
	end process;
	

end RTL;
