-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/08/2023
-- Design Name:		Dynamic actuator mask testbench
-- Module Name:		ACTUATOR_MASK_D_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--                  -> ACTUATOR_MASK_D.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation flow control and assertions
library std;
use std.standard.all;
use std.env.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_MODULE_CONFIG.all;




--! Functionality simulation
entity ACTUATOR_MASK_D_TB is
end entity ACTUATOR_MASK_D_TB;




--! Simulation architecture
architecture TB of ACTUATOR_MASK_D_TB is
  
  --****DUT****
    component ACTUATOR_MASK_D
        generic(
            g_address       :   natural;
            g_enc_x_invert  :   boolean;
            g_enc_z_invert  :   boolean
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            ref_unblock     : in    std_logic;
            ref_x_encoder   : in    std_logic;
            ref_z_encoder   : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            p_sys_io_i      : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            p_sys_io_o      : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            p_safe_io_o     : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal ref_x_encoder    :   std_logic := '0';
    signal ref_z_encoder    :   std_logic := '0';
    signal sys_bus_i        :   sbus_in  := gnd_sbus_i;
    signal sys_bus_o        :   sbus_out := gnd_sbus_o;
    signal p_sys_io_i       :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_i);
    signal p_sys_io_o       :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_o);
    signal p_safe_io_o      :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_o);
    --Testbench
    constant debounce_time  :   integer := 1250*4 ;
    signal input_data       :   std_logic_vector(9 downto 0) := (others => '0');
        --Sensors
        alias limit_x_neg   :   std_logic is input_data(0);
        alias limit_x_pos   :   std_logic is input_data(1);
        alias limit_y_neg   :   std_logic is input_data(2);
        alias limit_y_pos   :   std_logic is input_data(3);
        alias limit_z_neg   :   std_logic is input_data(4);
        alias limit_z_pos   :   std_logic is input_data(5);
        --Actuators
        alias motor_x_dir   :   std_logic is input_data(6);
        alias motor_y_out_1 :   std_logic is input_data(7);
        alias motor_y_out_2 :   std_logic is input_data(8);
        alias motor_z_dir   :   std_logic is input_data(9);
    signal encoder_inputs   :   std_logic_vector(3 downto 0) := (others => '0');
        alias x_channel_a   :   std_logic is encoder_inputs(0);
        alias x_channel_b   :   std_logic is encoder_inputs(1);
        alias z_channel_a   :   std_logic is encoder_inputs(2);
        alias z_channel_b   :   std_logic is encoder_inputs(3);

           
