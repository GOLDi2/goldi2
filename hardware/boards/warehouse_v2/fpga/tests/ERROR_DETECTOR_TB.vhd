-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Error list for high-bay warehouse
-- Module Name:		ERROR_DETECTOR_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--                  -> ERROR_LIST.vhd
--
-- Revisions:
-- Revision V3.01.00 - File Created
-- Additional Comments: First commitment
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
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;
use work.GOLDI_MODULE_CONFIG.all;




--! Functionality simulation
entity ERROR_DETECTOR_TB is
end entity ERROR_DETECTOR_TB;




--! Simulation architecture
architecture TB of ERROR_DETECTOR_TB is

    --****DUT****
    component ERROR_DETECTOR
    generic(
        g_address       :   natural := 1;
        g_enc_x_invert  :   boolean := false;
        g_enc_z_invert  :   boolean := false;
        g_x_box_margins :   sensor_limit_array(9 downto 0) := (others => (0,0));
        g_z_box_margins :   sensor_limit_array(4 downto 0) := (others => (0,0))
    );
    port(
        clk             : in    std_logic;
        rst             : in    std_logic;
        rst_x_encoder   : in    std_logic;
        rst_z_encoder   : in    std_logic;
        sys_bus_i       : in    sbus_in;
        sys_bus_o       : out   sbus_out;
        sys_io_i        : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
        sys_io_o        : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
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
    signal sys_bus_i        :   sbus_in := gnd_sbus_i;
    signal sys_bus_o        :   sbus_out := gnd_sbus_o;
    signal sys_io_i         :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal sys_io_o         :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    --Testbench
    constant debounce_time  :   integer := 2400*4;
    signal tb_abs_inputs    :   std_logic_vector(12 downto 0) := (others => '0');
        --Sensors
        alias limit_x_neg   :   std_logic is tb_abs_inputs(0);
        alias limit_x_pos   :   std_logic is tb_abs_inputs(1);
        alias limit_y_neg   :   std_logic is tb_abs_inputs(2);
        alias limit_y_pos   :   std_logic is tb_abs_inputs(3);
        alias limit_z_neg   :   std_logic is tb_abs_inputs(4);
        alias limit_z_pos   :   std_logic is tb_abs_inputs(5);
        --Actuators
        alias motor_x_step  :   std_logic is tb_abs_inputs(6);
        alias motor_x_dir   :   std_logic is tb_abs_inputs(7);
        alias motor_y_enb   :   std_logic is tb_abs_inputs(8);
        alias motor_y_out_1 :   std_logic is tb_abs_inputs(9);
        alias motor_y_out_2 :   std_logic is tb_abs_inputs(10);
        alias motor_z_step  :   std_logic is tb_abs_inputs(11);
        alias motor_z_dir   :   std_logic is tb_abs_inputs(12);
    signal tb_enc_inputs    :   std_logic_vector(3 downto 0) := (others => '0');
        alias x_channel_a   :   std_logic is tb_enc_inputs(0);
        alias x_channel_b   :   std_logic is tb_enc_inputs(1);
        alias z_channel_a   :   std_logic is tb_enc_inputs(2);
        alias z_channel_b   :   std_logic is tb_enc_inputs(3);
    --Buffers
    signal reg_1_buffer     :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0) := (others => '0');
    signal reg_2_buffer     :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0) := (others => '0');


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : ERROR_DETECTOR
    generic map(
        g_address       => 1,
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
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        sys_io_i        => sys_io_i,
        sys_io_o        => sys_io_o
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
    sys_io_o(18)                        <= ('1', motor_x_step);
    sys_io_o(19)                        <= ('1', motor_x_dir);
    sys_io_o(23 downto 20)              <= (others => gnd_io_o);
    sys_io_o(24)                        <= ('1', motor_y_enb);
    sys_io_o(25)                        <= ('1', motor_y_out_1);
    sys_io_o(26)                        <= ('1', motor_y_out_2);
    sys_io_o(29 downto 27)              <= (others => gnd_io_o);
    sys_io_o(30)                        <= ('1', motor_z_step);
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


        --Assert errors inside box margins
        for i in 0 to (2**tb_abs_inputs'length)-1 loop
            --Simulate possible gpio values
            tb_abs_inputs <= std_logic_vector(to_unsigned(i,tb_abs_inputs'length));
            wait for debounce_time*clk_period;

            --Shift error data into buffers for analysis
            sys_bus_i    <= readBus(1);
            wait for clk_period;
            sys_bus_i    <= readBus(2);
            wait for clk_period;
            reg_1_buffer <= sys_bus_o.dat;
            wait for clk_period;
            reg_2_buffer <= sys_bus_o.dat;

            wait for assert_hold;
            --Multi-sensor triggered
            if(limit_x_neg = '1' and limit_x_pos = '1') then
                assert(reg_1_buffer(0) = '1')
                report "ID01: Expecting error code 0" severity error;
            end if;

            if(limit_y_neg = '1' and limit_y_pos = '1') then
                assert(reg_1_buffer(1) = '1')
                report "ID02: Expecting error code 1" severity error;
            end if;

            if(limit_z_neg = '1' and limit_z_pos = '1') then
                assert(reg_1_buffer(2) = '1')
                report "ID03: Expecting error code 2" severity error;
            end if;


            --Model physical limits
            if(limit_x_neg = '1' and motor_x_dir = '0' and motor_x_step = '1') then
                assert(reg_1_buffer(3) = '1')
                report "ID04: Expecting error code 3" severity error;
            end if;

            if(limit_x_pos = '1' and motor_x_dir = '1' and motor_x_step = '1') then
                assert(reg_1_buffer(4) = '1')
                report "ID05: Expecting error code 4" severity error;
            end if;

            if(limit_y_neg = '1' and motor_y_out_2 = '1' and motor_y_enb = '1') then
                assert(reg_1_buffer(5) = '1')
                report "ID06: Expecting error code 5" severity error;
            end if;

            if(limit_y_pos = '1' and motor_y_out_1 = '1' and motor_y_enb = '1') then
                assert(reg_1_buffer(6) = '1')
                report "ID07: Expecting error code 6" severity error;
            end if;

            if(limit_z_neg = '1' and motor_z_dir = '0' and motor_z_step = '1') then
                assert(reg_1_buffer(7) = '1')
                report "ID08: Expecting error code 7" severity error;
            end if;

            if(limit_z_pos = '1' and motor_z_dir = '1' and motor_z_step = '1') then
                assert(reg_2_buffer(0) = '1')
                report "ID09: Expecting error code 8" severity error;
            end if;
            wait for post_hold;

        end loop;
        sys_bus_i <= gnd_sbus_i;
        tb_abs_inputs <= (others => '0');
        wait for debounce_time*clk_period;


        wait for 5*clk_period;

        x_channel_b <= '1';
        z_channel_b <= '1';
        wait for clk_period;
        --Assert errors outside box margins
        for i in 1 to 6 loop
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


        motor_x_step <= '1';
        motor_y_enb  <= '1';
        motor_z_step <= '1';
        motor_z_dir  <= '0';
        wait for debounce_time*clk_period;
        sys_bus_i    <= readBus(2);
        wait for 2*clk_period;
        reg_2_buffer <= sys_bus_o.dat;

        wait for assert_hold;
        assert(reg_2_buffer(1) = '1')
            report "ID10: Expecting error code 9" severity error;
        assert(reg_2_buffer(2) = '1')
            report "ID11: Expecting error code 10" severity error;
        assert(reg_2_buffer(3) = '1')
            report "ID12: Expecting error code 11" severity error;
        wait for post_hold;

        motor_z_dir <= '1';

        wait for debounce_time*clk_period;
        sys_bus_i    <= readBus(2);
        wait for 2*clk_period;
        reg_2_buffer <= sys_bus_o.dat;

        wait for assert_hold;
        assert(reg_2_buffer(1) = '1')
            report "ID14: Expecting error code 9" severity error;
        assert(reg_2_buffer(2) = '1')
            report "ID15: Expecting error code 10" severity error;
        assert(reg_2_buffer(4) = '1')
            report "ID16: Expecting error code 12" severity error;

        wait for post_hold;


        
        --**End simulation**
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;