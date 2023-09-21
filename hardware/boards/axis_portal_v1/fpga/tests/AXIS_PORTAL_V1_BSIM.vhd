-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		20/06/2023
-- Design Name:		Axis Portal V1 TOP_LEVEL - Board Simulation 
-- Module Name:		AXIS_PORTAL_V1_BSIM
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--                  -> TOP_LEVEL.vhd (AP1)
--
-- Revisions:
-- Revision V3.00.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V4.00.00 - Refactoring of testbench and renaming of module
-- Additional Comments: Modificatin to communication process to acount for 
--                      new SPI protocol. Extension of test cases to verify
--                      model. Use of env library for control of the simulation
--                      flow. Renaming of module to follow V4.00.00 naming
--                      conventions.
--                      (AXIS_PORTAL_V1_MOLE.vhd -> AXIS_PORTAL_V1_BSIM.vhd)
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
entity AXIS_PORTAL_V1_BSIM is
end entity AXIS_PORTAL_V1_BSIM;




--! Simulation architecture
architecture TB of AXIS_PORTAL_V1_BSIM is

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
	constant sclk_period	:	time := 160 ns;
    constant clk_period     :   time := 20 ns;
    signal clock            :   std_logic := '0';
	signal reset			:	std_logic := '0';
    signal run_sim          :   std_logic := '1';
    -- DUT IOs
    signal SPI0_SCLK        :   std_logic := '1';
    signal SPI0_MOSI        :   std_logic := '0';
    signal SPI0_MISO        :   std_logic := '0';
    signal SPI0_nCE0        :   std_logic := '1';
    signal IO_DATA          :   std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
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
    reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 11*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        --Ground input pins
        IO_DATA(10 downto 0)  <= (others => '0');
        IO_DATA(16 downto 11) <= (others => '0');
        IO_DATA(40 downto 33) <= (others => '0');
        wait for init_hold;



        --**Test communication with AP1**
        --Read configuration register
        mosi_config <= "00" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(1,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);
     
        wait for assert_hold;
        assert(miso_data_buff = std_logic_vector(to_unsigned(16,SPI_DATA_WIDTH)))
            report "ID01: Test communication - expecting ctrl_reg = 16/x10"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test actuation modules in the AP1**
        --Turn environment LED red on
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(22,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        --Turn environment LED white on
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(23,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        --Turn environment LED green on
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(24,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        wait for assert_hold;
        assert(IO_DATA(32 downto 30) = "111")
            report "ID02: Test AP1 operation - expecting environment LEDs = '1'" 
            severity error;
        wait for post_hold;


        wait for 5*clk_period;
        

        --**Test processing modules in the AP1**
        --Limit sensors active
        IO_DATA(9 downto 0) <= (others => '1');
        --Read sensor register
        mosi_config <= "00" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(3,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        wait for assert_hold;
            assert(miso_data_buff = std_logic_vector(to_unsigned(255,SPI_DATA_WIDTH)))
                report "ID03: Test AP1 operation - expecting sensor_reg = 255/xFF"
                severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test DC Motor drivers**
        --Sensors z_positive and x_negative asserted
        IO_DATA(9 downto 2) <= "10000001";
        --Set pwm to maximum
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(14,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(255,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);
        --Enable motor in locked direction        
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(13,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(1,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        wait for assert_hold;
            assert(IO_DATA(17) = '1' and IO_DATA(18) = '0' and IO_DATA(19) = '0')
                report "ID04: Test AP1 operation - expecting IO_DATA(19,18,17) = '0','0','1'"
                severity error;
        wait for post_hold;


        --Enable motor in free direction        
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(13,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(2,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);
        
        wait for assert_hold;
            assert(IO_DATA(17) = '1' and IO_DATA(18) = '1' and IO_DATA(19) = '0')
                report "ID05: Test AP1 operation - expecting IO_DATA(19,18,17) = '0','1','1'"
                severity error;
        wait for post_hold;
        
        
        
        --**End simulation**
		wait for 50 ns;
        report "AXIS_PORTAL_V1_BSIM - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;