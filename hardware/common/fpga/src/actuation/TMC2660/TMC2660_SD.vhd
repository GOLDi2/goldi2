-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		TMC2660 Step/Direction interface
-- Module Name:		TMC2660_SD
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:    none
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;





entity TMC2660_SD is
    generic(
        SPEED_FACTOR            : natural := 100
    );
    port(
        --General
        clk                     : in    std_logic;
        rst                     : in    std_logic;
        --Movement interface
        sd_enable_neg           : in    std_logic;
        sd_enable_pos           : in    std_logic;
        --Speed interface
        sd_nominal_frequency    : in    std_logic_vector(7 downto 0);
        sd_configuration_valid  : in    std_logic;
        --TMC2660 Step/Direction interface
        step                    : out   std_logic;
        direction               : out   std_logic
    );
end entity TMC2660_SD;




--! General architecture
architecture RTL of TMC2660_SD is

    --****INTERNAL SIGNALS****
    --Data buffers
    signal nominal_frequency_buff   :   std_logic_vector(7 downto 0);
    signal operation_frequency_buff :   natural range 0 to 256;
    --Counters
    signal step_period              :   natural range 0 to SPEED_FACTOR*256;
    signal step_period_counter      :   natural;
    --Flags
    signal configuration_valid      :   std_logic;
    signal calculation_valid        :   std_logic;
    --State machine
    type calculation_state  is (IDLE, EXTEND);
    signal ps   :   calculation_state;


begin

    --****SYSTEM CONFIGURATION****
    -----------------------------------------------------------------------------------------------
    CONFIGURATION_INTERFACE : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                nominal_frequency_buff  <= (others => '0');
                configuration_valid     <= '0';
            elsif(sd_configuration_valid = '1') then
                nominal_frequency_buff  <= sd_nominal_frequency;
                configuration_valid     <= '1';
            else
                configuration_valid     <= '0';
            end if;
        end if;
    end process;


    FREQUENCY_CONVERSION : process(clk)
    begin
        if(rising_edge(clk)) then
            case PS is
            when IDLE =>
                operation_frequency_buff <= 256 - to_integer(unsigned(nominal_frequency_buff));
                calculation_valid        <= '0';
                
                if(configuration_valid = '1') then
                    PS <= EXTEND;
                end if;
            
            when EXTEND =>
                step_period <= (operation_frequency_buff*SPEED_FACTOR)-1;
                calculation_valid <= '1';
                PS <= IDLE;

            when others => null;
            end case;

            if(rst = '1') then
                operation_frequency_buff <= 256;
                calculation_valid        <= '0';
                step_period 		     <= SPEED_FACTOR;
				PS <= EXTEND;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****STEP/DIRECTION INTERFACE****
    -----------------------------------------------------------------------------------------------
    FREQUENCY_CONTROL : process(clk)
    begin
        if(rising_edge(clk)) then
            if(calculation_valid = '1') then
                step_period_counter <= 0;
            elsif(sd_enable_neg = '1' xnor sd_enable_pos = '1') then
                step_period_counter <= 0;
            elsif(step_period_counter = step_period) then
                step_period_counter <= 0;
            else
                step_period_counter <= step_period_counter + 1;
            end if;
        end if;
    end process;


    SD_INTERFACE : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                step        <= '0';
                direction   <= '0';

            elsif(sd_enable_neg = '1' xnor sd_enable_pos = '1') then
                step        <= '0';
                direction   <= '0';

            else
                --Manage step direction
                direction <= sd_enable_neg;

                --Manage pulse generation
                if(step_period_counter < 10) then
                    step <= '0';
                else
                    step <= '1';
                end if;
            
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end RTL;
