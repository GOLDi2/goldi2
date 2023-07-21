-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		Warehouse V2 TOP_LEVEL - Testbench/Mole 
-- Module Name:		WAREHOUSE_V2_MOLE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> TOP_LEVEL.vhd (WH2)
--                  -> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd (WH2)
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




--! Verification simulation
entity WAREHOUSE_V2_MOLE is
end entity WAREHOUSE_V2_MOLE;




--! Simulation architecture
architecture TB of WAREHOUSE_V2_MOLE is

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
    signal SPI0_nCE0        :   std_logic := '1';
    signal SPI0_MOSI        :   std_logic := '0';
    signal SPI0_MISO        :   std_logic := '0';
    signal IO_DATA          :   std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    --Testbench
    signal mosi_data_buff   :   std_logic_vector(SPI_DATA_WIDTH-1 downto 0) := (others => '0');
        alias mosi_config   :   std_logic_vector(BUS_ADDRESS_WIDTH downto 0) 
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
    reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 11*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2; 
    begin
        IO_DATA(8 downto 0) <= (others => '0');
        wait for init_hold;


        --**Test communication with WH2**
        --Read configuration register
        mosi_config <= "0" & std_logic_vector(to_unsigned(1,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        wait for assert_hold;
        assert(miso_data_buff = std_logic_vector(to_unsigned(192,SPI_DATA_WIDTH)))
            report "ID01: Test communication - expecting ctrl_reg = 192/xC0"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test actuation modules in the WH2**
        --Turn environment LED red on
        mosi_config <= "1" & std_logic_vector(to_unsigned(29,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        --Turn environment LED white on
        mosi_config <= "1" & std_logic_vector(to_unsigned(30,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        --Turn environment LED green on
        mosi_config <= "1" & std_logic_vector(to_unsigned(31,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);
    
        wait for assert_hold;
        assert(IO_DATA(40 downto 38) = "111")
            report "ID02: Test WH2 operation - expecting environment LEDs = '1'" 
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test processing modules in the WH2**
        --Limit sensors active
        IO_DATA(7 downto 2) <= (others => '1');
        --Read sensor register
        mosi_config <= "0" & std_logic_vector(to_unsigned(2,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);
    
        wait for assert_hold;
            assert(miso_data_buff = std_logic_vector(to_unsigned(127,SPI_DATA_WIDTH)))
                report "ID03: Test WH2 operation - expecting sensor_reg = 127/x7F"
                severity error;
        wait for post_hold;
    

        --**End Simulation**
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------

end architecture;