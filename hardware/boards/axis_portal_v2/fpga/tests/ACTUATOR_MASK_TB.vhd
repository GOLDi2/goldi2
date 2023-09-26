-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		25/06/2023
-- Design Name:		Actuator mask testbench - Axis Portal V2
-- Module Name:		ACTUATOR_MASK_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_MODULE_CONFIG.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--                  -> ACTUATOR_MASK.vhd
--
-- Revisions:
-- Revision V3.00.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V4.00.00 - Module refactoring
-- Additional Comments: Use of env library to control the simulation flow.
--                      Changes to the DUT entity and the port signal names. 
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation flow control and assertions
library std;
use std.standard.all;
use std.env.all;
--! Use custom packages
library work;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality simulation
entity ACTUATOR_MASK_TB is
end entity ACTUATOR_MASK_TB;




--! Simulation architecture
architecture TB of ACTUATOR_MASK_TB is
  
    --****DUT****
    component ACTUATOR_MASK
        port(
            p_sys_io_i  : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            p_sys_io_o  : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            p_safe_io_o : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    --DUT IOs
    signal sys_io_i         :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_i);
    signal sys_io_o         :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_o);
    signal safe_io_out      :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_o);
        alias x_step_s      :   std_logic is safe_io_out(16).dat;
        alias y_step_s      :   std_logic is safe_io_out(25).dat;
        alias z_enable_s    :   std_logic is safe_io_out(31).dat;
    --Testbench
    signal input_values     :   std_logic_vector(12 downto 0);
        --Sensor inputs
        alias limit_x_neg   :   std_logic is input_values(0);
        alias limit_x_pos   :   std_logic is input_values(1);
        alias limit_y_neg   :   std_logic is input_values(2);
        alias limit_y_pos   :   std_logic is input_values(3);
        alias limit_z_neg   :   std_logic is input_values(4);
        alias limit_z_pos   :   std_logic is input_values(5);
        --Actuator inputs
        alias motor_x_step  :   std_logic is input_values(6);
        alias motor_x_dir   :   std_logic is input_values(7);
        alias motor_y_step  :   std_logic is input_values(8);
        alias motor_y_dir   :   std_logic is input_values(9);
        alias motor_z_enb   :   std_logic is input_values(10);
        alias motor_z_neg   :   std_logic is input_values(11);
        alias motor_z_pos   :   std_logic is input_values(12);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : ACTUATOR_MASK
    port map(
        p_sys_io_i  => sys_io_i,
        p_sys_io_o  => sys_io_o,
        p_safe_io_o => safe_io_out
    );
    -----------------------------------------------------------------------------------------------


    
    --****SIGNAL ASSIGNMENT****
    -----------------------------------------------------------------------------------------------
    --Sensors
    sys_io_i(2).dat  <= limit_x_neg;
    sys_io_i(3).dat  <= limit_x_pos;
    sys_io_i(4).dat  <= limit_y_neg;
    sys_io_i(5).dat  <= limit_y_pos;
    sys_io_i(6).dat  <= limit_z_neg;
    sys_io_i(7).dat  <= limit_z_pos;
    --Actuators
    sys_io_o(16).dat <= motor_x_step;
    sys_io_o(17).dat <= motor_x_dir;
    sys_io_o(25).dat <= motor_y_step;
    sys_io_o(26).dat <= motor_y_dir;
    sys_io_o(31).dat <= motor_z_enb;
    sys_io_o(32).dat <= motor_z_pos;
    sys_io_o(33).dat <= motor_z_neg;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        variable assert_hold    :   time := 5 ns;
        variable post_hold      :   time := 5 ns;
    begin

        for i in 0 to (2**13)-1 loop
            --Simulate possible gpio values
            input_values <= std_logic_vector(to_unsigned(i,13));

            wait for assert_hold;
            --Mask test
            --X step channel
            if((limit_x_neg = '1' and limit_x_pos = '1')  or
               (limit_x_neg = '1' and motor_x_dir = '0')  or
               (limit_x_pos = '1' and motor_x_dir = '1')  or
               (limit_z_pos = '0'                      )) then

                assert(x_step_s = '0')
                    report "ID01: Expecting x_step_s = '0'" severity error;
            end if;

            if((limit_y_neg = '1' and limit_y_pos = '1')  or
               (limit_y_neg = '1' and motor_y_dir = '0')  or
               (limit_y_pos = '1' and motor_y_dir = '1')  or
               (limit_z_pos = '0'                      )) then
            
                assert(y_step_s = '0')
                    report "ID02: Expecting y_step_s = '0'" severity error;
            end if;

            if((limit_z_neg = '0' and limit_z_pos = '1')  or
               (limit_z_neg = '0' and motor_z_pos = '1')  or
               (limit_z_pos = '1' and motor_z_neg = '1')) then

                assert(z_enable_s = '0')
                    report "ID03: Expecting z_enable_s = '0'" severity error;
            end if;

            wait for post_hold;
        end loop;


        --**End simulation**
		wait for 50 ns;
        report "AP2: ACUTATOR_MASK_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;