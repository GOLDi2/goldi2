library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity gpio_module is
    generic(
        address : natural
    );
    port(
        clk      : in  std_logic;
        rst      : in  std_logic;
        --
        bus_in   : in  work.GBus.uslave_in;
        bus_out  : out work.GBus.slave_out;
        --
        port_out : out work.crossbar.uport_out_vector(3 downto 0);
        port_in  : in  work.crossbar.uport_in_vector(3 downto 0)
    );
end entity gpio_module;

architecture RTL of gpio_module is
    signal output_enable : std_ulogic_vector(3 downto 0);
    signal output        : std_ulogic_vector(3 downto 0);
    signal input         : std_ulogic_vector(3 downto 0);
begin
    bus_register_inst : entity work.bus_register
        generic map(
            address => address
        )
        port map(
            clk                => clk,
            rst                => rst,
            bus_in             => bus_in,
            bus_out            => bus_out,
            input              => output_enable & input,
            output(7 downto 4) => output_enable,
            output(3 downto 0) => output
        );

    generate_ports : for i in 0 to 3 generate
        port_out(i) <= (enable => output_enable(i), output => output(i));
        input(i)    <= port_in(i).input;
    end generate generate_ports;

end architecture RTL;
