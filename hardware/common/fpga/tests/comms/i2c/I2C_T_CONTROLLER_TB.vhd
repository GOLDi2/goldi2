-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		IC2 transmission shift register testbench 
-- Module Name:		I2C_T_CONTROLLER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V0.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation flow control and assertions
library std;
use std.standard.all;
use std.env.all;




--! Functionality simulation
entity I2C_T_CONTROLLER_TB is
end entity I2C_T_CONTROLLER_TB;




--! Simulation architecture
architecture TB of I2C_T_CONTROLLER_TB is
  
    --****DUT****
    component I2C_T_CONTROLLER
        port(

            clk         : in    std_logic;
            rst         : in    std_logic;
            enb         : in    std_logic;
            p_t_data    : in    std_logic_vector(7 downto 0);
            p_t_valid   : out   std_logic;
            p_t_error   : out   std_logic;
            p_i2c_scl   : in    std_logic;
            p_i2c_sda_i : in    std_logic;
            p_i2c_sda_o : out   std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 20 ns;
	signal run_sim			:	std_logic := '1';
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
    --DUT IOs
    signal enb              :   std_logic := '0';
    signal p_t_data         :   std_logic_vector(7 downto 0) := (others => '0');
    signal p_t_valid        :   std_logic := '0';
    signal p_t_error        :   std_logic := '0';
    signal p_i2c_scl        :   std_logic := '0';
    signal p_i2c_sda_i      :   std_logic := '0';
    signal p_i2c_sda_o      :   std_logic := '0';
    --Testbench
    constant data_buffer    :   std_logic_vector(8 downto 0) := "110000111";


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : I2C_T_CONTROLLER
    port map(

        clk         => clock,
        rst         => reset,
        enb         => enb,
        p_t_data    => p_t_data,
        p_t_valid   => p_t_valid,
        p_t_error   => p_t_error,
        p_i2c_scl   => p_i2c_scl,
        p_i2c_sda_i => p_i2c_sda_i,
        p_i2c_sda_o => p_i2c_sda_o
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test reset state**
        wait for assert_hold;
        assert(p_t_valid = '0')
            report "ID01: Test reset - expecting p_t_valid = '0'"
            severity error;
        assert(p_t_error = '0')
            report "ID02: Test reset - expecting p_t_error = '0'"
            severity error;
        assert(p_i2c_sda_o = '0')
            report "ID03: Test reset - expecting p_i2c_sda_o = '0'"
            severity error;
        wait for post_hold;



        --**Test a valid data transfer**
        p_t_data    <= data_buffer(8 downto 1);
        p_i2c_sda_i <= '0';
        enb         <= '1';

        for i in 0 to 8 loop
            p_i2c_scl <= '0';
            wait for 4*clk_period;

            assert(p_i2c_sda_o = data_buffer(8-i))
                report "ID04: Test valid transfer - expecting p_i2c_sda_o = data_buffer(" &integer'image(i)&")"
                severity error;
            p_i2c_scl <= '1';
            wait for 4*clk_period;
        end loop;

        wait for assert_hold;
        assert(p_t_valid = '1')
            report "ID05: Test valid transfer - expecting p_t_valid = '1'"
            severity error;
        assert(p_t_error = '0')
            report "ID06: Test valid transfer - expecting p_t_error = '0'"
            severity error;
        wait for post_hold;
        enb <= '0';


        wait for 5*clk_period;


        --**Test error transfer**
        p_t_data    <= data_buffer(8 downto 1);
        p_i2c_sda_i <= '1';
        enb         <= '1';

        for i in 0 to 8 loop
            p_i2c_scl <= '0';
            wait for 4*clk_period;

            assert(p_i2c_sda_o = data_buffer(8-i))
                report "ID07: Test error transfer - expecting p_i2c_sda_o = data_buffer(" &integer'image(i)&")"
                severity error;
            p_i2c_scl <= '1';
            wait for 4*clk_period;
        end loop;

        wait for assert_hold;
        assert(p_t_valid = '0')
            report "ID08: Test error transfer - expecting p_t_valid = '0'"
            severity error;
        assert(p_t_error = '1')
            report "ID09: Test error transfer - expecting p_t_error = '1'"
            severity error;
        wait for post_hold;
        enb <= '0';


        --**End simulation**
        wait for 50 ns;
        report"I2C_T_CONTROLLER_TB - testbench completed";
        --Simulation end using vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries not supported)
        -- run_sim <= '0';
        -- wait; 

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;