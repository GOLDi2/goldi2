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
    alias limit_x_ref       :   std_logic is sys_io_i(4).dat;
    alias limit_y_neg       :   std_logic is sys_io_i(5).dat;
    alias limit_y_pos       :   std_logic is sys_io_i(6).dat;
    alias limit_y_ref       :   std_logic is sys_io_i(7).dat;
    alias limit_z_neg       :   std_logic is sys_io_i(8).dat;
    alias limit_z_pos       :   std_logic is sys_io_i(9).dat;
    --Actuator aliases
    alias x_enable          :   std_logic is sys_io_o(17).dat;
    alias x_out_pos         :   std_logic is sys_io_o(18).dat;
    alias x_out_neg         :   std_logic is sys_io_o(19).dat;
    alias y_enable          :   std_logic is sys_io_o(20).dat;
    alias y_out_pos         :   std_logic is sys_io_o(22).dat;
    alias y_out_neg         :   std_logic is sys_io_o(21).dat;
    alias z_enable          :   std_logic is sys_io_o(23).dat;
    alias z_out_pos         :   std_logic is sys_io_o(24).dat;
    alias z_out_neg         :   std_logic is sys_io_o(25).dat;
    
    --Memory
    constant memory_length  :   natural := getMemoryLength(22);
    constant reg_default    :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_buff         :   data_word_vector(memory_length-1 downto 0);
    signal error_list       :   std_logic_vector(22 downto 0);
    --Sensor Edges
    signal x_limits         :   std_logic;
    signal y_limits         :   std_logic;
    signal z_limits         :   std_logic;
    signal x_p_edge         :   std_logic;
    signal y_p_edge         :   std_logic;
    signal z_p_edge         :   std_logic;
    --Actuator buffers
    signal x_out_neg_buff   :   std_logic;
    signal x_out_pos_buff   :   std_logic;
    signal y_out_neg_buff   :   std_logic;
    signal y_out_pos_buff   :   std_logic;
    signal z_out_neg_buff   :   std_logic;
    signal z_out_pos_buff   :   std_logic;         


