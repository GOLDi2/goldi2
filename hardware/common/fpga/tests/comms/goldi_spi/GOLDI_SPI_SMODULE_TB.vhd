-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Custom SPI interface - SPI to BUS converter testbench
-- Module Name:		GOLDI_SPI_SMODULE_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_SPI_SMODULE.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V3.00.01 - Extension of testbench
-- Additional Comments: Modificatio of testbench to adapt to multipele
--						vector sizes.
--
-- Revision V4.00.00 - Extension of BUS protocol and renaming
-- Additional Comments: Introduction of "stb" signal to the GOLDi BUS master
--                      interface to prevent continuous read and write 
--                      operations. Addition of tags to the BUS interfaces
--                      to extend BUS flexibility. Renaming from SPI_TO_BUS
--                      to GOLDI_SPI_SMODULE.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation control and assertions
library std;
use std.standard.all;
use std.env.all;
--! Use custom communication library
library work;
use work.GOLDI_COMM_STANDARD.all;




--! Functionality siulation
entity GOLDI_SPI_SMODULE_TB is
end entity GOLDI_SPI_SMODULE_TB;




--! Simulation architecture
architecture TB of GOLDI_SPI_SMODULE_TB is

    --****DUT****
    component GOLDI_SPI_SMODULE
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            p_spi_nce       : in    std_logic;
            p_spi_sclk      : in    std_logic;
            p_spi_mosi      : in    std_logic;
            p_spi_miso      : out   std_logic;
            p_master_bus_o  : out   mbus_out;
            p_master_bus_i  : in    mbus_in
        );
    end component;


    --****INTERNAL SIGNALS****
	--Simulation timing 
	constant clk_period		:	time := 20 ns;
	constant sclk_period	:	time := 80 ns;
	signal clock			:	std_logic := '0';
	signal reset			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
    signal p_spi_nce        :   std_logic := '1';
    signal p_spi_sclk       :   std_logic := '1';
    signal p_spi_mosi       :   std_logic := '0';
    signal p_spi_miso       :   std_logic := '0';
    signal p_master_bus_o   :   mbus_out := gnd_mbus_o;
    signal p_master_bus_i   :   mbus_in  := gnd_mbus_i;
    --Testbench
    signal cmosi_buffer     :   std_logic_vector(CONFIGURATION_WORD-1 downto 0) := (others => '0');
    signal dmosi_buffer     :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0)  := (others => '0');
    signal dmiso_buffer     :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0)  := (others => '0');    


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : GOLDI_SPI_SMODULE
    port map(
        clk             => clock,
        rst             => reset,
        p_spi_nce       => p_spi_nce,
        p_spi_sclk      => p_spi_sclk,
        p_spi_mosi      => p_spi_mosi,
        p_spi_miso      => p_spi_miso,
        p_master_bus_o  => p_master_bus_o,
        p_master_bus_i  => p_master_bus_i
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
        variable init_hold		:	time := 5*clk_period/2; 
		variable assert_hold	:	time := 5*clk_period/2;
		variable post_hold		:	time := 1*clk_period/2;
	begin
		--**Initial setup**
		wait for init_hold;


        --**Test idle state**
        wait for assert_hold;
        assert(p_master_bus_o = gnd_mbus_o)
            report "ID01: Test reset - expecting p_master_bus_o = gnd_mbus_o"
            severity error;
        assert(p_spi_miso = '0')
            report "ID02: Test reset - expecting p_spi_miso = '0'"
            severity error;
        wait for post_hold;


        --**Test SPI transaction**
        --Port configuration
        p_spi_nce          <= '0';
        cmosi_buffer       <= "1" & "0" & std_logic_vector(to_unsigned(3,BUS_TAG_BITS)) 
                               & std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH));
        dmosi_buffer       <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
        p_master_bus_i.dat <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));


        for i in 0 to CONFIGURATION_WORD-1 loop
            wait for sclk_period/2;
            p_spi_mosi <= cmosi_buffer(CONFIGURATION_WORD-1-i);
            p_spi_sclk <= '0';
            wait for sclk_period/2;
            p_spi_sclk <= '1';
        end loop;

        wait for assert_hold;
        assert(p_master_bus_o.stb = '0')
            report "ID03: Test port configuration - expecting master_bus_o.stb = '0'"
            severity error;
        assert(p_master_bus_o.we  = '0')
            report "ID04: Test port configuration - expecting master_bus_o.we = '0'"
            severity error;
        assert(p_master_bus_o.adr = std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH)))
            report "ID05: Test port configuration - expecting master_bus_o.adr = x0F0"
            severity error;
        assert(p_master_bus_o.dat = (p_master_bus_o.dat'range => '0'))
            report "ID06: Test port configuration - expecting master_bus_o.dat = x00"
            severity error;
        assert(p_master_bus_o.tag = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID07: Test port configuration - expecting master_bus_o.tag = x3"
            severity error;
        wait for post_hold;


        --Data transfer
        for i in 0 to SYSTEM_DATA_WIDTH-1 loop
            wait for sclk_period/2;
            p_spi_mosi <= dmosi_buffer(SYSTEM_DATA_WIDTH-1-i);
            p_spi_sclk <= '0';
            wait for sclk_period/2;
            dmiso_buffer(SYSTEM_DATA_WIDTH-1-i) <= p_spi_miso;
            p_spi_sclk <= '1';
        end loop;

        wait for assert_hold;
        assert(p_master_bus_o.stb = '1')
            report "ID08: Test data transfer - expecting master_bus_o.stb = '1'"
            severity error;
        assert(p_master_bus_o.we  = '1')
            report "ID09: Test data transfer - expecting master_bus_o.we = '1'"
            severity error;
        assert(p_master_bus_o.adr = std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH)))
            report "ID10: Test data transfer - expecting master_bus_o.adr = x0F0"
            severity error;
        assert(p_master_bus_o.dat = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
            report "ID11: Test data transfer - expecting master_bus_o.dat = x0F"
            severity error;
        assert(p_master_bus_o.tag = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID12: Test data transfer - expecting master_bus_o.tag = x3"
            severity error;
        assert(dmiso_buffer = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
            report "ID13: Test data transfer - expecting dmiso_buffer = x0F"
            severity error;
        wait for post_hold;


        --Test second data byte
        p_master_bus_i.dat <= std_logic_vector(to_unsigned(14,SYSTEM_DATA_WIDTH));
        dmosi_buffer       <= std_logic_vector(to_unsigned(14,SYSTEM_DATA_WIDTH));
        
        for i in 0 to SYSTEM_DATA_WIDTH-1 loop
            wait for sclk_period/2;
            p_spi_mosi <= dmosi_buffer(SYSTEM_DATA_WIDTH-1-i);
            p_spi_sclk <= '0';
            wait for sclk_period/2;
            dmiso_buffer(SYSTEM_DATA_WIDTH-1-i) <= p_spi_miso;
            p_spi_sclk <= '1';
        end loop;

        wait for assert_hold;
        assert(p_master_bus_o.stb = '1')
            report "ID14: Test second data transfer - expecting master_bus_o.stb = '1'"
            severity error;
        assert(p_master_bus_o.we  = '1')
            report "ID15: Test second data transfer - expecting master_bus_o.we = '1'"
            severity error;
        assert(p_master_bus_o.adr = std_logic_vector(to_unsigned(239,BUS_ADDRESS_WIDTH)))
            report "ID16: Test second data transfer - expecting master_bus_o.adr = x0EE " &
                    integer'image(to_integer(unsigned(p_master_bus_o.adr)))
            severity error;
        assert(p_master_bus_o.dat = std_logic_vector(to_unsigned(14,SYSTEM_DATA_WIDTH)))
            report "ID17: Test second data transfer - expecting master_bus_o.dat = x0E"
            severity error;
        assert(p_master_bus_o.tag = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID18: Test second data transfer - expecting master_bus_o.tag = x3"
            severity error;
        assert(dmiso_buffer = std_logic_vector(to_unsigned(14,SYSTEM_DATA_WIDTH)))
            report "ID19: Test second data transfer - expecting dmiso_buffer = x0E"
            severity error;
        wait for post_hold;
        p_spi_nce <= '1';
        
        
        --**End simulation**
		wait for 50 ns;
        report "GOLDI_SPI_SMODULE_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;
		
	end process;
    -----------------------------------------------------------------------------------------------


end architecture;