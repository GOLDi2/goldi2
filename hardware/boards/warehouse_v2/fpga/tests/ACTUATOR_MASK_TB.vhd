-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Actuator mask testbench
-- Module Name:		ACTUATOR_MASK_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--                  -> ACTUATOR_MASK.vhd
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
--! Use assert library for simulation
library std;
use std.standard.all;
--! Use custom packages
library work;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;
use work.GOLDI_MODULE_CONFIG.all;




--! Functionality simulation
entity ACTUATOR_MASK_TB is
end entity ACTUATOR_MASK_TB;




--! Simulation architecture
architecture TB of ACTUATOR_MASK_TB is

    --****DUT****
    component ACTUATOR_MASK
        generic(
            g_enc_x_invert  :   boolean := false;
            g_enc_z_invert  :   boolean := false;
            g_x_box_margins :   sensor_limit_array(9 downto 0) := (others => (0,0));
            g_z_box_margins :   sensor_limit_array(4 downto 0) := (others => (0,0))
        );
        port(
            --General
            clk             : in    std_logic;
            rst             : in    std_logic;
            --Flags
            rst_x_encoder   : in    std_logic;
            rst_z_encoder   : in    std_logic;
            block_x_margin  : in    std_logic;
            block_z_margin  : in    std_logic;
            unblock_y_axis  : in    std_logic;
            --System data
            sys_io_i        : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            sys_io_o        : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            --Masked data
            safe_io_o       : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    constant tb_x_margins   :   sensor_limit_array(9 downto 0) := (others => (0,10));
    constant tb_z_margins   :   sensor_limit_array(4 downto 0) := (others => (0,10));
    signal rst_x_encoder    :   std_logic := '0';
    signal rst_z_encoder    :   std_logic := '0';
    signal block_x_margin   :   std_logic := '0';
    signal block_z_margin   :   std_logic := '0';
    signal unblock_y_axis   :   std_logic := '0';
    signal sys_io_i         :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal sys_io_o         :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal safe_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
        alias smotor_x_step :   std_logic is safe_io_o(18).dat;
        alias smotor_y_enb  :   std_logic is safe_io_o(24).dat;
        alias smotor_z_step :   std_logic is safe_io_o(30).dat;
    --Testbench
    constant debounce_time  :   integer := 2400*4;
    signal tb_abs_inputs    :   std_logic_vector(9 downto 0) := (others => '0');
        --Sensors
        alias limit_x_neg   :   std_logic is tb_abs_inputs(0);
        alias limit_x_pos   :   std_logic is tb_abs_inputs(1);
        alias limit_y_neg   :   std_logic is tb_abs_inputs(2);
        alias limit_y_pos   :   std_logic is tb_abs_inputs(3);
        alias limit_z_neg   :   std_logic is tb_abs_inputs(4);
        alias limit_z_pos   :   std_logic is tb_abs_inputs(5);
        --Actuators
        alias motor_x_dir   :   std_logic is tb_abs_inputs(6);
        alias motor_y_out_1 :   std_logic is tb_abs_inputs(7);
        alias motor_y_out_2 :   std_logic is tb_abs_inputs(8);
        alias motor_z_dir   :   std_logic is tb_abs_inputs(9);
    signal tb_enc_inputs    :   std_logic_vector(3 downto 0) := (others => '0');
        alias x_channel_a   :   std_logic is tb_enc_inputs(0);
        alias x_channel_b   :   std_logic is tb_enc_inputs(1);
        alias z_channel_a   :   std_logic is tb_enc_inputs(2);
        alias z_channel_b   :   std_logic is tb_enc_inputs(3);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : ACTUATOR_MASK
    generic map(
        g_enc_x_invert  => false,
        g_enc_z_invert  => false,
        g_x_box_margins => tb_x_margins,
        g_z_box_margins => tb_z_margins
    )
    port map(
        clk             => clock,
        rst             => reset,
        rst_x_encoder   => rst_x_encoder,
        rst_z_encoder   => rst_z_encoder,
        block_x_margin  => block_x_margin,
        block_z_margin  => block_z_margin,
        unblock_y_axis  => unblock_y_axis,
        sys_io_i        => sys_io_i,
        sys_io_o        => sys_io_o,
        safe_io_o       => safe_io_o
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 5 ns, '0' after 15 ns;
    -----------------------------------------------------------------------------------------------



    --****SIGNAL ROUTING****
    -----------------------------------------------------------------------------------------------
    --Sensor routing
    sys_io_i(1 downto 0)                <= (others => gnd_io_i);
    sys_io_i(2).dat                     <= limit_x_neg;
    sys_io_i(3).dat                     <= limit_x_pos;
    sys_io_i(4).dat                     <= limit_y_neg;
    sys_io_i(5).dat                     <= limit_y_pos;
    sys_io_i(6).dat                     <= limit_z_neg;
    sys_io_i(7).dat                     <= limit_z_pos;
    sys_io_i(8)                         <= gnd_io_i;
    sys_io_i(9).dat                     <= x_channel_a;
    sys_io_i(10).dat                    <= x_channel_b;
    sys_io_i(11)                        <= gnd_io_i;
    sys_io_i(12).dat                    <= z_channel_a;
    sys_io_i(13).dat                    <= z_channel_b;
    sys_io_i(sys_io_i'left downto 14)   <= (others => gnd_io_i); 
    --Actuator routing
    sys_io_o(17 downto 0)               <= (others => gnd_io_o);
    sys_io_o(18)                        <= ('1', '1');
    sys_io_o(19)                        <= ('1', motor_x_dir);
    sys_io_o(23 downto 20)              <= (others => gnd_io_o);
    sys_io_o(24)                        <= ('1', '1');
    sys_io_o(25)                        <= ('1', motor_y_out_1);
    sys_io_o(26)                        <= ('1', motor_y_out_2);
    sys_io_o(29 downto 27)              <= (others => gnd_io_o);
    sys_io_o(30)                        <= ('1', '1');
    sys_io_o(31)                        <= ('1', motor_z_dir);
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test absolute limits**
        --Test limits based on the physical sensor limits assuming the crane is inside the
        --parameters of a box and is not moving out of it
        for i in 0 to (2**10)-1 loop
            --Input data
            tb_abs_inputs <= std_logic_vector(to_unsigned(i,10));
            wait for debounce_time*clk_period;

            --Test conditions
            --X Motor
            wait for assert_hold;
            if(limit_x_neg = '1' and limit_x_pos = '1') then
                assert(smotor_x_step = '0')
                    report "ID01: Test x-motor multi-sensor input" 
                    severity error;
            end if;

            if(limit_x_neg = '1' and motor_x_dir = '0') then
                assert(smotor_x_step = '0')
                    report "ID02: Test x-motor negative limit reached" 
                    severity error;
            end if;

            if(limit_x_pos = '1' and motor_x_dir = '1') then
                assert(smotor_x_step = '0')
                    report "ID03: Test x-motor positive limit reached" 
                    severity error;
            end if;

            if(limit_y_neg = '0') then
                assert(smotor_x_step = '0')
                    report "ID04: Test x-motor inside box movement" 
                    severity error;
            end if;


            --Y Motor            
            if(limit_y_neg = '1' and limit_y_pos = '1') then
                assert(smotor_y_enb = '0')
                    report "ID05: Test y-motor multi-sensor input" 
                    severity error;
            end if;

            if(limit_y_neg = '1' and motor_y_out_2 = '1') then
                assert(smotor_y_enb = '0')
                    report "ID06: Test y-motor negative limit reached" 
                    severity error;
            end if;

            if(limit_y_pos = '1' and motor_y_out_1 = '1') then
                assert(smotor_y_enb = '0')
                    report "ID07: Test y-motor positive limit reached" 
                    severity error;
            end if;

            
            --Z Motor
            if(limit_z_neg = '1' and limit_z_pos = '1') then
                assert(smotor_z_step = '0')
                    report "ID08: Test z-motor multi-sensor input" 
                    severity error;
            end if;

            if(limit_z_neg = '1' and motor_z_dir = '0') then
                assert(smotor_z_step = '0')
                    report "ID08: Test z-motor negative limit reached" 
                    severity error;
            end if;

            if(limit_z_pos = '1' and motor_z_dir = '1') then
                assert(smotor_z_step = '0')
                    report "ID09: Test z-motor positive limit reached" 
                    severity error;
            end if;
            wait for post_hold;

        end loop;
        tb_abs_inputs <= (others => '0');
        wait for debounce_time*clk_period;


        wait for 5*clk_period;


        --**Test block flags**
        block_x_margin <= '1';
        block_z_margin <= '1';

        wait for assert_hold;
        assert(smotor_x_step = '0')
            report "ID10: Test block x margin - expecting smotor_x_step = '0'" 
            severity error;
        assert(smotor_z_step = '0')
            report "ID11: Test block z margin - expecting smotor_z_step = '0'" 
            severity error;
        wait for post_hold;

        block_x_margin <= '0';
        block_z_margin <= '0';        


        wait for 5*clk_period;


        --**Test movement outside margin limits**
        --Move crane outside margin limits and block movement
        x_channel_b <= '1';
        z_channel_b <= '1';
        wait for clk_period;

        for i in 1 to 4 loop
            x_channel_a <= '1';
            z_channel_a <= '1';
            wait for 4*clk_period;
            x_channel_b <= '0';
            z_channel_b <= '0';
            wait for 4*clk_period;
            x_channel_a <= '0';
            z_channel_a <= '0';
            wait for 4*clk_period;
            x_channel_b <= '1';
            z_channel_b <= '1';
            wait for 4*clk_period;
        end loop;


        motor_z_dir <= '1';
        wait for assert_hold;
        assert(smotor_x_step = '0')
            report "ID12: Test x movement in margins - expecting smotor_x_step = '0'" 
            severity error;
        assert(smotor_z_step = '0')
            report "ID13: Test z movement in margins - expecting smotor_z_step = '0'"
            severity error;
        wait for post_hold;

        motor_z_dir <= '0';
        wait for assert_hold;
        assert(smotor_z_step = '1')
            report "ID14: Test z movement in margins - expecting smotor_z_step = '1'"
            severity error;
        wait for post_hold;


        for i in 1 to 4 loop
            x_channel_a <= '1';
            z_channel_a <= '1';
            wait for 4*clk_period;
            x_channel_b <= '0';
            z_channel_b <= '0';
            wait for 4*clk_period;
            x_channel_a <= '0';
            z_channel_a <= '0';
            wait for 4*clk_period;
            x_channel_b <= '1';
            z_channel_b <= '1';
            wait for 4*clk_period;
        end loop;


        wait for assert_hold;
        assert(smotor_x_step = '0')
            report "ID15: Test x movement in margins - expecting smotor_x_step = '0'" 
            severity error;
        assert(smotor_z_step = '0')
            report "ID16: Test z movement in margins - expecting smotor_z_step = '0'"
            severity error;
        wait for post_hold;


        --**End simulation**
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;
