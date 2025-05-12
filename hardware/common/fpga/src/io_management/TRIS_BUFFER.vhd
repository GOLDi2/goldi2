library IEEE;
use IEEE.std_logic_1164.all;
library machxo2;
use work.GOLDI_IO_STANDARD.all;

--! @brief Tri-state synchronizer buffer
--! @details
--! The buffer transforms the tri-state signals of a FPGA pin into the io_o/io_i 
--! standard defined in the GOLDI_IO_STANDARD and used internaly by the GOLDi system.
--! The incomming data is presented in two ways. A SYNCHRONIZER samples the input data
--! and synchronizes the input to the system clock to use in sequential logic, and an
--! asynchronous port shifts the input data directly to use in combinatorial logic.
--!
--! ***Latency(sync input): 2cyl***
entity TRIS_BUFFER is
    port(
        --General
        clk           : in    std_logic; --! System clock
        rst           : in    std_logic; --! Asynchronous reset
        --System in/out interface
        port_out      : in    io_o;     --! System output data
        port_in_async : out   io_i;     --! System input asynchronous data
        port_in_sync  : out   io_i;     --! System input synchronous data
        --FPGA IO
        io            : inout std_logic --! FPGA Pin
    );
end entity TRIS_BUFFER;

--! General architecture
architecture RTL of TRIS_BUFFER is

    --****INTERNAL SIGNALS****
    --Buffer
    signal io_buffer : io_i;
    signal io_sync   : io_i;
    signal n_enb     : std_logic;

begin

    --Drive inout FPGA Pin
    BUFF : machxo2.components.BB
        port map(
            B => io,
            I => port_out.dat,
            T => n_enb,
            O => io_buffer.dat
        );
    --Invert enb signal 
    n_enb <= not port_out.enb;

    --Manage data input into the system
    port_in_async <= io_buffer;
    port_in_sync  <= io_sync;

    SYNC_INPUT : entity work.SYNCHRONIZER
        generic map(
            g_stages => 2
        )
        port map(
            clk       => clk,
            rst       => rst,
            p_io_i    => io_buffer.dat,
            p_io_sync => io_sync.dat
        );

end RTL;
