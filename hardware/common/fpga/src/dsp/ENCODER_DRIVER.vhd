--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Custom packages
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;

--! @brief Incremental encoder dsp module 
--! @details
--! Incremental encoder processing unit for 2 channel encoder. The module reacts
--! to the data of the a channel providing an impulse count for the "p_channel_a" 
--! edges and uses the "p_channel_b" to determine the movement direction. 
--! The counter value is stored in a unsigned 16 bit data word and is then 
--! presented in the "p_enc_count" signal.
--!
--! The parameter "g_invert_dir" selects the direction of the positive axis of
--! rotation. By setting the parameter to true the moduel increases the counter
--! when the encoder is rotated in the clockwise direction. A rising edge on the
--! "p_channel_a" and a high state in the "p_channel_b" increase the counter. If
--! the parameter is set to false this behaviour is inverted an the counter
--! clockwise movement produces an increment in the module's counter. A rising
--! edge on the "p_channel_a" and a low state in the "p_channel_b" increase the
--! counter.
--!
--! + g_invert = false 
--!     - [channel_a: "01" | channel_b: 0] counter --
--!     - [channel_a: "01" | channel_b: 1] counter ++
--!     - [channel_a: "10" | channel_b: 0] counter ++
--!     - [channel_a: "10" | channel_b: 1] counter --
--! 
--! + g_invert = true
--!     - [channel_a: "01" | channel_b: 0] counter ++
--!     - [channel_a: "01" | channel_b: 1] counter --
--!     - [channel_a: "10" | channel_b: 0] counter --
--!     - [channel_a: "10" | channel_b: 1] counter ++
--!
--! ***Latency:3***
entity ENCODER is
    generic(
        g_invert_dir       : boolean := false; --! Select positive direction [false -> CCW | true -> CC]
        g_enc_internal_bit : natural := 16
    );
    port(
        --General
        clk         : in  std_logic;    --! System clock
        rst         : in  std_logic;    --! Asynchronous reset
        --Encoder interface
        p_channel_a : in  std_logic;    --! Encoder channel_a input
        p_channel_b : in  std_logic;    --! Encoder channel_b input
        --Output
        p_enc_count : out std_logic_vector(15 downto 0) --! Encoder position counter
    );
end entity ENCODER;

--! General architecture
architecture RTL of ENCODER is
    signal enc_counter  : unsigned(g_enc_internal_bit - 1 downto 0);
    signal enc_signal_a : std_logic_vector(1 downto 0);
    signal enc_signal_b : std_logic;
begin

    SIGNAL_DECODER : process(clk, rst)
    begin
        if (rst = '1') then
            enc_counter  <= (others => '0');
            enc_signal_a <= (others => '0');
            enc_signal_b <= '0';

        elsif (rising_edge(clk)) then
            --Buffer signals to detect rising and falling
            enc_signal_a <= enc_signal_a(0) & p_channel_a;
            enc_signal_b <= p_channel_b;

            case enc_signal_a is
                when "01" =>
                    if (enc_signal_b = '1' and not g_invert_dir) then
                        enc_counter <= enc_counter + 1;
                    elsif (enc_signal_b = '1' and g_invert_dir) then
                        enc_counter <= enc_counter - 1;
                    elsif (enc_signal_b = '0' and not g_invert_dir) then
                        enc_counter <= enc_counter - 1;
                    elsif (enc_signal_b = '0' and g_invert_dir) then
                        enc_counter <= enc_counter + 1;
                    else
                        null;
                    end if;

                when "10" =>
                    if (enc_signal_b = '1' and not g_invert_dir) then
                        enc_counter <= enc_counter - 1;
                    elsif (enc_signal_b = '1' and g_invert_dir) then
                        enc_counter <= enc_counter + 1;
                    elsif (enc_signal_b = '0' and not g_invert_dir) then
                        enc_counter <= enc_counter + 1;
                    elsif (enc_signal_b = '0' and g_invert_dir) then
                        enc_counter <= enc_counter - 1;
                    else
                        null;
                    end if;

                when others => null;
            end case;
        end if;
    end process;

    p_enc_count <= std_logic_vector(enc_counter(g_enc_internal_bit - 1 downto g_enc_internal_bit - 16));

end RTL;
