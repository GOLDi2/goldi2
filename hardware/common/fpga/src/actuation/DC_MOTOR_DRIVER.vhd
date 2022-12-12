-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		DC Motor Driver - H-Bridge L293DD 
-- Module Name:		DC_MOTOR_DRIVER
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Quartus Prime Lite 21.1, Lattice Diamond 3.12
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




--! @brief  DC Motor driver module for H-Bridge *L293DD* 
--! @details
--! H-Bridge driver for a DC motor with configurable registers
--! The module is capable to drive the DC motor in both directions and
--! at diffrent speeds by changin the PWM value and direction bits.
--!
--! **Latency: 4**
--! 
--! The PWM signal frequency can be configured through the CLK_FACTOR
--!
--!    *CLK_FACTOR = (f_clk/f_pwm*255)*
--!
--! #### Registers:
--!
--! | Address 	| Bit 7	| Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! |+0			|Enable	|	    |       |   	|		|		|Out 2	| Out 1	|
--!	|+1			| PWM[7:0]||||||||
entity DC_MOTOR_DRIVER is
	generic(
		ADDRESS			:	natural := 1;	--! Module base address
		CLK_FACTOR		:	natural := 10	--! Factor sets PWM frequency
	);
	port(
		--General
		clk			: in	std_logic;		--! System clock
		rst			: in	std_logic;		--! Synchronous reset
		--BUS slave interface
		sys_bus_i	: in	bus_in;			--! BUS input signals [we,adr,dat]
		sys_bus_o	: out	bus_out;		--! BUS output signals [dat,err]
		--L293DD
		DC_enb		: out 	io_o;			--! L293DD Enable
		DC_out_1	: out	io_o;			--! L293DD Output 1 
		DC_out_2	: out 	io_o;			--! L293DD Output 2
		DC_err		: out 	std_logic		--! Error. Both directions selected
	);
end entity DC_MOTOR_DRIVER;




--! General architecture
architecture RTL of DC_MOTOR_DRIVER is

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
	signal reg_data			:	word_8_bit_array(1 downto 0);
		alias pwm			:	std_logic_vector(7 downto 0) is reg_data(1);
		alias enable		:	std_logic is reg_data(0)(7);
		alias enb_pos		:	std_logic is reg_data(0)(1);
		alias enb_neg		:	std_logic is reg_data(0)(0);
	signal reg_data_stb 	:	std_logic_vector(1 downto 0);
	--PWM
	signal pwm_count_flag	:	std_logic;
	signal pwm_out_valid	:	std_logic;
	signal pwm_counter		:	natural range 0 to 256 := 0;

	
begin
	--Output routing
	DC_enb.enb 	 <= '1';
	DC_enb.z_enb <= '0';
	DC_enb.dat	 <= '1' when((pwm_out_valid = '1') and (enable = '1') and 
							 ((enb_pos = '1') xor (enb_neg = '1'))) else '0';
	
	DC_out_1.enb 	<= '1';
	DC_out_1.z_enb 	<= '0';
	DC_out_1.dat	<= '1' 	when((enable = '1') and (enb_neg = '1')) else '0';
	
	DC_out_2.enb	<= '1';
	DC_out_2.z_enb  <= '0';
	DC_out_2.dat	<= '1'	when((enable = '1') and (enb_pos = '1')) else '0';
	
	DC_err <= enb_pos and enb_neg;
	
	
	
	--! Generates PWM signal for DC_enb
	--! [Period 255/x"FF"]
	--! Recomended frequency 500Hz [CLK_FACTOR = 377]
	PWM_SIGNAL_GENERATOR : process(clk)
	begin
		if(rising_edge(clk)) then
			if((rst = '1') or (reg_data_stb /= "00") or (enable /= '1')) then
				pwm_counter <= 1;
				pwm_out_valid <= '0';
				
			elsif(pwm_count_flag = '1') then
				--Manage pwm signal counter
				if(pwm_counter = 255) then
					pwm_counter <= 1;
				else
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
			if((rst = '1') or (reg_data_stb /= "00") or (enable /= '1')) then
				counter := 0;
				pwm_count_flag <= '0';
				
			elsif(counter = CLK_FACTOR-1) then
				counter := 0;
			else
				counter := counter + 1;
			end if;
			
			--Manage pwm frequency flag
			if(counter = 0) then
				pwm_count_flag <= '1';
			else
				pwm_count_flag <= '0';
			end if;
		end if;
	end process;	
	


	--Module memory
	MEMORY : REGISTER_TABLE
	generic map(
		BASE_ADDRESS		=> ADDRESS,
		REGISTER_NUMBER		=> 2,
		BUS_ADDRESS_WIDTH	=> BUS_ADDRESS_WIDTH,
		REG_CONFIGURATION	=> (W,W),
		REG_DEFAULT_VALUES	=> (x"00",x"0F")
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
	
	
end RTL;