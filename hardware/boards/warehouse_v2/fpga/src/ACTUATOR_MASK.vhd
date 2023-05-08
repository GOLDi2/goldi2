-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Actuator mask for damage prevention 
-- Module Name:		ACTUATOR_MASK
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--                  -> VIRTUAL_SENSOR_ARRAY.vhd
--                  -> EDGE_DETECTOR.vhd
--                  -> IO_DEBOUNCE.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: Release for Warehouse_V2
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;
use work.GOLDI_MODULE_CONFIG.all;




--! @brief
--! @details
entity ACTUATOR_MASK is
    generic(
        ENC_X_INVERT    :   boolean := false;
        ENC_Z_INVERT    :   boolean := false;
        LIMIT_X_SENSORS :   sensor_limit_array(9 downto 0) := (others => (0,0));
        LIMIT_Z_SENSORS :   sensor_limit_array(4 downto 0) := (others => (0,0))
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --System data
        sys_io_i        : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
        sys_io_o        : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
        --Masked data
        safe_io_o       : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
    );
end entity ACTUATOR_MASK;




--! General architecture
architecture RTL of ACTUATOR_MASK is

    --****INTERNAL SIGNALS****
    --Motor inputs
    alias motor_x_step      :   std_logic is sys_io_o(18).dat;
    alias motor_x_dir       :   std_logic is sys_io_o(19).dat;
    alias motor_y_enb       :   std_logic is sys_io_o(24).dat;
    alias motor_y_pos       :   std_logic is sys_io_o(25).dat;
    alias motor_y_neg       :   std_logic is sys_io_o(26).dat;
    alias motor_z_step      :   std_logic is sys_io_o(30).dat;
    alias motor_z_dir       :   std_logic is sys_io_o(31).dat;
    --Debounce sensors
    signal stable_sensors   :   std_logic_vector(5 downto 0);
        alias limit_x_neg   :   std_logic is stable_sensors(0);
        alias limit_x_pos   :   std_logic is stable_sensors(1);
        alias limit_y_neg   :   std_logic is stable_sensors(2);
        alias limit_y_pos   :   std_logic is stable_sensors(3);
        alias limit_z_neg   :   std_logic is stable_sensors(4);
        alias limit_z_pos   :   std_logic is stable_sensors(5);
    --Virtual sensor limits
    signal rst_virtual_x    :   std_logic;
    signal rst_virtual_z    :   std_logic;
    signal x_sensor_array   :   std_logic_vector(9 downto 0);
    signal z_sensor_array   :   std_logic_vector(4 downto 0);
    signal x_virtual_limit  :   std_logic;
    signal z_virtual_limit  :   std_logic;
    --Limit detection
    signal x_limits         :   std_logic;
    signal y_limits         :   std_logic;
    signal z_limits         :   std_logic;
    signal x_p_edge         :   std_logic;
    signal y_p_edge         :   std_logic;
    signal z_p_edge         :   std_logic;
    --Direction buffers
    signal x_direction_buff :   std_logic;
    signal y_direction_buff :   std_logic_vector(1 downto 0);
    signal z_direction_buff :   std_logic;
    --Actuator mask
    signal mask             :   std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0);


