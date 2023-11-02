-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		25/06/2023
-- Design Name:		Error detector testbench - Axis Portal V2
-- Module Name:		ERROR_DETECTOR
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_MODULE_CONFIG.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--                  -> ERROR_DETECTOR.vhd
--
-- Revisions:
-- Revision V3.00.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V4.00.00 - Module refactoring
-- Additional Comments: Use of env library to control simulation flow.
--                      Changes to the DUT entity and the port signal names. 
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
entity ERROR_DETECTOR_TB is
end entity ERROR_DETECTOR_TB;




--! Simulation architecture
architecture TB of ERROR_DETECTOR_TB is
  
    --****DUT****
    component ERROR_DETECTOR 
        generic(
            g_address       :   natural := 1
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            p_sys_io_i      : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            p_sys_io_o      : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period     :   time := 10 ns;
    constant settling_delay :   integer := 5*19200;
    signal clock            :   std_logic := '0';
    signal reset            :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    --DUT IOs
    signal sys_bus_i        :   sbus_in  := gnd_sbus_i;
    signal sys_bus_o        :   sbus_out := gnd_sbus_o;
    signal sys_io_i         :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_i);
    signal sys_io_o         :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_o);
    --Buffers
    signal reg_1_buff       :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0) := (others => '0');
    signal reg_2_buff       :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0) := (others => '0');
    --Testbench
    signal input_values     :   std_logic_vector(12 downto 0) := (others => '0');
        --Sensor inputs
        alias limit_x_neg   :   std_logic is input_values(0);
        alias limit_x_pos   :   std_logic is input_values(1);
        alias limit_y_neg   :   std_logic is input_values(2);
        alias limit_y_pos   :   std_logic is input_values(3);
        alias limit_z_neg   :   std_logic is input_values(4);
        alias limit_z_pos   :   std_logic is input_values(5);
        --Actuator inputs
        alias motor_x_step  :   std_logic is input_values(6);
        alias motor_x_dir   :   std_logic is input_values(7);
        alias motor_y_step  :   std_logic is input_values(8);
        alias motor_y_dir   :   std_logic is input_values(9);
        alias motor_z_enb   :   std_logic is input_values(10);
        alias motor_z_neg   :   std_logic is input_values(11);
        alias motor_z_pos   :   std_logic is input_values(12);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : ERROR_DETECTOR 
    generic map(
        g_address         => 1
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_sys_io_i      => sys_io_i,
        p_sys_io_o      => sys_io_o
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****SIGNAL ASSGNMENT****
    -----------------------------------------------------------------------------------------------
    --Sensors
    sys_io_i(2).dat  <= limit_x_neg;
    sys_io_i(3).dat  <= limit_x_pos;
    sys_io_i(4).dat  <= limit_y_neg;
    sys_io_i(5).dat  <= limit_y_pos;
    sys_io_i(6).dat  <= limit_z_neg;
    sys_io_i(7).dat  <= limit_z_pos;
    --Actuators
    sys_io_o(16).dat <= motor_x_step;
    sys_io_o(17).dat <= motor_x_dir;
    sys_io_o(25).dat <= motor_y_step;
    sys_io_o(26).dat <= motor_y_dir;
    sys_io_o(31).dat <= motor_z_enb;
    sys_io_o(32).dat <= motor_z_pos;
    sys_io_o(33).dat <= motor_z_neg;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial Setup**
        wait for init_hold;

        -- Needs Rework
--          for i in 0 to (2**13)-1 loop
--            --Simulate possible gpio values
--            input_values <= std_logic_vector(to_unsigned(i,13));
--            
--            wait for settling_delay*clk_period;
--
--            wait for 3*clk_period;
--            sys_bus_i  <= readBus(1);
--            wait for clk_period;
--            sys_bus_i  <= readBus(2);
--            wait for clk_period;
--            reg_1_buff <= sys_bus_o.dat;
--            wait for clk_period;
--            reg_2_buff <= sys_bus_o.dat;
--
--
--            wait for assert_hold;
--            --Multi-sensor activation errors
--            if(limit_x_neg = '1' and limit_x_pos = '1') then
--                assert(reg_1_buff(0) = '1')
--                report "ID01: Expecting error code 0" severity error;
--            end if;
--
--            if(limit_y_neg = '1' and limit_y_pos = '1') then
--                assert(reg_1_buff(1) = '1')
--                report "ID02: Expecting error code 1" severity error;
--            end if;
--
--            if(limit_z_neg = '0' and limit_z_pos = '1') then
--                assert(reg_1_buff(2) = '1')
--                report "ID03: Expecting error code 2" severity error;
--            end if;
--
--            --Crane position error
--            if(limit_z_pos = '0' and motor_x_dir = '0' and motor_x_step = '1') then
--                assert(reg_1_buff(3) = '1')
--                report "ID04: Expecting error code 3" severity error;
--            end if;
--
--            if(limit_z_pos = '0' and motor_x_dir = '1' and motor_x_step = '1') then
--                assert(reg_1_buff(4) = '1')
--                report "ID05: Expecting error code 4" severity error;
--            end if;
--
--            if(limit_z_pos = '0' and motor_y_dir = '0' and motor_y_step = '1') then
--                assert(reg_1_buff(5) = '1')
--                report "ID06: Expecting error code 5" severity error;
--            end if;
--
--            if(limit_z_pos = '0' and motor_y_dir = '1' and motor_y_step = '1') then
--                assert(reg_1_buff(6) = '1')
--                report "ID07: Expecting error code 6" severity error;
--            end if;
--
--            --AP operation errors
--            if(limit_x_neg = '1' and motor_x_dir = '0' and motor_x_step = '1') then
--                assert(reg_1_buff(7) = '1')
--                report "ID08: Expecting error code 7" severity error;
--            end if;
--
--            if(limit_x_pos = '1' and motor_x_dir = '1' and motor_x_step = '1') then
--                assert(reg_2_buff(0) = '1')
--                report "ID09: Expecting error code 8" severity error;
--            end if;
--
--            if(limit_y_neg = '1' and motor_y_dir = '1' and motor_y_step = '1') then
--                assert(reg_2_buff(1) = '1')
--                report "ID10: Expecting error code 9" severity error;
--            end if;
--
--            if(limit_y_pos = '1' and motor_y_dir = '0' and motor_y_step = '1') then
--                assert(reg_2_buff(2) = '1')
--                report "ID11: Expecting error code 10" severity error;
--            end if;
--
--            if(limit_z_neg = '0' and motor_z_neg = '1' and motor_z_enb = '1') then
--                assert(reg_2_buff(3) = '1')
--                report "ID12: Expecting error code 11" severity error;
--            end if;
--
--            if(limit_z_pos = '1' and motor_z_pos = '1' and motor_z_enb = '1') then
--                assert(reg_2_buff(4) = '1')
--                report "ID13: Expecting error code 12" severity error;
--            end if;
--
--            wait for post_hold;
--
--      end loop; 


  		--**End simulation**
		wait for 50 ns;
        report "AP2: ERROR_DETECTOR_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;