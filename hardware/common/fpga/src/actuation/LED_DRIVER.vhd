-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		LED Driver
-- Module Name:		LED_DRIVER
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commit
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



--! @brief Led controller module
--! @details
--! The simple led controller with blinking pattern and adjustable timing. 
--!
--!	#### Register:
--!
--! | Address	| Bit 7	| Bit 6	| Bit 5 | Bit 4	| Bit 3	| Bit 2	| Bit 1	| Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--!	| +0		| brightness | blink_enabled | delay_on ||| delay_off |||
--!
--! + brightness: [0=off, 1=on]
--! + blink_enabled: [0=disabled, 1=enabled]
--! + delay_on: [000=62.5ms, 001=187.5ms, 010=312.5ms, 011=437.5ms, 100=562.5ms, 101=687.5ms, 110=812.5ms, 111=937.5ms]
--! + delay_off: [000=62.5ms, 001=187.5ms, 010=312.5ms, 011=437.5ms, 100=562.5ms, 101=687.5ms, 110=812.5ms, 111=937.5ms]
entity LED_DRIVER is
    generic(
        ADDRESS         :   natural := 1;       --! Module's base address
        CLK_FEQUENCY    :   natural := 16;      --! Blinking pattern frequency
        INVERTED        :   boolean := false    --! Blinking pattern inverted
    );
    port(
        --General
        clk         : in    std_logic;          --! System clock
        rst         : in    std_logic;          --! Synchronous reset
        --BUS slave interface
        sys_bus_i   : in    sbus_in;            --! BUS slave input signals [we,adr,dat]
        sys_bus_o   : out   sbus_out;           --! BUS slave output signals [dat,val]
        --LED signal
        led_output  : out   io_o                --! Led power signal
    );
end entity LED_DRIVER;



--! General architecture
architecture RTL of LED_DRIVER is

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
    constant reg_default	:	data_word_vector(getMemoryLength(8)-1 downto 0)	--Use of larger constant due to problems with generics
								:= (others => (others => '0'));		
		
    --Register
    signal reg_data             :   data_word_vector(0 downto 0);
        alias led_enb           :   std_logic is reg_data(0)(7);
        alias led_blink_enb     :   std_logic is reg_data(0)(6);
        alias led_on_delay      :   std_logic_vector(2 downto 0) is reg_data(0)(5 downto 3);
        alias led_off_delay     :   std_logic_vector(2 downto 0) is reg_data(0)(2 downto 0);
    --Internal 
    constant counter_high       :   natural := CLK_FEQUENCY/16;
    signal counter              :   natural range 0 to counter_high;
    signal blink_counter        :   natural range 0 to 16;
    signal blinker_state        :   std_logic;
    signal blink_counter_enb    :   std_logic;
    signal led_state            :   std_logic;   


begin

    --Output routing
    led_state <= blinker_state when led_blink_enb = '1' else led_enb;
    led_output.enb <= '1';
    led_output.dat <= not led_state when INVERTED else led_state;



    BLINKER : process(clk) 
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                blink_counter <= 0;
                blinker_state <= '0';

            elsif(blink_counter_enb = '1') then
                if(blinker_state = '1') then
                    if(blink_counter = unsigned(led_on_delay) & '1') then
                        blink_counter <= 0;
                        blinker_state <= '0';
                    else
                        if(blink_counter = 15) then
                            blink_counter <= 0;
                        else
                            blink_counter <= blink_counter + 1;
                        end if;
                        blinker_state <= '1';
                    end if;
                
                else
                    if(blink_counter = unsigned(led_off_delay) & '1') then
                        blink_counter <= 0;
                        blinker_state <='1';
                    else
                        if(blink_counter = 15) then
                            blink_counter <= 0;
                        else
                            blink_counter <= blink_counter + 1;
                        end if;
                        blinker_state <= '0';
                    end if;
                end if;

            end if;
        end if;
    end process;


    CLK_DIVIDER : process(clk) is
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                counter <= 0;
                blink_counter_enb <= '0';
            
            elsif(counter = counter_high) then
                blink_counter_enb <= '1';
                counter <= 0;

            else
                blink_counter_enb <= '0';
                counter <= counter + 1;

            end if;
        end if;
    end process;



    MEMORY :REGISTER_TABLE
    generic map(
        BASE_ADDRESS		=> ADDRESS,
        NUMBER_REGISTERS    => getMemoryLength(8),
        REG_DEFAULT_VALUES	=> reg_default
    )
    port map(
        clk				=> clk,
        rst				=> rst,
        sys_bus_i	    => sys_bus_i,
        sys_bus_o		=> sys_bus_o,
        reg_data_in		=> reg_data,
        reg_data_out	=> reg_data,
        reg_data_stb	=> open
    );


end RTL;
