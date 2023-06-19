-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Incremental encoder dsp 
-- Module Name:		INC_ENCODER
-- Project Name:	GOLDi_FPGA_SRC
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




--! @brief Incremental encoder dsp module 
--! @details
--! Incremental encoder processing unit for 3 or 2 channel sensor.
--! The module reacts to the edges of the a channel providing an impulse
--! counts for channel a edge using the b channel to determinate direction. 
--! The counter value is stored in a signed 16 bit integer. The counter 
--! values are stored in internal registers (default 8 bits) and can be 
--! access through a custom parallel BUS stucture
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
--!
--! **Latency:3**
entity INC_ENCODER is
	generic(
		ADDRESS		:	natural := 1;			--! Module base address
		INDEX_RST	:	boolean := false;		--! Reset mode [true -> 3 channels, false -> 2 channels]
        INVERT      :   boolean := false        --! Select positive direction [false -> CCW | true -> CC]
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




--! General architecture
architecture RTL of INC_ENCODER is 

    --****INTERNAL SIGNALS****
    --Memory
    constant memory_length  :   natural := getMemoryLength(16);
    constant reg_default    :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_data_in      :   data_word_vector(memory_length-1 downto 0);
    signal reg_data_buff    :   std_logic_vector(15 downto 0);
    --Arithmetic
    signal enc_counter      :   integer;
    signal enc_signal_a     :   std_logic_vector(1 downto 0);
    signal enc_signal_b     :   std_logic;
    signal enc_block        :   std_logic;


begin

    --****DECODER****
    -----------------------------------------------------------------------------------------------
    SIGNAL_DECODER : process(clk)
    begin
        if(rising_edge(clk)) then
            --Reset encoder and block until index channel detection
            if(rst = '1' or enc_block /= '0') then
                enc_counter  <= 0;
    
            else
                --Buffer signals to detect rising and falling
                enc_signal_a <= enc_signal_a(0) & channel_a.dat;
                enc_signal_b <= channel_b.dat;

                case enc_signal_a is
                    when "01" =>
                        if(enc_signal_b = '1' and INVERT = false) then
                            enc_counter <= enc_counter + 1;
                        elsif(enc_signal_b = '1' and INVERT = true) then
                            enc_counter <= enc_counter - 1;
                        elsif(enc_signal_b = '0' and INVERT = false) then
                            enc_counter <= enc_counter - 1;
                        elsif(enc_signal_b = '0' and INVERT = true) then
                            enc_counter <= enc_counter + 1;
                        else null; 
                        end if;
                    
                    when "10" =>
                        if(enc_signal_b = '1' and INVERT = false) then
                            enc_counter <= enc_counter - 1;
                        elsif(enc_signal_b = '1' and INVERT = true) then
                            enc_counter <= enc_counter + 1;
                        elsif(enc_signal_b = '0' and INVERT = false) then
                            enc_counter <= enc_counter + 1;
                        elsif(enc_signal_b = '0' and INVERT = true) then
                            enc_counter <= enc_counter - 1;
                        else null;
                        end if;
                    
                    when others => null;
                end case;
            
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --***RESET CONTROL****
    -----------------------------------------------------------------------------------------------
    RST_MODE_SELECTION : process(clk)
    begin
        if(rising_edge(clk)) then
            if((INDEX_RST = false)) then
                enc_block <= '0';
            
            elsif(rst = '1') then
                enc_block <= '1';
            
            elsif(channel_i.dat = '1') then
                --Unblock incremental encoder after reference channel index
                enc_block <= '0';
            
            else null;
            end if;

        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    --Typecast data
    reg_data_buff <= std_logic_vector(to_unsigned(enc_counter,16));
    reg_data_in   <= setMemory(reg_data_buff);
    
    MEMROY : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => ADDRESS,
        NUMBER_REGISTERS    => memory_length,
        REG_DEFAULT_VALUES  => reg_default
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o,
        data_in             => reg_data_in,
        data_out            => open,
        read_stb            => open,
        write_stb           => open
    );
    -----------------------------------------------------------------------------------------------


end RTL;