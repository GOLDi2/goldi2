library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity output_controller is
    generic(
        address : natural;
        ports   : natural
    );
    port(
        clk      : in    std_logic;
        rst      : in    std_logic;
        --
        bus_do   : out   std_logic_vector(7 downto 0);
        bus_di   : in    std_logic_vector(7 downto 0);
        bus_we   : in    std_logic;
        bus_addr : in    std_logic_vector(8 downto 0);
        --
        output       : out std_logic_vector(8 * ports - 1 downto 0)
    );
end entity output_controller;

architecture RTL of output_controller is
    signal port_registers       : std_logic_vector(8 * ports - 1 downto 0);
    signal address_is_port      : boolean;
    signal base_address         : natural range 0 to 255;
begin
    address_is_port      <= unsigned(bus_addr) >= address and unsigned(bus_addr) < address + ports;

    base_address <= to_integer(unsigned(bus_addr)) - address;

    read_registers : process(address_is_port, base_address, port_registers) is
        variable offset : natural range 0 to 255;
    begin
        if address_is_port then
            offset := (base_address - ports) * 8;
            bus_do <= port_registers(offset + 7 downto offset);
        else
            bus_do <= (others => '0');
        end if;
    end process read_registers;

    write_registers : process(clk, rst) is
        variable offset : natural range 0 to 255;
    begin
        if rst = '1' then
            port_registers      <= (others => '0');
        elsif rising_edge(clk) then
            if address_is_port and bus_we = '1' then
                offset                                   := (base_address) * 8;
                port_registers(offset + 7 downto offset) <= bus_di;
            end if;
        end if;
    end process write_registers;
    
    output <= port_registers;

end architecture RTL;
