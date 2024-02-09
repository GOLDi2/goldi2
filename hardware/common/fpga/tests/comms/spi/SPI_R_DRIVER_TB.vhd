-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/07/2023
-- Design Name:		SPI General Reciver Testbench 
-- Module Name:		SPI_R_DRIVER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> SPI_R_DRIVER.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation flow control and assertions
library std;
use std.standard.all;
use std.env.all;




--! Functionality simulation
entity SPI_R_DRIVER_TB is
end entity SPI_R_DRIVER_TB;




--! Simulation architecture
architecture TB of SPI_R_DRIVER_TB is

    --****DUT****
    component SPI_R_DRIVER
    generic(
        g_word_length       :   integer   := 8;
        g_cpol              :   std_logic := '1';
        g_cpha              :   std_logic := '0';
        g_msbf              :   boolean   := true
    );
    port(
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        p_tdword_tvalid     : in    std_logic;
        p_tdword_tdata      : in    std_logic_vector(g_word_length-1 downto 0);
        p_rdword_tvalid     : out   std_logic;
        p_rdword_tdata      : out   std_logic_vector(g_word_length-1 downto 0);
        p_spi_ncs           : in    std_logic;
        p_spi_sclk          : in    std_logic;
        p_spi_mosi          : in    std_logic;
        p_spi_miso          : out   std_logic;
        p_spi_miso_highz    : out   std_logic
    );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		    :	time := 20 ns;
    constant sclk_period        :   time := 160 ns;
	signal reset			    :	std_logic := '0';
	signal clock			    :	std_logic := '0';
	signal run_sim			    :	std_logic := '1';
    --DUT IOs
    --Byte array structure to simplify testbench
    type byte_vector is array (natural range <>) of std_logic_vector(7 downto 0);
    --Parallel interface signals
    signal p_tdword_tvalid      :   std_logic := '0';
    signal p_tdword_tdata       :   std_logic_vector(7 downto 0) := (others => '0');
    signal p_rdword_tvalid      :   std_logic_vector(3 downto 0) := (others => '0');
    signal p_rdword_tdata       :   byte_vector(3 downto 0) := (others => (others => '0'));
    --SPI interface signals
    signal p_spi_ncs            :   std_logic := '1';
    signal p_spi_sclk           :   std_logic := '0';
    signal p_spi_mosi           :   std_logic := '0';
    signal p_spi_miso           :   std_logic_vector(3 downto 0) := (others => '0');
    signal p_spi_miso_highz     :   std_logic_vector(3 downto 0) := (others => '1');
    --Testbench
    constant mosi_data          :   std_logic_vector(7 downto 0) := x"3C";
    constant miso_data          :   std_logic_vector(7 downto 0) := x"C3";
    signal mosi_buff            :   byte_vector(3 downto 0) := (others => (others => '0'));
    signal miso_buff            :   byte_vector(3 downto 0) := (others => (others => '0'));



