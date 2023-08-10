-------------------------------------------------------------------------------
-- Company: 		Technische Universitaet Ilmenau
-- Engineer: 		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date: 	15/04/2023
-- Design Name: 	Negative and positive edge detector 
-- Module Name: 	EDGE_DETECTOR
-- Project Name: 	GOLDi_FPGA_SRC
-- Target Devices: 	LCMXO2-7000HC-4TG144C
-- Tool versions: 	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies: 	none;
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief Edge detector for time or signal analysis
--! @details
--! Module uses the system clock to sample the input signal
--! and detects changes in it. The edges of the signal are
--! flaged independently based on the type: rising or falling
--! edge.
--!
--! **Latency: 2cyl**
entity EDGE_DETECTOR is
	port(
	--General
		clk		: in	std_logic;		--! System clock
		rst		: in	std_logic;		--! Synchronous reset
	--Data	
		data_in	: in	std_logic;		--! Input signal
		n_edge	: out	std_logic;		--! Falling edge strobe
		p_edge	: out	std_logic		--! Rising edge strobe
	);
end entity EDGE_DETECTOR;




--! General architecture
architecture RTL of EDGE_DETECTOR is	
	
	--****INTERNAL SIGNALS****
	--Buffer
	signal data_in_buff	:	std_logic_vector(1 downto 0);

begin
	
	ED : process(clk) 
	begin
		if(rising_edge(clk)) then
			if(rst = '1') then
				data_in_buff <= (others => '0');
			
			else
				--Input data
				data_in_buff <= data_in_buff(0) & data_in;
				
				if(data_in_buff = "01") then
					p_edge <= '1';
					n_edge <= '0';
				
				elsif(data_in_buff = "10") then
					p_edge <= '0';
					n_edge <= '1';
					
				else 
					p_edge <= '0';
					n_edge <= '0';
				
				end if;
			end if;	
		end if;
	end process;
	
	
end RTL;