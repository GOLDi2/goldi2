-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:	    10/08/2023
-- Design Name:		Ultrasonic Sensor Processing Unit 
-- Module Name:		US_SENSOR_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
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




--! @brief Ultrasonic sensor processing unit for HC-SR04
--! @details
--! The ultrasonic sensor dsp generates the signals necesary to drive the 
--! device and process the transmitted data. The module works by looping a
--! measurement cycle every 60 ms and averaging the data using a moving 
--! average filter with the last 8 samples taken. The data formatted as a
--! 16-bit unsigned value is stored in the module's registers.
--!
--! A measurement cycle consists of a trigger burst, a echo measurement,
--! and a wait period. The trigger bust holds the "p_us_trigger" high for
--! 10 us to generate 8 ultrasonic pulses. Then the module enters an idle
--! period and waits for a rising edge in the "p_us_echo" signal. Once the
--! rising edge is detected a microsecond accumulator is increased until a
--! falling edge in the "p_us_echo" singal is detected. This time corresponds
--! to the time between the trigger burst and the detection of the echo. 
--! Finally the module enters a 20 ms idle state that prevents the detection
--! of secondary echos generated by the first burst.
--!
--! s[m] = (0,00034 m/us * t_echo[us])/2
--!
--! ### Registers:
--! |   g_address   |           data           |
--! |:-------------:|:------------------------:|
--! |   +0          |      us_counter[7:0]     |
--! |   +1          |      us_counter[15:8]    |
--!
entity US_SENSOR_SMODULE is
    generic(
        g_address       :   integer := 1;           --! Module's base address
        g_clk_frequency :   integer := 48000000     --! System clock frequency in Hz
    );
    port(
        --General
        clk             : in    std_logic;          --! System clock
        rst             : in    std_logic;          --! Asynchronous reset
        --BUS slave interface
        sys_bus_i       : in    sbus_in;            --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;           --! BUS output signals [dat,tag,mux]
        --Sensor interface
        p_us_trigger    : out   io_o;               --! HC-SR04 trigger signal
        p_us_echo       : in    io_i                --! HC-SR04 echo signal
    );
end entity US_SENSOR_SMODULE;




--! General architecture
architecture BH of US_SENSOR_SMODULE is

    --****INTERNAL SINGALS***¨
    --System constants
    constant period_1us     :   integer := g_clk_frequency/1000000;
    constant memory_length  :   integer := getMemoryLength(16);
    constant reg_default    :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_data         :   data_word_vector(memory_length-1 downto 0);
    --Data buffers
    signal us_accumulator   :   unsigned(15 downto 0);
    signal us_avg_data      :   std_logic_vector(15 downto 0);
    --Flags
    signal echo_f_edge      :   std_logic;
    signal echo_r_edge      :   std_logic;
    --Counters
    signal us_clk_counter   :   integer range 0 to period_1us;
    signal us_cyc_counter   :   integer range 0 to 60000;
    signal ac_clk_counter   :   integer range 0 to period_1us;
    --State machine
    type module_state is (s_trigger, s_standby, s_detect, s_hold);
    signal ps_module    :   module_state;

begin
    
    --****STATE MACHINE****
    -----------------------------------------------------------------------------------------------
    US_SENSOR_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            ps_module <= s_hold;
        elsif(rising_edge(clk)) then
            case ps_module is
            --Generate trigger signal for sensor (trigger length = 10 ms)
            when s_trigger => if((us_clk_counter = period_1us-1) and (us_cyc_counter = 9)) then ps_module <= s_standby;
                              else ps_module <= s_trigger;
                              end if;

            --Hold for echo detection or timeout (40ms)
            when s_standby => if((us_clk_counter = period_1us-1) and (us_cyc_counter = 39999)) then ps_module <= s_hold;
                              elsif(echo_r_edge = '1') then ps_module <= s_detect;
                              else ps_module <= s_standby;
                              end if;

            --Measure pulse width of echo or timeout 
            when s_detect  => if((us_clk_counter = period_1us-1) and (us_cyc_counter = 39999)) then ps_module <= s_hold;
                              elsif(echo_f_edge = '1') then ps_module <= s_hold;
                              else ps_module <= s_detect;
                              end if;

            --Hold additional time avoid interferance 
            when s_hold    => if((us_clk_counter = period_1us-1) and (us_cyc_counter = 59999)) then ps_module <= s_trigger;
                              else ps_module <= s_hold;
                              end if;

            when others    => ps_module <= s_hold;
            end case;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****ECHO DETECTION****
    -----------------------------------------------------------------------------------------------
    ECHO_EDGES : entity  work.EDGE_DETECTOR
    port map(
        clk     => clk,
        rst     => rst,
        data_in => p_us_echo.dat,
        p_f_edge  => echo_f_edge,
        p_r_edge  => echo_r_edge
    );
    -----------------------------------------------------------------------------------------------

    
    
    --****SIGNAL CONTROL AND PROCESSING****
    -----------------------------------------------------------------------------------------------
    --Generate trigger signal
    p_us_trigger <= high_io_o when(ps_module = s_trigger) else low_io_o;


    ECHO_ACCUMULATOR : process(clk,rst)
    begin
        if(rst = '1') then
            us_accumulator <= (others => '0');
            ac_clk_counter <= 0;
        elsif(rising_edge(clk)) then
            if((ps_module = s_detect) and (ac_clk_counter = period_1us-1)) then
                us_accumulator <= us_accumulator + 1;
                ac_clk_counter <= 0;
            elsif((ps_module = s_detect)) then
                ac_clk_counter <= ac_clk_counter + 1;
            else
                us_accumulator <= (others => '0');
                ac_clk_counter <= 0;
            end if;
        end if;
    end process;


    DATA_AVERAGING : entity work.MAVG_2N_FILTER
    generic map(
        g_data_width    => 16,
        g_length_log    => 3
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_sample_valid  => echo_f_edge,
        p_sample_data   => std_logic_vector(us_accumulator),
        p_avg_valid     => open,
        p_avg_data      => us_avg_data
    );
    -----------------------------------------------------------------------------------------------
    


    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
    MICRO_SECOND_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            us_clk_counter <= 0;
        elsif(rising_edge(clk)) then
            if(us_clk_counter = period_1us-1) then
                us_clk_counter <= 0;
            else
                us_clk_counter <= us_clk_counter + 1;
            end if;
        end if;
    end process;


    --Counter loops after 60 ms
    CYCLE_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            us_cyc_counter <= 0;
        elsif(rising_edge(clk)) then
            if((us_clk_counter = period_1us-1) and (us_cyc_counter = 59999)) then
                us_cyc_counter <= 0;
            elsif(us_clk_counter = period_1us-1) then
                us_cyc_counter <= us_cyc_counter + 1;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
    generic map(
        g_address       => g_address,
        g_reg_number    => memory_length,
        g_def_values    => reg_default
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

    --Typecast data
    reg_data <= setMemory(us_avg_data);
    -----------------------------------------------------------------------------------------------


end architecture;