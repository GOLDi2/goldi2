-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Error protection module - Axis Portal V2
-- Module Name:		ACTUATOR_MASK
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



--! @brief System protection module
--! @details
--! Module uses sensor inputs and driver outputs to generate
--! a mask that blocks the driver signals in case of user error to 
--! prevent damage to the physical model.
entity ACTUATOR_MASK is
    port(
        --System raw data
        sys_io_i            : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System asynchronous input data (sensors)
        sys_io_o            : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System output data (drivers)
        actuator_driver_i   : in    std_logic_vector(6 downto 0);                   
        --Masked data
        safe_io_out         : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)     --! Safe output data (drivers)
    );
end entity ACTUATOR_MASK;




--! General architecture
architecture RTL of ACTUATOR_MASK is
    
    --Intermediate signals
    --Buffers
    signal act_mask     :   std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    --Sensor aliases
    alias limit_x_neg       :   std_logic is sys_io_i(2).dat;
    alias limit_x_pos       :   std_logic is sys_io_i(3).dat;
    alias limit_y_neg       :   std_logic is sys_io_i(4).dat;
    alias limit_y_pos       :   std_logic is sys_io_i(5).dat;
    alias limit_z_neg       :   std_logic is sys_io_i(6).dat;
    alias limit_z_pos       :   std_logic is sys_io_i(7).dat;
    --Actuator aliases
    alias x_neg_valid       :   std_logic is actuator_driver_i(0);
    alias x_pos_valid       :   std_logic is actuator_driver_i(1);
    alias y_neg_valid       :   std_logic is actuator_driver_i(2);
    alias y_pos_valid       :   std_logic is actuator_driver_i(3);
    alias z_enable          :   std_logic is actuator_driver_i(4);
    alias z_out_1           :   std_logic is actuator_driver_i(5);
    alias z_out_2           :   std_logic is actuator_driver_i(6);


begin

    --Generate mask
    --General IO's
    act_mask(21 downto 0)                     <= (others => '1');
    act_mask(30 downto 23)                    <= (others => '1');
    act_mask(PHYSICAL_PIN_NUMBER-1 downto 35) <= (others => '1');



    --IO_DATA[22] - XAxis_STEP bit mask
    act_mask(22) <= '0' when((limit_x_neg = '1' and limit_x_pos = '1')  or
                             (limit_z_pos = '0' and x_neg_valid = '1')  or
                             (limit_z_pos = '0' and x_pos_valid = '1')  or
                             (limit_x_neg = '1' and x_neg_valid = '1')  or 
                             (limit_x_pos = '1' and x_pos_valid = '1')) else
                    '1';

    --IO_DATA[31] - YAxis_STEP bit mask
    act_mask(31) <= '0' when((limit_y_neg = '1' and limit_y_pos = '1')  or
                             (limit_z_pos = '0' and y_neg_valid = '1')  or
                             (limit_z_pos = '0' and y_pos_valid = '1')  or
                             (limit_y_neg = '1' and y_neg_valid = '1')  or
                             (limit_y_pos = '1' and y_pos_valid = '1')) else
                    '1';

    --IO_DATA[32] - ZAxis_DCEnable bit mask
    act_mask(32) <= '0' when((limit_z_neg = '1' and limit_z_pos = '1')  or
                             (z_out_1     = '1' and z_out_2     = '1')  or
                             (limit_z_neg = '1' and z_out_2     = '1')  or
                             (limit_z_pos = '1' and z_out_1     = '1')) else
                    '1';

    --IO_DATA[33] - ZAxis_DCAPWM bit mask
    act_mask(33) <= '0' when((limit_z_neg = '1' and limit_z_pos = '1')  or
                             (z_out_1     = '1' and z_out_2     = '1')  or
                             (limit_z_pos = '1' and z_out_1     = '1')) else
                    '1';

    --IO_DATA[34] - ZAxis_DCBPWM bit mask
    act_mask(34) <= '0' when((limit_z_neg = '1' and limit_z_pos = '1')  or
                             (z_out_1     = '1' and z_out_2     = '1')  or
                             (limit_z_neg = '1' and z_out_2     = '1')) else
                    '1';
    


    
    --Generate safe actuation signals
    SIGNAL_PROTECTON : for i in 0 to PHYSICAL_PIN_NUMBER-1 generate
        safe_io_out(i).enb <= sys_io_o(i).enb;
        safe_io_out(i).dat <= sys_io_o(i).dat and act_mask(i);
    end generate;


end architecture;