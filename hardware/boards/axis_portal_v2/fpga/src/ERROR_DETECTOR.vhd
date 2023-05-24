-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Error detector for 3_axis_portal_v1
-- Module Name:		ERROR_DETECTOR
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
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_COMM_STANDARD.all;




--! @brief List of user and system errors
--! @details
--! Module uses sensor inputs and driver outputs to generate a list
--! of flags correspoinding to the possible user and system errors.
entity ERROR_DETECTOR is 
    generic(
        ADDRESS         :   natural := 1                                        --! Module's base address
    );
    port(
        --General
        clk             : in    std_logic;                                      --! System clock
        rst             : in    std_logic;                                      --! Synchronous reset
        --Communication
        sys_bus_i       : in    sbus_in;                                        --! BUS slave input signals [we,adr,dat]
        sys_bus_o       : out   sbus_out;                                       --! BUS slave output signals [dat,val]
        --IO's 
        sys_io_i        : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System synchronous input data (sensors)
        sys_io_o        : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)     --! System output data (drivers)
    );
end entity ERROR_DETECTOR;




--! General architecture
architecture RTL of ERROR_DETECTOR is

    --****INTERNAL SIGNALS****
    --Sensor aliases
    alias limit_x_neg       :   std_logic is sys_io_i(2).dat;
    alias limit_x_pos       :   std_logic is sys_io_i(3).dat;
    alias limit_y_neg       :   std_logic is sys_io_i(4).dat;
    alias limit_y_pos       :   std_logic is sys_io_i(5).dat;
    alias limit_z_neg       :   std_logic is sys_io_i(6).dat;
    alias limit_z_pos       :   std_logic is sys_io_i(7).dat;
    --Actuator aliases
    alias motor_x_step      :   std_logic is sys_io_o(16).dat;
    alias motor_x_dir       :   std_logic is sys_io_o(17).dat;
    alias motor_y_step      :   std_logic is sys_io_o(25).dat;
    alias motor_y_dir       :   std_logic is sys_io_o(26).dat;
    alias motor_z_enb       :   std_logic is sys_io_o(31).dat;
    alias motor_z_out_1     :   std_logic is sys_io_o(32).dat;
    alias motor_z_out_2     :   std_logic is sys_io_o(33).dat;
    
    --Memory
    constant memory_length  :   natural := getMemoryLength(13);
    constant reg_default    :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_buff         :   data_word_vector(memory_length-1 downto 0);
    signal error_list       :   std_logic_vector(12 downto 0);
    --Sensor Edges
    signal x_stepper_active :   std_logic;
    signal y_stepper_active :   std_logic;
    signal z_motor_active   :   std_logic;


begin

    --****DETECTION OF ACTIVE STEPPERS****
    -----------------------------------------------------------------------------------------------
    X_STEPPER_ON : entity work.IO_DEBOUNCE
    generic map(
        STAGES      => 5,       
        CLK_FACTOR  => 19200    
    )
    port map(
        clk         => clk,
        rst         => rst,
        io_raw      => motor_x_step,
        io_stable   => x_stepper_active
    );

    Y_STEPPER_ON : entity work.IO_DEBOUNCE
    generic map(
        STAGES      => 5,       
        CLK_FACTOR  => 19200    
    )
    port map(
        clk         => clk,
        rst         => rst,
        io_raw      => motor_y_step,
        io_stable   => y_stepper_active
    );

    Z_STEPPER_ON : entity work.IO_DEBOUNCE
    generic map(
        STAGES      => 5,       
        CLK_FACTOR  => 19200    
    )
    port map(
        clk         => clk,
        rst         => rst,
        io_raw      => motor_z_enb,
        io_stable   => z_motor_active
    ); 
    -----------------------------------------------------------------------------------------------



    --****ERROR CODIFICATION****
    -----------------------------------------------------------------------------------------------
    --Multi-sensor activation errors:
    --Error code 0 - Limit sensors max left and right active
    error_list(0)  <= '1' when(limit_x_neg = '1' and limit_x_pos = '1') else '0';
    --Error code 1 - Limit sensors max back and max front active
    error_list(1)  <= '1' when(limit_y_neg = '1' and limit_y_pos = '1') else '0';
    --Error code 2 - Limit sensors max bottom and max top active
    error_list(2)  <= '1' when(limit_z_neg = '0' and limit_z_pos = '1') else '0';


    --Crane position errors:
    --Error code 3 - X Motor actuated left and crane down
    error_list(3)  <= '1' when(limit_z_pos = '0' and motor_x_dir = '0' and x_stepper_active = '1') else '0';
    --Error code 4 - X Motor actuated right and crane down
    error_list(4)  <= '1' when(limit_z_pos = '0' and motor_x_dir = '1' and x_stepper_active = '1') else '0';
    --Error code 5 - Y Motor actuated back and crane down
    error_list(5)  <= '1' when(limit_z_pos = '0' and motor_y_dir = '0' and y_stepper_active = '1') else '0';
    --Error code 13 - Y DC Motor actuated front and crane down
    error_list(6)  <= '1' when(limit_z_pos = '0' and motor_y_dir = '1' and y_stepper_active = '1') else '0';


    --AP operation errors (DC out channels correct):
    --Error code 8 - Limit left triggered and X Motor actuated left
    error_list(7)  <= '1' when(limit_x_neg = '1' and motor_x_dir = '0' and x_stepper_active = '1') else '0';
    --Error code 9 - Limit right triggered and X Motor actuated right
    error_list(8)  <= '1' when(limit_x_pos = '1' and motor_x_dir = '1' and x_stepper_active = '1') else '0';
    --Error code 10 - Limit back triggered and Y Motor actuated back
    error_list(9) <= '1' when(limit_y_neg = '1' and motor_y_dir = '1' and y_stepper_active = '1') else '0';
    --Error code 11 - Limit front triggered and Y Motor actuated front
    error_list(10) <= '1' when(limit_y_pos = '1' and motor_y_dir = '0' and y_stepper_active = '1') else '0';
    --Error code 12 - Limit bottom triggered and Z DC Motor actuated bottom
    error_list(11) <= '1' when(limit_z_neg = '0' and motor_z_out_2 = '1' and z_motor_active = '1') else '0';
    --Error code 13 - Limit top triggered and Z DC Motor actuated top
    error_list(12) <= '1' when(limit_z_pos = '1' and motor_z_out_1 = '1' and z_motor_active = '1') else '0';
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    reg_buff <= setMemory(error_list);

    MEMORY : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS		=> ADDRESS,
        NUMBER_REGISTERS	=> memory_length,
        REG_DEFAULT_VALUES	=> reg_default
    )
    port map(
        clk				    => clk,
        rst				    => rst,
        sys_bus_i		    => sys_bus_i,
        sys_bus_o		    => sys_bus_o,
        data_in		        => reg_buff,
        data_out	        => open,
        read_stb	        => open,
        write_stb           => open
    );
    -----------------------------------------------------------------------------------------------


end architecture;