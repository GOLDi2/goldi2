-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		10/05/2023
-- Design Name:		PWM generator module for use in other modules 
-- Module Name:		PWM_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GODLI_IO_STANDARD.vhd
--
-- Revisions:
-- Revision V3.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V4.00.00 - Module renaming
-- Additional Comments: Renaming of module to follow V4.00.00 naming convetion
--                      (PWM_GENERATOR_UNIT.vhd -> PWM_SMODULE.vhd)
-------------------------------------------------------------------------------
--! Use standard libary
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief PWM signal generator
--! @details
--! Module generates a PWM signal based on the 8-bit value stored in the 
--! module's register. The signal period is divided into  255 segments. 
--! The configuration word in the module's memory corresponds with the 
--! number of segments for which the signal is asserted.
--!
--! **Latency: 3cyc** 
entity PWM_SMODULE is
    generic(
        g_address       :   integer := 1;
        g_sys_freq      :   natural := 100000000;   --! System clock frequency in Hz
        g_pwm_freq      :   natural := 5000         --! PWM output signal frequency in Hz
    );
    port(
        --General
        clk             : in    std_logic;          --! System clock
        rst             : in    std_logic;          --! Asynchronous reset
        --BUS slave interface 
        sys_bus_i       : in    sbus_in;            --! BUS slave input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;           --! BUS slave output signals [dat,tag]
        --PWM signal
        p_pwm_output    : out   io_o                --! PWM signal
    );
end entity PWM_SMODULE;




--! General architecture
architecture RTL of PWM_SMODULE is

    --****INTERNAL SIGNALS****
    constant c_pwm_period   :   natural := (g_sys_freq/(g_pwm_freq*255))-1;    
    --Memory 
    constant reg_default    :   data_word := (others => '0');   
    signal pwm_word         :   data_word;
    signal pwm_stb          :   std_logic;
    --Counters
    signal clk_counter      :   unsigned(15 downto 0);
    signal pwm_counter      :   unsigned(7 downto 0);


begin

    --****SIGNAL GENERATOR****
    -----------------------------------------------------------------------------------------------
    PWM_PERIOD_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            clk_counter <= to_unsigned(0,clk_counter'length);
        elsif(rising_edge(clk)) then
            if(pwm_stb = '1') then
                clk_counter <= to_unsigned(0,clk_counter'length);
            elsif(clk_counter = to_unsigned(c_pwm_period,clk_counter'length)) then
                clk_counter <= to_unsigned(0,clk_counter'length);
            else
                clk_counter <= clk_counter + 1; 
            end if;
        end if;
    end process;

    
    PWM_FRACTION_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            pwm_counter      <= to_unsigned(1,pwm_counter'length);
            p_pwm_output.dat <= '0';

        elsif(rising_edge(clk)) then
            --Counter divides the signal into 255 segments to assert as high or low
            if(pwm_stb = '1') then
                pwm_counter <= to_unsigned(1,pwm_counter'length);
            elsif(pwm_counter = 255 and clk_counter = c_pwm_period) then
                pwm_counter <= to_unsigned(1,pwm_counter'length);
            elsif(clk_counter = c_pwm_period) then
                pwm_counter <= pwm_counter + 1;
            end if;

            --Control pwm active ratio
            if(pwm_counter > unsigned(pwm_word(7 downto 0))) then
                p_pwm_output.dat <= '0';
            else
                p_pwm_output.dat <= '1';
            end if;
        end if;

    end process;

    --Configure IO to output
    p_pwm_output.enb <= '1';
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_UNIT
    generic map(
        ADDRESS     => g_address,
        DEF_VALUE   => reg_default
    )
    port map(
        clk         => clk,
        rst         => rst,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o,
        data_in     => pwm_word,
        data_out    => pwm_word,
        read_stb    => open,
        write_stb   => pwm_stb
    );
    -----------------------------------------------------------------------------------------------


end RTL;