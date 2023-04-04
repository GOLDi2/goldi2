-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Error protection module
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
        sys_io_i    : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System asynchronous input data (sensors)
        sys_io_o    : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System output data (drivers)
        --Masked data
        safe_io_out : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)     --! Safe output data (drivers)
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
    alias limit_x_ref       :   std_logic is sys_io_i(4).dat;
    alias limit_y_neg       :   std_logic is sys_io_i(5).dat;
    alias limit_y_pos       :   std_logic is sys_io_i(6).dat;
    alias limit_y_ref       :   std_logic is sys_io_i(7).dat;
    alias limit_z_neg       :   std_logic is sys_io_i(8).dat;
    alias limit_z_pos       :   std_logic is sys_io_i(9).dat;
    --Actuator aliases
    alias x_enable          :   std_logic is sys_io_o(17).dat;
    alias x_out_1           :   std_logic is sys_io_o(18).dat;
    alias x_out_2           :   std_logic is sys_io_o(19).dat;
    alias y_enable          :   std_logic is sys_io_o(20).dat;
    alias y_out_1           :   std_logic is sys_io_o(21).dat;
    alias y_out_2           :   std_logic is sys_io_o(22).dat;
    alias z_enable          :   std_logic is sys_io_o(23).dat;
    alias z_out_1           :   std_logic is sys_io_o(24).dat;
    alias z_out_2           :   std_logic is sys_io_o(25).dat;

begin

    --Generate mask
    act_mask(16 downto 0) <= (others => '1');
    act_mask(17) <= '0' when((limit_x_neg = '1' and limit_x_pos = '1') or
                             (limit_x_neg = '1' and limit_x_ref = '1') or
                             (limit_x_pos = '1' and limit_x_ref = '1') or 
                             (x_out_1 = '1'     and x_out_2 = '1')     or
                             (x_out_1 = '1'     and limit_x_pos = '1') or
                             (x_out_2 = '1'     and limit_x_neg = '1') or
                             (limit_z_pos = '0' and x_enable = '1'))   else
                    '1';
    act_mask(18) <= '0' when((limit_x_neg = '1' and limit_x_pos = '1') or
                             (limit_x_neg = '1' and limit_x_ref = '1') or
                             (limit_x_pos = '1' and limit_x_ref = '1') or
                             (x_out_1 = '1'     and x_out_2 = '1')     or
                             (limit_z_pos = '0' and x_enable = '1')    or
                             (limit_x_neg = '1' and x_out_1 = '1'))    else
                    '1';
    act_mask(19) <= '0' when((limit_x_neg = '1' and limit_x_pos = '1') or
                             (limit_x_neg = '1' and limit_x_ref = '1') or
                             (limit_x_pos = '1' and limit_x_ref = '1') or
                             (x_out_1 = '1'     and x_out_2 = '1')     or
                             (limit_z_pos = '0' and x_enable = '1')    or
                             (limit_x_pos = '1' and x_out_2 = '1'))    else
                    '1';
    act_mask(20) <= '0' when((limit_y_neg = '1' and limit_y_pos = '1') or
                             (limit_y_neg = '1' and limit_y_ref = '1') or
                             (limit_y_pos = '1' and limit_y_ref = '1') or
                             (y_out_1 = '1'     and y_out_2     = '1') or
                             (y_out_1 = '1'     and limit_y_pos = '1') or
                             (y_out_2 = '1'     and limit_y_neg = '1') or
                             (limit_z_pos = '0' and y_enable = '1'))   else
                    '1';
    act_mask(21) <= '0' when((limit_y_neg = '1' and limit_y_pos = '1') or
                             (limit_y_neg = '1' and limit_y_ref = '1') or
                             (limit_y_pos = '1' and limit_y_ref = '1') or
                             (y_out_1 = '1'     and y_out_2     = '1') or
                             (limit_z_pos = '0' and y_enable = '1')    or
                             (limit_y_neg = '1' and y_out_1 = '1'))    else
                    '1';
    act_mask(22) <= '0' when((limit_y_neg = '1' and limit_y_pos = '1') or
                             (limit_y_neg = '1' and limit_y_ref = '1') or
                             (limit_y_pos = '1' and limit_y_ref = '1') or
                             (y_out_1 = '1'     and y_out_2     = '1') or
                             (limit_z_pos = '0' and y_enable = '1')    or
                             (limit_y_pos = '1' and y_out_2 = '1'))    else
                   '1';
    act_mask(23) <= '0' when((limit_z_neg = '1' and limit_z_pos = '1') or
                             (z_out_1 = '1'     and limit_z_pos = '1') or
                             (z_out_2 = '1'     and limit_z_neg = '1') or
                             (z_out_1 = '1'     and z_out_2 = '1'))    else
                    '1';
    act_mask(24) <= '0' when((limit_z_neg = '1' and limit_z_pos = '1') or
                             (z_out_1 = '1'     and z_out_2 = '1')     or
                             (limit_z_neg = '1' and z_out_1 = '1'))    else
                    '1';
    act_mask(25) <= '0' when((limit_z_neg = '1' and limit_z_pos = '1') or
                             (z_out_1 = '1'     and z_out_2 = '1')     or
                             (limit_z_pos = '1' and z_out_2 = '1'))    else
                    '1';
    act_mask(PHYSICAL_PIN_NUMBER-1 downto 26) <= (others => '1');


    
    --Generate safe actuation signals
    SIGNAL_PROTECTON : for i in 0 to PHYSICAL_PIN_NUMBER-1 generate
        safe_io_out(i).enb <= sys_io_o(i).enb;
        safe_io_out(i).dat <= sys_io_o(i).dat and act_mask(i);
    end generate;


end architecture;