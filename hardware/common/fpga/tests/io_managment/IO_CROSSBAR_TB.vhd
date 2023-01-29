-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmai.com>
--
-- Create Date:		01/01/2023
-- Design Name:		IO Crossbar Structure testbench
-- Module Name:		IO_CROSSBAR_TB
-- Project Name:	GOLDIi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd;
--                  -> GOLDI_COMM_STANDARD.vhd;
--                  -> GOLDI_IO_STANDARD.vhd; 
--                  -> GOLDI_CROSSBAR_STANDARD.vhd
--                  -> IO_CORSSBAR.vhd
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom libraries
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality Testbench
entity IO_CROSSBAR_TB is
end entity IO_CROSSBAR_TB;



--! Simulation architecture
architecture TB of IO_CROSSBAR_TB is

    --CUT
    component IO_CROSSBAR
        generic(
            LAYOUT_BLOCKED  :   boolean := false
        );
        port(
            clk         : in    std_logic;
            rst         : in    std_logic;
            cross_bus_i : in    sbus_in;
            cross_bus_o : out   sbus_out;
            vir_io_in   : out   io_i_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
            vir_io_out  : in    io_o_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
            phy_io_in   : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            phy_io_out  : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
        );
    end component;


    --Intermediate Signals
    --Simulation timing
    constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic;
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
    signal cross_bus_i      :   sbus_in;
    signal cross_bus_o_1    :   sbus_out;
    signal cross_bus_o_2    :   sbus_out;
    signal vir_io_in_1      :   io_i_vector(5 downto 0);
    signal vir_io_in_2      :   io_i_vector(5 downto 0);
    signal vir_io_out_1     :   io_o_vector(5 downto 0);
    signal vir_io_out_2     :   io_o_vector(5 downto 0);
    signal phy_io_in_1      :   io_i_vector(2 downto 0);
    signal phy_io_in_2      :   io_i_vector(2 downto 0);
    signal phy_io_out_1     :   io_o_vector(2 downto 0);
    signal phy_io_out_2     :   io_o_vector(2 downto 0);
    

