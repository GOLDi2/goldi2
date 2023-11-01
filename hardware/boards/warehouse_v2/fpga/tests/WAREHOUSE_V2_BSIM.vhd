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
-- Revision V4.00.00 - Refactoring of testbench and renaming of module
-- Additional Comments: Modification to communication process to account for 
--                      new SPI protocol. Extension of test cases to verify
--                      model. Use of "env" library for control of the 
--                      simulation flow. Renaming of module to follow V4.00.00 
--                      naming conventions.
--                      (WAREHOUSE_V2_MOLE.vhd -> WAREHOUSE_V2_BSIM.vhd)
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
use work.GOLDI_MODULE_CONFIG.all;




--! Verification simulation
entity WAREHOUSE_V2_BSIM is
end entity WAREHOUSE_V2_BSIM;




--! Simulation architecture
architecture TB of WAREHOUSE_V2_BSIM is

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
    signal IO_DATA          :   std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => '0');
    --Testbench
    constant debounce_time  :   integer := 4*1250;
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
        variable init_hold      :   time := 11*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2; 
    begin
        --**Initial Setup**
        wait for init_hold;


        --**Test communication with WH2**
        --Read configuration register
        mosi_config <= "00" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(1,BUS_ADDRESS_WIDTH));
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
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(35,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        --Turn environment LED white on
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(36,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        --Turn environment LED green on
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(37,BUS_ADDRESS_WIDTH));
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
        IO_DATA(8)          <= '0';
        wait for debounce_time*clk_period;
        --Read sensor register
        mosi_config <= "00" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(2,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        wait for assert_hold;
            assert(miso_data_buff = std_logic_vector(to_unsigned(127,SPI_DATA_WIDTH)))
                report "ID03: Test WH2 operation - expecting sensor_reg = 127/x7F"
                severity error;
        wait for post_hold;
    

        wait for 5*clk_period;


        --**Test DC Motor driver**
        --Modify protection mask limits currently at x(0,0) and z(0,0)
        --Increase x maximum to 255
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(7,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(255,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);
        --Increase z maximum to 255        
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(11,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(255,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        --Drive incremental encoders
        IO_DATA(10) <= '1';
        IO_DATA(13) <= '1';
        wait for clk_period;

        for i in 1 to 20  loop
            IO_DATA(9)  <= '1';
            IO_DATA(12) <= '1';
            wait for 4*clk_period;
            IO_DATA(10) <= '0';
            IO_DATA(13) <= '0';
            wait for 4*clk_period;
            IO_DATA(9)  <= '0';
            IO_DATA(12) <= '0';
            wait for 4*clk_period;
            IO_DATA(10) <= '1';
            IO_DATA(13) <= '1';
            wait for 4*clk_period;
        end loop;


        IO_DATA(3 downto 2) <= (others => '0');
        IO_DATA(4)          <= '1';
        IO_DATA(7 downto 5) <= (others => '0');
        wait for debounce_time*clk_period;
        --Set pwm to maximum
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(27,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(255,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);
        --Enable motor in locked direction        
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(26,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(1,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        wait for assert_hold;
            assert(IO_DATA(26) = '1' and IO_DATA(25) = '0' and IO_DATA(24) = '0')
                report "ID04: Test WH2 operation - expecting IO_DATA(26,25,24) = '1','0','0'"
                severity error;
        wait for post_hold;


        --Enable motor in free direction        
        mosi_config <= "10" & std_logic_vector(to_unsigned(0,BUS_TAG_BITS)) & std_logic_vector(to_unsigned(26,BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(2,SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period,mosi_data_buff,miso_data_buff,SPI0_nCE0,SPI0_SCLK,SPI0_MOSI,SPI0_MISO);

        wait for assert_hold;
            assert(IO_DATA(26) = '0' and IO_DATA(25) = '1' and IO_DATA(24) = '1')
                report "ID05: Test WH2 operation - expecting IO_DATA(26,25,24) = '0','1','1'"
                severity error;
        wait for post_hold;



        --**End simulation**
		wait for 10 us;
        report "WAREHOUSE_V2_BSIM - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;