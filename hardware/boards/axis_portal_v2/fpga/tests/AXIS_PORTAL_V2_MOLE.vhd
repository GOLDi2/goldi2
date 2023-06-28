-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		25/06/2023
-- Design Name:		Axis Portal V2 TOP_LEVEL - Testbench/Mole 
-- Module Name:		AXIS_PORTAL_V2_MOLE
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
use work.GOLDI_MODULE_CONFIG.all;




--! Verification simulation
entity AXIS_PORTAL_V2_MOLE is
end entity AXIS_PORTAL_V2_MOLE;




--! Simulation architecture
architecture TB of AXIS_PORTAL_V2_MOLE is

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
    constant sclk_period    :   time := 200 ns;
    signal clock            :   std_logic := '0';
    signal reset            :   std_logic := '0';
    signal run_sim          :   std_logic := '1';
    --DUT IOs
    signal SPI0_SCLK        :   std_logic;
    signal SPI0_MOSI        :   std_logic;
    signal SPI0_MISO        :   std_logic;
    signal SPI0_nCE0        :   std_logic;
    signal IO_DATA          :   std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => '0');
    --Testbench
    signal mosi_conf_buff   :   std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
    signal mosi_data_buff   :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
    signal miso_data_buff   :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);


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
    reset <= '1' after 10 ns, '0' after 110 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold  :   time := 210 ns; 
    begin
        --Preset signals
        SPI0_nCE0 <= '1';
        SPI0_SCLK <= '1';
        SPI0_MOSI <= '0';
        mosi_conf_buff <= (others => '0');
        mosi_data_buff <= (others => '0');
        miso_data_buff <= (others => '0');
        wait for init_hold;


        --**Communication with AP2**
        mosi_conf_buff <= "0" & std_logic_vector(to_unsigned(1,BUS_ADDRESS_WIDTH));
        mosi_data_buff <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));

        --Configuration word
        SPI0_nCE0 <= '0';
        for i in 0 to BUS_ADDRESS_WIDTH loop
            wait for sclk_period/2;
            SPI0_MOSI <= mosi_conf_buff(BUS_ADDRESS_WIDTH-i);
            SPI0_SCLK <= '0';
            wait for sclk_period/2;
            SPI0_SCLK <= '1';
        end loop;

        --Data word
        for i in 0 to SYSTEM_DATA_WIDTH-1 loop
            wait for sclk_period/2;
            SPI0_MOSI <= mosi_data_buff(SYSTEM_DATA_WIDTH-1-i);
            SPI0_SCLK <= '0';
            wait for sclk_period/2;
            miso_data_buff(SYSTEM_DATA_WIDTH-1-i) <= SPI0_MISO;
            SPI0_SCLK <= '1';
        end loop;

        wait for sclk_period;
        SPI0_nCE0 <= '1';


        assert(miso_data_buff = std_logic_vector(to_unsigned(32,SYSTEM_DATA_WIDTH)))
            report "ID01: Test control register - expecting miso_data_buff = 128/x20"
            severity error;

    
        --**End Simulation**
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;