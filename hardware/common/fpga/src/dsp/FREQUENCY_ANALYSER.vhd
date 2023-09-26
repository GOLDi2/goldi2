-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		31/07/2023
-- Design Name:		Periodic signal frequency analyser module
-- Module Name:		FREQUENCY_ANALYSER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief Periodic signal frequency analyser
--! @details
--! The frequency analyser module samples the signal at a given rate to calculates
--! the period of the input signal. The module uses the rising edges of the input
--! signal to calculate the amount of samples in the period. The values are then
--! averaged with the last four samples to clean the data. The data is formatted
--! as 32-bit unsigned value
entity FREQUENCY_ANALYSER is
    generic(
        g_sampling_period   :   integer := 1                        --! Sampling period as a multiple of the system clock period
    );
    port(
        --General
        clk                 : in    std_logic;                      --! System clock
        rst                 : in    std_logic;                      --! Asynchronous reset
        --Analyser interface
        p_data_in           : in    std_logic;                      --! Input signal
        p_data_period       : out   std_logic_vector(31 downto 0)   --! Signal period
    );
end entity FREQUENCY_ANALYSER;




--! General architecture
architecture BH of FREQUENCY_ANALYSER is

    --****INTERNAL SIGNALS****
    --Sample buffer
    type sample_array is array(3 downto 0) of unsigned(31 downto 0);
    signal sample_buffer    :   sample_array;
    signal data_buffer      :   std_logic;
    --Counters
    signal sampling_counter :   integer range 0 to g_sampling_period;
    --Arithmetic signals
    signal avg_result       :   unsigned(33 downto 0);
    signal period_counter   :   unsigned(31 downto 0);
    --Flag
    signal update_avg       :   std_logic;

begin

    --****RISING EDGE DETECTION****
    -----------------------------------------------------------------------------------------------
    EDGE_DETECTION : process(clk,rst)
    begin
        if(rst = '1') then
            data_buffer <= '0';
        elsif(rising_edge(clk)) then
            if(sampling_counter = g_sampling_period-1) then
                data_buffer <= p_data_in;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****DATA PROCESSING****
    -----------------------------------------------------------------------------------------------
    PERIOD_DETECTION : process(clk,rst)
    begin
        if(rst = '1') then
            sample_buffer  <= (others => (others => '1'));
            period_counter <= (others => '0');
            update_avg     <= '0';
        
        elsif(rising_edge(clk)) then
            if(sampling_counter = g_sampling_period-1) then
                if(data_buffer = '0' and p_data_in = '1') then
                    sample_buffer  <= sample_buffer(2 downto 0) & period_counter;
                    period_counter <= to_unsigned(1,period_counter'length);
                    update_avg     <= '1';
                else
                    period_counter <= period_counter + 1;
                    update_avg     <= '0';
                end if;
            else
                update_avg     <= '0';
            end if;
        end if;
    end process;


    AVERAGE_CALCULATION : process(clk,rst)
        variable avg_sum    :   unsigned(33 downto 0);
    begin
        if(rst = '1') then
            avg_result <= (others => '1');
            avg_sum    := (others => '0');
        elsif(rising_edge(clk)) then
            if(update_avg = '1') then
                avg_sum := (others => '0');
                for i in 0 to 3 loop
                    avg_sum := avg_sum + resize(sample_buffer(i),avg_sum'length);
                end loop;

                avg_result <= avg_sum;
            end if;
        end if;
    end process;

    --Average result
    p_data_period <= std_logic_vector(avg_result(33 downto 2));
    -----------------------------------------------------------------------------------------------



    --****SAMPLING TIMER****
    -----------------------------------------------------------------------------------------------
    SAMPLING : process(clk,rst)
    begin
        if(rst = '1') then
            sampling_counter <= 0;
        elsif(rising_edge(clk)) then
            if(sampling_counter = g_sampling_period-1) then
                sampling_counter <= 0;
            else
                sampling_counter <= sampling_counter + 1;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;