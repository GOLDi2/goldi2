-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/08/2023
-- Design Name:		Actuator mask for damage prevention (Dynamic) 
-- Module Name:		ACTUATOR_MASK_D
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--                  -> HIGH_DEBOUNCE.vhd
--                  -> ENCODER_DRIVER.vhd
--                  -> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_MODULE_CONFIG.all;




--! @brief Dynamic protection mask for the Warehouse_v2 model
--! @details
--! The dynamic protection mask is an alternate approach to the protection
--! of the Warehouse_V2 model. Instead of using PLU memory units and a large
--! set of logic conditions like the ACTUATOR_MASK used in V3.00.00, the new
--! module uses memory units to limit the movement area of the Warehouse_V2's
--! crane.
--!  
--! The module uses four 16-bit unsigned values corresponding to the lower and
--! upper limits of the X- and Z-Axis. An internal dsp unit processes the data
--! gathered by the incremental encoders and tracks the crane's position. Once
--! the crane has reached the configured limit, the movement in that direction
--! is blocked. This means that if the crane reaches the lower limit of an 
--! axis the crane can not longer be moved in the negative direction. The Y-Axis
--! DC motor is blocked as long as the crane is outside the configured limits.
--!
--! To align the crane with a loading bay both limits can be set to the same
--! value. The crane's movement in both directions and the Y-Axis will be blocked 
--! until the limits are updated by the microcontorler.
--!
--! Additionaly the physical limit switches block the crane's movement if pressed.
--! A debounce module holds a valid high signal for 2.5 us to prevent glitching.
--!
--! ###Registers:
--!
--! |   g_address   |           DATA                |
--! |:-------------:|:-----------------------------:|
--! |           +0  |   x_lower_limit[7:0]          |
--! |           +1  |   x_lower_limit[15:8]         |
--! |           +2  |   x_upper_limit[7:0]          |
--! |           +3  |   x_upper_limit[15:8]         |
--! |           +4  |   z_lower_limit[7:0]          |
--! |           +5  |   z_lower_limit[15:8]         |
--! |           +6  |   z_upper_limit[7:0]          |
--! |           +7  |   z_upper_limit[15:8]         |
--!
entity ACTUATOR_MASK_D is
    generic(
        g_address       :   natural := 1;                                       --! Module's base address
        g_enc_x_invert  :   boolean := false;                                   --! Select x encoder positive direction [false -> CCW | true -> CC]
        g_enc_z_invert  :   boolean := false                                    --! Select z encoder positive direction [false -> CCW | true -> CC]
    );
    port(
        --General
        clk             : in    std_logic;                                      --! System clock
        rst             : in    std_logic;                                      --! Asynchronous reset
        ref_unblock     : in    std_logic;                                      --! Unblock mask to reset encoders
        ref_x_encoder   : in    std_logic;                                      --! Reset for x encoder dsp
        ref_z_encoder   : in    std_logic;                                      --! Reset for z encoder dsp
        --Slave BUS interface
        sys_bus_i       : in    sbus_in;                                        --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;                                       --! BUS output signals [dat,tag,mux]
        --IO Data
        p_sys_io_i      : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System synchronous input data (sensors)
        p_sys_io_o      : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! System output data (drivers)
        p_safe_io_o     : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)     --! Safe output data (drivers)
    );
end entity ACTUATOR_MASK_D;




