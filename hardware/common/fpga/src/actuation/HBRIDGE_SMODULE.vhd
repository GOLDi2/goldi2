-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		H-Bridge Driver Module for DC Motor control 
-- Module Name:		HBRIDGE_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
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
--                      (DC_MOTOR_DRIVER.vhd -> HBRIDGE_SMODULE.vhd)
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




--! @brief H-Bridge driver module to contorl a DC Motor
--! @details
--! The H-Bridge drives is a module originally designed to drive the L293DD H-Bridge
--! and control a two wire DC motor. Therefore the module has been designed to contorl
--! both direction and speed of movement. The module has two registers. The first 
--! selects the direction of the motor (enabling the Out1 or Out2 signals) and the 
--! second controls the pulse width modulated PWM signal that controls motor speed 
--! (ENB signal).
--!
--! The direction register uses the first two bits to enable the Out1 and Out2 singals.
--! The Bit0 selects the Out2 signal and Bit1 the Out1. If both bit are be enabled 
--! simultaneously the module disables the ENB signal to prevent damage to the H-Bridge.
--!
--! To control the movement speed the ENB signal is capable of generating a PWM signal 
--! based on a 8-bit value stored in the second register. The PWM cycle, defined by the
--! system clock multiplied by the generic parameter g_clk_factor, is divided into 255 
--! segments. The ENB signal is asserted for the signal segments smaller or equal to the
--! provided pwm value.
--!
--! *g_clk_factor = f_clk/(f_pwm*255)*
--!
--! #### Registers:
--!
--! | g_address	| Bit 7	| Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! |+0			|		|	    |       |   	|		|		|Out 1	| Out 2	|
--!	|+1			| PWM[7:0]||||||||
--!
--! **Latency: 3cyc**
entity HBRIDGE_SMODULE is
    generic(
        g_address       :   natural := 1;   --! Module's base address
        g_clk_factor    :   natural := 10   --! PWM signal frequency
    );
    port(
        --General
        clk             : in    std_logic;  --! System clock
        rst             : in    std_logic;  --! Asynchronous reset
        --BUS slave interface
        sys_bus_i       : in    sbus_in;    --! BUS port input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;   --! BUS port output signals[dat,tag]
        --HBridge interface
        p_hb_enb        : out   io_o;       --! H-Bridge enable signal
        p_hb_out_1      : out   io_o;       --! H-Bridge Output 1 signal
        p_hb_out_2      : out   io_o        --! H-Bridge Output 2 signal
    );
end entity HBRIDGE_SMODULE;




--! General architecture
architecture RTL of HBRIDGE_SMODULE is

    --****INTERNAL SIGNALS****
    --Registers
    constant reg_default    :   data_word_vector(1 downto 0) := (
      0 => std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH)),
      1 => std_logic_vector(to_unsigned(128,SYSTEM_DATA_WIDTH))  
    );

    signal reg_data         :   data_word_vector(1 downto 0);
        alias enb_out_2     :   std_logic is reg_data(0)(0);
        alias enb_out_1     :   std_logic is reg_data(0)(1);
        alias pwm_value     :   std_logic_vector(7 downto 0) is reg_data(1)(7 downto 0);
    signal reg_data_stb     :   std_logic_vector(1 downto 0);

    --Counters
    signal clk_counter      :   natural range 0 to g_clk_factor-1;
    signal pwm_counter      :   natural range 0 to 255;
    --Flag
    signal pwm_valid        :   std_logic;


begin

    --****OUTPUT ROUTING****
    -----------------------------------------------------------------------------------------------
    p_hb_enb    <= high_io_o when((pwm_valid='1') and ((enb_out_1='1') xor (enb_out_2='1'))) else
                   low_io_o;
    
    p_hb_out_1  <= high_io_o when(enb_out_1 = '1') else
                   low_io_o;
    
    p_hb_out_2  <= high_io_o when(enb_out_2 = '1') else
                   low_io_o;
    -----------------------------------------------------------------------------------------------



    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
    PWM_CYCLE_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            clk_counter <= 0;
        elsif(rising_edge(clk)) then
            --Reset counter when new data arrives to the register
            if(reg_data_stb /= (reg_data_stb'range => '0')) then
                clk_counter <= 0;
            elsif(clk_counter = g_clk_factor-1) then
                clk_counter <= 0;
            else
                clk_counter <= clk_counter + 1;
            end if;
        end if;
    end process;


    PWM_SEGMENT_GENERTOR : process(clk,rst)
    begin
        if(rst = '1') then
            pwm_counter <= 1;
        elsif(rising_edge(clk)) then
            --Counter divides the signal into 255 segments
            if(reg_data_stb /= (reg_data_stb'range => '0')) then
                pwm_counter <= 1;
            elsif((pwm_counter = 255) and (clk_counter = g_clk_factor-1)) then
                pwm_counter <= 1;
            elsif(clk_counter = g_clk_factor-1) then
                pwm_counter <= pwm_counter + 1;
            else null;
            end if;
        end if;
    end process;


    PWM_SIGNAL_GENERATOR : process(clk,rst)
    begin
        if(rst = '1') then
            pwm_valid <= '0';
        elsif(rising_edge(clk)) then
            if(pwm_counter > to_integer(unsigned(pwm_value))) then
                pwm_valid <= '0';
            else
                pwm_valid <= '1';
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => g_address,
        NUMBER_REGISTERS    => 2,
        REG_DEFAULT_VALUES  => reg_default
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o,
        data_in             => reg_data,
        data_out            => reg_data,
        read_stb            => open,
        write_stb           => reg_data_stb
    );
    -----------------------------------------------------------------------------------------------


end architecture;