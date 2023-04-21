-------------------------------------------------------------------------------
-- Company: 		Technische Universität Ilmenau
-- Engineer: 		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name: 	Customizable FIFO structure testbench
-- Module Name: 	QUEUE_TB
-- Project Name: 	GOLDi_FPGA_CORE
-- Target Devices: 	LCMXO2-7000HC-4TG144C
-- Tool versions: 	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies: 	-> QUEUE.vhd
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
use std.standard.all;




--! Functionality simulation
entity QUEUE_TB is
end entity QUEUE_TB;



--! Simulation architecture
architecture TB of QUEUE_TB is

    --CUT
    component QUEUE 
        generic(
            QUEUE_LENGTH    :   natural := 10;
            DATA_WIDTH      :   natural := 8
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            write_enb       : in    std_logic;
            read_enb        : in    std_logic;
            queue_empty     : out   std_logic;
            queue_full      : out   std_logic;
            data_in         : in    std_logic_vector(DATA_WIDTH-1 downto 0);
            data_out        : out   std_logic_vector(DATA_WIDTH-1 downto 0)
        );
    end component;


    --Intermediate signals
    --Timing
	constant clk_period	:	time := 10 ns;
	signal clock		:	std_logic := '0';
	signal reset		:	std_logic;
	signal run_sim		:	std_logic := '1';
	--DUT i/o
    signal write_enb    :   std_logic;
    signal read_enb     :   std_logic;
    signal queue_empty  :   std_logic;
    signal queue_full   :   std_logic;
    signal data_in      :   std_logic_vector(7 downto 0);
    signal data_out     :   std_logic_vector(7 downto 0);


begin

    DUT : QUEUE
    generic map(
        QUEUE_LENGTH    => 4,
        DATA_WIDTH      => 8
    )
    port map(
		clk			=> clock,
		rst			=> reset,
		write_enb	=> write_enb,
		read_enb	=> read_enb,
		queue_empty	=> queue_empty,
		queue_full	=> queue_full,
		data_in		=> data_in,
		data_out	=> data_out
    );



    --Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 0 ns, '0' after 15 ns;



    TEST : process
        --Timing
		variable init_hold		:	time := 5*clk_period/2;
		variable assert_hold	:	time := 3*clk_period/2;
		variable post_hold		:	time := clk_period/2;
    begin

        --***Initial Setup***
        write_enb <= '0';
        read_enb  <= '0';
        data_in <= (others => '0');
        wait for init_hold;


        --***Test Reset values***
        wait for assert_hold;
        assert(data_out = (data_out'range => '0'))
            report "line(117): Test reset - expecting data_out = x00" severity error;
        assert(queue_empty = '1')
            report "line(119): Test reset - expecting queue_empty = '1'" severity error;
        assert(queue_full = '0')
            report "line(121): Test reset - expecting queue_full = '1'" severity error;
        wait for post_hold;



        --***Test partial fill***
        --Fill half of queue and return to empty state and analyse flags
        --Expecting data out in the same order as data in and flag empty;
        -- flag full remains grounded.
        for i in 1 to 2 loop
            data_in <= std_logic_vector(to_unsigned(i,8));
            write_enb <= '1';
            wait for clk_period;
            write_enb <= '0';

            wait for assert_hold;
            assert(queue_empty = '0') 
                report "line(138): Test partial fill - expecting queue_empty = '0'" severity error;
            assert(queue_full = '0')
                report "line(140): Test partial fill - expecting queue_full = '0'" severity error;
            wait for post_hold;  
        end loop;

        for i in 1 to 2 loop
            read_enb <= '1';
            wait for clk_period;
            read_enb <= '0';

            wait for assert_hold;
            assert(data_out = std_logic_vector(to_unsigned(i,8)))
                report ("line(151): Test partioal fill - expecting data_out = " & integer'image(i))
                severity error;
            wait for post_hold;
        end loop;

        wait for assert_hold;
        assert(queue_empty = '1')
            report "line(158): Test partial fill - expecting queue_empty = '0'" severity error;
        wait for post_hold;



        wait for 50 ns;



        --****Test empty queue****
        --Request data from empty queue
        --Expecting data_out to remain grounded and empty flag
        read_enb <= '1';
        wait for clk_period;
        read_enb <= '0';

        wait for assert_hold;
        assert(data_out = (data_out'range => '0'))
            report "line(176): Test empty queue - expecting data_out = x0" severity error;
        assert(queue_empty = '1')
            report "line(178): Test empty queue - expecting queue_empty = '1'" severity error;
        wait for post_hold;



        wait for 50 ns;
       



        --***Test overflow***
        --Fill queue over the limit and read output data
        --Expecting full flag and data to be lost 
        for i in 0 to 5 loop
            data_in <= std_logic_vector(to_unsigned(i,8));
            write_enb <= '1';
            wait for clk_period;
            write_enb <= '0';
        end loop;

        wait for assert_hold;
        assert(queue_full = '1')
            report"line(200): Test overflow - expecting queue_full = '1'" severity error;
        wait for post_hold;

        read_enb <= '1';
        wait for clk_period;
        read_enb <= '0';

        wait for assert_hold;
        assert(data_out = x"00")
            report "line(209): Test overflow - expecting data_out = 3" severity error;
        assert(queue_full = '0')
            report "line(211): Test overflow - expecting queue_full = '0'" severity error;
        wait for post_hold;



        --End simulation
        wait for 20 ns;
        run_sim <= '0';
        wait;

    end process;


end TB;