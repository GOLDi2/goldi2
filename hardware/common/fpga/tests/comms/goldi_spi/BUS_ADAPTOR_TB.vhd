-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Parallel data to BUS standard testbench
-- Module Name:		BUS_ADAPTOR_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> BUS_ADAPTOR.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit [Test for 8x8 bus structure]
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
--
-- Revision V4.00.00 - Extension of BUS protocol and renaming
-- Additional Comments: Introduction of "stb" signal to the GOLDi BUS master
--                      interface to prevent continuous read and write 
--                      operations. Addition of tags to the BUS interfaces
--                      to extend BUS flexibility. Renaming from BUS_CONVERTER
--                      to BUS_ADAPTOR.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard libarary for simulation control and assertions
library std;
use std.standard.all;
use std.env.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! Functionality simulation
entity BUS_ADAPTOR_TB is
end entity BUS_ADAPTOR_TB;




--! Simulation architecture
architecture TB of BUS_ADAPTOR_TB is

    --****DUT****
    component BUS_ADAPTOR
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            p_nce           : in    std_logic;
            p_word_val      : in    std_logic;
            p_config_word_i : in    std_logic_vector(CONFIGURATION_WORD-1 downto 0);
            p_data_word_i   : in    std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
            p_data_word_o   : out   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
            p_master_bus_o  : out   mbus_out;
            p_master_bus_i  : in    mbus_in  
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing 
	constant clk_period		:	time := 20 ns;
	signal clock			:	std_logic := '0';
	signal reset			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
    signal p_nce            :   std_logic := '1';
    signal p_word_val       :   std_logic := '0';
    signal p_config_word_i  :   std_logic_vector(CONFIGURATION_WORD-1 downto 0) := (others => '0');
    signal p_data_word_i    :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0)  := (others => '0');
    signal p_data_word_o    :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0)  := (others => '0');
    signal p_master_bus_o   :   mbus_out := gnd_mbus_o;
    signal p_master_bus_i   :   mbus_in  := gnd_mbus_i;


