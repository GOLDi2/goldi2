-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/07/2023
-- Design Name:		SPI General Transmiter Testbench 
-- Module Name:		SPI_T_INTERFACE_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> SPI_T_INTERFACE.vhd
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




--! Functionality simulation
entity SPI_T_INTERFACE_TB is
end entity SPI_T_INTERFACE_TB;




--! Simulation architecture
architecture TB of SPI_T_INTERFACE_TB is

    --****DUT****
    component SPI_T_INTERFACE is
    generic(
        g_clk_factor        :   integer := 4;
        g_word_length       :   integer := 8;
        g_cpol              :   std_logic := '1';
        g_cpha              :   std_logic := '0';
        g_msbf              :   boolean := true
    );
    port(
        --General
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        --Parallel interface
        o_tdword_tready     : out   std_logic;
        i_tdword_tvalid     : in    std_logic;
        i_tdword_tdata      : in    std_logic_vector(g_word_length-1 downto 0);
        o_rdword_tvalid     : out   std_logic;
        o_rdword_tdata      : out   std_logic_vector(g_word_length-1 downto 0);
        --SPI interface
        o_spi_ncs           : out   std_logic;
        o_spi_sclk          : out   std_logic;
        o_spi_mosi          : out   std_logic;
        i_spi_miso          : in    std_logic
    );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		    :	time := 10 ns;
    constant sclk_period        :   time := 80 ns;
	signal reset			    :	std_logic := '0';
	signal clock			    :	std_logic := '0';
	signal run_sim			    :	std_logic := '1';
    --DUT IOs
    --Byte array structure to simplify testbench
    type byte_vector is array (natural range <>) of std_logic_vector(7 downto 0);
    --Parallel interface signals
    signal o_tdword_tready      :   std_logic_vector(3 downto 0) := (others => '0');
    signal i_tdword_tvalid      :   std_logic_vector(3 downto 0) := (others => '0');
    signal i_tdword_tdata       :   byte_vector(3 downto 0)      := (others => (others => '0'));
    signal o_rdword_tvalid      :   std_logic_vector(3 downto 0) := (others => '0');
    signal o_rdword_tdata       :   byte_vector(3 downto 0)      := (others => (others => '0'));
    --SPI interface
    signal o_spi_ncs            :   std_logic_vector(3 downto 0) := (others => '0');
    signal o_spi_sclk           :   std_logic_vector(3 downto 0) := (others => '0');
    signal o_spi_mosi           :   std_logic_vector(3 downto 0) := (others => '0');
    signal i_spi_miso           :   std_logic_vector(3 downto 0) := (others => '0');
    --Testbench
    constant mosi_data          :   std_logic_vector(7 downto 0) := x"BF";
    constant miso_data          :   std_logic_vector(7 downto 0) := x"C3";
    signal mosi_buffer          :   byte_vector(3 downto 0)      := (others => (others => '0'));
    signal miso_buffer          :   byte_vector(3 downto 0)      := (others => (others => '0'));


