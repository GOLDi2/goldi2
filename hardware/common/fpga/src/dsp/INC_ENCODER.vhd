-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/01/2022
-- Design Name:		Incremental encoder dsp 
-- Module Name:		INC_ENCODER
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




--! @brief Incremental encoder driver module 
--! @details
--! Incremental encoder processing unit for a 3 channel sensor.
--! The module reacts to the edges of the a channel providing 2*impulse
--! counts using the b channel to determinate direction. The counter 
--! value is stored in a signed 16 bit integer. The counter values are
--! stored in internal registers and can be access through a custom
--! parallel BUS stucture
--! 
--! **Latency:3**
--!
--! The reset signal returns the registers to x"00" [counter = 0] and
--! sets the driver to an idle state that waits for the index signal 
--! to restart normal operation. This provides a fix reference point.
--!
--! #### Registers: 
--!
--! | Address	| Bit 7	| Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! | +0		|Enable |       |       |       |       |       |       |rst_mode|
--!	| +1 		| VALUE [7:0] ||||||||
--! | +2		| VALUE [15:8] ||||||||
entity INC_ENCODER is
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
		--3 Channel encoder signals
		channel_a	: in	std_logic;
		channel_b	: in	std_logic;
		channel_i	: in	std_logic
	);
end entity INC_ENCODER;




--General architecture
architecture RTL of INC_ENCODER is
	
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
	--Registers
	signal reg_data_out		:	word_8_bit_array(2 downto 0); 
		alias enable		:	std_logic is reg_data_out(0)(7);
		alias rst_mode		:	std_logic is reg_data_out(0)(1);
	signal reg_data_in		:	word_8_bit_array(2 downto 0);
		alias low_byte		:	std_logic_vector(7 downto 0) is reg_data_in(1);
		alias high_byte 	:	std_logic_vector(7 downto 0) is reg_data_in(2);
	signal reg_data_stb 	:	std_logic_vector(2 downto 0);
	--Internal decoding
	signal enc_counter_buff :	std_logic_vector(15 downto 0);
	signal enc_counter		:	integer := 0;
	signal enc_signal_a		:	std_logic_vector(1 downto 0);
	signal enc_signal_b		:	std_logic;
	signal enc_block		:	std_logic;
	
	
begin

	--Output routing
	enc_counter_buff <= std_logic_vector(to_unsigned(enc_counter,16));
	low_byte  <= enc_counter_buff(7 downto 0);
	high_byte <= enc_counter_buff(15 downto 8);



	SIGNAL_DECODE : process(clk)
	begin
		if(rising_edge(clk)) then
			if(rst = '1' or reg_data_stb(0) /= '0') then
				--Reset internal buffers
				enc_counter  <= 0;
				enc_signal_a <= (others => '0');
				enc_signal_b <= '0';
				
			elsif(enc_block = '0' and enable = '1') then
				--Buffer signals to detect rising and falling edges
				enc_signal_a <= enc_signal_a(0) & channel_a;
				enc_signal_b <= channel_b;
				
				case enc_signal_a is
					when "01" =>
						if(enc_signal_b = '1') then
							enc_counter <= enc_counter + 1;
						else
							enc_counter <= enc_counter - 1;
						end if;
						
					when "10" =>
						if(enc_signal_b = '1') then
							enc_counter <= enc_counter + 1;
						else
							enc_counter <= enc_counter - 1;
						end if;
						
					when others => null;
				end case;
			
			else
				--Ignore encoder movement when encoder blocked or disabled
				enc_counter  <= 0;
				enc_signal_a <= (others => '0');
				enc_signal_b <= '0';
			
			end if;
			
		end if;
	end process;
	
	
	RST_MODE_SELECTION : process(clk)
	begin
		if(rising_edge(clk)) then
			if(rst = '1' and rst_mode = '1') then
				enc_block <= '1';
			
			elsif(rst = '1' and rst_mode /= '1') then
				enc_block <= '0';
				
			elsif(enable = '1' and channel_i = '1') then	
				--Unlock incremental encoder with reference pulse i
				enc_block <= '0';
		
			else null;
			end if;
		
		end if;
	end process;
	
	
	
	
	MEMORY : REGISTER_TABLE
	generic map(
		BASE_ADDRESS		=> ADDRESS,
		REGISTER_NUMBER		=> 3,
		BUS_ADDRESS_WIDTH	=> BUS_ADDRESS_WIDTH,
		REG_CONFIGURATION	=> (W,R,R),
		REG_DEFAULT_VALUES	=> (x"00",x"00",x"00")
	)
	port map(
		clk				=> clk,
		rst				=> rst,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o,
		reg_data_in		=> reg_data_in,
		reg_data_out	=> reg_data_out,
		reg_data_stb	=> reg_data_stb
	);
	
	
end RTL;
