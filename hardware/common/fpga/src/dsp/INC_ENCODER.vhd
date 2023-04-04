-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Incremental encoder dsp 
-- Module Name:		INC_ENCODER
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
-- Revision V0.01.00 - File Created
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
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief Incremental encoder dsp module 
--! @details
--! Incremental encoder processing unit for 3 or 2 channel sensor.
--! The module reacts to the edges of the a channel providing an impulse
--! counts per channel a edge using the b channel to determinate direction. 
--! The counter value is stored in a signed 16 bit integer. The counter 
--! values are stored in internal registers (default 8 bits) and can be 
--! access through a custom parallel BUS stucture
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
--!	| +0 		| VALUE [7:0] ||||||||
--! | +1		| VALUE [15:8] ||||||||
entity INC_ENCODER is
	generic(
		ADDRESS		:	natural := 1;			--! Module base address
		INDEX_RST	:	boolean := false		--! Reset mode [true -> 3 channels, false -> 2 channels]
	);
	port(
		--General
		clk			: in	std_logic;			--! System clock
		rst			: in	std_logic;			--! Synchronous reset
		--BUS slave interface
		sys_bus_i	: in	sbus_in;			--! BUS input signals [we,adr,dat]
		sys_bus_o	: out	sbus_out;			--! BUS output signals [dat,val]
		--3 Channel encoder signals
		channel_a	: in	io_i;				--! Channel_a input
		channel_b	: in	io_i;				--! Channel_b input
		channel_i	: in	io_i				--! Channel_i input
	);
end entity INC_ENCODER;




--General architecture
architecture RTL of INC_ENCODER is
	
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
	--Registers
	constant memory_length	:	natural := getMemoryLength(16);
	constant reg_defaults	:	data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
	signal reg_data_in		:	data_word_vector(memory_length-1 downto 0);
	--Internal decoding
	signal enc_counter_buff :	std_logic_vector(15 downto 0);
	signal enc_counter		:	integer := 0;
	signal enc_signal_a		:	std_logic_vector(1 downto 0);
	signal enc_signal_b		:	std_logic;
	signal enc_block		:	std_logic;
	
	
begin

	--Output routing
	enc_counter_buff <= std_logic_vector(to_unsigned(enc_counter,16));
	reg_data_in <= setMemory(enc_counter_buff);



	SIGNAL_DECODE : process(clk)
	begin
		if(rising_edge(clk)) then
			if(rst = '1') then
				--Reset internal buffers
				enc_counter  <= 0;
				enc_signal_a <= (others => '0');
				enc_signal_b <= '0';
				
			elsif(enc_block = '0') then
				--Buffer signals to detect rising and falling edges
				enc_signal_a <= enc_signal_a(0) & channel_a.dat;
				enc_signal_b <= channel_b.dat;
				
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
			if((rst = '1') and (INDEX_RST = true)) then
				enc_block <= '1';
			
			elsif((rst) = '1' and (INDEX_RST = false)) then
				enc_block <= '0';
				
			elsif(channel_i.dat = '1') then	
				--Unlock incremental encoder with reference pulse i
				enc_block <= '0';
		
			else null;
			end if;
		
		end if;
	end process;
	
	
	
	
	MEMORY : REGISTER_TABLE
	generic map(
		BASE_ADDRESS		=> ADDRESS,
		NUMBER_REGISTERS	=> memory_length,
		REG_DEFAULT_VALUES	=> reg_defaults
	)
	port map(
		clk				=> clk,
		rst				=> rst,
		sys_bus_i		=> sys_bus_i,
		sys_bus_o		=> sys_bus_o,
		reg_data_in		=> reg_data_in,
		reg_data_out	=> open,
		reg_data_stb	=> open
	);
	
	
end RTL;