begin

    --****COMPONENTS****
    -----------------------------------------------------------------------------------------------
    --Capture -> rising edge / Shift -> falling edge
    DUT_MODE0 : SPI_T_INTERFACE
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
        o_tdword_tready     => o_tdword_tready(0),
        i_tdword_tvalid     => i_tdword_tvalid(0),
        i_tdword_tdata      => i_tdword_tdata(0),
        o_rdword_tvalid     => o_rdword_tvalid(0),
        o_rdword_tdata      => o_rdword_tdata(0),
        o_spi_ncs           => o_spi_ncs(0),
        o_spi_sclk          => o_spi_sclk(0),
        o_spi_mosi          => o_spi_mosi(0),
        i_spi_miso          => i_spi_miso(0)
    );


    --Captrure -> falling edge / Shift -> rising edge
    DUT_MODE1 : SPI_T_INTERFACE
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
        o_tdword_tready     => o_tdword_tready(1),
        i_tdword_tvalid     => i_tdword_tvalid(1),
        i_tdword_tdata      => i_tdword_tdata(1),
        o_rdword_tvalid     => o_rdword_tvalid(1),
        o_rdword_tdata      => o_rdword_tdata(1),
        o_spi_ncs           => o_spi_ncs(1),
        o_spi_sclk          => o_spi_sclk(1),
        o_spi_mosi          => o_spi_mosi(1),
        i_spi_miso          => i_spi_miso(1)
    );


    --Capture -> falling edge / Shift -> rising edge
    DUT_MODE2 : SPI_T_INTERFACE
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
        o_tdword_tready     => o_tdword_tready(2),
        i_tdword_tvalid     => i_tdword_tvalid(2),
        i_tdword_tdata      => i_tdword_tdata(2),
        o_rdword_tvalid     => o_rdword_tvalid(2),
        o_rdword_tdata      => o_rdword_tdata(2),
        o_spi_ncs           => o_spi_ncs(2),
        o_spi_sclk          => o_spi_sclk(2),
        o_spi_mosi          => o_spi_mosi(2),
        i_spi_miso          => i_spi_miso(2)
    );


    --Capture -> rising edge / Shift -> falling edge
    DUT_MODE3 : SPI_T_INTERFACE
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
        o_tdword_tready     => o_tdword_tready(3),
        i_tdword_tvalid     => i_tdword_tvalid(3),
        i_tdword_tdata      => i_tdword_tdata(3),
        o_rdword_tvalid     => o_rdword_tvalid(3),
        o_rdword_tdata      => o_rdword_tdata(3),
        o_spi_ncs           => o_spi_ncs(3),
        o_spi_sclk          => o_spi_sclk(3),
        o_spi_mosi          => o_spi_mosi(3),
        i_spi_miso          => i_spi_miso(3)
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after  5 ns, '0' after 15 ns;
    -----------------------------------------------------------------------------------------------




    --****SECONDARY PROCESSES****
    -----------------------------------------------------------------------------------------------
    DATA_SHIFTING : process(clock)
    begin
        if(rising_edge(clock)) then
            if(o_rdword_tvalid(0) = '1') then
                miso_buffer(0) <= o_rdword_tdata(0);
            end if;

            if(o_rdword_tvalid(1) = '1') then
                miso_buffer(1) <= o_rdword_tdata(1);
            end if;

            if(o_rdword_tvalid(2) = '1') then
                miso_buffer(2) <= o_rdword_tdata(2);
            end if;

            if(o_rdword_tvalid(3) = '1') then
                miso_buffer(3) <= o_rdword_tdata(3);
            end if;
        end if;
    end process;
    

    SPI_SLAVE_0 : process(clock)
        variable sclk_buff  :   std_logic := '0';
        variable counter    :   unsigned(2 downto 0) := (others => '0');
    begin
        if(rising_edge(clock)) then
            if(o_spi_ncs(0) = '0' and sclk_buff = '0' and o_spi_sclk(0) = '1') then
                mosi_buffer(0)(7-to_integer(counter)) <= o_spi_mosi(0);
                counter := counter + 1;
            end if;

            sclk_buff := o_spi_sclk(0);
            i_spi_miso(0) <= miso_data(7-to_integer(counter));
        end if;
    end process;


    SPI_SLAVE_1 : process(clock)
        variable sclk_buff  :   std_logic := '0';
        variable counter    :   unsigned(2 downto 0) := (others => '0');
    begin
        if(rising_edge(clock)) then
            if(o_spi_ncs(1) = '0' and sclk_buff = '1' and o_spi_sclk(1) = '0') then
                mosi_buffer(1)(7-to_integer(counter)) <= o_spi_mosi(1);
                counter := counter + 1;
            end if;

            sclk_buff := o_spi_sclk(1);
            i_spi_miso(1) <= miso_data(7-to_integer(counter));
        end if;
    end process;


    SPI_SLAVE_2 : process(clock)
        variable sclk_buff  :   std_logic := '0';
        variable counter    :   unsigned(2 downto 0) := (others => '0');
    begin
        if(rising_edge(clock)) then
            if(o_spi_ncs(2) = '0' and sclk_buff = '1' and o_spi_sclk(2) = '0') then
                mosi_buffer(2)(7-to_integer(counter)) <= o_spi_mosi(2);
                counter := counter + 1;
            end if;

            sclk_buff := o_spi_sclk(2);
            i_spi_miso(2) <= miso_data(7-to_integer(counter));
        end if;
    end process;


    SPI_SLAVE_3 : process(clock)
        variable sclk_buff  :   std_logic := '0';
        variable counter    :   unsigned(2 downto 0) := (others => '0');
    begin
        if(rising_edge(clock)) then
            if(o_spi_ncs(3) = '0' and sclk_buff = '0' and o_spi_sclk(3) = '1') then
                mosi_buffer(3)(7-to_integer(counter)) <= o_spi_mosi(3);
                counter := counter + 1;
            end if;

            sclk_buff := o_spi_sclk(3);
            i_spi_miso(3) <= miso_data(7-to_integer(counter));
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Initial setup
        wait for init_hold;


        --**Test idle state**
        wait for assert_hold;
        --DUT_MODE0 tests
        assert(o_tdword_tready(0) = '1' and o_rdword_tvalid(0) = '0' and o_rdword_tdata(0) = x"00")
            report "ID01: Test reset MODE0 - expecting parallel interface grounded"
            severity error;
        assert(o_spi_ncs(0) = '1' and o_spi_sclk(0) = '0' and o_spi_mosi(0) = '0')
            report "ID02: Test reset MODE0 - expecting spi interface grounded"
            severity error;
        --DUT_MODE1 tests
        assert(o_tdword_tready(1) = '1' and o_rdword_tvalid(1) = '0' and o_rdword_tdata(1) = x"00")
            report "ID02: Test reset MODE1 - expecting parallel interface grounded"
            severity error;
        assert(o_spi_ncs(1) = '1' and o_spi_sclk(1) = '0' and o_spi_mosi(1) = '0')
            report "ID03: Test reset MODE1 - expecting spi interface grounded"
            severity error;
        --DUT_MODE2 tests
        assert(o_tdword_tready(2) = '1' and o_rdword_tvalid(2) = '0' and o_rdword_tdata(2) = x"00")
            report "ID04: Test reset MODE2 - expecting parallel interface grounded"
            severity error;
        assert(o_spi_ncs(2) = '1' and o_spi_sclk(2) = '1' and o_spi_mosi(2) = '0')
            report "ID05: Test reset MODE2 - expecting spi interface grounded"
            severity error;
        --DUT_MODE3 tests
        assert(o_tdword_tready(3) = '1' and o_rdword_tvalid(3) = '0' and o_rdword_tdata(3) = x"00")
            report "ID06: Test reset MODE3 - expecting parallel interface grounded"
            severity error;
        assert(o_spi_ncs(3) = '1' and o_spi_sclk(3) = '1' and o_spi_mosi(3) = '0')
            report "ID07: Test reset MODE3 - expecting spi interface grounded"
            severity error;
        wait for post_hold;



        --**Test transaction**
        --*Test DUT_MODE0*
        i_tdword_tdata(0)  <= mosi_data;
        i_tdword_tvalid(0) <= '1';
        wait for clk_period;
        i_tdword_tvalid(0) <= '0';
        
        wait for assert_hold;
        assert(o_tdword_tready(0) = '0')
            report "ID08: Test DUT_MODE0 - expecting tready = '0'"
            severity error;
        wait for 10*sclk_period;
        assert(o_tdword_tready(0) = '1')
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
        i_tdword_tdata(1)  <= mosi_data;
        i_tdword_tvalid(1) <= '1';
        wait for clk_period;
        i_tdword_tvalid(1) <= '0';
        
        wait for assert_hold;
        assert(o_tdword_tready(1) = '0')
            report "ID12: Test DUT_MODE1 - expecting tready = '0'"
            severity error;
        wait for 10*sclk_period;
        assert(o_tdword_tready(1) = '1')
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
        i_tdword_tdata(2)  <= mosi_data;
        i_tdword_tvalid(2) <= '1';
        wait for clk_period;
        i_tdword_tvalid(2) <= '0';
        
        wait for assert_hold;
        assert(o_tdword_tready(2) = '0')
            report "ID16: Test DUT_MODE2 - expecting tready = '0'"
            severity error;
        wait for 10*sclk_period;
        assert(o_tdword_tready(2) = '1')
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
        i_tdword_tdata(3)  <= mosi_data;
        i_tdword_tvalid(3) <= '1';
        wait for clk_period;
        i_tdword_tvalid(3) <= '0';
        
        wait for assert_hold;
        assert(o_tdword_tready(3) = '0')
            report "ID20: Test DUT_MODE3 - expecting tready = '0'"
            severity error;
        wait for 10*sclk_period;
        assert(o_tdword_tready(3) = '1')
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
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;