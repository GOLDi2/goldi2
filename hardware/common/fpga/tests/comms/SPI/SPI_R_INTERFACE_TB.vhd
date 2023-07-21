-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/07/2023
-- Design Name:		SPI General Reciver Testbench 
-- Module Name:		SPI_R_INTERFACE_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> SPI_R_INTERFACE.vhd
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
entity SPI_R_INTERFACE_TB is
end entity SPI_R_INTERFACE_TB;




--! Simulation architecture
architecture TB of SPI_R_INTERFACE_TB is

    --****DUT****
    component SPI_R_INTERFACE
    generic(
        g_word_length       :   integer   := 8;
        g_cpol              :   std_logic := '1';
        g_cpha              :   std_logic := '0';
        g_msbf              :   boolean   := true
    );
    port(
        --General
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        --Parallel interface
        i_dword_tvalid      : in    std_logic;
        i_dword_tdata       : in    std_logic_vector(g_word_length-1 downto 0);
        o_dword_tvalid      : out   std_logic;
        o_dword_tdata       : out   std_logic_vector(g_word_length-1 downto 0);
        --SPI interface
        i_spi_ncs           : in    std_logic;
        i_spi_sclk          : in    std_logic;
        i_spi_mosi          : in    std_logic;
        o_spi_miso          : out   std_logic;
        o_spi_miso_highz    : out   std_logic
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
    --parallel interface signals
    signal i_dword_tvalid       :   std_logic := '0';
    signal i_dword_tdata        :   std_logic_vector(7 downto 0) := (others => '0');
    signal o_dword_tvalid       :   std_logic_vector(3 downto 0) := (others => '0');
    signal o_dword_tdata        :   byte_vector(3 downto 0)      := (others => (others => '0'));
    --spi interface signals
    signal i_spi_ncs            :   std_logic := '1';
    signal i_spi_sclk           :   std_logic := '0';
    signal i_spi_mosi           :   std_logic := '0';
    signal o_spi_miso           :   std_logic_vector(3 downto 0) := (others => '0');
    signal o_spi_miso_highz     :   std_logic_vector(3 downto 0) := (others => '1');
    --Testbench
    constant mosi_data          :   std_logic_vector(7 downto 0) := x"BF";
    constant miso_data          :   std_logic_vector(7 downto 0) := x"AB";
    signal mosi_buff            :   byte_vector(3 downto 0)      := (others => (others => '0'));
    signal miso_buff            :   byte_vector(3 downto 0)      := (others => (others => '0'));



begin

    --****COMPONENTS****
    -----------------------------------------------------------------------------------------------
    --Capture -> rising edge / Shift -> falling edge
    DUT_MODE0 : SPI_R_INTERFACE
    generic map(
        g_word_length       =>  8,
        g_cpol              => '0',
        g_cpha              => '0',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        i_dword_tvalid      => i_dword_tvalid,
        i_dword_tdata       => i_dword_tdata,
        o_dword_tvalid      => o_dword_tvalid(0),
        o_dword_tdata       => o_dword_tdata(0),
        i_spi_ncs           => i_spi_ncs,
        i_spi_sclk          => i_spi_sclk,
        i_spi_mosi          => i_spi_mosi,
        o_spi_miso          => o_spi_miso(0),
        o_spi_miso_highz    => o_spi_miso_highz(0)
    );


    --Capture -> falling edge / Shift -> rising edge
    DUT_MODE1 : SPI_R_INTERFACE
    generic map(
        g_word_length       =>  8,
        g_cpol              => '0',
        g_cpha              => '1',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        i_dword_tvalid      => i_dword_tvalid,
        i_dword_tdata       => i_dword_tdata,
        o_dword_tvalid      => o_dword_tvalid(1),
        o_dword_tdata       => o_dword_tdata(1),
        i_spi_ncs           => i_spi_ncs,
        i_spi_sclk          => i_spi_sclk,
        i_spi_mosi          => i_spi_mosi,
        o_spi_miso          => o_spi_miso(1),
        o_spi_miso_highz    => o_spi_miso_highz(1)
    );


    --Capture -> falling edge / Shift -> rising edge
    DUT_MODE2 : SPI_R_INTERFACE
    generic map(
        g_word_length       =>  8,
        g_cpol              => '1',
        g_cpha              => '0',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        i_dword_tvalid      => i_dword_tvalid,
        i_dword_tdata       => i_dword_tdata,
        o_dword_tvalid      => o_dword_tvalid(2),
        o_dword_tdata       => o_dword_tdata(2),
        i_spi_ncs           => i_spi_ncs,
        i_spi_sclk          => i_spi_sclk,
        i_spi_mosi          => i_spi_mosi,
        o_spi_miso          => o_spi_miso(2),
        o_spi_miso_highz    => o_spi_miso_highz(2)
    );


    --Capture -> rising edge / Shift -> falling edge
    DUT_MODE3 : SPI_R_INTERFACE
    generic map(
        g_word_length       =>  8,
        g_cpol              => '1',
        g_cpha              => '1',
        g_msbf              => true
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        i_dword_tvalid      => i_dword_tvalid,
        i_dword_tdata       => i_dword_tdata,
        o_dword_tvalid      => o_dword_tvalid(3),
        o_dword_tdata       => o_dword_tdata(3),
        i_spi_ncs           => i_spi_ncs,
        i_spi_sclk          => i_spi_sclk,
        i_spi_mosi          => i_spi_mosi,
        o_spi_miso          => o_spi_miso(3),
        o_spi_miso_highz    => o_spi_miso_highz(3)
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after  5 ns, '0' after 15 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------    
    DATA_SHIFTING : process(clock)
    begin
        if(rising_edge(clock)) then
            if(o_dword_tvalid(0) = '1') then
                mosi_buff(0) <= o_dword_tdata(0);
            end if;

            if(o_dword_tvalid(1) = '1') then
                mosi_buff(1) <= o_dword_tdata(1);
            end if;

            if(o_dword_tvalid(2) = '1') then
                mosi_buff(2) <= o_dword_tdata(2);
            end if;

            if(o_dword_tvalid(3) = '1') then
                mosi_buff(3) <= o_dword_tdata(3);
            end if;
        end if;
    end process;
    


    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Initial setup
        wait for init_hold;


        --**Test idle state**
        wait for assert_hold;
        assert(o_dword_tvalid(0) = '0' and o_dword_tdata(0) = (o_dword_tdata(0)'range => '0'))
            report "ID01: Test reset - expecting DUT_MODE0 o_dword interface grounded"
            severity error;
        assert(o_spi_miso(0) = '0' and o_spi_miso_highz(0) = '1')
            report "ID02: Test reset - expecting DUT_MODE0 spi_miso interface ('0';'1')"
            severity error;
        assert(o_dword_tvalid(1) = '0' and o_dword_tdata(1) = (o_dword_tdata(1)'range => '0'))
            report "ID03: Test reset - expecting DUT_MODE1 o_dword interface grounded"
            severity error;
        assert(o_spi_miso(1) = '0' and o_spi_miso_highz(1) = '1')
            report "ID04: Test reset - expecting DUT_MODE1 spi_miso interface ('0';'1')"
            severity error;
        assert(o_dword_tvalid(2) = '0' and o_dword_tdata(2) = (o_dword_tdata(2)'range => '0'))
            report "ID05: Test reset - expecting DUT_MODE2 o_dword interface grounded"
            severity error;
        assert(o_spi_miso(2) = '0' and o_spi_miso_highz(2) = '1')
            report "ID06: Test reset - expecting DUT_MODE2 spi_miso interface ('0';'1')"
            severity error;
        assert(o_dword_tvalid(3) = '0' and o_dword_tdata(3) = (o_dword_tdata(3)'range => '0'))
            report "ID07: Test reset - expecting DUT_MODE3 o_dword interface grounded"
            severity error;
        assert(o_spi_miso(3) = '0' and o_spi_miso_highz(3) = '1')
            report "ID08: Test reset - expecting DUT_MODE3 spi_miso interface ('0';'1')"
            severity error;
        wait for post_hold;



        --**Test transaction**
        --*Test DUT_MODE0*
        i_dword_tdata  <= miso_data;
        i_dword_tvalid <= '1';
        i_spi_sclk     <= '0';
        wait for clk_period;
        i_dword_tvalid <= '0';
        i_spi_ncs      <= '0';

        for i in 0 to 7 loop
            i_spi_mosi        <= mosi_data(7-i);
            wait for sclk_period/2;
            i_spi_sclk        <= '1';
            miso_buff(0)(7-i) <= o_spi_miso(0); 
            wait for sclk_period/2;
            i_spi_sclk        <= '0';
        end loop;
        wait for sclk_period/2;
        i_spi_ncs <= '1';

        wait for assert_hold;
        assert(mosi_buff(0) = mosi_data)
            report "ID09: Test DUT_MODE0 - expecting mosi_buff = mosi_data" severity error;
        assert(miso_buff(0) = miso_data)
            report "ID10: Test DUT_MODE0 - expecting miso_buff = miso_data" severity error;
        wait for post_hold;



        wait for 5*clk_period;



        --*Test DUT_MODE1*
        i_dword_tdata  <= miso_data;
        i_dword_tvalid <= '1';
        i_spi_sclk     <= '0';
        wait for clk_period;
        i_dword_tvalid <= '0';
        i_spi_ncs      <= '0';

        for i in 0 to 7 loop
            wait for sclk_period/2;
            i_spi_sclk        <= '1';
            i_spi_mosi        <= mosi_data(7-i);
            wait for sclk_period/2;
            i_spi_sclk        <= '0';
            miso_buff(1)(7-i) <= o_spi_miso(1);
        end loop;
        wait for sclk_period/2;
        i_spi_ncs <= '1';

        wait for assert_hold;
        assert(mosi_buff(1) = mosi_data)
            report "ID11: Test DUT_MODE1 - expecting mosi_buff = mosi_data" severity error;
        assert(miso_buff(1) = miso_data)
            report "ID12: Test DUT_MODE1 - expecting miso_buff = miso_data" severity error;
        wait for post_hold;



        wait for 5*clk_period;



        --*Test DUT_MODE2*
        i_dword_tdata  <= miso_data;
        i_dword_tvalid <= '1';
        i_spi_sclk     <= '1';
        wait for clk_period;
        i_dword_tvalid <= '0';
        i_spi_ncs      <= '0';

        for i in 0 to 7 loop
            i_spi_mosi        <= mosi_data(7-i);
            wait for sclk_period/2;
            i_spi_sclk        <= '0';
            miso_buff(2)(7-i) <= o_spi_miso(2);
            wait for sclk_period/2;
            i_spi_sclk        <= '1';
            
        end loop;
        wait for sclk_period/2;
        i_spi_ncs <= '1'; 

        wait for assert_hold;
        assert(mosi_buff(2) = mosi_data)
            report "ID13: Test DUT_MODE2 - expecting mosi_buff = mosi_data" severity error;
        assert(miso_buff(2) = miso_data)
            report "ID14: Test DUT_MODE2 - expecting miso_buff = miso_data" severity error;
        wait for post_hold;



        wait for 5*clk_period;



        --*Test DUT_MODE3*
        i_dword_tdata  <= miso_data;
        i_dword_tvalid <= '1';
        i_spi_sclk     <= '1';
        wait for clk_period;
        i_dword_tvalid <= '0';
        i_spi_ncs      <= '0';

        for i in 0 to 7 loop
            wait for sclk_period/2;
            i_spi_sclk        <= '0';
            i_spi_mosi        <= mosi_data(7-i);
            wait for sclk_period/2;
            i_spi_sclk        <= '1';
            miso_buff(3)(7-i) <= o_spi_miso(3); 
        end loop;
        wait for sclk_period/2;
        i_spi_ncs <= '1';

        wait for assert_hold;
        assert(mosi_buff(3) = mosi_data)
            report "ID15: Test DUT_MODE3 - expecting mosi_buff = mosi_data" severity error;
        assert(miso_buff(3) = miso_data)
            report "ID16: Test DUT_MODE3 - epxecting miso_buff = miso_data" severity error;
        wait for post_hold;



        --**End simulation**
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;




    -----------------------------------------------------------------------------------------------


end architecture;
