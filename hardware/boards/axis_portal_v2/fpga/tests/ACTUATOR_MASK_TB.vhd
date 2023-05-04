-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/04/2023
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
            sys_io_i            : in    io_i_vector(42 downto 0);
            sys_io_o            : in    io_o_vector(42 downto 0);
            actuator_driver_i   : in    std_logic_vector(6 downto 0);
            safe_io_out         : out   io_o_vector(42 downto 0) 
        );
    end component;


    --Intermediate Signals
	--DUT i/o
    constant sys_io_o       :   io_o_vector(42 downto 0) := (others => (enb => '1', dat => '1'));
    signal sys_io_i         :   io_i_vector(42 downto 0);
    signal safe_io_out      :   io_o_vector(42 downto 0);
        alias x_axis_step   :   std_logic is safe_io_out(22).dat;
        alias y_axis_step   :   std_logic is safe_io_out(31).dat;
        alias z_dc_enabled  :   std_logic is safe_io_out(32).dat;
        alias z_dc_out_1    :   std_logic is safe_io_out(33).dat;
        alias z_dc_out_2    :   std_logic is safe_io_out(34).dat;
    
    signal input_values     :   std_logic_vector(12 downto 0);
        alias limit_x_neg   :   std_logic is input_values(0);
        alias limit_x_pos   :   std_logic is input_values(1);
        alias limit_y_neg   :   std_logic is input_values(2);
        alias limit_y_pos   :   std_logic is input_values(3);
        alias limit_z_neg   :   std_logic is input_values(4);
        alias limit_z_pos   :   std_logic is input_values(5);
        alias x_neg_valid   :   std_logic is input_values(6);
        alias x_pos_valid   :   std_logic is input_values(7);
        alias y_neg_valid   :   std_logic is input_values(8);
        alias y_pos_valid   :   std_logic is input_values(9);
        alias z_dc_enb      :   std_logic is input_values(10);
        alias z_out_1       :   std_logic is input_values(11);
        alias z_out_2       :   std_logic is input_values(12);


begin

    DUT : ACTUATOR_MASK
    port map(
        sys_io_i            => sys_io_i,
        sys_io_o            => sys_io_o,
        actuator_driver_i   => input_values(12 downto 6),
        safe_io_out         => safe_io_out
    );

    
    --Sensors
    sys_io_i(2).dat <= limit_x_neg;
    sys_io_i(3).dat <= limit_x_pos;
    sys_io_i(4).dat <= limit_y_neg;
    sys_io_i(5).dat <= limit_y_pos;
    sys_io_i(6).dat <= limit_z_neg;
    sys_io_i(7).dat <= limit_z_pos;



    TEST : process
        variable assert_hold    :   time := 5 ns;
        variable post_hold      :   time := 5 ns;
    begin

        for i in 0 to (2**13)-1 loop
            --Simulate possible gpio values
            input_values <= std_logic_vector(to_unsigned(i,13));

            wait for assert_hold;
            --Mask tests
            if((limit_x_neg = '1' and limit_x_pos = '1') or (limit_z_pos = '0' and x_neg_valid = '1')   or
               (limit_z_pos = '0' and x_pos_valid = '1') or (limit_x_neg = '1' and x_neg_valid = '1')   or
               (limit_x_pos = '1' and x_pos_valid = '1')) then
                
                assert(safe_io_out(22).dat = '0') 
                    report "line(121): Expecting safe_io_out(22) disabled" severity error;
            end if;

            if((limit_y_neg = '1' and limit_y_pos = '1') or (limit_z_pos = '0' and y_neg_valid = '1')   or
               (limit_z_pos = '0' and y_pos_valid = '1') or (limit_y_neg = '1' and y_neg_valid = '1')   or
               (limit_y_pos = '1' and y_pos_valid = '1')) then

                assert(safe_io_out(31).dat = '0')
                    report "line(129): Expecting safe_io_out(31) disabled" severity error;
            end if;

            if((limit_z_neg = '1' and limit_z_pos = '1') or (z_out_1     = '1' and z_out_2     = '1')   or
               (limit_z_neg = '1' and z_out_2     = '1') or (limit_z_pos = '1' and z_out_1     = '1'))  then  
            
                assert(safe_io_out(32).dat = '0')
                    report "line(136): Expecting safe_io_out(32) disabled" severity error;
            end if;

            if((limit_z_neg = '1' and limit_z_pos = '1') or (z_out_1     = '1' and z_out_2     = '1')   or
               (limit_z_pos = '1' and z_out_1     = '1')) then
            
                assert(safe_io_out(33).dat = '0')
                    report "line(143): Expecting safe_io_out(33) disabled" severity error;
            end if;

            if((limit_z_neg = '1' and limit_z_pos = '1')  or (z_out_1     = '1' and z_out_2     = '1')  or
               (limit_z_neg = '1' and z_out_2     = '1')) then

                assert(safe_io_out(34).dat = '0')
                    report "line(146): Expecting safe_io_out(34) disabled" severity error;
            end if; 


            wait for post_hold;
        end loop;


        --End simulation
        wait for 50 ns;
        wait;

    end process;


end TB;