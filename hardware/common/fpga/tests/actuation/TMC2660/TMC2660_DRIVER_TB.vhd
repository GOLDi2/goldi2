-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		TMC2660 Stepper driver testbench 
-- Module Name:		TMC2660_DRIVER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> TMC2660_DRIVER.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments:-
--
-- Revision V4.00.00 - Module refactoring
-- Additional Comments: Use of env library to stop simulation.
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




--! Functionality simulation
entity TMC2660_DRIVER_TB is
end entity TMC2660_DRIVER_TB;




--! Simulation architecture
architecture TB of TMC2660_DRIVER_TB is

    --****DUT****
    component TMC2660_DRIVER
        generic(
            ADDRESS         :   natural := 1;
            SCLK_FACTOR     :   natural := 8;
            TMC2660_CONFIG  :   tmc2660_rom := (x"FF00FF",x"FF00FF")
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            tmc2660_clk     : out   io_o;
            tmc2660_enn     : out   io_o;
            tmc2660_sg      : in    io_i;
            tmc2660_dir     : out   io_o;
            tmc2660_step    : out   io_o;
            tmc2660_sclk    : out   io_o;
            tmc2660_ncs     : out   io_o;
            tmc2660_mosi    : out   io_o;
            tmc2660_miso    : in    io_i
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period	    :	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:   std_logic := '1';
    --DUT IOs
    signal sys_bus_i        :   sbus_in  := gnd_sbus_i;
    signal sys_bus_o        :   sbus_out := gnd_sbus_o;
    signal tmc2660_clk      :   io_o := low_io_o;
    signal tmc2660_enn      :   io_o := low_io_o;
    signal tmc2660_sg       :   io_i := low_io_i;
    signal tmc2660_dir      :   io_o := low_io_o;
    signal tmc2660_step     :   io_o := low_io_o;
    signal tmc2660_sclk     :   io_o := low_io_o;
    signal tmc2660_ncs      :   io_o := low_io_o;
    signal tmc2660_mosi     :   io_o := low_io_o;


begin


    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : entity work.TMC2660_DRIVER
    generic map(
        ADDRESS         => 1,
        SCLK_FACTOR     => 10,
        TMC2660_CONFIG  => (x"FF00FF",x"FF00FF")
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        tmc2660_clk     => tmc2660_clk,
        tmc2660_enn     => tmc2660_enn,
        tmc2660_sg      => (dat => '1'),
        tmc2660_dir     => tmc2660_dir,
        tmc2660_step    => tmc2660_step,
        tmc2660_sclk    => tmc2660_sclk,
        tmc2660_ncs     => tmc2660_ncs,
        tmc2660_mosi    => tmc2660_mosi,
        tmc2660_miso    => (dat => '1')
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
        variable init_hold  :   time := 5*clk_period/2;
    begin
        --**Initial Setup**
        wait for init_hold;

        wait for 7 us;


        --Test stream data
        sys_bus_i <= writeBus(3,255);
        wait for clk_period;
        sys_bus_i <= writeBus(4,0);
        wait for clk_period;
        sys_bus_i <= writeBus(5,8);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for 3 us;


        --**End simulation**
		wait for 50 ns;
        report "TMC2660_DRIVER_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;