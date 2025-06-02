library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;

entity TMC2660_SMODULE_ENCODER is
    generic(
        g_address          : natural      := 1; --! Module's base address
        g_sclk_factor      : natural      := 8; --! SPI serial clock period as a factor of clk
        g_rst_delay        : natural      := 100; --! Initial delay after reset given in clk cycles
        g_tmc2660_config   : array_16_bit := (x"0000", x"0000"); --! Default configuration of TMC2660
        g_enc_invert       : boolean      := false;
        g_enc_internal_bit : natural      := 16
    );
    port(
        --General
        clk            : in  std_logic; --! System clock
        rst            : in  std_logic; --! Asyncrhonous reset

        --BUS slave interface
        sys_bus_i      : in  sbus_in;   --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o      : out sbus_out;  --! BUS output signals [dat,tag,mux]
        --TMC2660 interface
        p_tmc2660_clk  : out io_o;      --! TMC2660 external clock (sys_clock/2)
        p_tmc2660_enn  : out io_o;      --! TMC2660 enable signal ('0'-on | '1'-off)
        p_tmc2660_sg   : in  io_i;      --! TMC2660 StallGuard2 input
        p_tmc2660_dir  : out io_o;      --! TMC2660 direction signal
        p_tmc2660_step : out io_o;      --! TMC2660 step signal
        p_tmc2660_ncs  : out io_o;      --! TMC2660 SPI chip select 
        p_tmc2660_sclk : out io_o;      --! TMC2660 SPI serial clock
        p_tmc2660_mosi : out io_o;      --! TMC2660 SPI master_out/slave-in
        p_tmc2660_miso : in  io_i;      --! TMC2660 SPI master-in/slave-out
        --ENCODER interface
        p_enc_a        : in  io_i;      --! ENCODER channel a
        p_enc_b        : in  io_i       --! ENCODER channel b
    );
end entity TMC2660_SMODULE_ENCODER;

--! General architecture
architecture RTL of TMC2660_SMODULE_ENCODER is
    signal s_enc_counter   : std_logic_vector(15 downto 0);
    signal s_enc_reference : std_logic;

begin
    ENCODER : entity work.ENCODER
        generic map(
            g_invert_dir       => g_enc_invert,
            g_enc_internal_bit => g_enc_internal_bit
        )
        port map(
            clk         => clk,
            rst         => rst or s_enc_reference,
            p_channel_a => p_enc_a.dat,
            p_channel_b => p_enc_b.dat,
            p_enc_count => s_enc_counter
        );

    SMODULE : entity work.TMC2660_SMODULE
        generic map(
            g_address        => g_address,
            g_sclk_factor    => g_sclk_factor,
            g_rst_delay      => g_rst_delay,
            g_tmc2660_config => g_tmc2660_config
        )
        port map(
            clk               => clk,
            rst               => rst,
            sys_bus_i         => sys_bus_i,
            sys_bus_o         => sys_bus_o,
            p_tmc2660_clk     => p_tmc2660_clk,
            p_tmc2660_enn     => p_tmc2660_enn,
            p_tmc2660_sg      => p_tmc2660_sg,
            p_tmc2660_dir     => p_tmc2660_dir,
            p_tmc2660_step    => p_tmc2660_step,
            p_tmc2660_ncs     => p_tmc2660_ncs,
            p_tmc2660_sclk    => p_tmc2660_sclk,
            p_tmc2660_mosi    => p_tmc2660_mosi,
            p_tmc2660_miso    => p_tmc2660_miso,
            p_enc_initialized => open,
            p_enc_reference   => s_enc_reference,
            p_enc_counter     => s_enc_counter
        );

end architecture;
