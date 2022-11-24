library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity input_controller is
    generic(
        address : natural;
        ports   : natural
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
        input    : in  std_logic_vector(8 * ports - 1 downto 0)
    );
end entity input_controller;

architecture RTL of input_controller is
    signal address_is_port : boolean;
    signal base_address    : natural range 0 to 255;
    signal internal_io     : std_logic_vector(8 * ports - 1 downto 0);
begin
    address_is_port <= unsigned(bus_addr) >= address and unsigned(bus_addr) < address + ports;

    base_address <= to_integer(unsigned(bus_addr)) - address;

    read_io : process(clk, rst) is
    begin
        if rst = '1' then
            internal_io <= (others => '0');
        elsif rising_edge(clk) then
            internal_io <= input;
        end if;
    end process read_io;

    read_registers : process(address_is_port, internal_io, base_address) is
        variable offset : natural range 0 to 255;
    begin
        if address_is_port then
            offset := (base_address) * 8;
            bus_do <= internal_io(offset + 7 downto offset);
        else
            bus_do <= (others => '0');
        end if;
    end process read_registers;

end architecture RTL;
