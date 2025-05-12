library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;

--! @brief Edge detector for time or signal analysis
--! @details
--! The module uses the system clock to sample the input signal
--! and detects changes in it. The edges of the signal are
--! flaged independently based on the type: rising or falling
--! edges.
--!
--! ***Latency: 2cyl***
entity EDGE_DETECTOR is
	port(
		--General
		clk      : in  std_logic;       --! System clock
		rst      : in  std_logic;       --! Asynchronous reset
		--Data	
		data_in  : in  std_logic;       --! Input signal
		p_f_edge : out std_logic;       --! Falling edge strobe
		p_r_edge : out std_logic        --! Rising edge strobe
	);
end entity EDGE_DETECTOR;

--! General architecture
architecture RTL of EDGE_DETECTOR is

	--****INTERNAL SIGNALS****
	--Buffer
	signal data_in_buff : std_logic;

begin

	EDGE_DETECTION : process(clk, rst)
	begin
		if (rst = '1') then
			data_in_buff <= '0';
			p_r_edge     <= '0';
			p_f_edge     <= '0';

		elsif (rising_edge(clk)) then
			if ((data_in_buff = '0') and (data_in = '1')) then
				p_r_edge <= '1';
				p_f_edge <= '0';
			elsif ((data_in_buff = '1') and (data_in = '0')) then
				p_r_edge <= '0';
				p_f_edge <= '1';
			else
				p_r_edge <= '0';
				p_f_edge <= '0';
			end if;

			--Shift data
			data_in_buff <= data_in;
		end if;
	end process;

end RTL;
