-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		25/06/2023
-- Design Name:		Axis Portal V2 TOP_LEVEL - Testbench/Mole 
-- Module Name:		AXIS_PORTAL_V2_MOTOR
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> TOP_LEVEL.vhd (AP2)
--                  -> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd (AP2)
--
-- Revisions:
-- Revision V3.00.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V4.00.00 - Refactoring of testbench and renaming of module
-- Additional Comments: Modification to communication process to account for 
--                      new SPI protocol. Extension of test cases to verify
--                      model. Use of "env" library for control of the 
--                      simulation flow. Renaming of module to follow V4.00.00 
--                      naming conventions.
--                      (AXIS_PORTAL_V2_MOLE.vhd -> AXIS_PORTAL_V2_MOTOR.vhd)
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


--! Verification simulation
entity AXIS_PORTAL_V2_MOTOR is
end entity AXIS_PORTAL_V2_MOTOR;


--! Simulation architecture
architecture TB of AXIS_PORTAL_V2_MOTOR is

    --****DUT****
    component TOP_LEVEL
        port(
            ClockFPGA   : in    std_logic;
            FPGA_nReset : in    std_logic;
            SPI0_SCLK   : in    std_logic;
            SPI0_MOSI   : in    std_logic;
            SPI0_MISO   : out   std_logic;
            SPI0_nCE0   : in    std_logic;
            IO_DATA     : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period     :   time := 20 ns;
    constant sclk_period    :   time := 160 ns;
    signal clock            :   std_logic := '0';
    signal reset            :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    --DUT IOs
    signal SPI0_SCLK        :   std_logic := '1';
    signal SPI0_MOSI        :   std_logic := '0';
    signal SPI0_MISO        :   std_logic := '0';
    signal SPI0_nCE0        :   std_logic := '1';
    signal IO_DATA          :   std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => '0');
    --Testbench
    signal mosi_data_buff   :   std_logic_vector(SPI_DATA_WIDTH-1 downto 0) := (others => '0');
        alias mosi_config   :   std_logic_vector(CONFIGURATION_WORD-1 downto 0) 
                                is mosi_data_buff(SPI_DATA_WIDTH-1 downto SYSTEM_DATA_WIDTH);
        alias mosi_data     :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0)
                                is mosi_data_buff(SYSTEM_DATA_WIDTH-1 downto 0);  
    signal miso_data_buff   :   std_logic_vector(SPI_DATA_WIDTH-1 downto 0) := (others => '0');


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : TOP_LEVEL
    port map(
        ClockFPGA   => clock,
        FPGA_nReset => reset,
        SPI0_SCLK   => SPI0_SCLK,
        SPI0_MOSI   => SPI0_MOSI,
        SPI0_MISO   => SPI0_MISO,
        SPI0_nCE0   => SPI0_nCE0,
        IO_DATA     => IO_DATA
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 10 ns, '0' after 50 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 1001*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2; 
    begin
        --**Initial Setup**
        --Ground input pins
        IO_DATA(12 downto 0) <= (others => '0');
        IO_DATA(15) <= '0';
        IO_DATA(21) <= '0';
        IO_DATA(24) <= '0';
        IO_DATA(30) <= '0';
        wait for init_hold;

        --Set speed low
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(12,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        --Set speed high
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(13,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(255,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        --Set motor to run
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(11,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(1,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        wait for 100 ms;

        --Set motor to stop
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(11,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        wait for 100 ms;

      --**End simulation**
        wait for 50 ns;
        report "AXIS_PORTAL_V2_MOTOR - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;