begin

    DUT_1 : IO_CROSSBAR
    generic map(
        LAYOUT_BLOCKED  => false
    )
    port map(
        clk         => clock,
        rst         => reset,
        cross_bus_i => cross_bus_i,
        cross_bus_o => cross_bus_o_1,
        vir_io_in   => vir_io_in_1,
        vir_io_out  => vir_io_out_1,
        phy_io_in   => phy_io_in_1,
        phy_io_out  => phy_io_out_1
    );

    DUT_2 : IO_CROSSBAR
    generic map(
        LAYOUT_BLOCKED  => true
    )
    port map(
        clk         => clock,
        rst         => reset,
        cross_bus_i => cross_bus_i,
        cross_bus_o => cross_bus_o_2,
        vir_io_in   => vir_io_in_2,
        vir_io_out  => vir_io_out_2,
        phy_io_in   => phy_io_in_2,
        phy_io_out  => phy_io_out_2
    );


    --Timing
	clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 0 ns, '0' after 15 ns;


    TEST : process
        variable init_hold      :   time := 4*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        
		--Preset master interface of bus
        cross_bus_i.we <= '0';
        cross_bus_i.adr <= (others => '0');
        cross_bus_i.dat <= (others => '0');
		--Preset the Physical pins
        phy_io_in_1(0).dat <= '1';
        phy_io_in_1(1).dat <= '1';
        phy_io_in_1(2).dat <= '1';

        phy_io_in_2(0).dat <= '1';
        phy_io_in_2(1).dat <= '1';
        phy_io_in_2(2).dat <= '1';
        
        --Preset virtual pins
        vir_io_out_1(0).enb <= '0';
        vir_io_out_1(1).enb <= '1';
        vir_io_out_1(2).enb <= '1';
        vir_io_out_1(0).dat <= '1';
        vir_io_out_1(1).dat <= '0';
        vir_io_out_1(2).dat <= '1';
        vir_io_out_1(3) <= gnd_io_o;
        vir_io_out_1(4) <= gnd_io_o;
        vir_io_out_1(5) <= gnd_io_o;

        vir_io_out_2(0).enb <= '0';
        vir_io_out_2(1).enb <= '1';
        vir_io_out_2(2).enb <= '1';
        vir_io_out_2(0).dat <= '1';
        vir_io_out_2(1).dat <= '0';
        vir_io_out_2(2).dat <= '1';
        vir_io_out_2(3) <= gnd_io_o;
        vir_io_out_2(4) <= gnd_io_o;
        vir_io_out_2(5) <= gnd_io_o;

        wait for init_hold;


        --Test reset state
        assert(vir_io_in_1(0).dat = '1') 
            report "line(167): Test reset - expecting vir(0) = '1'" severity error;
        assert(vir_io_in_1(1).dat = '1')
            report "line(169): Test reset - expecting vir(1) = '1'" severity error;
        assert(vir_io_in_1(2).dat = '1')
            report "line(171): Test reset - expecting vir(2) = '1'" severity error; 

        assert(phy_io_out_1(0).enb = '0' and phy_io_out_1(0).dat = '1')
            report "line(174): Test reset - expecting phy(0) = ('0','1')" severity error;
        assert(phy_io_out_1(1).enb = '1' and phy_io_out_1(1).dat = '0')
            report "line(176): Test reset - expecting phy(1) = ('1','0')" severity error;
        assert(phy_io_out_1(2).enb = '1' and phy_io_out_1(2).dat = '1')
            report "line(178): Test reset - expecting phy(2) = ('1','1')" severity error;
        --


        --Test read operation
        cross_bus_i.adr <= "0000011";
        wait for assert_hold;
        assert(cross_bus_o_1.dat = x"01") 
            report "line(186): Test read operation - expecting bus_o_1.dat = x01" severity error;
        assert(cross_bus_o_1.val = '1')
            report "line(188): Test read operation - expecting bus_o_1.val = '1'" severity error;
        wait for post_hold;
        --
        

        --Test write operation
        wait for 50 ns;
        cross_bus_i.we <= '1';
        cross_bus_i.adr <= "0000100";
        cross_bus_i.dat <= x"05";
        wait for assert_hold;
        assert(phy_io_out_1(2).enb = '0' and phy_io_out_1(2).dat = '0')
            report "line(200): Test write operation - expecing phy(2) = ('0','0')" severity error;
        assert(vir_io_in_1(5).dat = '1')
            report "line(202): Test write operation - expecting vir(2) = '1'" severity error;
        wait for post_hold;
        --


        --Test Blocked Crossbar
        wait for 50 ns;
        cross_bus_i.we <= '0';
        wait for assert_hold;
        assert(cross_bus_o_1.dat = x"05") 
            report "line(212): Test blocked crossbar - expecting bus_o_1.dat = x05" severity error;
        assert(cross_bus_o_1.val = '1')
            report "line(214): Test blocked crossbar - expecting bus_o_1.val = '1'" severity error;
        assert(cross_bus_o_2.dat = x"02") 
            report "line(216): Test blocked crossbar - expecting bus_o_2.dat = x02" severity error;
        assert(cross_bus_o_2.val = '1')
            report "line(218): Test blocked crossbar - expecting bus_o_2.val = '1'" severity error;
        assert(phy_io_out_2(2).enb = '1' and phy_io_out_2(2).dat = '1')
            report "line(220): Test blocked crossbar - expecting phy_2(2) = ('1','1')" severity error;
        assert(vir_io_in_2(2).dat = '1') 
            report "lien(222): Test blocked crossbar - expecting vir_2(2) = '1'" severity error;
        wait for post_hold;


        --End simulation
        wait for 50 ns;
		run_sim <= '0';
        wait;    
    end process;


end TB;