-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		31/07/2023
-- Design Name:		2n Moving average filter
-- Module Name:		MAVG_2N_FILTER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:    none
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief Moving average filter
--! @details
--! The "MAVG_2N_FILTER" is a moving average filter module with a 2**N number
--! of samples. The length of the data buffer is defined by the generic 
--! parameter "g_length_log" which is equal to N. The "p_sample_data" is an 
--! unsigned vector with a width defined by the parameter "g_data_width".
--!
--! **Latency: 2cyc**
entity MAVG_2N_FILTER is
    generic(
        g_data_width    :   integer := 8;                                   --! Sample data width
        g_length_log    :   integer := 2                                    --! Buffer size 2**g_length_log
    );
    port(
        --General
        clk             : in    std_logic;                                  --! System clock
        rst             : in    std_logic;                                  --! Asynchronous reset
        --Data
        p_sample_valid  : in    std_logic;                                  --! Input sample valid
        p_sample_data   : in    std_logic_vector(g_data_width-1 downto 0);  --! Input sample
        p_avg_valid     : out   std_logic;                                  --! Filter average valid
        p_avg_data      : out   std_logic_vector(g_data_width-1 downto 0)   --! Filter average 
    );
end entity;




--! General architecture
architecture RTL of MAVG_2N_FILTER is

    --****INTERNAL SIGNALS****
    constant filter_length  :   integer := 2**g_length_log;
    signal avg_result       :   unsigned(g_data_width+g_length_log-1 downto 0);
    signal update_avg       :   std_logic;
    --Sample buffer
    type sample_array is array(filter_length-1 downto 0) of unsigned(g_data_width-1 downto 0);
    signal sample_buffer    :   sample_array;


begin

    --****SAMPLE MANAGEMENT & FLAGS****
    -----------------------------------------------------------------------------------------------
    ROLLING_BUFFER : process(clk,rst)
    begin
        if(rst = '1') then
            sample_buffer <= (others => (others => '0'));
        elsif(rising_edge(clk)) then
            if(p_sample_valid = '1') then
                --Roll sample buffer
                sample_buffer(0) <= unsigned(p_sample_data);
                for i in 1 to sample_buffer'length-1 loop
                    sample_buffer(i) <= sample_buffer(i-1);
                end loop;
            end if;
        end if;
    end process;

    
    UPDATE_FLAG_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            update_avg <= '0';
        elsif(rising_edge(clk)) then
            --Internal update flag
            if(p_sample_valid = '1') then
                update_avg <= '1';
            else
                update_avg <= '0';
            end if;
        end if;
    end process;


    AVG_FLAG_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            p_avg_valid <= '0';
        elsif(rising_edge(clk)) then
            --Internal update flag
            if(update_avg = '1') then
                p_avg_valid <= '1';
            else
                p_avg_valid <= '0';
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****ARITHMETIC****
    -----------------------------------------------------------------------------------------------
    AVERAGE_CALCULATOR : process(clk,rst)
        variable avg_sum    :   unsigned(g_data_width+g_length_log-1 downto 0);
    begin
        if(rst = '1') then
            avg_result <= (others => '0');
            avg_sum    := (others => '0');
        elsif(rising_edge(clk)) then
            if(update_avg = '1') then
                avg_sum := (others => '0');
                for i in sample_buffer'range loop
                    avg_sum := avg_sum + resize(sample_buffer(i),avg_sum'length);
                end loop;
            
                avg_result <= avg_sum;
            end if;
        end if;
    end process;

    --Average result
    p_avg_data <= std_logic_vector(avg_result(avg_result'left downto g_length_log));
    -----------------------------------------------------------------------------------------------
  

end architecture;