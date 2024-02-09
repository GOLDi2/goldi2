-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/07/2023
-- Design Name:		SPI General Transmiter Testbench 
-- Module Name:		SPI_T_DRIVER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> SPI_T_DRIVER.vhd
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
entity SPI_T_DRIVER_TB is
end entity SPI_T_DRIVER_TB;




--! Simulation architecture 
architecture TB of SPI_T_DRIVER_TB is

    --****DUT****
    component SPI_T_DRIVER
        generic(
            g_clk_factor        :   integer := 4;
            g_word_length       :   integer := 8;
            g_cpol              :   std_logic := '1';
            g_cpha              :   std_logic := '0';
            g_msbf              :   boolean := true
        );
        port(
            clk                 : in    std_logic;
            rst                 : in    std_logic;
            p_stream_enb        : in    std_logic;
            p_tdword_tready     : out   std_logic;
            p_tdword_tvalid     : in    std_logic;
            p_tdword_tdata      : in    std_logic_vector(g_word_length-1 downto 0);
            p_rdword_tvalid     : out   std_logic;
            p_rdword_tdata      : out   std_logic_vector(g_word_length-1 downto 0);
            p_spi_ncs           : out   std_logic;
            p_spi_sclk          : out   std_logic;
            p_spi_mosi          : out   std_logic;
            p_spi_miso          : in    std_logic
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
    signal p_tdword_tready      :   std_logic_vector(3 downto 0) := (others => '0');
    signal p_tdword_tvalid      :   std_logic_vector(3 downto 0) := (others => '0');
    signal p_tdword_tdata       :   byte_vector(3 downto 0) := (others => (others => '0'));
    signal p_rdword_tvalid      :   std_logic_vector(3 downto 0) := (others => '0');
    signal p_rdword_tdata       :   byte_vector(3 downto 0) := (others => (others => '0'));
    --SPI interface
    signal p_spi_ncs            :   std_logic_vector(3 downto 0) := (others => '0');
    signal p_spi_sclk           :   std_logic_vector(3 downto 0) := (others => '0');
    signal p_spi_mosi           :   std_logic_vector(3 downto 0) := (others => '0');
    signal p_spi_miso           :   std_logic_vector(3 downto 0) := (others => '0');
    --Testbench
    constant mosi_data          :   std_logic_vector(7 downto 0) := x"3C";
    constant miso_data          :   std_logic_vector(7 downto 0) := x"C3";
    signal mosi_buffer          :   byte_vector(3 downto 0) := (others => (others => '0'));
    signal miso_buffer          :   byte_vector(3 downto 0) := (others => (others => '0'));


begin

    --****COMPONENTS****
    -----------------------------------------------------------------------------------------------
    --Capture -> leading edge / Shift -> trailing edge
    DUT_MODE0 : SPI_T_DRIVER
    generic map(
        g_clk_factor        => 8,
        g_word_length       => 8,
        g_cpol              => '0',
        g_cpha              => '0',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_stream_enb        => '0',
        p_tdword_tready     => p_tdword_tready(0),
        p_tdword_tvalid     => p_tdword_tvalid(0),
        p_tdword_tdata      => p_tdword_tdata(0),
        p_rdword_tvalid     => p_rdword_tvalid(0),
        p_rdword_tdata      => p_rdword_tdata(0),
        p_spi_ncs           => p_spi_ncs(0),
        p_spi_sclk          => p_spi_sclk(0),
        p_spi_mosi          => p_spi_mosi(0),
        p_spi_miso          => p_spi_miso(0)
    );


    --Captrure -> trailing edge / Shift -> leading edge
    DUT_MODE1 : SPI_T_DRIVER
    generic map(
        g_clk_factor        => 8,
        g_word_length       => 8,
        g_cpol              => '0',
        g_cpha              => '1',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_stream_enb        => '0',
        p_tdword_tready     => p_tdword_tready(1),
        p_tdword_tvalid     => p_tdword_tvalid(1),
        p_tdword_tdata      => p_tdword_tdata(1),
        p_rdword_tvalid     => p_rdword_tvalid(1),
        p_rdword_tdata      => p_rdword_tdata(1),
        p_spi_ncs           => p_spi_ncs(1),
        p_spi_sclk          => p_spi_sclk(1),
        p_spi_mosi          => p_spi_mosi(1),
        p_spi_miso          => p_spi_miso(1)
    );


    --Capture -> leading edge / Shift -> trailing edge
    DUT_MODE2 : SPI_T_DRIVER
    generic map(
        g_clk_factor        => 8,
        g_word_length       => 8,
        g_cpol              => '1',
        g_cpha              => '0',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_stream_enb        => '0',
        p_tdword_tready     => p_tdword_tready(2),
        p_tdword_tvalid     => p_tdword_tvalid(2),
        p_tdword_tdata      => p_tdword_tdata(2),
        p_rdword_tvalid     => p_rdword_tvalid(2),
        p_rdword_tdata      => p_rdword_tdata(2),
        p_spi_ncs           => p_spi_ncs(2),
        p_spi_sclk          => p_spi_sclk(2),
        p_spi_mosi          => p_spi_mosi(2),
        p_spi_miso          => p_spi_miso(2)
    );


    --Capture -> trailing edge / Shift -> leading edge
    DUT_MODE3 : SPI_T_DRIVER
    generic map(
        g_clk_factor        => 8,
        g_word_length       => 8,
        g_cpol              => '1',
        g_cpha              => '1',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        p_stream_enb        => '0',
        p_tdword_tready     => p_tdword_tready(3),
        p_tdword_tvalid     => p_tdword_tvalid(3),
        p_tdword_tdata      => p_tdword_tdata(3),
        p_rdword_tvalid     => p_rdword_tvalid(3),
        p_rdword_tdata      => p_rdword_tdata(3),
        p_spi_ncs           => p_spi_ncs(3),
        p_spi_sclk          => p_spi_sclk(3),
        p_spi_mosi          => p_spi_mosi(3),
        p_spi_miso          => p_spi_miso(3)
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after  10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****SECONDARY PROCESSES****
    -----------------------------------------------------------------------------------------------
    DATA_SHIFTING : process(clock)
    begin
        if(rising_edge(clock)) then
            if(p_rdword_tvalid(0) = '1') then
                miso_buffer(0) <= p_rdword_tdata(0);
            end if;

            if(p_rdword_tvalid(1) = '1') then
                miso_buffer(1) <= p_rdword_tdata(1);
            end if;

            if(p_rdword_tvalid(2) = '1') then
                miso_buffer(2) <= p_rdword_tdata(2);
            end if;

            if(p_rdword_tvalid(3) = '1') then
                miso_buffer(3) <= p_rdword_tdata(3);
            end if;
        end if;
    end process;
    

    SPI_SLAVE_0 : process(clock)
        variable sclk_buff  :   std_logic := '0';
        variable counter    :   unsigned(2 downto 0) := (others => '0');
    begin
        if(rising_edge(clock)) then
            if(p_spi_ncs(0) = '0' and sclk_buff = '0' and p_spi_sclk(0) = '1') then
                mosi_buffer(0)(7-to_integer(counter)) <= p_spi_mosi(0);
                counter := counter + 1;
            end if;

            sclk_buff := p_spi_sclk(0);
            p_spi_miso(0) <= miso_data(7-to_integer(counter));
        end if;
    end process;


    SPI_SLAVE_1 : process(clock)
        variable sclk_buff  :   std_logic := '0';
        variable counter    :   unsigned(2 downto 0) := (others => '0');
    begin
        if(rising_edge(clock)) then
            if(p_spi_ncs(1) = '0' and sclk_buff = '1' and p_spi_sclk(1) = '0') then
                mosi_buffer(1)(7-to_integer(counter)) <= p_spi_mosi(1);
                counter := counter + 1;
            end if;

            sclk_buff := p_spi_sclk(1);
            p_spi_miso(1) <= miso_data(7-to_integer(counter));
        end if;
    end process;


    SPI_SLAVE_2 : process(clock)
        variable sclk_buff  :   std_logic := '0';
        variable counter    :   unsigned(2 downto 0) := (others => '0');
    begin
        if(rising_edge(clock)) then
            if(p_spi_ncs(2) = '0' and sclk_buff = '1' and p_spi_sclk(2) = '0') then
                mosi_buffer(2)(7-to_integer(counter)) <= p_spi_mosi(2);
                counter := counter + 1;
            end if;

            sclk_buff := p_spi_sclk(2);
            p_spi_miso(2) <= miso_data(7-to_integer(counter));
        end if;
    end process;


    SPI_SLAVE_3 : process(clock)
        variable sclk_buff  :   std_logic := '0';
        variable counter    :   unsigned(2 downto 0) := (others => '0');
    begin
        if(rising_edge(clock)) then
            if(p_spi_ncs(3) = '0' and sclk_buff = '0' and p_spi_sclk(3) = '1') then
                mosi_buffer(3)(7-to_integer(counter)) <= p_spi_mosi(3);
                counter := counter + 1;
            end if;

            sclk_buff := p_spi_sclk(3);
            p_spi_miso(3) <= miso_data(7-to_integer(counter));
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 7*clk_period/2;
        variable assert_hold    :   time := 1*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test idle state**
        wait for assert_hold;
        --DUT_MODE0 tests
        assert(p_tdword_tready(0) = '1' and p_rdword_tvalid(0) = '0' and p_rdword_tdata(0) = x"00")
            report "ID01: Test reset MODE0 - expecting parallel interface grounded"
            severity error;
        assert(p_spi_ncs(0) = '1' and p_spi_sclk(0) = '0' and p_spi_mosi(0) = '0')
            report "ID02: Test reset MODE0 - expecting spi interface grounded"
            severity error;
        --DUT_MODE1 tests
        assert(p_tdword_tready(1) = '1' and p_rdword_tvalid(1) = '0' and p_rdword_tdata(1) = x"00")
            report "ID02: Test reset MODE1 - expecting parallel interface grounded"
            severity error;
        assert(p_spi_ncs(1) = '1' and p_spi_sclk(1) = '0' and p_spi_mosi(1) = '0')
            report "ID03: Test reset MODE1 - expecting spi interface grounded"
            severity error;
        --DUT_MODE2 tests
        assert(p_tdword_tready(2) = '1' and p_rdword_tvalid(2) = '0' and p_rdword_tdata(2) = x"00")
            report "ID04: Test reset MODE2 - expecting parallel interface grounded"
            severity error;
        assert(p_spi_ncs(2) = '1' and p_spi_sclk(2) = '1' and p_spi_mosi(2) = '0')
            report "ID05: Test reset MODE2 - expecting spi interface grounded"
            severity error;
        --DUT_MODE3 tests
        assert(p_tdword_tready(3) = '1' and p_rdword_tvalid(3) = '0' and p_rdword_tdata(3) = x"00")
            report "ID06: Test reset MODE3 - expecting parallel interface grounded"
            severity error;
        assert(p_spi_ncs(3) = '1' and p_spi_sclk(3) = '1' and p_spi_mosi(3) = '0')
            report "ID07: Test reset MODE3 - expecting spi interface grounded"
            severity error;
        wait for post_hold;



        --**Test transaction**
        --*Test DUT_MODE0*
        p_tdword_tdata(0)  <= mosi_data;
        p_tdword_tvalid(0) <= '1';
        wait for clk_period;
        p_tdword_tvalid(0) <= '0';
        
        wait for assert_hold;
        assert(p_tdword_tready(0) = '0')
            report "ID08: Test DUT_MODE0 - expecting tready = '0'"
            severity error;
        wait for 10*sclk_period;
        assert(p_tdword_tready(0) = '1')
            report "ID09: Test DUT_MODE0 - expecting tready = '1'"
            severity error;
        assert(mosi_buffer(0) = mosi_data)
            report "ID10: Test DUT_MODE0 - expecting mosi_buffer = mosi_data"
            severity error;
        assert(miso_buffer(0) = miso_data)
            report "ID11: Test DUT_MODE0 - expecting miso_buffer = miso_data"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --*Test DUT_MODE1*
        p_tdword_tdata(1)  <= mosi_data;
        p_tdword_tvalid(1) <= '1';
        wait for clk_period;
        p_tdword_tvalid(1) <= '0';
        
        wait for assert_hold;
        assert(p_tdword_tready(1) = '0')
            report "ID12: Test DUT_MODE1 - expecting tready = '0'"
            severity error;
        wait for 10*sclk_period;
        assert(p_tdword_tready(1) = '1')
            report "ID13: Test DUT_MODE1 - expecting tready = '1'"
            severity error;
        assert(mosi_buffer(1) = mosi_data)
            report "ID14: Test DUT_MODE1 - expecting mosi_buffer = mosi_data"
            severity error;
        assert(miso_buffer(1) = miso_data)
            report "ID15: Test DUT_MODE1 - expecting miso_buffer = miso_data"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --*Test DUT_MODE2*
        p_tdword_tdata(2)  <= mosi_data;
        p_tdword_tvalid(2) <= '1';
        wait for clk_period;
        p_tdword_tvalid(2) <= '0';
        
        wait for assert_hold;
        assert(p_tdword_tready(2) = '0')
            report "ID16: Test DUT_MODE2 - expecting tready = '0'"
            severity error;
        wait for 10*sclk_period;
        assert(p_tdword_tready(2) = '1')
            report "ID17: Test DUT_MODE2 - expecting tready = '1'"
            severity error;
        assert(mosi_buffer(2) = mosi_data)
            report "ID18: Test DUT_MODE2 - expecting mosi_buffer = mosi_data"
            severity error;
        assert(miso_buffer(2) = miso_data)
            report "ID19: Test DUT_MODE2 - expecting miso_buffer = miso_data"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --*Test DUT_MODE3*
        p_tdword_tdata(3)  <= mosi_data;
        p_tdword_tvalid(3) <= '1';
        wait for clk_period;
        p_tdword_tvalid(3) <= '0';
        
        wait for assert_hold;
        assert(p_tdword_tready(3) = '0')
            report "ID20: Test DUT_MODE3 - expecting tready = '0'"
            severity error;
        wait for 10*sclk_period;
        assert(p_tdword_tready(3) = '1')
            report "ID21: Test DUT_MODE3 - expecting tready = '1'"
            severity error;
        assert(mosi_buffer(3) = mosi_data)
            report "ID22: Test DUT_MODE3 - expecting mosi_buffer = mosi_data"
            severity error;
        assert(miso_buffer(3) = miso_data)
            report "ID23: Test DUT_MODE3 - expecting miso_buffer = miso_data"
            severity error;
        wait for post_hold;


		--**End simulation**
		wait for 50 ns;
        report "SPI_T_DRIVER_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       	std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;