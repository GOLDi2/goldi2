library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity gpio_module_array is
    generic(
        address    : natural;
        module_cnt : positive
    );
    port(
        clk      : in  std_ulogic;
        rst      : in  std_ulogic;
        --
        bus_in   : in  work.GBus.uslave_in;
        bus_out  : out work.GBus.uslave_out;
        --
        port_out : out work.crossbar.uport_out_vector(module_cnt * 4 - 1 downto 0);
        port_in  : in  work.crossbar.uport_in_vector(module_cnt * 4 - 1 downto 0)
    );
end entity gpio_module_array;

architecture RTL of gpio_module_array is
    signal bus_out_array : work.GBus.uslave_out_vector(module_cnt - 1 downto 0);

begin
    generate_modules : for i in 0 to module_cnt - 1 generate
        gpio_module_inst : entity work.gpio_module
            generic map(
                address => address + i
            )
            port map(
                clk      => clk,
                rst      => rst,
                bus_in   => bus_in,
                bus_out  => bus_out_array(i),
                port_out => port_out(i * 4 + 3 downto i * 4),
                port_in  => port_in(i * 4 + 3 downto i * 4)
            );
    end generate generate_modules;
    
    bus_out <= work.GBus.or_reduce(bus_out_array);

end architecture RTL;
