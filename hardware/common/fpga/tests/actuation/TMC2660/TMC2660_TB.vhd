-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/04/2023
-- Design Name:		TMC2660 Driver testbench
-- Module Name:		TMC2660_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> REGISTER_TABLE.vhd
--                  -> AXI_FIFO.vhd
--                  -> TMC2660_SPI.vhd
--                  -> TMC2660_STEP_DRIVER.vhd
--
-- Revisions:
-- Revision V0.01.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality simulation
entity TMC2660_TB is
end entity TMC2660_TB;




--! General architecture
architecture TB of TMC2660_TB is

    --****DUT****
    component TMC2660
        generic(
            ADDRESS             :   natural := 1
        );
        port(
            --General
            clk                 : in    std_logic;
            rst                 : in    std_logic;
            clk_16_MHz          : in    std_logic;
            --Bus 
            sys_bus_i           : in    sbus_in;
            sys_bus_o           : out   sbus_out;
            --TMC2660 interface
            tmc2660_clk         : out   io_o;
            tmc2660_enn         : out   io_o;
            tmc2660_sg          : in    io_i;
            --SPI
            tmc2660_spi_sclk    : out   io_o;
            tmc2660_spi_ncs     : out   io_o;
            tmc2660_spi_mosi    : out   io_o;
            tmc2660_spi_miso    : in    io_i;
            --Step/Dir
            tmc2660_dir         : out   io_o;
            tmc2660_step        : out   io_o
        );
    end component;


    --****Internal signals****
    --Simulation timing
	constant clk_period		:	time := 10 ns;
    signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
    signal sys_bus_i        :   sbus_in;
    signal sys_bus_o        :   sbus_out;
    signal tmc2660_clk      :   io_o;
    signal tmc2660_enn      :   io_o;
    signal tmc2660_sg       :   io_i;
    signal tmc2660_spi_sclk :   io_o;
    signal tmc2660_spi_ncs  :   io_o;
    signal tmc2660_spi_mosi :   io_o;
    signal tmc2660_spi_miso :   io_i;
    signal tmc2660_dir      :   io_o;
    signal tmc2660_step     :   io_o;


begin

    DUT : TMC2660
    generic map(
        ADDRESS             => 1
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        clk_16_MHz          => '1',
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o,
        tmc2660_clk         => tmc2660_clk,
        tmc2660_enn         => tmc2660_enn,
        tmc2660_sg          => tmc2660_sg,
        tmc2660_spi_sclk    => tmc2660_spi_sclk,
        tmc2660_spi_ncs     => tmc2660_spi_ncs,
        tmc2660_spi_mosi    => tmc2660_spi_mosi,
        tmc2660_spi_miso    => tmc2660_spi_miso,
        tmc2660_dir         => tmc2660_dir,
        tmc2660_step        => tmc2660_step
    );


    --Timing
	clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 5 ns, '0' after 15 ns;


    TEST : process
        --Timing
		variable init_hold			:	time :=	7*clk_period/2;
    begin

        --Initial setupu
        sys_bus_i        <= gnd_sbus_i;
        tmc2660_spi_miso <= gnd_io_i;
        tmc2660_sg       <= gnd_io_i;
        wait for init_hold;
		

        --Test SPI interface
        sys_bus_i.we    <= '1';
		sys_bus_i.adr 	<= "0000001";
		sys_bus_i.dat 	<= x"01";
		wait for clk_period;
        sys_bus_i.adr   <= "0000011";
        sys_bus_i.dat   <= x"0F";
        wait for clk_period;
        sys_bus_i.adr   <= "0000100";
        wait for clk_period;
        sys_bus_i.adr   <= "0000101";
        wait for clk_period;
        sys_bus_i       <= gnd_sbus_i;

		wait for 1550*clk_period;
        
        
        --End simulation
		wait for 200 ns;
		run_sim <= '0';
		wait;

    end process;


end TB;