--! General architecture
architecture RTL of ACTUATOR_MASK_D is

    --****INTENRAL SIGNALS****
    --**Memory**
    constant memory_length      :   natural := getMemoryLength(64);
    constant reg_default        :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_data             :   data_word_vector(memory_length-1 downto 0);
    signal vlimit_x_neg      	:   std_logic_vector(15 downto 0);
    signal vlimit_x_pos      	:   std_logic_vector(15 downto 0);
    signal vlimit_z_neg      	:   std_logic_vector(15 downto 0);
    signal vlimit_z_pos      	:   std_logic_vector(15 downto 0);
    --**Position data**
    signal rst_x_encoder        :   std_logic;
    signal rst_z_encoder        :   std_logic;
    signal enc_x_counter        :   std_logic_vector(15 downto 0);
    signal enc_z_counter        :   std_logic_vector(15 downto 0);
    signal limit_flag           :   std_logic_vector(3 downto 0);
    --**Inputs**
    signal stable_sensors_i     :   std_logic_vector(5 downto 0);
    alias limit_x_neg           :   std_logic is stable_sensors_i(0);
    alias limit_x_pos           :   std_logic is stable_sensors_i(1);
    alias limit_y_neg           :   std_logic is stable_sensors_i(2);
    alias limit_y_pos           :   std_logic is stable_sensors_i(3);
    alias limit_z_neg           :   std_logic is stable_sensors_i(4);
    alias limit_z_pos           :   std_logic is stable_sensors_i(5);
    --Incremental encoders
    alias x_channel_a           :   std_logic is p_sys_io_i(9).dat;
    alias x_channel_b           :   std_logic is p_sys_io_i(10).dat;
    alias z_channel_a           :   std_logic is p_sys_io_i(12).dat;
    alias z_channel_b           :   std_logic is p_sys_io_i(13).dat;
	--Motor inputs
    alias motor_x_step          :   std_logic is p_sys_io_o(18).dat;
    alias motor_x_dir           :   std_logic is p_sys_io_o(19).dat;
    alias motor_y_enb           :   std_logic is p_sys_io_o(24).dat;
    alias motor_y_out_1         :   std_logic is p_sys_io_o(25).dat;
    alias motor_y_out_2         :   std_logic is p_sys_io_o(26).dat;
    alias motor_z_step          :   std_logic is p_sys_io_o(30).dat;
    alias motor_z_dir           :   std_logic is p_sys_io_o(31).dat;
    

