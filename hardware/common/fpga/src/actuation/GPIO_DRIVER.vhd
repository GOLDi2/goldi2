-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		10/03/2023
-- Design Name:		GPIO driver unit with in/out and pwm configurations 
-- Module Name:		GPIO_DRIVER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GPIO_COMM_STANDARD.vhd
--                  -> GPIO_IO_STANDARD.vhd
--                  -> REGISTER_TABLE.vhd
--                  -> PWM_GENERATOR_UNIT.vhd
--                      
--
-- Revisions:
-- Revision V3.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief GPIO module with input/output and pwm configuration
--! @details
--! Module controls an FPGA pin to act as an inout IO pin capable
--! of reading data, writing data and generating a PWM modulated signal
--! 
--! #### Registers:
--!
--! | Address 	| Bit 7	| Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! |+0			|		|	    |       |   	|		| PWM_enb |Out_enb | Data	|
--!	|+1			| PWM[7:0]||||||||
--!
--! **Latency: 3**
entity GPIO_DRIVER is
    generic(
        ADDRESS     :   natural := 1;           --! Module's base address
        FRQ_SYSTEM  :   natural := 48000000;    --! System clock frequency in Hz
        FRQ_PWM     :   natural := 5000         --! PWM output signal frequency in Hz
    );
    port(
        --General
        clk         : in    std_logic;          --! System clock
        rst         : in    std_logic;          --! Asynchronous reset
        --BUS slave interface
        sys_bus_i   : in    sbus_in;            --! BUS input signals [we,adr,dat]
        sys_bus_o   : out   sbus_out;           --! BUS output signals [dat,val]
        --GPIO data
        gpio_in     : in    io_i;               --! GPIO input data
        gpio_out    : out   io_o                --! GPIO output data
    );
end entity GPIO_DRIVER;




--! General architecture
architecture RTL of GPIO_DRIVER is

    --****INTERNAL SIGNALS****
    --Memory
    constant memory_length  :   natural := getMemoryLength(16);
    constant reg_default    :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_data_i       :   data_word_vector(memory_length-1 downto 0);
    signal reg_data_o       :   data_word_vector(memory_length-1 downto 0);
    signal reg_write_stb    :   std_logic_vector(memory_length-1 downto 0);
    signal reg_data_i_buff  :   std_logic_vector(memory_length*SYSTEM_DATA_WIDTH-1 downto 0);
    signal reg_data_o_buff  :   std_logic_vector(memory_length*SYSTEM_DATA_WIDTH-1 downto 0);
    --PWM signals
    signal pwm_signal       :   std_logic;
    signal pwm_config_valid :   std_logic;


begin

    --****GPIO SIGNALS****
    -----------------------------------------------------------------------------------------------
    --Route register outputs
    gpio_out.enb <= reg_data_o_buff(1);
    gpio_out.dat <= pwm_signal when(reg_data_o_buff(2) = '1') else reg_data_o_buff(0);

    --Route register inputs
    reg_data_i_buff(0) <= reg_data_o_buff(0) when(reg_data_o_buff(1) = '1') else gpio_in.dat;
    reg_data_i_buff(reg_data_i_buff'high downto 1) <= reg_data_o_buff(reg_data_o_buff'high downto 1);
    -----------------------------------------------------------------------------------------------



    --****PWM GENERATOR****
    -----------------------------------------------------------------------------------------------
    PWM_SIGNAL_GENERATOR : entity work.PWM_GENERATOR_UNIT
    generic map(
        FRQ_SYSTEM      => FRQ_SYSTEM,
        FRQ_PWM         => FRQ_PWM
    )
    port map(
        clk             => clk,
        rst             => rst,
        config_word     => reg_data_o_buff(15 downto 8),
        config_valid    => pwm_config_valid,
        pwm_enb         => reg_data_o_buff(2),
        pwm_out         => pwm_signal
    );

    pwm_config_valid <= reduceRegStrobe(reg_write_stb);
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
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
        data_in             => reg_data_i,
        data_out            => reg_data_o,
        read_stb            => open,
        write_stb           => reg_write_stb 
    );

    --Typecast registers to std_logic_vectors
    reg_data_o_buff <= getMemory(reg_data_o);
    reg_data_i <= setMemory(reg_data_i_buff);
    -----------------------------------------------------------------------------------------------
end RTL;