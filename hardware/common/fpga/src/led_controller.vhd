library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

-- The led controller uses a single register:
-- 7 6 5 4 3 2 1 0
-- | | |___| |___|
-- | |   |     +--- delay_off     (000=62.5ms, 001=187.5ms, 010=312.5ms, 011=437.5ms, 100=562.5ms, 101=687.5ms, 110=812.5ms, 111=937.5ms)
-- | |   +--------- delay_on      (000=62.5ms, ..., 111=937.5ms)
-- | +------------- blink_enabled (0=disabled, 1=enabled)
-- +--------------- brightness    (0=off, 1=on)

entity led_controller is
    generic(
        address       : integer;
        clk_frequency : integer;
        inverted      : boolean := true
    );
    port(
        clk      : in  std_logic;
        rst      : in  std_logic;
        --
        bus_do   : out std_logic_vector(7 downto 0);
        bus_di   : in  std_logic_vector(7 downto 0);
        bus_we   : in  std_logic;
        bus_addr : in  std_logic_vector(8 downto 0);
        --
        led      : out std_logic
    );
end entity led_controller;

architecture RTL of led_controller is
    signal brightness    : std_logic_vector(0 downto 0);
    signal blink_enabled : std_logic_vector(0 downto 0);
    signal delay_on      : std_logic_vector(2 downto 0);
    signal delay_off     : std_logic_vector(2 downto 0);

    constant counter_high   : natural := clk_frequency / 16;
    signal counter          : natural range 0 to counter_high;
    signal blink_counter    : natural range 0 to 16;
    signal blinker_state    : std_logic;
    signal blink_counter_en : std_logic;

    signal led_state : std_logic;
begin
    bus_do    <= brightness & blink_enabled & delay_on & delay_off;
    led_state <= blinker_state when blink_enabled(0) = '1' else brightness(0);
    led       <= not led_state when inverted else led_state;

    write_register : process(clk, rst) is
    begin
        if rst = '1' then
            brightness    <= (others => '0');
            blink_enabled <= (others => '0');
            delay_on      <= (others => '0');
            delay_off     <= (others => '0');
        elsif rising_edge(clk) then
            if unsigned(bus_addr) = address and bus_we = '1' then
                brightness    <= bus_di(7 downto 7);
                blink_enabled <= bus_di(6 downto 6);
                delay_on      <= bus_di(5 downto 3);
                delay_off     <= bus_di(2 downto 0);
            end if;
        end if;
    end process write_register;

    blinker : process(clk, rst) is
    begin
        if rst = '1' then
            blink_counter <= 0;
        elsif rising_edge(clk) then
            if blink_counter_en = '1' then
                if blinker_state = '1' then
                    if blink_counter = unsigned(delay_on)&'1' then
                        blink_counter <= 0;
                        blinker_state <= '0';
                    else
                        if blink_counter = 15 then
                            blink_counter <= 0;
                        else
                            blink_counter <= blink_counter + 1;
                        end if;
                        blinker_state <= '1';
                    end if;
                else
                    if blink_counter = unsigned(delay_off)&'1' then
                        blink_counter <= 0;
                        blinker_state <= '1';
                    else
                        if blink_counter = 15 then
                            blink_counter <= 0;
                        else
                            blink_counter <= blink_counter + 1;
                        end if;
                        blinker_state <= '0';
                    end if;
                end if;
            end if;
        end if;
    end process blinker;

    clock_divider : process(clk, rst) is
    begin
        if rst = '1' then
            counter          <= 0;
            blink_counter_en <= '0';
        elsif rising_edge(clk) then
            if counter = counter_high then
                blink_counter_en <= '1';
                counter          <= 0;
            else
                blink_counter_en <= '0';
                counter          <= counter + 1;
            end if;
        end if;
    end process clock_divider;

end architecture RTL;
