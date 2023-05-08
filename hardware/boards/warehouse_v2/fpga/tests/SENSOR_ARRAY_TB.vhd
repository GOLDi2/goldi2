-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		High-bay warehouse sensor array testbench
-- Module Name:		SENSOR_ARRAY_TB
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




--! Functionality Simulation
entity SENSOR_ARRAY_TB is
end entity SENSOR_ARRAY_TB;




--! Simulation architecture
architecture TB of SENSOR_ARRAY_TB is

    --****DUT****
    component SENSOR_ARRAY
        generic(
            ADDRESS         :   natural := 1;
            ENC_X_INVERT    :   boolean := false;
            ENC_Z_INVERT    :   boolean := false;
            LIMIT_X_SENSORS :   sensor_limit_array(9 downto 0) := (others => (1,10));
            LIMIT_Z_SENSORS :   sensor_limit_array(5 downto 0) := (others => (1,10))
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            lim_x_neg       : in    io_i;
            lim_x_pos       : in    io_i;
            lim_y_neg       : in    io_i;
            lim_y_pos       : in    io_i;
            lim_z_neg       : in    io_i;
            lim_z_pos       : in    io_i;
            inductive       : in    io_i;
            enc_channel_x_a : in    io_i;
            enc_channel_x_b : in    io_i;
            enc_channel_z_a : in    io_i;
            enc_channel_z_b : in    io_i
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal sys_bus_i        :   sbus_in;
    signal sys_bus_o        :   sbus_out;
    signal limits           :   io_i_vector(6 downto 0);
    signal encoder          :   io_i_vector(3 downto 0);      


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : SENSOR_ARRAY
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        lim_x_neg       => limits(0),
        lim_x_pos       => limits(1),
        lim_y_neg       => limits(2),
        lim_y_pos       => limits(3),
        lim_z_neg       => limits(4),
        lim_z_pos       => limits(5),
        inductive       => limits(6),
        enc_channel_x_a => encoder(0),
        enc_channel_x_b => encoder(1),
        enc_channel_z_a => encoder(2),
        enc_channel_z_b => encoder(3)
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
	-----------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 5 ns, '0' after 15 ns;
	-----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        limits      <= (others => gnd_io_i);
        encoder     <= (others => gnd_io_i);
        sys_bus_i   <= gnd_sbus_i;
        wait for init_hold;

        
        --**Test Idle**¨
        --Test limit sensors
        sys_bus_i <= readBus(1,0);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"00") 
            report"line(146): Test idle - expecting limits = x00" severity error;
        wait for post_hold;
        --Test virtual sensors
        sys_bus_i <= readBus(2,0);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"00") 
            report"line(152): Test idle - expecting virtual_1 = x00" severity error;
        wait for post_hold;
        sys_bus_i <= readBus(3,0);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"00") 
            report"line(157): Test idle - expecting virtual_2 = x00" severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;


        wait for 5*clk_period;


        --**Test limit sensors**
        limits(1) <= (dat => '1');
        limits(3) <= (dat => '1');
        limits(5) <= (dat => '1');
        wait for clk_period;
        sys_bus_i <= readBus(1,0);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"2A") 
            report"line(173): Test idle - expecting limits = x2A" severity error;
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
        sys_bus_i <= readBus(2,0);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"FF") 
            report"line(198): Test virtual - expecting virtual_1 = xFF" severity error;
        wait for post_hold;
        sys_bus_i <= readBus(3,0);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"03") 
            report"line(203): Test virtual - expecting virtual_2 = x03" severity error;
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
        sys_bus_i <= readBus(3,0);
        wait for assert_hold;
        assert(sys_bus_o.dat = x"FF") 
            report"line(227): Test virtual - expecting virtual_2 = xFF" severity error;
        wait for post_hold;
        sys_bus_i <= gnd_sbus_i;



        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end TB;