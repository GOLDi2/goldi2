-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/09/2023
-- Design Name:		Pulse width modulation (PWM) signal analyser 
-- Module Name:		PWM_ANALYSER_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> FREQUENCY_ANALYSER.vhd
--                  -> MAVG_2N_FILTER.vhd
--                  -> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
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




--! @brief
--! @details
--!
entity PWM_ANALYSER_SMODULE is
    generic(
        g_address           :   integer := 1;
        g_sampling_period   :   integer := 10000
    );
    port(
        --General
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        --BUS slave interface
        sys_bus_i           : in    sbus_in;
        sys_bus_o           : out   sbus_out;
        --Data signals
        p_pwm_signal        : in    io_i
    );
end entity PWM_ANALYSER_SMODULE;




--! General architecture
architecture RTL of PWM_ANALYSER_SMODULE is
    
    --****INTERNAL SIGNALS****
    --Memory
    constant c_memory_length    :   natural := getMemoryLength(32);
    constant c_reg_default      :   data_word_vector(c_memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_data             :   data_word_vector(c_memory_length-1 downto 0);
    --Arithmetic
    signal pwm_signal_period    :   std_logic_vector(31 downto 0);
    signal pwm_neg_counter      :   unsigned(31 downto 0);
    signal pwm_pos_counter      :   unsigned(31 downto 0);
    signal pwm_neg_average      :   std_logic_vector(15 downto 0);
    signal pwm_pos_average      :   std_logic_vector(15 downto 0);
    --Counter
    signal pwm_clk_counter      :   integer range 0 to g_sampling_period;
    --Flags
    signal pwm_sample_valid     :   std_logic;
    signal pwm_rising_edge      :   std_logic;


begin

    --****RISING EDGE DETECTION****
    -----------------------------------------------------------------------------------------------
    PWM_EDGE_DETECTION : entity work.EDGE_DETECTOR
    port map(
        clk         => clk,
        rst         => rst,
        data_in     => p_pwm_signal.dat,
        p_f_edge    => open,
        p_r_edge    => pwm_rising_edge
    );
    -----------------------------------------------------------------------------------------------



    --****SAMPLING CONTROL****
    -----------------------------------------------------------------------------------------------
    PERIOD_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            pwm_clk_counter <= 0;
        elsif(rising_edge(clk)) then
            if(pwm_clk_counter = g_sampling_period-1) then
                pwm_clk_counter <= 0;
            else
                pwm_clk_counter <= pwm_clk_counter + 1;
            end if;
        end if;
    end process;


    PERIOD_ESTIMATION : entity work.FREQUENCY_ANALYSER
    generic map(
        g_sampling_period   => g_sampling_period
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        p_data_in           => p_pwm_signal.dat,
        p_data_period       => pwm_signal_period
    );


    ACCUMULATOR_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            pwm_neg_counter <= (others => '0');
            pwm_pos_counter <= (others => '0');
        
        elsif(rising_edge(clk)) then
            --Control Low Input accumulator
            if((pwm_rising_edge = '1') or (pwm_pos_counter > unsigned(pwm_signal_period))) then
                pwm_neg_counter <= (others => '0');
            elsif(pwm_neg_counter > unsigned(pwm_signal_period)) then
                pwm_neg_counter <= unsigned(pwm_signal_period);
            elsif((pwm_clk_counter = g_sampling_period-1) and (p_pwm_signal.dat = '0')) then
                pwm_neg_counter <= pwm_neg_counter + 1;
            else null;
            end if;

            --Control HIGH input accumulator
            if((pwm_rising_edge = '1') or (pwm_neg_counter > unsigned(pwm_signal_period))) then
                pwm_pos_counter <= (others => '0');
            elsif(pwm_pos_counter > unsigned(pwm_signal_period)) then
                pwm_pos_counter <= unsigned(pwm_signal_period); 
            elsif((pwm_clk_counter = g_sampling_period-1) and (p_pwm_signal.dat = '1')) then
                pwm_pos_counter <= pwm_pos_counter + 1;
            end if;

        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****DATA FILTERING****
    -----------------------------------------------------------------------------------------------
    NEG_AVG_ACCUMULATOR : entity work. MAVG_2N_FILTER
    generic map(
        g_data_width    => 16,
        g_length_log    => 2
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_sample_valid  => pwm_sample_valid,
        p_sample_data   => std_logic_vector(pwm_neg_counter(15 downto 0)),
        p_avg_valid     => open,
        p_avg_data      => pwm_neg_average
    );


    POS_AVG_ACCUMULATOR : entity work. MAVG_2N_FILTER
    generic map(
        g_data_width    => 16,
        g_length_log    => 2
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_sample_valid  => pwm_sample_valid,
        p_sample_data   => std_logic_vector(pwm_pos_counter(15 downto 0)),
        p_avg_valid     => open,
        p_avg_data      => pwm_pos_average
    );


    --Filter sampling control
    pwm_sample_valid <= '1' when((pwm_rising_edge = '1')                          or
                                 (pwm_pos_counter > unsigned(pwm_signal_period))  or
                                 (pwm_neg_counter > unsigned(pwm_signal_period))) else
                        '0';
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
    generic map(
        g_address       => g_address,
        g_reg_number    => c_memory_length,
        g_def_values    => c_reg_default 
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_data_in       => reg_data,
        p_data_out      => open,
        p_read_stb      => open,
        p_write_stb     => open
    );

    reg_data <= (setMemory(pwm_pos_average(15 downto 0)) & setMemory(pwm_neg_average(15 downto 0)));
    -----------------------------------------------------------------------------------------------


end architecture;