begin


    --****COMPONENTS****
    -------------------------------------------------------------------------------------------------------------------
    DUT : BUS_ADAPTOR
    port map(
        clk             => clock,
        rst             => reset,
        p_nce           => p_nce,
        p_word_val      => p_word_val,
        p_config_word_i => p_config_word_i,
        p_data_word_i   => p_data_word_i,
        p_data_word_o   => p_data_word_o,
        p_master_bus_o  => p_master_bus_o,
        p_master_bus_i  => p_master_bus_i
    );
    -------------------------------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
	-------------------------------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 10 ns, '0' after 30 ns;
	-------------------------------------------------------------------------------------------------------------------



    --****TEST****
    -------------------------------------------------------------------------------------------------------------------
    TEST : process
        --Timing 
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 1*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --***Initial setup**
        wait for init_hold;


        --**Test reset conditions**
        wait for assert_hold;
        assert(p_master_bus_o = gnd_mbus_o)
            report "ID01: Test reset - expecting master_bus_o = gnd_mbus_o" 
            severity error;
        assert(p_data_word_o = (p_data_word_o'range => '0'))
            report "ID02: Test reset - expecting data_word_o = x00" 
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test simple write transaction**
        --Enable module and shift configuration word
        p_nce <= '0';
        wait for 2*clk_period;
        --Configuration word: "we" & "!se" & "tag(3)" & "address(240)"
        p_config_word_i <= "1" & "0" & std_logic_vector(to_unsigned(3,BUS_TAG_BITS))
                            & std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH));
        p_word_val      <= '1';
        wait for clk_period;
        p_config_word_i <= std_logic_vector(to_unsigned(0,CONFIGURATION_WORD));
        p_word_val      <= '0';

        wait for assert_hold;
        assert(p_master_bus_o.stb = '0')
            report "ID03: Test simple transaction - expecting master_bus_o.stb = '0'"
            severity error;
        assert(p_master_bus_o.we  = '0')
            report "ID04: Test simple transaction - expecting master_bus_o.we = '0'"
            severity error;
        assert(p_master_bus_o.adr = std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH)))
            report "ID05: Test simple transaction - expecting master_bus_o.adr = x0F0"
            severity error;
        assert(p_master_bus_o.dat = std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH)))
            report "ID06: Test simple transaction - expecting master_bus_o.dat = x00"
            severity error;
        assert(p_master_bus_o.tag = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID07: Test simple transaction - expecting master_bus_o.tag = x3"
            severity error;
        wait for post_hold;

        --Shift data word
        p_data_word_i <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
        p_word_val    <= '1';
        wait for clk_period;
        p_data_word_i <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
        p_word_val    <= '0';

        wait for assert_hold;
        assert(p_master_bus_o.stb = '1')
            report "ID08: Test simple transaction - expecting master_bus_o.stb = '1'"
            severity error;
        assert(p_master_bus_o.we  = '1')
            report "ID09: Test simple transaction - expecting master_bus_o.we = '1'"
            severity error;
        assert(p_master_bus_o.adr = std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH)))
            report "ID10: Test simple transaction - expecting master_bus_o.adr = x0F0"
            severity error;
        assert(p_master_bus_o.dat = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
            report "ID11: Test simple transaction - expecting master_bus_o.dat = x0F"
            severity error;
        assert(p_master_bus_o.tag = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID12: Test simple transaction - expecting master_bus_o.tag = x3"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test multi-register transaction**
        p_data_word_i <= std_logic_vector(to_unsigned(16,SYSTEM_DATA_WIDTH));
        p_word_val    <= '1';
        wait for clk_period;
        p_data_word_i <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
        p_word_val    <= '0';

        wait for assert_hold;
        assert(p_master_bus_o.stb = '1')
            report "ID13: Test multi-reg transaction - expecting master_bus_o.stb = '1'"
            severity error;
        assert(p_master_bus_o.we  = '1')
            report "ID14: Test multi-reg transaction - expecting master_bus_o.we = '1'"
            severity error;
        assert(p_master_bus_o.adr = std_logic_vector(to_unsigned(239,BUS_ADDRESS_WIDTH)))
            report "ID15: Test multi-reg transaction - expecting master_bus_o.adr = x0EE"
            severity error;
        assert(p_master_bus_o.dat = std_logic_vector(to_unsigned(16,SYSTEM_DATA_WIDTH)))
            report "ID16: Test multi-reg transaction - expecting master_bus_o.dat = x10"
            severity error;
        assert(p_master_bus_o.tag = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID17: Test multi-reg transaction - expecting master_bus_o.tag = x3"
            severity error;
        wait for post_hold;
        p_nce <= '1';


        wait for 5*clk_period;


        --**Test strem transactions**
        --Enable module and shift configuration word
        p_nce <= '0';
        wait for 2*clk_period;
        --Configuration word: "we" & "se" & "tag(3)" & "address(240)"
        p_config_word_i <= "1" & "1" & std_logic_vector(to_unsigned(3,BUS_TAG_BITS))
                            & std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH));
        p_word_val      <= '1';
        wait for clk_period;
        p_config_word_i <= std_logic_vector(to_unsigned(0,CONFIGURATION_WORD));
        p_word_val      <= '0';

        wait for assert_hold;
        assert(p_master_bus_o.stb = '0')
            report "ID18: Test stream transaction - expecting master_bus_o.stb = '0'"
            severity error;
        assert(p_master_bus_o.we  = '0')
            report "ID19: Test stream transaction - expecting master_bus_o.we = '0'"
            severity error;
        assert(p_master_bus_o.adr = std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH)))
            report "ID20: Test stream transaction - expecting master_bus_o.adr = x0F0"
            severity error;
        assert(p_master_bus_o.dat = std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH)))
            report "ID21: Test stream transaction - expecting master_bus_o.dat = x00"
            severity error;
        assert(p_master_bus_o.tag = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID22: Test stream transaction - expecting master_bus_o.tag = x3"
            severity error;
        wait for post_hold;

        --Shift data word
        p_data_word_i <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
        p_word_val    <= '1';
        wait for clk_period;
        p_data_word_i <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
        p_word_val    <= '0';

        wait for assert_hold;
        assert(p_master_bus_o.stb = '1')
            report "ID23: Test stream transaction - expecting master_bus_o.stb = '1'"
            severity error;
        assert(p_master_bus_o.we  = '1')
            report "ID24: Test stream transaction - expecting master_bus_o.we = '1'"
            severity error;
        assert(p_master_bus_o.adr = std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH)))
            report "ID25: Test stream transaction - expecting master_bus_o.adr = x0F0"
            severity error;
        assert(p_master_bus_o.dat = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
            report "ID26: Test stream transaction - expecting master_bus_o.dat = x0F"
            severity error;
        assert(p_master_bus_o.tag = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID27: Test stream transaction - expecting master_bus_o.tag = x3"
            severity error;
        wait for post_hold;


        --**Test multi-register transaction**
        p_data_word_i <= std_logic_vector(to_unsigned(16,SYSTEM_DATA_WIDTH));
        p_word_val    <= '1';
        wait for clk_period;
        p_data_word_i <= std_logic_vector(to_unsigned(0,SYSTEM_DATA_WIDTH));
        p_word_val    <= '0';

        wait for assert_hold;
        assert(p_master_bus_o.stb = '1')
            report "ID28: Test stream transaction - expecting master_bus_o.stb = '1'"
            severity error;
        assert(p_master_bus_o.we  = '1')
            report "ID29: Test stream transaction - expecting master_bus_o.we = '1'"
            severity error;
        assert(p_master_bus_o.adr = std_logic_vector(to_unsigned(240,BUS_ADDRESS_WIDTH)))
            report "ID30: Test stream transaction - expecting master_bus_o.adr = x0F0"
            severity error;
        assert(p_master_bus_o.dat = std_logic_vector(to_unsigned(16,SYSTEM_DATA_WIDTH)))
            report "ID31: Test stream transaction - expecting master_bus_o.dat = x10"
            severity error;
        assert(p_master_bus_o.tag = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID32: Test stream transaction - expecting master_bus_o.tag = x3"
            severity error;
        wait for post_hold;
        p_nce <= '1';


		--**End simulation**
		wait for 50 ns;
        report "BUS_CONVERTER_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -------------------------------------------------------------------------------------------------------------------


end architecture;