-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		I2C Controller module
-- Module Name:		I2C_R_CONTROLLER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
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
entity I2C_C_DRIVER_TB is
end entity I2C_C_DRIVER_TB;




--! Simulation architecture
architecture TB of I2C_C_DRIVER_TB is

    --****DUT****
    component I2C_C_DRIVER
        generic(
            g_scl_factor    :   natural
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            p_tdword_tready : out   std_logic;
            p_tdword_tvalid : in    std_logic;
            p_tdword_start  : in    std_logic;
            p_tdword_stop   : in    std_logic;
            p_tdword_tdata  : in    std_logic_vector(7 downto 0);
            p_tdword_error  : out   std_logic;
            p_rdword_tready : in    std_logic;
            p_rdword_tvalid : out   std_logic;
            p_rdword_tdata  : out   std_logic_vector(7 downto 0);
            p_i2c_scl       : out   std_logic;
            p_i2c_sda_i     : in    std_logic;
            p_i2c_sda_o     : out   std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 20 ns;
	signal run_sim			:	std_logic := '1';
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
    --DUT IOs
    signal p_tdword_tready  :   std_logic := '0';
    signal p_tdword_tvalid  :   std_logic := '0';
    signal p_tdword_start   :   std_logic := '0';
    signal p_tdword_stop    :   std_logic := '0';
    signal p_tdword_error   :   std_logic := '0';
    signal p_rdword_tready  :   std_logic := '0';
    signal p_tdword_tdata   :   std_logic_vector(7 downto 0) := (others => '0');
    signal p_rdword_tvalid  :   std_logic := '0';
    signal p_rdword_tdata   :   std_logic_vector(7 downto 0) := (others => '0');
    signal p_i2c_scl        :   std_logic := '0';
    signal p_i2c_sda_i      :   std_logic := '0';
    signal p_i2c_sda_o      :   std_logic := '0';
    --Testbench
    constant c_address_t    :   std_logic_vector(8 downto 0) := "110000101";
    constant c_address_r    :   std_logic_vector(8 downto 0) := "110000111";
    constant c_recive       :   std_logic_vector(8 downto 0) := "010101011";
    constant c_transfer_1   :   std_logic_vector(8 downto 0) := "101010101";
    constant c_transfer_2   :   std_logic_vector(8 downto 0) := "110011001";    
  

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : I2C_C_DRIVER
    generic map(
        g_scl_factor    => 500
    )
    port map(
        clk             => clock,
        rst             => reset,
        p_tdword_tready => p_tdword_tready,
        p_tdword_tvalid => p_tdword_tvalid,
        p_tdword_start  => p_tdword_start,
        p_tdword_stop   => p_tdword_stop,
        p_tdword_tdata  => p_tdword_tdata,
        p_tdword_error  => p_tdword_error,
        p_rdword_tready => p_rdword_tready,
        p_rdword_tvalid => p_rdword_tvalid,
        p_rdword_tdata  => p_rdword_tdata,
        p_i2c_scl       => p_i2c_scl,
        p_i2c_sda_i     => p_i2c_sda_i,
        p_i2c_sda_o     => p_i2c_sda_o
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
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;
        

        --**Test reset state**
        wait for assert_hold;
        assert(p_tdword_tready = '1')
            report "ID01: Test reset - expecting p_tdword_tready = '1'"
            severity error;
        assert(p_tdword_error = '0')
            report "ID02: Test reset - expecting p_tdword_error = '0'"
            severity error;
        assert(p_rdword_tvalid = '0')
            report "ID03: Test reset - expecting p_rdword_tvalid = '0'"
            severity error;
        assert(p_rdword_tdata = (p_rdword_tdata'range => '0'))
            report "ID04: Test reset - expecting p_rdword_tdata = x00"
            severity error;
        assert(p_i2c_scl = '1')
            report "ID05: Test reset - expecting p_i2c_scl = '1'"
            severity error;
        assert(p_i2c_sda_o = '1')
            report "ID06: Test reset - expecting p_i2c_sda_o = '1'"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test address/read transfer**
        p_i2c_sda_i <= '0';
        p_tdword_tdata  <= c_address_r(8 downto 1);
        p_tdword_start  <= '1';
        p_tdword_tvalid <= '1';
        wait for clk_period;
        p_tdword_start  <= '0';
        p_tdword_tvalid <= '0';

        wait for 500*clk_period;
        for i in 0 to 8 loop
            wait for 250*clk_period;
            assert(p_i2c_sda_o = c_address_r(8-i))
            report "ID07: Test address/recive transfer - expecting p_i2c_sda_o = c_address_r(" & integer'image(i) & ")"
            severity error;
            wait for 250*clk_period;
        end loop;
        wait for 500*clk_period;

        wait for assert_hold;
        assert(p_tdword_tready = '1')
            report "ID08: Test address/recive transfer - expecting p_tdword_tready = '1'"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test data reception**
        p_tdword_tvalid <= '1';
        wait for clk_period;
        p_tdword_tvalid <= '0';
        wait for 2*clk_period;

        for i in 0 to 8 loop
            p_i2c_sda_i <= c_recive(8-i);
            wait for 500*clk_period;
        end loop;

        wait for assert_hold;
        assert(p_rdword_tvalid = '1')
            report "ID09: Test data reception - expecting p_rdword_tvalid = '1'"
            severity error;
        assert(p_rdword_tdata = c_recive(8 downto 1))
            report "ID10: Test data reception - expecting p_rdword_tdata = c_recive"
            severity error;
        wait for post_hold;

        p_rdword_tready <= '1';
        wait for clk_period;
        p_rdword_tready <= '0';

        wait for assert_hold;
        assert(p_rdword_tvalid = '0')
            report "ID11: Test data reception - expecting p_rdword_tvalid = '0'"
            severity error;    
        wait for post_hold;


        wait for 5*clk_period;
        
        
        --**Test address/write transfer**
        p_i2c_sda_i <= '0';
        p_tdword_tdata  <= c_address_t(8 downto 1);
        p_tdword_start  <= '1';
        p_tdword_tvalid <= '1';
        wait for clk_period;
        p_tdword_start  <= '0';
        p_tdword_tvalid <= '0';

        wait for 1000*clk_period;
        for i in 0 to 8 loop
            wait for 250*clk_period;
            assert(p_i2c_sda_o = c_address_t(8-i))
            report "ID12: Test address/write transfer - expecting p_i2c_sda_o = c_address_t(" & integer'image(i) & ")"
            severity error;
            wait for 250*clk_period;
        end loop;
        wait for 500*clk_period;

        wait for assert_hold;
        assert(p_tdword_tready = '1')
            report "ID13: Test address/transfer transfer - expecting p_tdword_tready = '1'"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test data transmission**
        p_i2c_sda_i <= '0';
        p_tdword_tdata  <= c_transfer_1(8 downto 1);
        p_tdword_tvalid <= '1';
        wait for clk_period;
        p_tdword_tvalid <= '0';

        for i in 0 to 8 loop
            wait for 250*clk_period;
            assert(p_i2c_sda_o = c_transfer_1(8-i))
            report "ID14: Test data transfer - expecting p_i2c_sda_o = c_transfer_1(" & integer'image(i) & ")"
            severity error;
            wait for 250*clk_period;
        end loop;

        wait for assert_hold;
        assert(p_tdword_tready = '1')
            report "ID15: Test data transfer - expecting p_tdword_tready = '1'"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test data transfer/stop process**
        p_i2c_sda_i <= '0';
        p_tdword_stop   <= '1';
        p_tdword_tdata  <= c_transfer_2(8 downto 1);
        p_tdword_tvalid <= '1';
        wait for clk_period;
        p_tdword_stop   <= '0';
        p_tdword_tvalid <= '0';

        for i in 0 to 8 loop
            wait for 250*clk_period;
            assert(p_i2c_sda_o = c_transfer_2(8-i))
            report "ID16: Test data transfer and stop- expecting p_i2c_sda_o = c_transfer_2(" & integer'image(i) & ")"
            severity error;
            wait for 250*clk_period;
        end loop;
        
        wait for 250*clk_period;
        wait for assert_hold;
        assert(p_tdword_tready = '0')
            report "ID17: Test data transfer and stop - expecting p_tdword_tready = '0'"
            severity error;
        assert(p_i2c_sda_o = '0')
            report "ID18: Test data transfer and stop - expecting p_i2c_sda_o = '0'"
            severity error;
        assert(p_i2c_scl = '0')
            report "ID19: Test data transfer and stop - epxecting p_i2c_scl = '0'";
        wait for post_hold;
        wait for 250*clk_period;

        wait for 500*clk_period;

        --**End simulation**
        wait for 500 ns;
        report"I2C_C_DRIVER_TB - testbench completed";
        --Simulation end using vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries not supported)
        -- run_sim <= '0';
        -- wait; 

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;