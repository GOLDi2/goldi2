library ieee;
use ieee.std_logic_1164.all;

use work.all;
use ieee.numeric_std.all;

entity bus_register_array is
    generic(
        address      : natural range 0 to GBus.HIGHEST_ADDRESS;
        register_cnt : positive
    );
    port(
        clk     : in  std_logic;
        rst     : in  std_logic;
        --
        bus_in  : in  GBus.uslave_in;
        bus_out : out GBus.uslave_out;
        --
        input   : in  GBus.word_vector(0 to register_cnt - 1);
        output  : out GBus.word_vector(0 to register_cnt - 1)
    );
end entity bus_register_array;

architecture RTL of bus_register_array is
begin
    generate_registers : for i in 0 to register_cnt - 1 generate
        bus_register_inst : entity work.bus_register
            generic map(
                address => address + i
            )
            port map(
                clk     => clk,
                rst     => rst,
                bus_in  => bus_in,
                bus_out => bus_out,
                input   => input(i),
                output  => output(i)
            );
    end generate generate_registers;
end architecture RTL;
