library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use work.GOLDI_IO_STANDARD.all;

--! @brief Array of tri-state buffers
--! @details
--! Array of tri-state buffers TRIS_BUFFER for a simplified instantiation 
--! and routing.
entity TRIS_BUFFER_ARRAY is
    generic(
        g_buff_number : natural := 10   --! Number of tri-state buffers
    );
    port(
        --General
        clk           : in    std_logic; --! System clock
        rst           : in    std_logic; --! Asynchronous reset
        --System In/Out
        port_out      : in    io_o_vector(g_buff_number - 1 downto 0); --! System output data vector
        port_in_async : out   io_i_vector(g_buff_number - 1 downto 0); --! System input asynchronous data vector
        port_in_sync  : out   io_i_vector(g_buff_number - 1 downto 0); --! System input synchronous data vector
        --FPGA IO
        io_vector     : inout std_logic_vector(g_buff_number - 1 downto 0) --! FPGA Pins
    );
end entity TRIS_BUFFER_ARRAY;

--! General architecture
architecture RTL of TRIS_BUFFER_ARRAY is
begin

    BUFF_ARRAY : for i in 0 to g_buff_number - 1 generate
        BUFF : entity work.TRIS_BUFFER
            port map(
                clk           => clk,
                rst           => rst,
                port_out      => port_out(i),
                port_in_async => port_in_async(i),
                port_in_sync  => port_in_sync(i),
                io            => io_vector(i)
            );
    end generate;

end architecture;
