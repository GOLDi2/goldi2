library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;

--! @brief Incremental encoder dsp module 
--!
--! ### Registers: 
--!
--! **SYSTEM_DATA_WIDTH = 8**
--!
--! | Address	| Bit 7	| Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--!	| +0 		| VALUE [7:0]                                            ||||||||
--! | +1		| VALUE [15:8]                                           ||||||||
--!
--!
--! ***Latency:3***
entity ENCODER_SMODULE is
    generic(
        g_address : natural := 1;       --! Module's base address
        g_invert  : boolean := false    --! Select positive direction [false -> CCW | true -> CC]
    );
    port(
        --General
        clk         : in  std_logic;    --! System clock
        rst         : in  std_logic;    --! Asynchronous reset
        --BUS slave interface
        sys_bus_i   : in  sbus_in;      --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o   : out sbus_out;     --! BUS output signals [dat,tag,mux]
        --3 Channel encoder signals
        p_channel_a : in  io_i;         --! Channel_a input
        p_channel_b : in  io_i          --! Channel_b input
    );
end entity ENCODER_SMODULE;

--! General architecture
architecture RTL of ENCODER_SMODULE is
    constant memory_length : natural                                      := getMemoryLength(16);
    constant c_reg_default : data_word_vector(memory_length - 1 downto 0) := (others => (others => '0'));
    signal reg_data_in     : data_word_vector(memory_length - 1 downto 0);
    signal reg_data_buff   : std_logic_vector(15 downto 0);

begin
    ENCODER : entity work.ENCODER
        generic map(
            g_invert_dir       => g_invert,
            g_enc_internal_bit => 16
        )
        port map(
            clk         => clk,
            rst         => rst,
            p_channel_a => p_channel_a.dat,
            p_channel_b => p_channel_b.dat,
            p_enc_count => reg_data_buff
        );

    --Typecast data
    reg_data_in <= setMemory(reg_data_buff);

    MEMROY : entity work.REGISTER_TABLE
        generic map(
            g_address    => g_address,
            g_reg_number => memory_length,
            g_def_values => c_reg_default
        )
        port map(
            clk         => clk,
            rst         => rst,
            sys_bus_i   => sys_bus_i,
            sys_bus_o   => sys_bus_o,
            p_data_in   => reg_data_in,
            p_data_out  => open,
            p_read_stb  => open,
            p_write_stb => open
        );
    -----------------------------------------------------------------------------------------------

end RTL;
