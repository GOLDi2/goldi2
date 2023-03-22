-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		TMC2660 Step Interface driver 
-- Module Name:		TMC2660_STEP_DRIVER
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> EDGE_DETECTOR.vhd
--
-- Revisions:
-- Revision V0.01.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;



--! @brief
--! @detials
--!
entity TMC2660_STEP_DRIVER is
    port(
        --General
        clk                     : in    std_logic;
        rst                     : in    std_logic;
        --Movement interface
        sd_move_negative_valid  : in    std_logic;
        sd_move_positive_valid  : in    std_logic;
        --Speed interface
        sd_nominal_frequency    : in    std_logic_vector(7 downto 0);
        sd_configuration_valid  : in    std_logic;
        --TMC2660 Step/Dir interface
        tmc2660_step            : out   std_logic;
        tmc2660_dir             : out   std_logic
    );
end entity TMC2660_STEP_DRIVER;




--! General architecture
architecture RTL of TMC2660_STEP_DRIVER is

    --Internal signals
    --Buffers
    signal nominal_frequency_buff   :   integer range 0 to (2**8)-1;
    signal direction_buff           :   std_logic;
    --Flags
    signal new_configuration_valid  :   std_logic;
    signal step_valid               :   std_logic;
    --Counters
    signal step_period_counter      :   integer range 0 to 6;
    signal step_velocity_counter    :   integer; 
    --SM
    type interface_state is (IDLE, COMM);
    signal step_ps  :   interface_state := IDLE;
    

begin

    --****TMC2660 STEP/DIR interface control****
    ---------------------------------------------------------------------------
    TMC2660_INTERFACE_CONTROL : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                step_period_counter <= 0;
                step_ps <= IDLE;

            elsif(step_ps = IDLE) then
                step_period_counter <= 0;
                
                if(step_valid = '1') then
                    step_ps <= COMM;
                else
                    step_ps <= IDLE;
                end if;

            elsif(step_ps = COMM) then
                
                if(step_period_counter = 5) then
                    step_ps <= IDLE;
                else
                    step_period_counter <= step_period_counter + 1;
                end if;
    
            end if;
        end if;
    end process;



    TMC2660_INTERFACE_SIGNALS : process(step_ps,step_period_counter,direction_buff)
    begin
        case step_ps is         
        when COMM => 
            if(step_period_counter = 0) then
                tmc2660_step <= '0';
            elsif(step_period_counter = 3) then
                tmc2660_step <= '1';
            else null;
            end if;

        when IDLE =>
            tmc2660_step <= '0';
        when others => null;
        end case;

        tmc2660_dir  <= direction_buff;
    end process;
    ---------------------------------------------------------------------------




    --****SYSTEM INTERFACE****
    ---------------------------------------------------------------------------
    CONFIGURATION_INTERFACE : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                nominal_frequency_buff  <= 0;
                new_configuration_valid <= '0';
            elsif(sd_configuration_valid = '1') then
                nominal_frequency_buff  <= to_integer(unsigned(sd_nominal_frequency));
                new_configuration_valid <= '1';
            else
                new_configuration_valid <= '0';
            end if;        
        end if;
    end process;


    VELOCITY_CONTROL : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1' or new_configuration_valid = '1') then
                step_velocity_counter <= 0;
                step_valid <= '0';
            
            elsif(sd_move_negative_valid = '1' xor sd_move_positive_valid = '1') then                
                if (step_velocity_counter >= nominal_frequency_buff + 1535) then
                    step_velocity_counter <= 0;
                    step_valid <= '1';
                
                else
                    step_velocity_counter <= step_velocity_counter + 1;
                    step_valid <= '0';
                end if;
 
            else
                step_velocity_counter <= 0;
                step_valid <= '0';

            end if;

            direction_buff <= sd_move_negative_valid;
        end if;
    end process;
    ---------------------------------------------------------------------------


end RTL;

