-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Bidirectional Serial to/form Parallel converter testbench
-- Module Name:		SP_CONVERTER_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> SP_CONVERTER.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use assert library for simulation
use std.standard.all;




--! Functionality testbench
entity SP_CONVERTER_TB is
end entity SP_CONVERTER_TB;




--! Simulation architecture
architecture TB of SP_CONVERTER_TB is
	
	--Component
	component SP_CONVERTER
		generic(
			WORD_LENGTH		:	natural := 8
		);
		port(
			clk				: in	std_logic;
			rst				: in	std_logic;
			ce				: in	std_logic;
			sclk			: in	std_logic;
			mosi			: in	std_logic;
			miso			: out	std_logic;
			word_valid		: out	std_logic;
			dat_i			: in	std_logic_vector(WORD_LENGTH-1 downto 0);
			dat_o			: out	std_logic_vector(WORD_LENGTH-1 downto 0)
		);
	end component;
	
	
	--Signals
	--Simulation timing 
	constant clk_period		:	time := 10 ns;
	constant sclk_period	:	time := 40 ns;
	signal clock			:	std_logic := '0';
	signal reset			:	std_logic;
	signal run_sim			:	std_logic := '1';
	--DUT i/o
	signal ce				:	std_logic;
	signal sclk				:	std_logic;
	signal mosi				:	std_logic;
	signal miso				:	std_logic;
	signal word_valid		:	std_logic;
	signal dat_i			:	std_logic_vector(7 downto 0);
	signal dat_o			:	std_logic_vector(7 downto 0);
	--TB
	signal miso_buff		:	std_logic_vector(7 downto 0) := (others => '0');
	signal mosi_buff		:	std_logic_vector(7 downto 0) := (others => '0');
	
begin

	DUT : SP_CONVERTER
	port map(
		clk				=> clock,
		rst				=> reset,
		ce				=> ce,
		sclk			=> sclk,
		mosi			=> mosi,
		miso			=> miso,
		word_valid		=> word_valid,
		dat_i			=> dat_i,
		dat_o			=> dat_o
	);
	
	
	--Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 0 ns, '0' after 15 ns;
	
	
	TEST : process
		--Timing
		variable init_hold		:	time := 5*clk_period/2; 
		variable assert_hold	:	time := 3*clk_period/2;
		variable post_hold		:	time := 1*clk_period/2;
	begin
		--Wait for initial setup
		wait for init_hold;
		
		
		--Test reset conditions
		assert(miso = '0') 		 report "line(106): Test reset - expecting miso = '0'" severity error;
		assert(word_valid = '0') report "line(107): Test reset - expecting word_valid = '0'" severity error;	
		assert(dat_o = x"00")	 report "line(108): Test reset - expecting dat_o = x00" severity error;
		
		
		wait for 5*clk_period;
		
		
		--Test data conversion
		ce   <= '1';
		sclk <= '0';
		for i in 0 to 255 loop
			--Serial data to convert
			mosi_buff <= std_logic_vector(to_unsigned(i,8));
			--Parallel data to convert
			dat_i 	  <= std_logic_vector(to_unsigned(i,8));
			
			for j in 0 to 7 loop
				wait for sclk_period/2;
				sclk <= '0';
				wait for sclk_period/2;
				sclk <= '1';
				mosi <= mosi_buff(7-j);
				miso_buff(7-j) <= miso;				
			end loop;
			
			wait for assert_hold;
			assert(miso_buff = std_logic_vector(to_unsigned(i,8)))
				report "line(136): Test conversion - expecting miso_buff = " & integer'image(i)
				severity error;
			assert(dat_o = std_logic_vector(to_unsigned(i,8)))
				report "line(139): Test conversion - expecting dat_o = " & integer'image(i)
				severity error;
			assert(word_valid = '1')
				report "line(142): Test conversion - expecting word_valid = '1'" severity error;
			wait for post_hold;
		
		end loop;
		
		
		
		--Finish simulation
		wait for 50 ns;
		run_sim <= '0';
		wait;
		
	end process;
	
	
end TB;
