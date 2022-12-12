-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Electromagnet driver - H-Bridge L293DD [onesided]
-- Module Name:		EMAGNET_DRIVER_AP1
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_DATA_TYPES.vhd
--					-> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom library
use work.GOLDI_DATA_TYPES.all;




--! @brief Electromagnet driver module for H-Bridge *L293DD*
--! @details
--! Simple H-Bridge driver for an electromotor motor. Uses only onesided
--! channel of the H-Bridge to activate the electromotor. 	
--!
--! **Latency: 1 **
--!
--! #### Register:
--!
--! | Address	| Bit 7	| Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! | +0		|Enable |		|		|		|		|		|		|EM_pwr	|
entity EMAGNET_DRIVER_AP1 is
	generic(
		ADDRESS		:	natural := 1
	);
	port(
		--General
		clk			: in	std_logic;
		rst			: in	std_logic;
		--BUS slave interface
		sys_bus_i	: in	bus_in;
		sys_bus_o	: out	bus_out;
		--L293DD
		EM_enb		: out	io_o;
		EM_out_1	: out	io_o
	);
end entity EMAGNET_DRIVER_AP1;




--! General architecture
architecture RTL of EMAGNET_DRIVER_AP1 is
	
	--Components
	component REGISTER_TABLE
		generic(
			BASE_ADDRESS		:	natural;
			REGISTER_NUMBER		:	natural;
			BUS_ADDRESS_WIDTH	:	natural;
			REG_CONFIGURATION	:	reg_type_array;
			REG_DEFAULT_VALUES	:	word_8_bit_array
		);
		port(
			clk				: in	std_logic;
			rst				: in	std_logic;
			sys_bus_i		: in	bus_in;
			sys_bus_o		: out	bus_out;
			reg_data_in		: in	word_8_bit_array(REGISTER_NUMBER-1 downto 0);
			reg_data_out	: out	word_8_bit_array(REGISTER_NUMBER-1 downto 0);
			reg_data_stb	: out	std_logic_vector(REGISTER_NUMBER-1 downto 0)
		);
	end component;
	
	
	--Intermediate signals
	constant reg_type		:	reg_type_array(0 downto 0) := (others => W);
	constant reg_default	:	word_8_bit_array(0 downto 0) := (others => x"00");
	signal reg_data			:	word_8_bit_array(0 downto 0);
		alias enable		:	std_logic is reg_data(0)(7);
		alias enb_mag		:	std_logic is reg_data(0)(0);
	signal reg_data_stb 	:	std_logic_vector(0 downto 0);
	
	
begin
	
	--Output routing
	EM_enb.enb   <= '1';
	EM_enb.z_enb <= '0';
	EM_enb.dat	 <= enb_mag when(enable = '1') else '0';
	
	EM_out_1.enb   <= '1';
	EM_out_1.z_enb <= '0';
	EM_out_1.dat   <= enb_mag when(enable = '1') else '0';
	
	
	
	--Module memory
	MEMORY : REGISTER_TABLE
	generic map(
		BASE_ADDRESS		=> ADDRESS,
		REGISTER_NUMBER		=> 1,
		BUS_ADDRESS_WIDTH	=> BUS_ADDRESS_WIDTH,
		REG_CONFIGURATION	=> reg_type,
		REG_DEFAULT_VALUES	=> reg_default
	)
	port map(
		clk				=> clk,
		rst				=> rst,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o,
		reg_data_in		=> (others => (others => '0')),
		reg_data_out	=> reg_data,
		reg_data_stb	=> reg_data_stb
	);

end architecture RTL;
	