begin

    --****X SENSOR MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    x_limits <= limit_x_neg or limit_x_pos;

    X_SENSORS_EDGES : entity work.EDGE_DETECTOR
    port map(
        clk     => clk,
        rst     => rst,
        data_in => x_limits,
        n_edge  => open,
        p_edge  => x_p_edge
    );


    X_DIRECTION_DETECTOR : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                x_out_neg_buff <= '0';
                x_out_pos_buff <= '0';
            
            --Record movement direction when a sensor rising edge is detected
            elsif(x_p_edge = '1') then
                x_out_neg_buff <= x_out_neg;
                x_out_pos_buff <= x_out_pos;

            --Clear movement direction after a sensor returns to idle
            elsif(x_limits = '0') then
                x_out_neg_buff <= '0';
                x_out_pos_buff <= '0';
            
            else null;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****Y SENSOR MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    y_limits <= limit_y_neg or limit_y_pos;

    Y_SENSORS_EDGES : entity work.EDGE_DETECTOR
    port map(
        clk     => clk,
        rst     => rst,
        data_in => y_limits,
        n_edge  => open,
        p_edge  => y_p_edge
    );


    Y_DIRECTION_DETECTOR : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                y_out_neg_buff <= '0';
                y_out_pos_buff <= '0';
            
            --Record movement direction when a sensor rising edge is detected
            elsif(y_p_edge = '1') then
                y_out_neg_buff <= y_out_neg;
                y_out_pos_buff <= y_out_pos;

            --Clear movement direction after a sensor returns to idle
            elsif(y_limits = '0') then
                y_out_neg_buff <= '0';
                y_out_pos_buff <= '0';
            
            else null;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------
    
    

    --****Z SENSOR MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    z_limits <= limit_z_neg or limit_z_pos;

    Z_SENSOR_EDGES : entity work.EDGE_DETECTOR
    port map(
        clk     => clk,
        rst     => rst,
        data_in => z_limits,
        n_edge  => open,
        p_edge  => z_p_edge
    );


    Z_DIRECTION_DETECTOR : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                z_out_neg_buff <= '0';
                z_out_pos_buff <= '0';
            
            --Record movement direction when a sensor rising edge is detected
            elsif(z_p_edge = '1') then
                z_out_neg_buff <= z_out_neg;
                z_out_pos_buff <= z_out_pos;

            --Clear movement direction after a sensor returns to idle
            elsif(z_limits = '0') then
                z_out_neg_buff <= '0';
                z_out_pos_buff <= '0';
            
            else null;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****ERROR CODIFICATION****
    -----------------------------------------------------------------------------------------------
    --Multi-sensor activation errors:
    --Error code 0 - Limit sensors max left and right active
    error_list(0)  <= '1' when(limit_x_neg = '1' and limit_x_pos = '1') else '0';
    --Error code 1 - Limit sensors max left and reference active
    error_list(1)  <= '1' when(limit_x_neg = '1' and limit_x_ref = '1') else '0';
    --Error code 2 - Limit sensors max right and reference active
    error_list(2)  <= '1' when(limit_x_pos = '1' and limit_x_ref = '1') else '0';
    --Error code 3 - Limit sensors max back and max front active
    error_list(3)  <= '1' when(limit_y_neg = '1' and limit_y_pos = '1') else '0';
    --Error code 4 - Limit sensors max back and reference active
    error_list(4)  <= '1' when(limit_y_neg = '1' and limit_y_ref = '1') else '0';
    --Error code 5 - Limit sensors max front and reference active
    error_list(5)  <= '1' when(limit_y_pos = '1' and limit_y_ref = '1') else '0';
    --Error code 6 - Limit sensors max bottom and max top active
    error_list(6)  <= '1' when(limit_z_neg = '1' and limit_z_pos = '1') else '0';
    

    --Motor direction errors:
    --Error code 7 - DC Motor X actuated left and right 
    error_list(7)  <= '1' when(x_out_neg = '1' and x_out_pos = '1') else '0';
    --Error code 8 - DC Motor Y actuated back and front
    error_list(8)  <= '1' when(y_out_neg = '1' and y_out_pos = '1') else '0';
    --Error code 9 - DC Motor Z actuated bottom and top
    error_list(9)  <= '1' when(z_out_neg = '1' and z_out_pos = '1') else '0';


    --Crane position errors:
    --Error code 10 - X DC Motor actuated left and crane down
    error_list(10) <= '1' when(limit_z_pos = '0' and x_out_neg = '1') else '0';
    --Error code 11 - X DC Motor actuated right and crane down
    error_list(11) <= '1' when(limit_z_pos = '0' and x_out_pos = '1') else '0';
    --Error code 12 - Y DC Motor actuated back and crane down
    error_list(12) <= '1' when(limit_z_pos = '0' and y_out_neg = '1') else '0';
    --Error code 13 - Y DC Motor actuated front and crane down
    error_list(13) <= '1' when(limit_z_pos = '0' and y_out_pos = '1') else '0';


    --AP operation errors (DC out channels correct):
    --Error code 14 - Limit left triggered and DC Motor actuated left
    error_list(14) <= '1' when(x_out_neg = '1' and x_out_neg_buff = '1') else '0';
    --Error code 15 - Limit right triggered and DC Motor actuated right
    error_list(15) <= '1' when(x_out_pos = '1' and x_out_pos_buff = '1') else '0';
    --Error code 16 - Limit back triggered and DC Motor actuated back
    error_list(16) <= '1' when(y_out_neg = '1' and y_out_neg_buff = '1') else '0';
    --Error code 17 - Limit front triggered and DC Motor actuated front
    error_list(17) <= '1' when(y_out_pos = '1' and y_out_pos_buff = '1') else '0';
    --Error code 18 - Limit bottom triggered and DC Motor actuated bottom
    error_list(18) <= '1' when(z_out_neg = '1' and z_out_neg_buff = '1') else '0';
    --Error code 19 - Limit top triggered and DC Motor actuated top
    error_list(19) <= '1' when(z_out_pos = '1' and z_out_pos_buff = '1') else '0';
   
   
   
    --DC Motor configuration errors
    --Error code 20 - X actuator inverted (Channel A/1/pos <-> Channel B/2/neg)
    error_list(20) <= '1' when((x_out_neg_buff = '1' and limit_x_pos = '1')  or
                               (x_out_pos_buff = '1' and limit_x_neg = '1')) else '0';
    --Error code 21 - Y actuator inverted (Channel A/1/pos <-> Channel B/2/neg)
    error_list(21) <= '1' when((y_out_neg_buff = '1' and limit_y_pos = '1')  or
                               (y_out_pos_buff = '1' and limit_y_neg = '1')) else '0';
    --Error code 22 - Z actuator inverted (Channel A/1/pos <-> Channel B/2/neg)
    error_list(22) <= '1' when((z_out_neg = '1' and z_out_neg_buff = '1' and limit_z_pos = '1') or
                               (z_out_pos = '1' and z_out_pos_buff = '1' and limit_z_neg = '1')) else '0';
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
        clk				=> clk,
        rst				=> rst,
        sys_bus_i		=> sys_bus_i,
        sys_bus_o		=> sys_bus_o,
        reg_data_in		=> reg_buff,
        reg_data_out	=> open,
        reg_data_stb	=> open
    );
    -----------------------------------------------------------------------------------------------


end architecture;