begin


    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : ACTUATOR_MASK_D
    generic map(
        g_address       => 1,
        g_enc_x_invert  => false,
        g_enc_z_invert  => false
    )
    port map(
        clk             => clock,
        rst             => reset,
        ref_unblock     => '0',
        ref_x_encoder   => ref_x_encoder,
        ref_z_encoder   => ref_z_encoder,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_sys_io_i      => p_sys_io_i,
        p_sys_io_o      => p_sys_io_o,
        p_safe_io_o     => p_safe_io_o
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****SIGNAL ROUTING****
    -----------------------------------------------------------------------------------------------
    --Sensor routing
    p_sys_io_i(1 downto 0)                <= (others => gnd_io_i);
    p_sys_io_i(2).dat                     <= limit_x_neg;
    p_sys_io_i(3).dat                     <= limit_x_pos;
    p_sys_io_i(4).dat                     <= limit_y_neg;
    p_sys_io_i(5).dat                     <= limit_y_pos;
    p_sys_io_i(6).dat                     <= limit_z_neg;
    p_sys_io_i(7).dat                     <= limit_z_pos;
    p_sys_io_i(8)                         <= gnd_io_i;
    p_sys_io_i(9).dat                     <= x_channel_a;
    p_sys_io_i(10).dat                    <= x_channel_b;
    p_sys_io_i(11)                        <= gnd_io_i;
    p_sys_io_i(12).dat                    <= z_channel_a;
    p_sys_io_i(13).dat                    <= z_channel_b;
    p_sys_io_i(p_sys_io_i'left downto 14)   <= (others => gnd_io_i); 
    --Actuator routing
    p_sys_io_o(17 downto 0)               <= (others => gnd_io_o);
    p_sys_io_o(18)                        <= high_io_o;
    p_sys_io_o(19)                        <= ('1', motor_x_dir);
    p_sys_io_o(23 downto 20)              <= (others => gnd_io_o);
    p_sys_io_o(24)                        <= high_io_o;
    p_sys_io_o(25)                        <= ('1', motor_y_out_1);
    p_sys_io_o(26)                        <= ('1', motor_y_out_2);
    p_sys_io_o(29 downto 27)              <= (others => gnd_io_o);
    p_sys_io_o(30)                        <= high_io_o;
    p_sys_io_o(31)                        <= ('1', motor_z_dir);
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 5*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test reset**
        wait for assert_hold;
        assert(p_safe_io_o(18) = low_io_o)
            report "ID01: Test reset - expecting p_safe_io_o(18) = low_io_o"
            severity error;
        assert(p_safe_io_o(24) = low_io_o)
            report "ID02: Test reset - expecting p_safe_io_o(24) = low_io_o"
            severity error;
        assert(p_safe_io_o(30) = low_io_o)
            report "ID03: Test reset - expecting p_safe_io_o(30) = low_io_o"
            severity error;
        wait for post_hold;
        


        --**Configure mask**
        sys_bus_i <= writeBus(1,15);
        wait for clk_period;
        sys_bus_i <= writeBus(3,30);
        wait for clk_period;
        sys_bus_i <= writeBus(5,15);
        wait for clk_period;
        sys_bus_i <= writeBus(7,30);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;


        --**Test mask outside negative limits**
        motor_x_dir <= '0';
        motor_z_dir <= '0';
        wait for assert_hold;
        assert(p_safe_io_o(18) = low_io_o)
            report "ID04: Test negative limits - expecting p_safe_io_o(18) = low_io_o"
            severity error;
        assert(p_safe_io_o(24) = low_io_o)
            report "ID05: Test negative limits - expecting p_safe_io_o(24) = low_io_o"
            severity error;
        assert(p_safe_io_o(30) = low_io_o)
            report "ID06: Test negative limits - expecting p_safe_io_o(30) = low_io_o"
            severity error;
        wait for post_hold;

        motor_x_dir <= '1';
        motor_z_dir <= '1';
                wait for assert_hold;
        assert(p_safe_io_o(18) = high_io_o)
            report "ID07: Test negative limits - expecting p_safe_io_o(18) = high_io_o"
            severity error;
        assert(p_safe_io_o(24) = low_io_o)
            report "ID08: Test negative limits - expecting p_safe_io_o(24) = low_io_o"
            severity error;
        assert(p_safe_io_o(30) = high_io_o)
            report "ID09: Test negative limits - expecting p_safe_io_o(30) = high_io_o"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Move crane outside of positive limits**
        x_channel_b <= '1';
        z_channel_b <= '1';
        wait for clk_period;

        for i in 1 to 20  loop
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


        --**Test mask outside positive limits**
        motor_x_dir <= '1';
        motor_z_dir <= '1';
        wait for assert_hold;
        assert(p_safe_io_o(18) = low_io_o)
            report "ID10: Test positive limits - expecting p_safe_io_o(18) = low_io_o"
            severity error;
        assert(p_safe_io_o(24) = low_io_o)
            report "ID11: Test positive limits - expecting p_safe_io_o(24) = low_io_o"
            severity error;
        assert(p_safe_io_o(30) = low_io_o)
            report "ID12: Test positive limits - expecting p_safe_io_o(30) = low_io_o"
            severity error;
        wait for post_hold;

        motor_x_dir <= '0';
        motor_z_dir <= '0';
        wait for assert_hold;
        assert(p_safe_io_o(18) = high_io_o)
            report "ID13: Test positive limits - expecting p_safe_io_o(18) = high_io_o"
            severity error;
        assert(p_safe_io_o(24) = low_io_o)
            report "ID14: Test positive limits - expecting p_safe_io_o(24) = low_io_o"
            severity error;
        assert(p_safe_io_o(30) = high_io_o)
            report "ID15: Test positive limits - expecting p_safe_io_o(30) = high_io_o"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Return crane to the valid range**
        x_channel_b <= '0';
        z_channel_b <= '0';
        wait for clk_period;

        for i in 1 to 8 loop
            x_channel_a <= '1';
            z_channel_a <= '1';
            wait for 4*clk_period;
            x_channel_b <= '1';
            z_channel_b <= '1';
            wait for 4*clk_period;
            x_channel_a <= '0';
            z_channel_a <= '0';
            wait for 4*clk_period;
            x_channel_b <= '0';
            z_channel_b <= '0';
            wait for 4*clk_period;
        end loop;


        --**Test valid range**
        motor_x_dir <= '1';
        motor_z_dir <= '1';
        wait for assert_hold;
        assert(p_safe_io_o(18) = high_io_o)
            report "ID16: Test valid range - expecting p_safe_io_o(18) = high_io_o"
            severity error;
        assert(p_safe_io_o(24) = high_io_o)
            report "ID17: Test valid range - expecting p_safe_io_o(24) = high_io_o"
            severity error;
        assert(p_safe_io_o(30) = high_io_o)
            report "ID18: Test valid range - expecting p_safe_io_o(30) = high_io_o"
            severity error;
        wait for post_hold;

        motor_x_dir <= '0';
        motor_z_dir <= '0';
        wait for assert_hold;
        assert(p_safe_io_o(18) = high_io_o)
            report "ID19: Test valid range - expecting p_safe_io_o(18) = high_io_o"
            severity error;
        assert(p_safe_io_o(24) = high_io_o)
            report "ID20: Test valid range - expecting p_safe_io_o(24) = high_io_o"
            severity error;
        assert(p_safe_io_o(30) = high_io_o)
            report "ID21: Test valid range - expecting p_safe_io_o(30) = high_io_o"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test physical limit sensors**
        for i in 0 to (2**10)-1 loop
            input_data <= std_logic_vector(to_unsigned(i,10));
            wait for debounce_time*clk_period;
            
            --Test conditions
            wait for assert_hold;
            --X motor
            if(limit_x_neg = '1' and limit_x_pos = '1') then
                assert(p_safe_io_o(18) = low_io_o)
                    report "ID22: Test x-motor multi-sensor input" 
                    severity error;
            end if;

            if(limit_x_neg = '1' and motor_x_dir = '0') then
                assert(p_safe_io_o(18) = low_io_o)
                    report "ID23: Test x-motor negative limit reached" 
                    severity error;
            end if;

            if(limit_x_pos = '1' and motor_x_dir = '1') then
                assert(p_safe_io_o(18) = low_io_o)
                    report "ID24: Test x-motor positive limit reached" 
                    severity error;
            end if;


            --Y motor
            if(limit_y_neg = '1' and limit_y_pos = '1') then
                assert(p_safe_io_o(24) = low_io_o)
                    report "ID25: Test y-motor multi-sensor input" 
                    severity error;
            end if;

            if(limit_y_neg = '1' and motor_y_out_2 = '1') then
                assert(p_safe_io_o(24) = low_io_o)
                    report "ID26: Test y-motor negative limit reached" 
                    severity error;
            end if;

            if(limit_y_pos = '1' and motor_y_out_1 = '1') then
                assert(p_safe_io_o(24) = low_io_o)
                    report "ID27: Test y-motor positive limit reached" 
                    severity error;
            end if;

                        --Z Motor
            if(limit_z_neg = '1' and limit_z_pos = '1') then
                assert(p_safe_io_o(30) = low_io_o)
                    report "ID28: Test z-motor multi-sensor input" 
                    severity error;
            end if;

            if(limit_z_neg = '1' and motor_z_dir = '0') then
                assert(p_safe_io_o(30) = low_io_o)
                    report "ID29: Test z-motor negative limit reached" 
                    severity error;
            end if;

            if(limit_z_pos = '1' and motor_z_dir = '1') then
                assert(p_safe_io_o(30) = low_io_o)
                    report "ID30: Test z-motor positive limit reached" 
                    severity error;
            end if;
            wait for post_hold;

        end loop;
        

        --**End simulation**
		wait for 50 ns;
        report "WH: ACTUATOR_MASK_D_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;
