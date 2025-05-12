library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;

--! @brief Electromagnet driver module based on the use of an H-Bridge circuit
--! @details
--! The module is an H-Bridge driver for control of an electromagnet. It is designed
--! for a double channel (Out_1 and Out_2) configuration, capable of  reducing the 
--! magnetic remanence. This is accomplished through decreasing alternating pulses
--! that reduce the remanent magnetic field in the core. The inital pulse width is 
--! set by the "g_pulse_width" parameter and the width reduction is set by the 
--! "g_pulse_reduction" factor. The pulse width can be calculated as 
--! clk_period*g_pulse_width
--!
--! To prevent a shortcut or overload of the H-Bridge the module waits for the current
--! to decrease between every polarity change in the voltage, thereby reducing the
--! inductive effects. The waiting time is set by the "g_magnet_tao" parameter.
--!
--! ### Register:
--! | g_address | Bit 7 | Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! | +0		|		|		|		|		|		|		|		|EM_pow	|
--!
--! ***Latency: 3***
entity EMAGNET_SMODULE is
    generic(
        g_address         : integer := 1; --! Module's base address
        g_magnet_tao      : integer := 10; --! Electromagnet time constant
        g_pulse_width     : integer := 100; --! Demagnetization pulse inital width
        g_pulse_reduction : integer := 10 --! Demagnetization pulse width reduction
    );
    port(
        --General
        clk        : in  std_logic;     --! System clock
        rst        : in  std_logic;     --! Asynchronous reset
        --BUS interface
        sys_bus_i  : in  sbus_in;       --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o  : out sbus_out;      --! BUS output signals [dat,tag,mux]
        --HBridge interface
        p_em_enb   : out io_o;          --! H-Bridge Enale
        p_em_out_1 : out io_o;          --! H-Bridge Output 1
        p_em_out_2 : out io_o           --! H-Bridge Output 2
    );
end entity EMAGNET_SMODULE;

--! General architecture
architecture RTL of EMAGNET_SMODULE is

    --****INTERNAL SIGNALS****
    --Memory
    constant c_reg_default : data_word := (others => '0');
    signal reg_data        : data_word;
    --Data buffers
    signal pulse_width     : integer range 0 to g_pulse_width;
    --Counters
    signal tao_counter     : integer range 0 to g_magnet_tao;
    signal pulse_counter   : integer range 0 to g_pulse_width;
    --State machines
    type magnet_state is (s_idle, s_power_on, s_power_off);
    type pulse_state is (s_hold_tao_pos, s_hold_tao_neg, s_pulse_pos, s_pulse_neg);
    signal ps_magnet       : magnet_state;
    signal ps_pulse        : pulse_state;

begin

    --****CONTROL OF MAGNET POWER ON/OFF CYCLE****
    -----------------------------------------------------------------------------------------------
    MAGNET_CONTROL : process(clk, rst)
    begin
        if (rst = '1') then
            ps_magnet <= s_idle;

        elsif (rising_edge(clk)) then
            --Magnet state machine
            case ps_magnet is
                when s_idle => if (reg_data(0) = '1') then
                        ps_magnet <= s_power_on;
                    else
                        ps_magnet <= s_idle;
                    end if;

                when s_power_on => if (reg_data(0) = '0') then
                        ps_magnet <= s_power_off;
                    else
                        ps_magnet <= s_power_on;
                    end if;

                when s_power_off => if (pulse_width < g_pulse_reduction) then
                        ps_magnet <= s_idle;
                    else
                        ps_magnet <= s_power_off;
                    end if;
            end case;
        end if;
    end process;

    PULSE_CONTROL : process(clk, rst)
    begin
        if (rst = '1') then
            ps_pulse    <= s_hold_tao_pos;
            pulse_width <= g_pulse_width;

        elsif (rising_edge(clk)) then
            if (ps_magnet /= s_power_off) then
                ps_pulse    <= s_hold_tao_pos;
                pulse_width <= g_pulse_width;

            else
                --Control pulse generation
                case ps_pulse is
                    when s_hold_tao_pos => if (tao_counter = g_magnet_tao - 1) then
                            ps_pulse <= s_pulse_neg;
                        else
                            ps_pulse <= s_hold_tao_pos;
                        end if;

                    when s_hold_tao_neg => if (tao_counter = g_magnet_tao - 1) then
                            ps_pulse <= s_pulse_pos;
                        else
                            ps_pulse <= s_hold_tao_neg;
                        end if;

                    when s_pulse_neg => if (pulse_counter = pulse_width - 1) then
                            ps_pulse    <= s_hold_tao_neg;
                            pulse_width <= pulse_width - g_pulse_reduction;
                        else
                            ps_pulse <= s_pulse_neg;
                        end if;

                    when s_pulse_pos => if (pulse_counter = pulse_width - 1) then
                            ps_pulse <= s_hold_tao_pos;
                        else
                            ps_pulse <= s_pulse_pos;
                        end if;
                end case;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------

    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
    PULSE_WIDTH_GENERATION : process(clk, rst)
    begin
        if (rst = '1') then
            pulse_counter <= 0;
        elsif (rising_edge(clk)) then
            if (ps_magnet /= s_power_off) then
                pulse_counter <= 0;
            elsif (ps_magnet = s_power_off and (ps_pulse = s_hold_tao_pos or ps_pulse = s_hold_tao_neg)) then
                pulse_counter <= 0;
            elsif (pulse_counter = pulse_width - 1) then
                pulse_counter <= 0;
            else
                pulse_counter <= pulse_counter + 1;
            end if;
        end if;
    end process;

    TAO_OFF_COUNTER : process(clk, rst)
    begin
        if (rst = '1') then
            tao_counter <= 0;
        elsif (rising_edge(clk)) then
            --Reset counter as long as the magnet is not in power off mode
            if (ps_magnet /= s_power_off) then
                tao_counter <= 0;
            elsif (ps_pulse /= s_hold_tao_pos and ps_pulse /= s_hold_tao_neg) then
                tao_counter <= 0;
            elsif (tao_counter = g_magnet_tao - 1) then
                tao_counter <= 0;
            else
                tao_counter <= tao_counter + 1;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------

    --****H-BRIDGE SIGNALS****
    -----------------------------------------------------------------------------------------------
    --Enable signal for the H-Bridge
    p_em_enb.enb <= '1';
    p_em_enb.dat <= '1' when ((ps_magnet = s_power_on) or (ps_magnet = s_power_off and ps_pulse = s_pulse_neg) or (ps_magnet = s_power_off and ps_pulse = s_pulse_pos)) else
                    '0';

    --Out 1 for H-Bridge. Main power signal for electromagnet
    p_em_out_1.enb <= '1';
    p_em_out_1.dat <= '1' when ((ps_magnet = s_power_on) or (ps_magnet = s_power_off and ps_pulse = s_pulse_pos)) else
                      '0';

    --Out 2 for H-Bridge. Demagnetization line
    p_em_out_2.enb <= '1';
    p_em_out_2.dat <= '1' when ((ps_magnet = s_power_off and ps_pulse = s_pulse_neg)) else
                      '0';
    -----------------------------------------------------------------------------------------------

    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_UNIT
        generic map(
            g_address   => g_address,
            g_def_value => c_reg_default
        )
        port map(
            clk         => clk,
            rst         => rst,
            sys_bus_i   => sys_bus_i,
            sys_bus_o   => sys_bus_o,
            p_data_in   => reg_data,
            p_data_out  => reg_data,
            p_read_stb  => open,
            p_write_stb => open
        );
    -----------------------------------------------------------------------------------------------

end architecture;
