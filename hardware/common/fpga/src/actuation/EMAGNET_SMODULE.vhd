-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Electromagnet driver - H-Bridge
-- Module Name:		EMAGNET_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V4.00.00 - Module renaming and change of reset type
-- Additional Comments: Renaming of module to follow V4.00.00 conventions.
--                      (EMAGNET_DRIVER.vhd -> EMAGNET_SMODULE.vhd)
--						Change from synchronous to asynchronous reset.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;



--! @brief Electromagnet driver module using an H-Bridge
--! @details
--! H-Bridge driver for control of an electromagnet. The module can be used
--! in a single or double channel configuration allowing the module to reduce
--! remanence effects by shortly reversing the polarity of the current. The 
--! length of that pulse can be set using the parameter "g_demag_time".
--!
--! To prevent a shortcut or overload the module first waits for the current 
--! to decrease in order to limit the inductive effects. The waiting time is
--! set by the "g_magnet_tao" paramter. 	
--!
--! #### Register:
--!
--! | g_address	| Bit 7	| Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! | +0		|		|		|		|		|		|		|		|EM_pow	|
--!
--! **Latency: 3 **
entity EMAGNET_SMODULE is
	generic(
		g_address		:	natural := 1;		--! Module's base g_address
		g_magnet_tao	:	natural := 100;		--! Electromagnet time constant
		g_demag_time	:	natural := 50 		--! Demagnetization time constant
	);
	port(
		--General
		clk				: in	std_logic;		--! System clock
		rst				: in	std_logic;		--! Asynchronous reset
		--BUS slave interface
		sys_bus_i		: in	sbus_in;		--! BUS input signals [stb,we,adr,dat,tag]
		sys_bus_o		: out	sbus_out;		--! BUS output signals [dat,tag]
		--HBridge interface
		p_em_enb		: out	io_o;			--! H-Bridge Enable
		p_em_out_1		: out	io_o;			--! H-Bridge Output 1 
		p_em_out_2		: out	io_o			--! H-Bridge Output 2
	);
end entity EMAGNET_SMODULE;




--! General architecture
architecture RTL of EMAGNET_SMODULE is
	
	--****INTERNAL SIGNALS****
	--Memory
	constant reg_default	:	data_word := (others => '0');  
	signal reg_data			:	data_word;
		alias emag_enb		:	std_logic is reg_data(0);
	--em_state machine
	type em_state is (s_idle,s_pow_on,s_pow_hold,s_pow_off);
	signal PS				:	em_state;

	
begin
	
	--****MAGNET CONTROL****
	-----------------------------------------------------------------------------------------------
	STATE_MACHINE : process(clk)
		variable counter : natural;

	begin
		if(rst = '1') then 
			PS <= s_pow_hold;
			counter := 1;
		
		elsif(rising_edge(clk)) then
			case PS is
			when s_idle =>
				if(emag_enb = '1') then
					PS <= s_pow_on;
					counter := 1;
				else
					PS <= s_idle;
					counter := 1;
				end if;

			when s_pow_on =>
				if(emag_enb = '0') then
					PS <= s_pow_hold;
					counter := 1;
				else
					PS <= s_pow_on;
					counter := 1;
				end if;

			when s_pow_hold => 
				if(counter < g_magnet_tao) then
					PS <= s_pow_hold;
					counter := counter + 1;
				else
					PS <= s_pow_off;
					counter := 1;
				end if;

			when s_pow_off =>
				if(counter < g_demag_time) then
					PS <= s_pow_off;
					counter := counter + 1;
				else 
					PS <= s_idle;
					counter := 1;
				end if;
			end case;

		end if;
	end process;

	

	OUTPUT_ROUTING : process(PS)
  	begin
		--IO configuration
		p_em_enb.enb   <= '1';
		p_em_out_1.enb <= '1';
		p_em_out_2.enb <= '1';
		
		case PS is
		when s_idle =>
			p_em_enb.dat   <= '0';
			p_em_out_1.dat <= '0';
			p_em_out_2.dat <= '0';

		when s_pow_on =>
			p_em_enb.dat   <= '1';
			p_em_out_1.dat <= '1';
			p_em_out_2.dat <= '0';

		when s_pow_hold =>
			p_em_enb.dat   <= '0';
			p_em_out_1.dat <= '0';
			p_em_out_2.dat <= '0';

		when s_pow_off =>
			p_em_enb.dat   <= '1';
			p_em_out_1.dat <= '0';
			p_em_out_2.dat <= '1';
			
		end case;
	end process;
	-----------------------------------------------------------------------------------------------

	

	--****MEMORY****
	-----------------------------------------------------------------------------------------------
	MEMORY : entity work.REGISTER_UNIT
	generic map(
		g_address	=> g_address,
		g_def_value	=> reg_default
	)
	port map(
		clk			=> clk,
		rst			=> rst,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o,
		p_data_in	=> reg_data,
		p_data_out	=> reg_data,
		p_read_stb	=> open,
		p_write_stb => open
	);
	-----------------------------------------------------------------------------------------------


end architecture;
	