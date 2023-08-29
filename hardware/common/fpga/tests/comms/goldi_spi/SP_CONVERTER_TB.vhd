-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		Custom SPI Serial/Parallel converter testbench
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
--
-- Revision V4.00.00 - Changes due to design optimization and simulation flow
-- Additional Comments: Testbench addapted to test the optimizations made to
--						the module in the revision. Changes to the simulation
--						control; use of the env library to stop simulation.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation control and assertions
library std;
use std.standard.all;
use std.env.all;




--! Functionality testbench
entity SP_CONVERTER_TB is
end entity SP_CONVERTER_TB;




--! Simulation architecture
architecture TB of SP_CONVERTER_TB is
	
	--****DUT****
	component SP_CONVERTER
generic(
        g_word_length   :   natural
    );    
    port(
        clk             : in    std_logic;
        rst             : in    std_logic;
        p_spi_nce       : in    std_logic;
        p_spi_sclk      : in    std_logic;
        p_spi_mosi      : in    std_logic;
        p_spi_miso      : out   std_logic;
        p_word_val      : out   std_logic;
        p_data_out      : out   std_logic_vector(g_word_length-1 downto 0);
        p_data_in       : in    std_logic_vector(g_word_length-1 downto 0)
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
	signal p_spi_nce		:	std_logic := '1';
	signal p_spi_sclk		:	std_logic := '1';
	signal p_spi_mosi		:	std_logic := '0';
	signal p_spi_miso		:	std_logic := '0';
	signal p_word_val		:	std_logic := '0';
	signal p_data_out		:	std_logic_vector(7 downto 0) := (others => '0');
	signal p_data_in		:	std_logic_vector(7 downto 0) := (others => '0');
	--Testbench
	signal miso_buff		:	std_logic_vector(7 downto 0) := (others => '0');
	signal mosi_buff		:	std_logic_vector(7 downto 0) := (others => '0');
	

begin

	--****COMPONENT****
	-----------------------------------------------------------------------------------------------
	DUT : SP_CONVERTER
	generic map(
		g_word_length	=> 8
	)
	port map(
		clk				=> clock,
		rst				=> reset,
		p_spi_nce		=> p_spi_nce,
		p_spi_sclk		=> p_spi_sclk,
		p_spi_mosi		=> p_spi_mosi,
		p_spi_miso		=> p_spi_miso,
		p_word_val		=> p_word_val,
		p_data_out		=> p_data_out,
		p_data_in		=> p_data_in
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
		variable assert_hold	:	time := 3*clk_period/2;
		variable post_hold		:	time := 1*clk_period/2;
	begin
		--**Initial setup**
		wait for init_hold;
		
		
		--**Test reset state**
		wait for assert_hold;
		assert(p_spi_miso = '0') 		 
			report "ID01: Test reset - expecting p_spi_miso = '0'" severity error;
		assert(p_word_val = '0') 
			report "ID02: Test reset - expecting p_word_val = '0'" severity error;	
		assert(p_data_out = x"00")
			report "ID03: Test reset - expecting p_data_out = x00" severity error;
		wait for post_hold;

		
		wait for 5*clk_period;
		
		
		--**Test data conversion**
		p_spi_nce   <= '0';
		for i in 0 to 255 loop
			--*Data to be shifted*
			--Serial data to convert
			mosi_buff <= std_logic_vector(to_unsigned(i,8));
			--Parallel data to convert
			p_data_in <= std_logic_vector(to_unsigned(i,8));
			

			--Shift data
			for j in 0 to 7 loop
				wait for sclk_period/2;
				p_spi_sclk <= '0';
				p_spi_mosi <= mosi_buff(7-j);
				wait for sclk_period/2;
				p_spi_sclk <= '1';
				miso_buff(7-j) <= p_spi_miso;
			end loop;
			

			wait for assert_hold;
			assert(miso_buff = std_logic_vector(to_unsigned(i,8)))
				report "ID04: Test conversion - expecting miso_buff = " & integer'image(i)
				severity error;
			assert(p_data_out = std_logic_vector(to_unsigned(i,8)))
				report "ID05: Test conversion - expecting dat_o = " & integer'image(i)
				severity error;
			assert(p_word_val = '1')
				report "ID06: Test conversion - expecting p_word_val = '1'" severity error;
			wait for post_hold;
		
		end loop;
		p_spi_nce <= '1';


		
		--**End simulation**
		wait for 50 ns;
        report "SP_CONVERTER_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        -- run_sim <= '0';
        -- wait;
		
	end process;
	-----------------------------------------------------------------------------------------------

	
end TB;
