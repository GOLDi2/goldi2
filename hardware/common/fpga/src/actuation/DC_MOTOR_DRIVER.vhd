-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		DC Motor Driver - H-Bridge L293DD 
-- Module Name:		DC_MOTOR_DRIVER
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd
--					-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V0.01.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom library
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief  DC Motor driver module for H-Bridge *L293DD* 
--! @details
--! H-Bridge driver for a DC motor with configurable registers
--! The module is capable to drive the DC motor in both directions and
--! at diffrent speeds by changin the PWM value and direction bits.
--! 
--! The PWM signal frequency can be configured through the CLK_FACTOR
--!
--! *CLK_FACTOR = (f_clk/f_pwm*255)*
--!
--! #### Registers:
--!
--! | Address 	| Bit 7	| Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! |+0			|		|	    |       |   	|		|		|Out 2	| Out 1	|
--!	|+1			| PWM[7:0]||||||||
--!
--! **Latency: 3**
entity DC_MOTOR_DRIVER is
	generic(
		ADDRESS			:	natural := 1;	--! Module's base address
		CLK_FACTOR		:	natural := 10	--! PWM frequency factor
	);
	port(
		--General
		clk			: in	std_logic;		--! System clock
		rst			: in	std_logic;		--! Synchronous reset
		--BUS slave interface
		sys_bus_i	: in	sbus_in;		--! BUS input signals [we,adr,dat]
		sys_bus_o	: out	sbus_out;		--! BUS output signals [dat,val]
		--L293DD
		DC_enb		: out 	io_o;			--! L293DD Enable
		DC_out_1	: out	io_o;			--! L293DD Output 1 
		DC_out_2	: out 	io_o			--! L293DD Output 2
	);
end entity DC_MOTOR_DRIVER;




--! General architecture
architecture RTL of DC_MOTOR_DRIVER is

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
	--Constants
	constant reg_default	:	data_word_vector(1 downto 0) 
		:= (std_logic_vector(to_unsigned(128,SYSTEM_DATA_WIDTH)),
			std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH)));
	--Registers
	signal reg_data			:	data_word_vector(1 downto 0);
		alias enb_neg		:	std_logic is reg_data(0)(0);
		alias enb_pos		:	std_logic is reg_data(0)(1);
		alias pwm			:	std_logic_vector(7 downto 0) is reg_data(1)(7 downto 0);
	signal reg_data_stb 	:	std_logic_vector(1 downto 0);
	--PWM
	signal pwm_count_flag	:	std_logic;
	signal pwm_out_valid	:	std_logic;
	signal pwm_counter		:	natural range 0 to 256 := 0;

	
begin
	--Output routing
	DC_enb.enb 	 <= '1';
	DC_enb.dat	 <= '1' when((pwm_out_valid = '1') and ((enb_pos = '1') xor (enb_neg = '1'))) else '0';

	DC_out_1.enb 	<= '1';
	DC_out_1.dat	<= '1' 	when(enb_neg = '1') else '0';
	
	DC_out_2.enb	<= '1';
	DC_out_2.dat	<= '1'	when(enb_pos = '1') else '0';
	
	
	
	--! Generates PWM signal for DC_enb
	--! [Period 255/x"FF"]
	--! Recomended frequency 500Hz [CLK_FACTOR = 377]
	PWM_SIGNAL_GENERATOR : process(clk)
	begin
		if(rising_edge(clk)) then
			if((rst = '1') or (reg_data_stb /= "00")) then
				pwm_counter <= 1;
				pwm_out_valid <= '0';
				
			else
				if((pwm_count_flag = '1') and (pwm_counter = 255)) then
					pwm_counter <= 1;
				elsif(pwm_count_flag <= '1') then
					pwm_counter <= pwm_counter + 1;
				end if;
				
				--Manage pwm valid flag
				if(pwm_counter <= to_integer(unsigned(pwm))) then
					pwm_out_valid <= '1';
				else
					pwm_out_valid <= '0';
				end if;
			end if;
			
		end if;
	end process;


	--! Clock divider to provide correct PWM frequency. Reset when reg 
	--! contents change and global reset is asserted.
	CLOCK_DIVIDER : process(clk)
		variable counter : natural range 0 to CLK_FACTOR := 0;
	begin
		if(rising_edge(clk)) then
			--Manage counter value
			if((rst = '1') or (reg_data_stb /= "00")) then
				counter := 0;
				pwm_count_flag <= '0';
				
			elsif(counter = CLK_FACTOR-1) then
				counter := 0;
				pwm_count_flag <= '1';
			else
				counter := counter + 1;
				pwm_count_flag <= '0';
			end if;
		end if;
	end process;	
	


	--Module memory
	MEMORY : REGISTER_TABLE
	generic map(
		BASE_ADDRESS		=> ADDRESS,
		NUMBER_REGISTERS	=> 2,
		REG_DEFAULT_VALUES	=> reg_default
	)
	port map(
		clk				=> clk,
		rst				=> rst,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o,
		reg_data_in		=> reg_data,
		reg_data_out	=> reg_data,
		reg_data_stb	=> reg_data_stb
	);
	
	
end RTL;