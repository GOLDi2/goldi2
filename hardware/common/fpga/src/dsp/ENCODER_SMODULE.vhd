-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Incremental encoder dsp 
-- Module Name:		INC_ENCODER
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
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V4.00.00 - Module renaming and change of reset type
-- Additional Comments: Renaming of module to follow V4.00.00 conventions.
--                      (INC_ENCODER.vhd -> ENCODER_SMODULE.vhd)
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




--! @brief Incremental encoder dsp module 
--! @details
--! Incremental encoder processing unit for 3 or 2 channel sensor. The module
--! reacts to the data of the a channel providing an impulse counts for 
--! "p_channel_a" edges using the "p_channel_b" to determine the movement 
--! direction. The counter value is stored in a unsigned 16 bit data word and 
--! then stored in the internal registers. The data can be accessed through 
--! the GOLDi BUS interface. The parameter "g_address" is the base address of 
--! the module i.e. the address of the data word or, in the case of a 
--! SYSTEM_DATA_WIDTH value smaller than 16, the lower bits of the data.
--!
--! The parameter "g_invert" selects the direction of the positive axis of
--! rotation. By setting the parameter to true the moduel increases the counter
--! when the encoder is rotated in the clockwise direction. A rising edge on the
--! "p_channel_a" and a high state in the "p_channel_b" increase the counter. If
--! the parameter is set to false this behaviour is inverted an the counter
--! clockwise movement produces an increment in the module's counter. A rising
--! edge on the "p_channel_a" and a low state in the "p_channel_b" increase the
--! counter.
--!
--! g_invert = false 
--! -> [channel_a: 01 | channel_b: '0'] counter --
--! -> [channel_a: 01 | channel_b: '1'] counter ++
--! -> [channel_a: 10 | channel_b: '0'] counter ++
--! -> [channel_a: 10 | channel_b: '1'] counter --
--! 
--! g_invert = true
--! -> [channel_a: 01 | channel_b: '0'] counter ++
--! -> [channel_a: 01 | channel_b: '1'] counter --
--! -> [channel_a: 10 | channel_b: '0'] counter --
--! -> [channel_a: 10 | channel_b: '1'] counter ++
--!
--! When the "g_index_rst" is set to true the assertion of the reset signal
--! returns the registers to the value x"00" [counter = 0] and sets the driver 
--! in an idle state that holds until the index signal is asserted to restart 
--! the normal operation of the module. This provides a fix reference point.
--!
--! #### Registers: 
--!
--! SYSTEM_DATA_WIDTH = 8
--!
--! | Address	| Bit 7	| Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--!	| +0 		| VALUE [7:0] ||||||||
--! | +1		| VALUE [15:8] ||||||||
--!
--! **Latency:3**
entity ENCODER_SMODULE is
	generic(
		g_address	:	natural := 1;			--! Module's base address
		g_index_rst	:	boolean := false;		--! Reset mode [true -> 3 channels, false -> 2 channels]
        g_invert    :   boolean := false        --! Select positive direction [false -> CCW | true -> CC]
    );
	port(
		--General
		clk			: in	std_logic;			--! System clock
		rst			: in	std_logic;			--! Asynchronous reset
		--BUS slave interface
		sys_bus_i	: in	sbus_in;			--! BUS input signals [stb,we,adr,dat,tag]
		sys_bus_o	: out	sbus_out;			--! BUS output signals [dat,tag,mux]
		--3 Channel encoder signals
		p_channel_a	: in	io_i;				--! Channel_a input
		p_channel_b	: in	io_i;				--! Channel_b input
		p_channel_i	: in	io_i				--! Channel_i input
	);
end entity ENCODER_SMODULE;




--! General architecture
architecture RTL of ENCODER_SMODULE is 

    --****INTERNAL SIGNALS****
    --Memory
    constant memory_length  :   natural := getMemoryLength(16);
    constant c_reg_default  :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_data_in      :   data_word_vector(memory_length-1 downto 0);
    signal reg_data_buff    :   std_logic_vector(15 downto 0);
    --Arithmetic
    signal enc_counter      :   unsigned(15 downto 0);
    signal enc_signal_a     :   std_logic_vector(1 downto 0);
    signal enc_signal_b     :   std_logic;
    signal enc_block        :   std_logic;


begin

    --****DECODER****
    -----------------------------------------------------------------------------------------------
    SIGNAL_DECODER : process(clk,rst)
    begin
        if(rst = '1') then
            enc_counter  <= (others => '0');
            enc_signal_a <= (others => '0');
            enc_signal_b <= '0';

        elsif(rising_edge(clk)) then
            --After reset block until index channel detection
            if(enc_block = '0') then

                --Buffer signals to detect rising and falling
                enc_signal_a <= enc_signal_a(0) & p_channel_a.dat;
                enc_signal_b <= p_channel_b.dat;

                case enc_signal_a is
                    when "01" =>
                        if(enc_signal_b = '1' and g_invert = false) then
                            enc_counter <= enc_counter + 1;
                        elsif(enc_signal_b = '1' and g_invert = true) then
                            enc_counter <= enc_counter - 1;
                        elsif(enc_signal_b = '0' and g_invert = false) then
                            enc_counter <= enc_counter - 1;
                        elsif(enc_signal_b = '0' and g_invert = true) then
                            enc_counter <= enc_counter + 1;
                        else null; 
                        end if;
                    
                    when "10" =>
                        if(enc_signal_b = '1' and g_invert = false) then
                            enc_counter <= enc_counter - 1;
                        elsif(enc_signal_b = '1' and g_invert = true) then
                            enc_counter <= enc_counter + 1;
                        elsif(enc_signal_b = '0' and g_invert = false) then
                            enc_counter <= enc_counter + 1;
                        elsif(enc_signal_b = '0' and g_invert = true) then
                            enc_counter <= enc_counter - 1;
                        else null;
                        end if;
                    
                    when others => null;
                end case;

            else null;            
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --***RESET CONTROL****
    -----------------------------------------------------------------------------------------------
    RST_MODE_SELECTION : process(clk,rst)
    begin
        if(rst = '1' and g_index_rst = false) then
            enc_block <= '0';
        elsif(rst = '1' and g_index_rst = true) then
            enc_block <= '1';
        elsif(rising_edge(clk)) then
            if(p_channel_i.dat = '1') then
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
    reg_data_buff <= std_logic_vector(enc_counter);
    reg_data_in   <= setMemory(reg_data_buff);
    
    MEMROY : entity work.REGISTER_TABLE
    generic map(
        g_address       => g_address,
        g_reg_number    => memory_length,
        g_def_values    => c_reg_default
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_data_in       => reg_data_in,
        p_data_out      => open,
        p_read_stb      => open,
        p_write_stb     => open
    );
    -----------------------------------------------------------------------------------------------


end RTL;