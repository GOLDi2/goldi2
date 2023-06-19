-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/05/2023
-- Design Name:		Virtual sensor test bench
-- Module Name:		VIRTUAL_SENSOR_ARRAY_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_DATA_TYPES.vhd
--                  -> VIRTUAL_SENSOR_ARRAY.vhd
--
-- Revisions:
-- Revision V2.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library 
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
use std.standard.all;
--! Use custom packages
library work;
use work.GOLDI_DATA_TYPES.all;




--! Functionality simulation
entity VIRTUAL_SENSOR_ARRAY_TB is
end entity VIRTUAL_SENSOR_ARRAY_TB;




--! Simulation architecture
architecture TB of VIRTUAL_SENSOR_ARRAY_TB is

    --****DUT****
    component VIRTUAL_SENSOR_ARRAY
        generic(
            INVERT              :   boolean := false;
            NUMBER_SENSORS      :   integer := 3;
            SENSOR_LIMITS       :   sensor_limit_array := ((0,0),(0,0),(0,0))
        );
        port(
            --General
            clk                 : in    std_logic;
            rst                 : in    std_logic;
            --Incremental encoder interface
            enc_channel_a       : in    std_logic;
            enc_channel_b       : in    std_logic;
            --Sensor outputs
            sensor_data_out     : out   std_logic_vector(NUMBER_SENSORS-1 downto 0)

        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		    :	time := 10 ns;
	signal reset			    :	std_logic := '0';
	signal clock			    :	std_logic := '0';
	signal run_sim			    :	std_logic := '1';
	--DUT i/o
    signal enc_channel_a        :   std_logic;
    signal enc_channel_b        :   std_logic;
    signal sensor_full_range    :   std_logic_vector(2 downto 0);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : VIRTUAL_SENSOR_ARRAY
    generic map(
        INVERT              => false,
        NUMBER_SENSORS      => 3,
        SENSOR_LIMITS       => ((100,20),(200,20),(300,20))
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        enc_channel_a       => enc_channel_a,
        enc_channel_b       => enc_channel_b,
        sensor_data_out     => sensor_full_range
    );
    -----------------------------------------------------------------------------------------------



    --***SIMULATION TIMING****
	-----------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 5 ns, '0' after 15 ns;
	-----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process 
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset signals
        enc_channel_a <= '0';
        enc_channel_b <= '0';
        wait for init_hold;


        --**Test reset conditions**
        wait for assert_hold;
        assert(sensor_full_range = (sensor_full_range'range => '0'))
            report "ID01: Test reset - expecting sensor_full_range = 0" severity error;
        wait for post_hold;



        --****Test operation****
        enc_channel_b <= '1';
        enc_channel_a <= '0';
        wait for 4*clk_period;
        --Simulate encoder impulses in positive direction
        for i in 0 to 399 loop
            enc_channel_a <= not enc_channel_a;

            --**Test cases**
            wait for assert_hold;
            --Test position sensors full range
            if (80 <= i and i <= 120) then
                assert(sensor_full_range(0) = '1')
                    report "ID02: Test sensor operation - expecting sensor(0) = '1'"
                    severity error;
            elsif(180 <= i and i <= 220) then
                assert(sensor_full_range(1) = '1')
                    report "ID03: Test sensor operation - expecting sensor(1) = '1'"
                    severity error;
            elsif(280 <= i and i <= 320) then
                assert(sensor_full_range(2) = '1')
                    report "ID04: Test sensor operation - expecting sensor(2) = '1'"
                    severity error;
            else
                assert(sensor_full_range = (sensor_full_range'range => '0'))
                    report "ID05: Test sensor operation - expecting sensors = 0"
                    severity error;
            end if;

            enc_channel_b <= not enc_channel_b;
            wait for 2*clk_period;
        end loop;


        --End simulation
        wait for 5*clk_period;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end TB;