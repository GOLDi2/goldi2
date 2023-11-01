-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Error protection module testbench
-- Module Name:		ACTUATOR_MASK_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GODLI_MODULE_CONFIG.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> ACTUATOR_MASK.vhd
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
--
-- Revision V3.00.01 - Standarization of testbenches
-- Additional Comments: Modification to message format and test cases
--
-- Revision V4.00.00 - Module refactoring
-- Additional Comments: Use of env library to control simulation flow.
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
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_COMM_STANDARD.all;




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
    signal p_sys_io_i       :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_i);
    signal p_sys_io_o       :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_o);
    signal p_safe_io_o      :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
        alias x_enable_s    :   std_logic is p_safe_io_o(17).dat;
        alias x_out_pos_s   :   std_logic is p_safe_io_o(18).dat;
        alias x_out_neg_s   :   std_logic is p_safe_io_o(19).dat;
        alias y_enable_s    :   std_logic is p_safe_io_o(20).dat;
        alias y_out_neg_s   :   std_logic is p_safe_io_o(21).dat;
        alias y_out_pos_s   :   std_logic is p_safe_io_o(22).dat;
        alias z_enable_s    :   std_logic is p_safe_io_o(23).dat;
        alias z_out_pos_s   :   std_logic is p_safe_io_o(24).dat;
        alias z_out_neg_s   :   std_logic is p_safe_io_o(25).dat;
    
    signal input_values     :   std_logic_vector(16 downto 0);
        alias limit_x_neg   :   std_logic is input_values(0);
        alias limit_x_pos   :   std_logic is input_values(1);
        alias limit_x_ref   :   std_logic is input_values(2);
        alias limit_y_neg   :   std_logic is input_values(3);
        alias limit_y_pos   :   std_logic is input_values(4);
        alias limit_y_ref   :   std_logic is input_values(5);
        alias limit_z_neg   :   std_logic is input_values(6);
        alias limit_z_pos   :   std_logic is input_values(7);
        alias x_enable      :   std_logic is input_values(8);
        alias x_out_pos     :   std_logic is input_values(9);
        alias x_out_neg     :   std_logic is input_values(10);
        alias y_enable      :   std_logic is input_values(11);
        alias y_out_pos     :   std_logic is input_values(12);
        alias y_out_neg     :   std_logic is input_values(13);
        alias z_enable      :   std_logic is input_values(14);
        alias z_out_pos     :   std_logic is input_values(15);
        alias z_out_neg     :   std_logic is input_values(16);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : ACTUATOR_MASK
    port map(
        p_sys_io_i  => p_sys_io_i,
        p_sys_io_o  => p_sys_io_o,
        p_safe_io_o => p_safe_io_o
    );
    -----------------------------------------------------------------------------------------------


    
    --****SIGNAL ASSIGNMENT****
    -----------------------------------------------------------------------------------------------
    --Sensors
    p_sys_io_i(2).dat <= limit_x_neg;
    p_sys_io_i(3).dat <= limit_x_pos;
    p_sys_io_i(4).dat <= limit_x_ref;
    p_sys_io_i(5).dat <= limit_y_neg;
    p_sys_io_i(6).dat <= limit_y_pos;
    p_sys_io_i(7).dat <= limit_y_ref;
    p_sys_io_i(8).dat <= limit_z_neg;
    p_sys_io_i(9).dat <= limit_z_pos;
    --Actuators
    p_sys_io_o(17).dat <= x_enable;
    p_sys_io_o(18).dat <= x_out_pos;
    p_sys_io_o(19).dat <= x_out_neg;
    p_sys_io_o(20).dat <= y_enable;
    p_sys_io_o(21).dat <= y_out_neg;
    p_sys_io_o(22).dat <= y_out_pos;
    p_sys_io_o(23).dat <= z_enable;
    p_sys_io_o(24).dat <= z_out_pos;
    p_sys_io_o(25).dat <= z_out_neg;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        variable assert_hold    :   time := 5 ns;
        variable post_hold      :   time := 5 ns;
    begin

        for i in 0 to (2**17)-1 loop
            --Simulate possible gpio values
            input_values <= std_logic_vector(to_unsigned(i,17));

            wait for assert_hold;
            --Mask tests
            --X_Enable channel
            if((limit_x_neg = '1' and limit_x_pos = '1')  or 
               (limit_x_neg = '1' and limit_x_ref = '1')  or
               (limit_x_pos = '1' and limit_x_ref = '1')  or 
               (x_out_pos   = '1' and x_out_neg   = '1')  or
               (limit_z_pos = '0' and x_enable    = '1')) then
                
                assert(p_safe_io_o(17).dat = '0') 
                    report "ID01: Expecting p_safe_io_o(0) disabled" severity error;
            end if;

            --X_Out_Pos Channel
            if((limit_x_pos = '1'                      )  or 
               (limit_x_neg = '1' and limit_x_ref = '1')  or 
               (x_out_pos   = '1' and x_out_neg   = '1')  or
               (limit_z_pos = '0'                      )) then

                assert(p_safe_io_o(18).dat = '0')
                    report "ID02: Expecting p_safe_io_o(1) disabled" severity error;
            end if;

            --X_Out_Neg Channel
            if((limit_x_neg = '1'                      )  or 
               (limit_x_pos = '1' and limit_x_ref = '1')  or 
               (x_out_pos   = '1' and x_out_neg   = '1')  or
               (limit_z_pos = '0'                      )) then
            
                assert(p_safe_io_o(19).dat = '0')
                    report "ID03: Expecting p_safe_io_o(2) disabled" severity error;
            end if;

            --Y_Enable Channel
            if((limit_y_neg = '1' and limit_y_pos = '1')  or 
               (limit_y_neg = '1' and limit_y_ref = '1')  or
               (limit_y_pos = '1' and limit_y_ref = '1')  or 
               (y_out_pos   = '1' and y_out_neg   = '1')  or
               (limit_z_pos = '0'                      )) then
            
                assert(p_safe_io_o(20).dat = '0')
                    report "ID04: Expecting p_safe_io_o(3) disabled" severity error;
            end if;

            --Y_Out_Neg Channel
            if((limit_y_neg = '1'                      )  or 
               (limit_y_pos = '1' and limit_y_ref = '1')  or 
               (y_out_pos   = '1' and y_out_neg   = '1')  or
               (limit_z_pos = '0'                      )) then

                assert(p_safe_io_o(21).dat = '0')
                    report "ID05: Expecting p_safe_io_o(4) disabled" severity error;
            end if; 

            --Y_Out_Pos Channel
            if((limit_y_pos = '1'                      )  or 
               (limit_y_neg = '1' and limit_y_ref = '1')  or
               (y_out_pos   = '1' and y_out_neg   = '1')  or
               (limit_z_pos = '0'                      )) then
            
                assert(p_safe_io_o(22).dat = '0')
                    report "ID06: Expecting p_safe_io_o(5) disabled" severity error;
            end if;

            --Z_Enable Channel
            if((limit_z_neg = '1' and limit_z_pos = '1')  or 
               (z_out_pos   = '1' and z_out_neg   = '1')) then
                
                assert(p_safe_io_o(23).dat = '0')
                    report "ID07: Expecting p_safe_io_o(6) disabled" severity error;
            end if;

            --Z_Out_Pos Channel
            if((limit_z_pos = '1'                      )  or 
               (z_out_pos   = '1' and z_out_neg   = '1')) then
            
                assert(p_safe_io_o(24).dat = '0')
                    report "ID07: Expecting p_safe_io_o(7) disabled" severity error;
            end if;

            --Z_Out_Neg Channel
            if((limit_z_neg = '1'                      )  or 
               (z_out_pos   = '1' and z_out_neg   = '1')) then
            
                assert(p_safe_io_o(25).dat = '0')
                    report "ID08: Expecting p_safe_io_o(8) disabled" severity error;
            end if;

            wait for post_hold;
        end loop;


  		--**End simulation**
		wait for 50 ns;
        report "AP1: ACUTATOR_MASK_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- wait;
		
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;