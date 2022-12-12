library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity bus_register is
    generic(
        address : natural range 0 to work.GBus.HIGHEST_ADDRESS
    );
    port(
        clk     : in  std_logic;
        rst     : in  std_logic;
        --
        bus_in  : in  work.GBus.uslave_in;
        bus_out : out work.GBus.uslave_out;
        --
        input   : in  work.GBus.word;
        output  : out work.GBus.word
    );
end entity bus_register;

architecture RTL of bus_register is
begin
    write : process(clk, rst) is
    begin
        if rst = '1' then
            output <= (others => '0');
        elsif rising_edge(clk) then
            if (bus_in.address = std_logic_vector(to_unsigned(address, work.GBus.ADDRESS_WIDTH)) and bus_in.write_enable = '1') then
                output <= bus_in.write_data;
            else
                output <= output;
            end if;
        end if;
    end process write;

    read : process(bus_in.address, input) is
    begin
        if (bus_in.address = std_logic_vector(to_unsigned(address, work.GBus.ADDRESS_WIDTH))) then
            bus_out <= work.GBus.slave_data(input);
        else
            bus_out <= work.GBus.slave_idle;
        end if;
    end process read;

end architecture RTL;