begin

    --****SENSOR DEBOUNCE****
    -----------------------------------------------------------------------------------------------
    STABILIZERS : for i in 0 to 5 generate
        DEBOUNCER : entity work.IO_DEBOUNCE
        generic map(
            STAGES      => 4,
            CLK_FACTOR  => 12000
        )
        port map(
            clk         => clk,
            rst         => rst,
            io_raw      => sys_io_i(i+2).dat,
            io_stable   => stable_sensors(i)
        );
    end generate;
    -----------------------------------------------------------------------------------------------



    --****VIRTUAL SENSOR LIMITS****
    -----------------------------------------------------------------------------------------------
    --Reset sensor arrays with normal reset and when sensor limit_x_neg/limit_z_neg are triggered
    rst_virtual_x <= rst or limit_x_neg;
    rst_virtual_z <= rst or limit_z_neg;


    X_SENSORS : entity work.VIRTUAL_SENSOR_ARRAY
    generic map(
        INVERT          => ENC_X_INVERT,
        NUMBER_SENSORS  => 10,
        SENSOR_LIMITS   => LIMIT_X_SENSORS
    )
    port map(
        clk             => clk,
        rst             => rst_virtual_x,
        enc_channel_a   => sys_io_i(9).dat,     --Encoder x channel a
        enc_channel_b   => sys_io_i(10).dat,    --Encoder x channel b
        sensor_data_out => x_sensor_array
    );


    Z_SENSORS : entity work.VIRTUAL_SENSOR_ARRAY
    generic map(
        INVERT          => ENC_Z_INVERT,
        NUMBER_SENSORS  => 5,
        SENSOR_LIMITS   => LIMIT_Z_SENSORS
    )
    port map(
        clk             => clk,
        rst             => rst_virtual_z,
        enc_channel_a   => sys_io_i(12).dat,    --Encoder z channel a
        enc_channel_b   => sys_io_i(13).dat,    --Encoder z channel b
        sensor_data_out => z_sensor_array
    );
    

    --Reduce limit vectors to a limit flag that indicates if the crane is out of bounds
    x_virtual_limit <= '1' when((x_sensor_array'range => '0') = x_sensor_array) else '0';
    z_virtual_limit <= '1' when((z_sensor_array'range => '0') = z_sensor_array) else '0';
    -----------------------------------------------------------------------------------------------




    --****LIMIT DETECTION***
    -----------------------------------------------------------------------------------------------
    --Combine physical limits and virtal limits into a flag to protect incorrect motor driving
    x_limits <= limit_x_neg or limit_x_pos or x_virtual_limit;
    y_limits <= limit_y_neg or limit_y_pos;
    z_limits <= limit_z_neg or limit_z_pos or z_virtual_limit;


    --Detect a rising edge in the limit signals
    X_LIMIT_EDGES : entity work.EDGE_DETECTOR
    port map(
        clk     => clk,
        rst     => rst,
        data_in => x_limits,
        n_edge  => open,
        p_edge  => x_p_edge
    );

    Y_LIMIT_EDGES : entity work.EDGE_DETECTOR
    port map(
        clk     => clk,
        rst     => rst,
        data_in => y_limits,
        n_edge  => open,
        p_edge  => y_p_edge
    );

    Z_LIMIT_EDGES : entity work.EDGE_DETECTOR
    port map(
        clk     => clk,
        rst     => rst,
        data_in => z_limits,
        n_edge  => open,
        p_edge  => z_p_edge
    );
    -----------------------------------------------------------------------------------------------




    --****DIRECTION DETECTION****
    -----------------------------------------------------------------------------------------------
    X_DIRECTION_DETECTION : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                --Reset condition takes into account if limit swiches are already triggered
                if(limit_x_neg = '1') then
                    x_direction_buff <= '1';
                else
                    x_direction_buff <= '0';
                end if;

            elsif(x_p_edge = '1') then
                x_direction_buff <= motor_x_dir;
            end if;
        end if;
    end process;


    Y_DIRECTION_DETECTION : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                --Reset condition takes into account if limit swiches are triggered
                if(limit_y_neg = '1') then
                    y_direction_buff(0) <= '1';
                    y_direction_buff(1) <= '0';
                elsif(limit_y_pos = '1') then
                    y_direction_buff(0) <= '0';
                    y_direction_buff(1) <= '1';
                else
                    y_direction_buff <= (others => '0');
                end if;
            elsif(y_p_edge = '1') then
                y_direction_buff(0) <= motor_y_neg;
                y_direction_buff(1) <= motor_y_pos;
            end if;
        end if;
    end process;


    Z_DIRECTION_DETECTION : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                --Reset condition takes into account if limit swiches are already triggered
                if(z_p_edge = '1') then
                    z_direction_buff <= '1';
                else
                    z_direction_buff <= '0';
                end if;

            elsif(z_p_edge = '1') then
                z_direction_buff <= motor_z_dir;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****MASK GENERATION****
    -----------------------------------------------------------------------------------------------
    mask(17 downto 0) <= (others => '1');


    --X motor protection
    --TMC2660 step signal blocked to avoid damage
    mask(18) <= '0' when(( limit_x_neg = '1' and limit_x_pos      = '1')            or
                         ( limit_x_neg = '1' and x_direction_buff = motor_x_dir)    or
                         ( limit_x_pos = '1' and x_direction_buff = motor_x_dir)    or
                         ((limit_y_neg = '0' and x_virtual_limit  = '1'             and 
                           x_direction_buff = motor_x_dir))                         --or
                        -- ( sys_io_i(17).dat = '1'))                               
    )else    --StallGuard active
                '1';

    mask(23 downto 19) <= (others => '1');


    --Y motor protection
    --H-Bridge enable signal blocked to avoid damage
    mask(24) <= '0' when((limit_y_neg = '1' and limit_x_pos         = '1')          or
                         (y_limits    = '1'                                         and 
                          y_direction_buff = (motor_y_pos & motor_y_neg) ))         else
                '1';

    mask(29 downto 25) <= (others => '1');


    --Z motor protection
    --TMC2660 step signal blocked to avoid damage
    mask(30) <= '0' when(( limit_z_neg = '1' and limit_z_pos      = '1')            or
                         ( limit_z_neg = '1' and z_direction_buff = motor_z_dir)    or
                         ( limit_z_pos = '1' and z_direction_buff = motor_z_dir)    or
                         ((limit_y_neg = '0' and z_virtual_limit  = '1'             and 
                           z_direction_buff = motor_z_dir))    --                     or
                         --( sys_io_i(29).dat = '1')
                         )                                 else    --StallGuard active
                '1';   

    mask(PHYSICAL_PIN_NUMBER-1 downto 31) <= (others => '1'); 
    -----------------------------------------------------------------------------------------------




    --****SAFE IO GENERATION****
    -----------------------------------------------------------------------------------------------
    SIGNAL_PROTECTON : for i in 0 to PHYSICAL_PIN_NUMBER-1 generate
        safe_io_o(i).enb <= sys_io_o(i).enb;
        safe_io_o(i).dat <= sys_io_o(i).dat and mask(i);
    end generate;
    -----------------------------------------------------------------------------------------------


end RTL;