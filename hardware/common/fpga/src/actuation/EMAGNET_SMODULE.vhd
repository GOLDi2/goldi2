-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Electromagnet driver - H-Bridge L293DD
-- Module Name:		EMAGNET_DRIVER
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
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;



--! @brief Electromagnet driver module for H-Bridge *L293DD*
--! @details
--! H-Bridge driver for control of an electromagnet. The module can be used
--! in a single or double channel configuration allowing the module to avoid
--! remanence effects by shortly reversing the polarity of the current. To
--! prevent a shortcut or overload the module first waits for the current 
--! to decrease in order to limit the inductive effects. 	
--!
--! #### Register:
--!
--! | Address	| Bit 7	| Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! | +0		|		|		|		|		|		|		|		|EM_pwr	|
--!
--! **Latency: 3 **
entity EMAGNET_DRIVER is
	generic(
		ADDRESS		:	natural := 1;		--! Module's base address
		MAGNET_TAO	:	natural := 100;		--! Electromagnet time constant
		DEMAG_TIME	:	natural := 50 		--! Demagnetization time constant
	);
	port(
		--General
		clk			: in	std_logic;		--! System clock
		rst			: in	std_logic;		--! Synchronous reset
		--BUS slave interface
		sys_bus_i	: in	sbus_in;		--! BUS slave input signals [we,adr,dat]
		sys_bus_o	: out	sbus_out;		--! BUS slave output signals [dat,val]
		--L293DD
		em_enb		: out	io_o;			--! L293DD Enalbe
		em_out_1	: out	io_o;			--! L293DD Output 1
		em_out_2	: out	io_o			--! L293DD Output 2
	);
end entity EMAGNET_DRIVER;




--! General architecture
architecture RTL of EMAGNET_DRIVER is
	
	--I****INTERNAL SIGNALS****
	--Memory
	constant reg_default	:	data_word := (others => '0');  
	signal reg_data			:	data_word;
		alias emag_enb		:	std_logic is reg_data(0);
	--State machine
	type STATE is (IDLE,POW_ON,POW_HOLD,POW_OFF);
	signal PS				:	STATE := IDLE;

	
begin
	
	--****MAGNET CONTROL****
	-----------------------------------------------------------------------------------------------
	STATE_MACHINE : process(clk)
		variable counter : natural;

	begin
		if(rising_edge(clk)) then
			if(rst = '1') then 
				PS <= POW_HOLD;
				counter := 1;
			
			else
				case PS is
				when IDLE =>
					if(emag_enb = '1') then
						PS <= POW_ON;
						counter := 1;
					else
						PS <= IDLE;
						counter := 1;
					end if;

				when POW_ON =>
					if(emag_enb = '0') then
						PS <= POW_HOLD;
						counter := 1;
					else
						PS <= POW_ON;
						counter := 1;
					end if;

				when POW_HOLD => 
					if(counter < MAGNET_TAO) then
						PS <= POW_HOLD;
						counter := counter + 1;
					else
						PS <= POW_OFF;
						counter := 1;
					end if;

				when POW_OFF =>
					if(counter < DEMAG_TIME) then
						PS <= POW_OFF;
						counter := counter + 1;
					else 
						PS <= IDLE;
						counter := 1;
					end if;
				end case;

			end if;
		end if;
	end process;

	

	OUTPUT_ROUTING : process(PS)
  	begin
		--IO configuration
		em_enb.enb <= '1';
		em_out_1.enb <= '1';
		em_out_2.enb <= '1';
		
		case PS is
		when IDLE =>
			em_enb.dat <= '0';
			em_out_1.dat <= '0';
			em_out_2.dat <= '0';

		when POW_ON =>
			em_enb.dat <= '1';
			em_out_1.dat <= '1';
			em_out_2.dat <= '0';

		when POW_HOLD =>
			em_enb.dat <= '0';
			em_out_1.dat <= '0';
			em_out_2.dat <= '0';

		when POW_OFF =>
			em_enb.dat <= '1';
			em_out_1.dat <= '0';
			em_out_2.dat <= '1';
			
		end case;
	end process;
	-----------------------------------------------------------------------------------------------


	

	--****MEMORY****
	-----------------------------------------------------------------------------------------------
	MEMORY : entity work.REGISTER_UNIT
	generic map(
		ADDRESS		=> ADDRESS,
		DEF_VALUE	=> reg_default
	)
	port map(
		clk			=> clk,
		rst			=> rst,
		sys_bus_i	=> sys_bus_i,
		sys_bus_o	=> sys_bus_o,
		data_in		=> reg_data,
		data_out	=> reg_data,
		read_stb	=> open,
		write_stb 	=> open
	);
	-----------------------------------------------------------------------------------------------


end architecture RTL;
	