begin

    --****SENSOR DEBOUNCE****
    -----------------------------------------------------------------------------------------------
    --Physical sensor debounce removes signal jitter by holding the signal until a logic low is 
    --detected for at least 500us (clk(48*10^6)/stages(4)*clk_factor())
    STABILIZERS : for i in 0 to 5 generate
        DEBOUNCE : entity work.HIGH_DEBOUNCE
        generic map(
            g_stages      => 4,
            g_clk_factor  => 1200
        )
        port map(
            clk         => clk,
            rst         => rst,
            p_io_raw    => p_sys_io_i(i+2).dat,
            p_io_stable => stable_sensors_i(i)
        );
    end generate;
    -----------------------------------------------------------------------------------------------



    --****VIRTUAL LIMIT CONTROL****
    -----------------------------------------------------------------------------------------------
    --Reset encoders through global reset and local reset in register
    rst_x_encoder <= rst or ref_x_encoder;
    rst_z_encoder <= rst or ref_z_encoder;


    X_ENCODER_DSP : entity work.ENCODER_DRIVER
    generic map(
        g_invert_dir    => g_enc_x_invert
    )
    port map(
        clk             => clk,
        rst             => rst_x_encoder,
        enb             => '1',
        p_channel_a     => x_channel_a,
        p_channel_b     => x_channel_b,
        p_enc_count     => enc_x_counter
    );

    Z_ENCODER_DSP : entity work.ENCODER_DRIVER
    generic map(
        g_invert_dir    => g_enc_z_invert
    )
    port map(
        clk             => clk,
        rst             => rst_z_encoder,
        enb             => '1',
        p_channel_a     => z_channel_a,
        p_channel_b     => z_channel_b,
        p_enc_count     => enc_z_counter
    );


    LIMIT_FLAG_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            limit_flag <= (others => '0');
        elsif(rising_edge(clk)) then
            -- X-Axis limits
            if(unsigned(enc_x_counter) <= unsigned(vlimit_x_neg)) then
                limit_flag(0) <= '1';
            else
                limit_flag(0) <= '0';
            end if;

            if(unsigned(vlimit_x_pos) <= unsigned(enc_x_counter)) then
                limit_flag(1) <= '1';
            else 
                limit_flag(1) <= '0';
            end if;

            -- Z-Axis limits
            if(unsigned(enc_z_counter) <= unsigned(vlimit_z_neg)) then
                limit_flag(2) <= '1';
            else
                limit_flag(2) <= '0';
            end if;

            if(unsigned(vlimit_z_pos) <= unsigned(enc_z_counter)) then
                limit_flag(3) <= '1';
            else
                limit_flag(3) <= '0';
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------
    


    --****MASK GENEREATION****
    -----------------------------------------------------------------------------------------------
    p_safe_io_o(17 downto 0) <= p_sys_io_o(17 downto 0);


    --X motor protection
    --TMC2660 step signal blocked to avoid damage
    p_safe_io_o(18).enb <= p_sys_io_o(18).enb;
    p_safe_io_o(18).dat <= '0' when((limit_x_neg   = '1' and limit_x_pos = '1')   or 
                                    (limit_x_neg   = '1' and motor_x_dir = '0')   or
                                    (limit_x_pos   = '1' and motor_x_dir = '1')   or
                                    --Dynamic protection system
                                    (limit_flag(0) = '1' and motor_x_dir = '0' and ref_unblock = '0')  or 
                                    (limit_flag(1) = '1' and motor_x_dir = '1' and ref_unblock = '0')) else
                           p_sys_io_o(18).dat;


    p_safe_io_o(23 downto 19) <= p_sys_io_o(23 downto 19);


    --Y motor protection
    --H-Bridge enable signal blocked to avoid damage
    p_safe_io_o(24).enb <= p_sys_io_o(24).enb;
    p_safe_io_o(24).dat <= '0' when((limit_y_neg = '1' and limit_y_pos   = '1') or
                                    (limit_y_neg = '1' and motor_y_out_2 = '1') or
                                    (limit_y_pos = '1' and motor_y_out_1 = '1') or
                                    (limit_flag  /= (limit_flag'range => '0') ) or
                                    (ref_unblock = '1'))                        else
                            p_sys_io_o(24).dat; 


    p_safe_io_o(29 downto 25) <= p_sys_io_o(29 downto 25);


    --Z motor protection
    --TMC2660 step signal blocked to avoid damage
    p_safe_io_o(30).enb <= p_sys_io_o(30).enb;
    p_safe_io_o(30).dat <= '0' when((limit_z_neg   = '1' and limit_z_pos = '1')   or 
                                    (limit_z_neg   = '1' and motor_z_dir = '0')   or
                                    (limit_z_pos   = '1' and motor_z_dir = '1')   or
                                    --Dynamic protection system
                                    (limit_flag(2) = '1' and motor_z_dir = '0' and ref_unblock = '0')   or
                                    (limit_flag(3) = '1' and motor_z_dir = '1' and ref_unblock = '0'))  else
                           p_sys_io_o(18).dat;


    p_safe_io_o(p_safe_io_o'left downto 31) <= p_sys_io_o(p_sys_io_o'left downto 31);
    -----------------------------------------------------------------------------------------------


    
    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
    generic map(
        g_address       => g_address,
        g_reg_number    => memory_length,
        g_def_values    => reg_default
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_data_in       => reg_data,
        p_data_out      => reg_data,
        p_read_stb      => open,
        p_write_stb     => open
    );
	
	vlimit_x_neg <= reg_data(1) & reg_data(0);
	vlimit_x_pos <= reg_data(3) & reg_data(2);
	vlimit_z_neg <= reg_data(5) & reg_data(4);
	vlimit_z_pos <= reg_data(7) & reg_data(6);
    -----------------------------------------------------------------------------------------------


end architecture;