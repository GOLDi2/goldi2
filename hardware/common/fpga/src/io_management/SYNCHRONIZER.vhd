library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;

--! @brief A chain of multiple flip flops to avoid metastability issues
--! @details
--! The module takes an asynchronous input and uses a chain of multiple flip flops
--! to avoid metastability in case of a violation of setup or hold time constrains.
--! The module outputs a signal synchronized with the FPGA's system clock
entity SYNCHRONIZER is
	generic(
		g_stages : natural := 2         --! Chain length
	);
	port(
		clk       : in  std_logic;      --! System clock
		rst       : in  std_logic;      --! Asynchronous reset
		p_io_i    : in  std_logic;      --! Asynchonous input signal
		p_io_sync : out std_logic       --! Synchronous output signal
	);
end entity SYNCHRONIZER;

--! General architecture 
architecture RTL of SYNCHRONIZER is
	--****INTERNAL SIGNALS****
	signal sync_reg : std_logic_vector(g_stages - 1 downto 0);

begin

	SYNCHRONIZATION : process(clk, rst) is
	begin
		if (rst = '1') then
			sync_reg <= (others => '0');

		elsif (rising_edge(clk)) then
			sync_reg <= sync_reg(g_stages - 2 downto 0) & p_io_i;

		end if;
	end process;

	p_io_sync <= sync_reg(g_stages - 1);

end RTL;
