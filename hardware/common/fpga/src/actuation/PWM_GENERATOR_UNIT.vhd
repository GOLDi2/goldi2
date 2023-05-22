-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		10/05/2023
-- Design Name:		PWM generator module for use in other modules 
-- Module Name:		PWM_GENERATOR_UNIT
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V3.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard libary
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief PWM signal generator
--! @details
--! Module generates a PWM signal based on the value
--! presented in the config_word port. The 8-bit word
--! corrsponds to the on/off ratio of the signals.
--! The signal frequency is set by the parameter FRQ_PWM.
--! The module is enabled by the pwm_enb signal. 
entity PWM_GENERATOR_UNIT is
    generic(
        ADDRESS         :   integer := 1;
        FRQ_SYSTEM      :   natural := 100000000;   --! System clock frequency in Hz
        FRQ_PWM         :   natural := 5000         --! PWM output signal frequency in Hz
    );
    port(
        --General
        clk             : in    std_logic;          --! System clock
        rst             : in    std_logic;          --! Asynchronous reset
        --BUS slave interface 
        sys_bus_i       : in    sbus_in;            --! BUS slave input signals [we,adr,dat]
        sys_bus_o       : out   sbus_out;           --! BUS slave output signals [dat,val]
        --PWM signal
        pwm_out         : out   io_o                --! PWM signal
    );
end entity PWM_GENERATOR_UNIT;




--! General architecture
architecture RTL of PWM_GENERATOR_UNIT is

    --****INTERNAL SIGNALS****
    constant PWM_PERIOD     :   natural := (FRQ_SYSTEM/(FRQ_PWM*255))-1;    
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
            elsif(clk_counter = to_unsigned(PWM_PERIOD,clk_counter'length)) then
                clk_counter <= to_unsigned(0,clk_counter'length);
            else
                clk_counter <= clk_counter + 1; 
            end if;
        end if;
    end process;

    
    PWM_FRACTION_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            pwm_counter <= to_unsigned(1,pwm_counter'length);
            pwm_out.dat <= '0';

        elsif(rising_edge(clk)) then
            --Counter divides the signal into 255 segments to assert as high or low
            if(pwm_stb = '1') then
                pwm_counter <= to_unsigned(1,pwm_counter'length);
            elsif(pwm_counter = 255 and clk_counter = PWM_PERIOD) then
                pwm_counter <= to_unsigned(1,pwm_counter'length);
            elsif(clk_counter = PWM_PERIOD) then
                pwm_counter <= pwm_counter + 1;
            end if;

            --Control pwm active ratio
            if(pwm_counter > unsigned(pwm_word(7 downto 0))) then
                pwm_out.dat <= '0';
            else
                pwm_out.dat <= '1';
            end if;
        end if;

    end process;

    --Configura IO to output
    pwm_out.enb <= '1';
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_UNIT
    generic map(
        ADDRESS     => ADDRESS,
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