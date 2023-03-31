-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Error protection module testbench
-- Module Name:		ACTUATOR_MASK_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom libraries
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_COMM_STANDARD.all;




--! Functionality simulation
entity ACTUATOR_MASK_TB is
end entity ACTUATOR_MASK_TB;



--! Simulation architecture
architecture TB of ACTUATOR_MASK_TB is

    --CUT
    component ACTUATOR_MASK
        port(
            sys_io_i    : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            sys_io_o    : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            safe_io_out : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0) 
        );
    end component;


    --Intermediate Signals
	--DUT i/o
    signal sys_io_i         :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal sys_io_o         :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal safe_io_out      :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
        alias x_enable_s    :   std_logic is safe_io_out(17).dat;
        alias x_out_1_s     :   std_logic is safe_io_out(18).dat;
        alias x_out_2_s     :   std_logic is safe_io_out(19).dat;
        alias y_enable_s    :   std_logic is safe_io_out(20).dat;
        alias y_out_1_s     :   std_logic is safe_io_out(21).dat;
        alias y_out_2_s     :   std_logic is safe_io_out(22).dat;
        alias z_enable_s    :   std_logic is safe_io_out(23).dat;
        alias z_out_1_s     :   std_logic is safe_io_out(24).dat;
        alias z_out_2_s     :   std_logic is safe_io_out(25).dat;
    
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
        alias x_out_1       :   std_logic is input_values(9);
        alias x_out_2       :   std_logic is input_values(10);
        alias y_enable      :   std_logic is input_values(11);
        alias y_out_1       :   std_logic is input_values(12);
        alias y_out_2       :   std_logic is input_values(13);
        alias z_enable      :   std_logic is input_values(14);
        alias z_out_1       :   std_logic is input_values(15);
        alias z_out_2       :   std_logic is input_values(16);


begin

    DUT : ACTUATOR_MASK
    port map(
        sys_io_i    => sys_io_i,
        sys_io_o    => sys_io_o,
        safe_io_out => safe_io_out
    );

    
    --Sensors
    sys_io_i(2).dat <= limit_x_neg;
    sys_io_i(3).dat <= limit_x_pos;
    sys_io_i(4).dat <= limit_x_ref;
    sys_io_i(5).dat <= limit_y_neg;
    sys_io_i(6).dat <= limit_y_pos;
    sys_io_i(7).dat <= limit_y_ref;
    sys_io_i(8).dat <= limit_z_neg;
    sys_io_i(9).dat <= limit_z_pos;
    --Actuators
    sys_io_o(17).dat <= x_enable;
    sys_io_o(18).dat <= x_out_1;
    sys_io_o(19).dat <= x_out_2;
    sys_io_o(20).dat <= y_enable;
    sys_io_o(21).dat <= y_out_1;
    sys_io_o(22).dat <= y_out_2;
    sys_io_o(23).dat <= z_enable;
    sys_io_o(24).dat <= z_out_1;
    sys_io_o(25).dat <= z_out_2;



    TEST : process
        variable assert_hold    :   time := 5 ns;
        variable post_hold      :   time := 5 ns;
    begin

        for i in 0 to (2**17)-1 loop
            --Simulate possible gpio values
            input_values <= std_logic_vector(to_unsigned(i,17));

            wait for assert_hold;
            --Mask tests
            if((limit_x_neg = '1' and limit_x_pos = '1') or (limit_x_neg = '1' and limit_x_ref = '1') or
               (limit_x_pos = '1' and limit_x_ref = '1') or (x_out_1 = '1'and x_out_2 = '1') or
               (limit_z_pos = '0' and x_enable = '1'))   then
                
                assert(safe_io_out(17).dat = '0') 
                    report "line(135): Expecting safe_io_out(0) disabled" severity error;
            end if;

            if((limit_x_neg = '1' and limit_x_pos = '1') or (limit_x_neg = '1' and limit_x_ref = '1') or
               (limit_x_pos = '1' and limit_x_ref = '1') or (x_out_1 = '1'     and x_out_2 = '1')     or
               (limit_z_pos = '0' and x_enable = '1')    or (limit_x_neg = '1' and x_out_1 = '1'))    then

                assert(safe_io_out(18).dat = '0')
                    report "line(143): Expecting safe_io_out(1) disabled" severity error;
            end if;

            if((limit_x_neg = '1' and limit_x_pos = '1') or (limit_x_neg = '1' and limit_x_ref = '1') or
               (limit_x_pos = '1' and limit_x_ref = '1') or (x_out_1 = '1'     and x_out_2 = '1')     or
               (limit_z_pos = '0' and x_enable = '1')    or (limit_x_pos = '1' and x_out_2 = '1'))    then
            
                assert(safe_io_out(19).dat = '0')
                    report "line(151): Expecting safe_io_out(2) disabled" severity error;
            end if;

            if((limit_y_neg = '1' and limit_y_pos = '1') or (limit_y_neg = '1' and limit_y_ref = '1') or
               (limit_y_pos = '1' and limit_y_ref = '1') or (y_out_1 = '1'     and y_out_2     = '1') or
               (limit_z_pos = '0' and y_enable = '1'))   then
            
                assert(safe_io_out(20).dat = '0')
                    report "line(159): Expecting safe_io_out(3) disabled" severity error;
            end if;

            if((limit_y_neg = '1' and limit_y_pos = '1') or (limit_y_neg = '1' and limit_y_ref = '1') or
               (limit_y_pos = '1' and limit_y_ref = '1') or (y_out_1 = '1'     and y_out_2     = '1') or
               (limit_z_pos = '0' and y_enable = '1')    or (limit_y_neg = '1' and y_out_1 = '1'))    then

                assert(safe_io_out(21).dat = '0')
                    report "line(167): Expecting safe_io_out(4) disabled" severity error;
            end if; 

            if((limit_y_neg = '1' and limit_y_pos = '1') or (limit_y_neg = '1' and limit_y_ref = '1') or
               (limit_y_pos = '1' and limit_y_ref = '1') or (y_out_1 = '1'     and y_out_2     = '1') or
               (limit_z_pos = '0' and y_enable = '1')    or (limit_y_pos = '1' and y_out_2 = '1'))    then
            
                assert(safe_io_out(22).dat = '0')
                    report "line(175): Expecting safe_io_out(5) disabled" severity error;
            end if;

            if((limit_z_neg = '1' and limit_z_pos = '1') or (z_out_1 = '1'     and z_out_2 = '1'))    then
                
                assert(safe_io_out(23).dat = '0')
                    report "line(181): Expecting safe_io_out(6) disabled" severity error;
            end if;

            if((limit_z_neg = '1' and limit_z_pos = '1') or (z_out_1 = '1'     and z_out_2 = '1')     or
               (limit_z_neg = '1' and z_out_1 = '1')) then
            
                assert(safe_io_out(24).dat = '0')
                    report "line(188): Expecting safe_io_out(7) disabled" severity error;
            end if;

            if((limit_z_neg = '1' and limit_z_pos = '1') or (z_out_1 = '1'     and z_out_2 = '1')     or
               (limit_z_pos = '1' and z_out_2 = '1')) then
            
                assert(safe_io_out(25).dat = '0')
                    report "line(195): Expecting safe_io_out(8) disabled" severity error;
            end if;


            wait for post_hold;
        end loop;


        --End simulation
        wait for 50 ns;
        wait;

    end process;


end TB;