begin

    --****COMPONENTS****
    -----------------------------------------------------------------------------------------------
    --Capture -> rising edge / Shift -> falling edge
    DUT_MODE0 : SPI_R_DRIVER
    generic map(
        g_word_length       =>  8,
        g_cpol              => '0',
        g_cpha              => '0',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_tdword_tvalid     => p_tdword_tvalid,
        p_tdword_tdata      => p_tdword_tdata,
        p_rdword_tvalid     => p_rdword_tvalid(0),
        p_rdword_tdata      => p_rdword_tdata(0),
        p_spi_ncs           => p_spi_ncs,
        p_spi_sclk          => p_spi_sclk,
        p_spi_mosi          => p_spi_mosi,
        p_spi_miso          => p_spi_miso(0),
        p_spi_miso_highz    => p_spi_miso_highz(0)
    );


    --Capture -> falling edge / Shift -> rising edge
    DUT_MODE1 : SPI_R_DRIVER
    generic map(
        g_word_length       =>  8,
        g_cpol              => '0',
        g_cpha              => '1',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_tdword_tvalid     => p_tdword_tvalid,
        p_tdword_tdata      => p_tdword_tdata,
        p_rdword_tvalid     => p_rdword_tvalid(1),
        p_rdword_tdata      => p_rdword_tdata(1),
        p_spi_ncs           => p_spi_ncs,
        p_spi_sclk          => p_spi_sclk,
        p_spi_mosi          => p_spi_mosi,
        p_spi_miso          => p_spi_miso(1),
        p_spi_miso_highz    => p_spi_miso_highz(1)
    );


    --Capture -> falling edge / Shift -> rising edge
    DUT_MODE2 : SPI_R_DRIVER
    generic map(
        g_word_length       =>  8,
        g_cpol              => '1',
        g_cpha              => '0',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_tdword_tvalid     => p_tdword_tvalid,
        p_tdword_tdata      => p_tdword_tdata,
        p_rdword_tvalid     => p_rdword_tvalid(2),
        p_rdword_tdata      => p_rdword_tdata(2),
        p_spi_ncs           => p_spi_ncs,
        p_spi_sclk          => p_spi_sclk,
        p_spi_mosi          => p_spi_mosi,
        p_spi_miso          => p_spi_miso(2),
        p_spi_miso_highz    => p_spi_miso_highz(2)
    );


    --Capture -> rising edge / Shift -> falling edge
    DUT_MODE3 : SPI_R_DRIVER
    generic map(
        g_word_length       =>  8,
        g_cpol              => '1',
        g_cpha              => '1',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_tdword_tvalid     => p_tdword_tvalid,
        p_tdword_tdata      => p_tdword_tdata,
        p_rdword_tvalid     => p_rdword_tvalid(3),
        p_rdword_tdata      => p_rdword_tdata(3),
        p_spi_ncs           => p_spi_ncs,
        p_spi_sclk          => p_spi_sclk,
        p_spi_mosi          => p_spi_mosi,
        p_spi_miso          => p_spi_miso(3),
        p_spi_miso_highz    => p_spi_miso_highz(3)
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after  10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------    
    DATA_SHIFTING : process(clock)
    begin
        if(rising_edge(clock)) then
            if(p_rdword_tvalid(0) = '1') then
                mosi_buff(0) <= p_rdword_tdata(0);
            end if;

            if(p_rdword_tvalid(1) = '1') then
                mosi_buff(1) <= p_rdword_tdata(1);
            end if;

            if(p_rdword_tvalid(2) = '1') then
                mosi_buff(2) <= p_rdword_tdata(2);
            end if;

            if(p_rdword_tvalid(3) = '1') then
                mosi_buff(3) <= p_rdword_tdata(3);
            end if;
        end if;
    end process;
    


    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial Setup**
        wait for init_hold;


        --**Test idle state**
        wait for assert_hold;
        assert(p_rdword_tvalid(0) = '0' and p_rdword_tdata(0) = (p_rdword_tdata(0)'range => '0'))
            report "ID01: Test reset - expecting DUT_MODE0 o_dword interface grounded"
            severity error;
        assert(p_spi_miso(0) = '0' and p_spi_miso_highz(0) = '1')
            report "ID02: Test reset - expecting DUT_MODE0 spi_miso interface ('0';'1')"
            severity error;
        assert(p_rdword_tvalid(1) = '0' and p_rdword_tdata(1) = (p_rdword_tdata(1)'range => '0'))
            report "ID03: Test reset - expecting DUT_MODE1 o_dword interface grounded"
            severity error;
        assert(p_spi_miso(1) = '0' and p_spi_miso_highz(1) = '1')
            report "ID04: Test reset - expecting DUT_MODE1 spi_miso interface ('0';'1')"
            severity error;
        assert(p_rdword_tvalid(2) = '0' and p_rdword_tdata(2) = (p_rdword_tdata(2)'range => '0'))
            report "ID05: Test reset - expecting DUT_MODE2 o_dword interface grounded"
            severity error;
        assert(p_spi_miso(2) = '0' and p_spi_miso_highz(2) = '1')
            report "ID06: Test reset - expecting DUT_MODE2 spi_miso interface ('0';'1')"
            severity error;
        assert(p_rdword_tvalid(3) = '0' and p_rdword_tdata(3) = (p_rdword_tdata(3)'range => '0'))
            report "ID07: Test reset - expecting DUT_MODE3 o_dword interface grounded"
            severity error;
        assert(p_spi_miso(3) = '0' and p_spi_miso_highz(3) = '1')
            report "ID08: Test reset - expecting DUT_MODE3 spi_miso interface ('0';'1')"
            severity error;
        wait for post_hold;



        --**Test transaction**
        --*Test DUT_MODE0*
        p_tdword_tdata  <= miso_data;
        p_tdword_tvalid <= '1';
        p_spi_sclk      <= '0';
        wait for clk_period;
        p_tdword_tvalid <= '0';
        p_spi_ncs       <= '0';

        for i in 0 to 7 loop
            p_spi_mosi        <= mosi_data(7-i);
            wait for sclk_period/2;
            p_spi_sclk        <= '1';
            miso_buff(0)(7-i) <= p_spi_miso(0); 
            wait for sclk_period/2;
            p_spi_sclk        <= '0';
        end loop;
        wait for sclk_period/2;
        p_spi_ncs <= '1';

        wait for assert_hold;
        assert(mosi_buff(0) = mosi_data)
            report "ID09: Test DUT_MODE0 - expecting mosi_buff = mosi_data" severity error;
        assert(miso_buff(0) = miso_data)
            report "ID10: Test DUT_MODE0 - expecting miso_buff = miso_data" severity error;
        wait for post_hold;



        wait for 5*clk_period;



        --*Test DUT_MODE1*
        p_tdword_tdata  <= miso_data;
        p_tdword_tvalid <= '1';
        p_spi_sclk      <= '0';
        wait for clk_period;
        p_tdword_tvalid <= '0';
        p_spi_ncs       <= '0';

        for i in 0 to 7 loop
            wait for sclk_period/2;
            p_spi_sclk        <= '1';
            p_spi_mosi        <= mosi_data(7-i);
            wait for sclk_period/2;
            p_spi_sclk        <= '0';
            miso_buff(1)(7-i) <= p_spi_miso(1);
        end loop;
        wait for sclk_period/2;
        p_spi_ncs <= '1';

        wait for assert_hold;
        assert(mosi_buff(1) = mosi_data)
            report "ID11: Test DUT_MODE1 - expecting mosi_buff = mosi_data" severity error;
        assert(miso_buff(1) = miso_data)
            report "ID12: Test DUT_MODE1 - expecting miso_buff = miso_data" severity error;
        wait for post_hold;



        wait for 5*clk_period;



        --*Test DUT_MODE2*
        p_tdword_tdata  <= miso_data;
        p_tdword_tvalid <= '1';
        p_spi_sclk      <= '1';
        wait for clk_period;
        p_tdword_tvalid <= '0';
        p_spi_ncs       <= '0';

        for i in 0 to 7 loop
            p_spi_mosi        <= mosi_data(7-i);
            wait for sclk_period/2;
            p_spi_sclk        <= '0';
            miso_buff(2)(7-i) <= p_spi_miso(2);
            wait for sclk_period/2;
            p_spi_sclk        <= '1';
            
        end loop;
        wait for sclk_period/2;
        p_spi_ncs <= '1'; 

        wait for assert_hold;
        assert(mosi_buff(2) = mosi_data)
            report "ID13: Test DUT_MODE2 - expecting mosi_buff = mosi_data" severity error;
        assert(miso_buff(2) = miso_data)
            report "ID14: Test DUT_MODE2 - expecting miso_buff = miso_data" severity error;
        wait for post_hold;



        wait for 5*clk_period;



        --*Test DUT_MODE3*
        p_tdword_tdata  <= miso_data;
        p_tdword_tvalid <= '1';
        p_spi_sclk      <= '1';
        wait for clk_period;
        p_tdword_tvalid <= '0';
        p_spi_ncs       <= '0';

        for i in 0 to 7 loop
            wait for sclk_period/2;
            p_spi_sclk        <= '0';
            p_spi_mosi        <= mosi_data(7-i);
            wait for sclk_period/2;
            p_spi_sclk        <= '1';
            miso_buff(3)(7-i) <= p_spi_miso(3); 
        end loop;
        wait for sclk_period/2;
        p_spi_ncs <= '1';

        wait for assert_hold;
        assert(mosi_buff(3) = mosi_data)
            report "ID15: Test DUT_MODE3 - expecting mosi_buff = mosi_data" severity error;
        assert(miso_buff(3) = miso_data)
            report "ID16: Test DUT_MODE3 - epxecting miso_buff = miso_data" severity error;
        wait for post_hold;



		--**End simulation**
		wait for 50 ns;
        report "SPI_R_DRIVER_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;
