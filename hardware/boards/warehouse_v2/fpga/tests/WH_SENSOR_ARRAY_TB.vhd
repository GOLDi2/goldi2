-----------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Warehouse sensor array testbench
-- Module Name:		WH_SENSOR_ARRAY_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> REGISTER_TABLE.vhd
--                  -> VIRTUAL_SENSOR_ARRAY.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
-- 
-- Revision V2.00.00 - First release
-- Additional Comments:
--
-- Revision V4.00.00 - Module refactoring
-- Additional Comments: Use of env library to control the simulation flow.
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
use work.GOLDI_DATA_TYPES.all;




--! Functionality Simulation
entity WH_SENSOR_ARRAY_TB is
end entity WH_SENSOR_ARRAY_TB;




--! Simulation architecture
architecture TB of wH_SENSOR_ARRAY_TB is

    --****DUT****
    component WH_SENSOR_ARRAY
        generic(
            g_address           :   natural;
            g_enc_x_invert      :   boolean;
            g_enc_z_invert      :   boolean;
            g_x_limit_sensors   :   sensor_limit_array(9 downto 0);
            g_z_limit_sensors   :   sensor_limit_array(4 downto 0)
        );
        port(
            clk                 : in    std_logic;
            rst                 : in    std_logic;
            ref_virtual_x       : in    std_logic;
            ref_virtual_z       : in    std_logic;
            sys_bus_i           : in    sbus_in;
            sys_bus_o           : out   sbus_out;
            p_lim_x_neg         : in    io_i;
            p_lim_x_pos         : in    io_i;
            p_lim_y_neg         : in    io_i;
            p_lim_y_pos         : in    io_i;
            p_lim_z_neg         : in    io_i;
            p_lim_z_pos         : in    io_i;
            p_inductive         : in    io_i;
            p_channel_x_a       : in    io_i;
            p_channel_x_b       : in    io_i;
            p_channel_z_a       : in    io_i;
            p_channel_z_b       : in    io_i
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal sys_bus_i        :   sbus_in  := gnd_sbus_i;
    signal sys_bus_o        :   sbus_out := gnd_sbus_o;
    signal limits           :   io_i_vector(6 downto 0) := (others => gnd_io_i);
    signal encoder          :   io_i_vector(3 downto 0) := (others => gnd_io_i);      


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : WH_SENSOR_ARRAY
    generic map(
        g_address           => 1,
        g_enc_x_invert      => false,
        g_enc_z_invert      => false,
        g_x_limit_sensors   => (others => (10,5)),
        g_z_limit_sensors   => (others => (10,5))
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        ref_virtual_x       => reset,
        ref_virtual_z       => reset,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o,
        p_lim_x_neg         => limits(0),
        p_lim_x_pos         => limits(1),
        p_lim_y_neg         => limits(2),
        p_lim_y_pos         => limits(3),
        p_lim_z_neg         => limits(4),
        p_lim_z_pos         => limits(5),
        p_inductive         => limits(6),
        p_channel_x_a       => encoder(0),
        p_channel_x_b       => encoder(1),
        p_channel_z_a       => encoder(2),
        p_channel_z_b       => encoder(3)
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
	-----------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 10 ns, '0' after 30 ns;
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

        
        --**Test idle state**¨
        --Test limit sensors
        sys_bus_i <= readBus(1);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"40") 
            report"ID01: Test idle - expecting limits = x00" severity error;
        wait for post_hold;
        --Test virtual sensors
        sys_bus_i <= readBus(2);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"00") 
            report"ID02: Test idle - expecting virtual_1 = x00" severity error;
        wait for post_hold;
        sys_bus_i <= readBus(3);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"00") 
            report"ID03: Test idle - expecting virtual_2 = x00" severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;


        wait for 5*clk_period;


        --**Test limit sensors**
        limits(1) <= (dat => '1');
        limits(3) <= (dat => '1');
        limits(5) <= (dat => '1');
        wait for clk_period;
        sys_bus_i <= readBus(1);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"6A") 
            report"ID04: Test idle - expecting limits = x2A" severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;


        wait for 5*clk_period;


        --**Test horizontal virtual sensors**
        encoder(0).dat <= '0';
        encoder(1).dat <= '1';
        for i in 0 to 2 loop
            wait for clk_period;
            encoder(0).dat <= not encoder(0).dat;
            wait for clk_period;
            encoder(1).dat <= not encoder(1).dat;
            wait for clk_period;
            encoder(0).dat <= not encoder(0).dat;
            wait for clk_period;
            encoder(1).dat <= not encoder(1).dat;
        end loop;
        --Test virtual sensors
        sys_bus_i <= readBus(2);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"FF") 
            report"ID05: Test virtual - expecting virtual_1 = xFF" severity error;
        wait for post_hold;
        sys_bus_i <= readBus(3);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"03") 
            report"ID06: Test virtual - expecting virtual_2 = x03" severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;


        wait for 5*clk_period;


        encoder(2).dat <= '0';
        encoder(3).dat <= '1';
        for i in 0 to 2 loop
            wait for clk_period;
            encoder(2).dat <= not encoder(2).dat;
            wait for clk_period;
            encoder(3).dat <= not encoder(3).dat;
            wait for clk_period;
            encoder(2).dat <= not encoder(2).dat;
            wait for clk_period;
            encoder(3).dat <= not encoder(3).dat;
        end loop;
        --Test virtual sensors
        sys_bus_i <= readBus(3);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"7F") 
            report"ID07: Test virtual - expecting virtual_2 = x7F" severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;



		--**End simulation**
		wait for 50 ns;
        report "WH: SENSOR_ARRAY_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;