-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		PWM Signal Generator
-- Module Name:		PWM_GENERATOR
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V0.01.04 - File Created
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
library work;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief PWM Signal generator
--! @details
--! The module produces a pwm signal to drive analog components.
--! An 8-bit configuration word is used to establish the duty cycle
--! of the signal.
--!
--! CLK_FACTOR = (f_clk/f_pwm*255)
--!
--! **Latency: 3cyc**
entity PWM_GENERATOR is
    generic(
        ADDRESS         :   natural := 1;       --! Module base address
        PWM_FREQUENCY   :   natural := 377      --! PWM Frequency factor
    );
    port(
        --General
        clk             : in    std_logic;      --! System clock
        rst             : in    std_logic;      --! Sychronous active high reset
        --BUS slave interface
        sys_bus_i       : in    sbus_in;        --! BUS input signals [we,adr,dat]
        sys_bus_o       : out   sbus_out;       --! BUS output signals [dat,val]
        --Pin
        pwm_io          : out   io_o            --! PWM driven IO pin
    );
end entity PWM_GENERATOR;




--! General architecture
architecture RTL of PWM_GENERATOR is

    --Intermediate Signals
    --Constants
    constant reg_default    :   data_word_vector(1 downto 0) := (others => (others => '0'));
    --Register data
    signal reg_data         :   data_word_vector(0 downto 0);
        alias pwm           :   std_logic_vector(7 downto 0) is reg_data(0)(7 downto 0);
    signal reg_data_stb     :   std_logic_vector(0 downto 0);
    --Counters and flags
    signal clk_counter      :   natural range 0 to PWM_FREQUENCY;
    signal pwm_counter      :   natural range 0 to 256;
    signal pwm_valid        :   std_logic; 


begin

    --****Signal Generator****
    -----------------------------------------------------------------------------------------------
    PWM_FRANCTION_COUNTER : process(clk)
	begin
		if(rising_edge(clk)) then
			--Reset counter when new data arrives to the registers
			if((rst = '1') or (reg_data_stb /= (reg_data_stb'range => '0'))) then
				clk_counter <= 0;
			elsif(clk_counter = PWM_FREQUENCY-1) then
				clk_counter <= 0;
			else
				clk_counter <= clk_counter + 1;
			end if;
		end if;
	end process;
    

    PWM_ASSERTION_COUNTER : process(clk)
	begin
		if(rising_edge(clk)) then
			--Counter divides the signal into 255 segments
			if((rst = '1') or (reg_data_stb /= (reg_data_stb'range => '0'))) then
				pwm_counter <= 1;
			elsif((pwm_counter = 255) and (clk_counter = PWM_FREQUENCY-1)) then
				pwm_counter <= 1;
			elsif(clk_counter = PWM_FREQUENCY-1) then
				pwm_counter <= pwm_counter + 1;
			end if;

			--Control valid flag
			if(pwm_counter > to_integer(unsigned(pwm))) then
				pwm_valid <= '0';
			else
				pwm_valid <= '1';
			end if;

		end if;
	end process;
    

    --Route output
    pwm_io.enb <= '1';
    pwm_io.dat <= pwm_valid; 
    -----------------------------------------------------------------------------------------------



    --****Memory****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => ADDRESS,
        NUMBER_REGISTERS    => 1,
        REG_DEFAULT_VALUES  => reg_default(0 downto 0)
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o,
        reg_data_in         => reg_data,
        reg_data_out        => reg_data,
        reg_data_stb        => reg_data_stb
    );
    -----------------------------------------------------------------------------------------------


end RTL;




