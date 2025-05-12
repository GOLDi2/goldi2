library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;

--! @brief Multiple flip flop chain to avoid metastability
--! @details
--! Module takes an asynchronous input and uses a chain of multiple flip flops
--! to avoid metastability issues in case of violation of setup or hold time 
--! constrains. The module outputs a signal synchronized with the system clock.
entity SYNCHRONIZER_ARRAY is
	generic(
		g_array_width : natural := 10;  --! Signal bitsize
		g_stages      : natural := 2    --! Chain length
	);
	port(
		clk       : in  std_logic;      --! System clock
		rst       : in  std_logic;      --! Synchronous reset
		p_io_i    : in  std_logic_vector(g_array_width - 1 downto 0); --! Asynchronous input signal
		p_io_sync : out std_logic_vector(g_array_width - 1 downto 0) --! Synchronous output signal
	);
end entity SYNCHRONIZER_ARRAY;

--! General architecture
architecture RTL of SYNCHRONIZER_ARRAY is
begin

	SYNC_ARRAY : for i in 0 to g_array_width - 1 generate
		SYNC_CHAIN : entity work.SYNCHRONIZER
			generic map(
				g_stages => g_stages
			)
			port map(
				clk       => clk,
				rst       => rst,
				p_io_i    => p_io_i(i),
				p_io_sync => p_io_sync(i)
			);
	end generate;

end architecture;
