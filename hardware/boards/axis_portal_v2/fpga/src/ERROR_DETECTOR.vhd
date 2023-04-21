-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Error detector module - Axis Portal V2
-- Module Name:		ERROR_DETECTOR
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




--! @brief List of user and system errors
--! @details
--! Module uses sensor inputs and driver outputs to generate a list
--! of flags correspoinding to the possible user and system errors.
entity ERROR_DETECTOR is 
    generic(
        ADDRESS             :   natural := 1                                        --! Module's base address
    );
    port(
        --General
        clk                 : in    std_logic;                                      --! System clock
        rst                 : in    std_logic;                                      --! Synchronous reset
        --Communication
        sys_bus_i           : in    sbus_in;                                        --! BUS slave input signals [we,adr,dat]
        sys_bus_o           : out   sbus_out;                                       --! BUS slave output signals [dat,val]
        --IO's 
        sys_io_i            : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System asynchronous input data (sensors)
        actuator_driver_i   : in    std_logic_vector(6 downto 0)     --! System output data (drivers)
    );
end entity ERROR_DETECTOR;




--! General architecture
architecture RTL of ERROR_DETECTOR is
    
    --****Internal signals****
    --Memory
    constant memory_length  :   natural := getMemoryLength(11);
    constant reg_default    :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_buff         :   data_word_vector(memory_length-1 downto 0);
    signal error_list       :   std_logic_vector(11 downto 0);
    signal error_list_sync  :   std_logic_vector(11 downto 0);
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

    --Error codifier
    --Sensor input errors
    --X Axis: Both sensors activated
    error_list(0) <= '1' when (limit_x_neg = '1' and limit_x_pos = '1') else '0';
    --Y Axis: Both sensors activated
    error_list(1) <= '1' when (limit_y_neg = '1' and limit_y_pos = '1') else '0';
    --Z Axis: Both sensors activated
    error_list(2) <= '1' when (limit_z_neg = '1' and limit_z_pos = '1') else '0';
    
    
    --Motor input errors
    --X and Y Stepper motors can not be actuated in both directions.
    --Z DC Motor active in both directions
    error_list(3) <= '1' when (z_out_1 = '1' and z_out_2 = '1') else '0';


    --Operation errors
    --X and Y axis actuation when the crane is not at the vertical limit
    --X motor enabled
    error_list(4) <= '1' when (limit_z_pos = '0' and (x_neg_valid = '1' or x_pos_valid = '1')) else '0';
    --Y motor enabled
    error_list(5) <= '1' when (limit_z_pos = '0' and (y_neg_valid = '1' or y_pos_valid = '1')) else '0';
    
    
    --Operation errors
    --X Axis: Left side reached and motor enabled in negative direction (left: -x)
    error_list(6)  <= '1' when (limit_x_neg = '1' and x_neg_valid = '1') else '0';
    --X Axis: Right limit reached and motor enabled in positive direction (right: +x)
    error_list(7)  <= '1' when (limit_x_pos = '1' and x_pos_valid = '1') else '0';
    --Y Axis: Back limit reached and motor enabled in negative direction (back: -y)
    error_list(8)  <= '1' when (limit_y_neg = '1' and y_neg_valid = '1') else '0';
    --Y Axis: Front limit reached and motor enabled in positive direction (front: + y)
    error_list(9)  <= '1' when (limit_y_pos = '1' and y_pos_valid = '1') else '0';
    --Z Axis: Bottom limit reached and motor enabled in negative direction (bottom: -z)
    error_list(10) <= '1' when (limit_z_neg = '1' and z_out_1     = '1') else '0';
    --Z Axis: Top limit reached and motor enbaled in positive direction (top: +z)
    error_list(11) <= '1' when (limit_z_pos = '1' and z_out_2     = '1') else '0';



    --Route memory
    reg_buff <= assignMemory(error_list_sync);



    LIST_SYNC : entity work.SYNCHRONIZER_ARRAY
    generic map(
        ARRAY_WIDTH => 12,
        STAGES      => 2
    )
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => error_list,
        io_sync => error_list_sync
    );


    MEMORY : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS		=> ADDRESS,
        NUMBER_REGISTERS	=> memory_length,
        REG_DEFAULT_VALUES	=> reg_default
    )
    port map(
        clk				=> clk,
        rst				=> rst,
        sys_bus_i		=> sys_bus_i,
        sys_bus_o		=> sys_bus_o,
        reg_data_in		=> reg_buff,
        reg_data_out	=> open,
        reg_data_stb	=> open
    );


end architecture;