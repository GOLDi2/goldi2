-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Error protection module
-- Module Name:		ACTUATOR_MASK
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_MODULE_CONFIG.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V4.00.00 - Change to the port signal names
-- Additional Comments: Change to the port signal names to follow the
--                      V4.00.00 naming convention
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Custom packages
library work;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_COMM_STANDARD.all;



--! @brief System protection module
--! @details
--! The module uses sensor inputs and driver outputs to generate
--! a mask that blocks the driver signals in case of user error to 
--! prevent damage to the physical model.
entity ACTUATOR_MASK is
    port(
        --System raw data
        p_sys_io_i  : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System asynchronous input data (sensors)
        p_sys_io_o  : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System output data (drivers)
        --Masked data
        p_safe_io_o : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)     --! Safe output data (drivers)
    );
end entity ACTUATOR_MASK;




--! General architecture
architecture RTL of ACTUATOR_MASK is
    
    --****INTERNAL SIGNALS****
    --Sensor aliases
    alias limit_x_neg       :   std_logic is p_sys_io_i(2).dat;
    alias limit_x_pos       :   std_logic is p_sys_io_i(3).dat;
    alias limit_x_ref       :   std_logic is p_sys_io_i(4).dat;
    alias limit_y_neg       :   std_logic is p_sys_io_i(5).dat;
    alias limit_y_pos       :   std_logic is p_sys_io_i(6).dat;
    alias limit_y_ref       :   std_logic is p_sys_io_i(7).dat;
    alias limit_z_neg       :   std_logic is p_sys_io_i(8).dat;
    alias limit_z_pos       :   std_logic is p_sys_io_i(9).dat;
    --Actuator aliases
    alias x_enable          :   std_logic is p_sys_io_o(17).dat;
    alias x_out_pos         :   std_logic is p_sys_io_o(18).dat;
    alias x_out_neg         :   std_logic is p_sys_io_o(19).dat;
    alias y_enable          :   std_logic is p_sys_io_o(20).dat;
    alias y_out_pos         :   std_logic is p_sys_io_o(22).dat;
    alias y_out_neg         :   std_logic is p_sys_io_o(21).dat;
    alias z_enable          :   std_logic is p_sys_io_o(23).dat;
    alias z_out_pos         :   std_logic is p_sys_io_o(24).dat;
    alias z_out_neg         :   std_logic is p_sys_io_o(25).dat;
    
    --Buffers
    signal act_mask     :   std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    

begin

    --****ACTUATOR MASK GENERATION****
    -----------------------------------------------------------------------------------------------
    act_mask(16 downto 0) <= (others => '1');

    --Mask Bit for x_enable channel
    act_mask(17) <= '0' when((limit_x_neg = '1' and limit_x_pos = '1')  or
                             (limit_x_neg = '1' and limit_x_ref = '1')  or
                             (limit_x_pos = '1' and limit_x_ref = '1')  or 
                             (x_out_neg   = '1' and x_out_pos   = '1')  or
                             (limit_z_pos = '0' ))                      else
                    '1';

    --Mask Bit for x_out_1 / x_out_pos channel
    act_mask(18) <= '0' when((limit_x_pos = '1'                      )  or
                             (limit_x_neg = '1' and limit_x_ref = '1')  or
                             (x_out_neg   = '1' and x_out_pos   = '1')  or
                             (limit_z_pos = '0'                      )) else
                    '1';

    --Mask Bit for x_out_2 / x_out_neg channel                
    act_mask(19) <= '0' when((limit_x_neg = '1'                      )  or
                             (limit_x_pos = '1' and limit_x_ref = '1')  or
                             (x_out_neg   = '1' and x_out_pos   = '1')  or
                             (limit_z_pos = '0'                      )) else
                    '1';
    
    --Mask Bit for y_enable channel
    act_mask(20) <= '0' when((limit_y_neg = '1' and limit_y_pos = '1')  or
                             (limit_y_neg = '1' and limit_y_ref = '1')  or
                             (limit_y_pos = '1' and limit_y_ref = '1')  or
                             (y_out_neg   = '1' and y_out_pos   = '1')  or
                             (limit_z_pos = '0'                      )) else
                    '1';

    --Mask Bit for y_out_1 / y_out_neg channel
    act_mask(21) <= '0' when((limit_y_neg = '1'                      )  or
                             (limit_y_pos = '1' and limit_y_ref = '1')  or
                             (y_out_neg   = '1' and y_out_pos   = '1')  or
                             (limit_z_pos = '0'                      )) else
                    '1';

    --Mask Bit for y_out_2 / y_out_pos channel
    act_mask(22) <= '0' when((limit_y_pos = '1'                      )  or
                             (limit_y_neg = '1' and limit_y_ref = '1')  or
                             (y_out_neg   = '1' and y_out_pos   = '1')  or
                             (limit_z_pos = '0'                      )) else
                   '1';

    --Mask Bit for z_enable channel               
    act_mask(23) <= '0' when((limit_z_neg = '1' and limit_z_pos = '1')  or
                             (z_out_neg   = '1' and z_out_pos   = '1')) else
                    '1';

    --Mask Bit for z_out_1 / z_out_pos channel
    act_mask(24) <= '0' when((limit_z_pos = '1'                      )  or
                             (z_out_neg   = '1' and z_out_pos   = '1')) else
                    '1';

    --Mask Bit for z_out_2 / z_out_neg channel
    act_mask(25) <= '0' when((limit_z_neg = '1'                      )  or
                             (z_out_neg   = '1' and z_out_pos   = '1')) else
                    '1';


    act_mask(PHYSICAL_PIN_NUMBER-1 downto 26) <= (others => '1');
    -----------------------------------------------------------------------------------------------


    
    --****SAFE ACTUATION SIGNAL GENERATION****
    -----------------------------------------------------------------------------------------------
    SIGNAL_PROTECTON : for i in 0 to PHYSICAL_PIN_NUMBER-1 generate
        p_safe_io_o(i).enb <= p_sys_io_o(i).enb;
        p_safe_io_o(i).dat <= p_sys_io_o(i).dat and act_mask(i);
    end generate;
    -----------------------------------------------------------------------------------------------


end architecture;