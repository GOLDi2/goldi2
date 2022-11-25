library ieee;
use ieee.std_logic_1164.all;

entity crossbar_switch_module is
    generic(
        address             : natural                 := 0;
        left_side_port_cnt  : positive range 1 to 256 := 256;
        right_side_port_cnt : positive                := 1
    );
    port(
        clk             : in  std_logic;
        rst             : in  std_logic;
        --
        bus_in          : in  work.GBus.uslave_in;
        bus_out         : out work.GBus.uslave_out;
        --
        left_ports_out  : in  work.crossbar.uport_out_vector(0 to left_side_port_cnt - 1);
        right_ports_out : out work.crossbar.uport_out_vector(0 to right_side_port_cnt - 1);
        left_ports_in   : out work.crossbar.uport_in_vector(0 to left_side_port_cnt - 1);
        right_ports_in  : in  work.crossbar.uport_in_vector(0 to right_side_port_cnt - 1)
    );
end entity crossbar_switch_module;

architecture RTL of crossbar_switch_module is
    signal config : work.GBus.word_vector(0 to right_side_port_cnt - 1);
begin
    bus_register_array_inst : entity work.bus_register_array
        generic map(
            address      => address,
            register_cnt => right_side_port_cnt
        )
        port map(
            clk     => clk,
            rst     => rst,
            bus_in  => bus_in,
            bus_out => bus_out,
            input   => config,
            output  => config
        );

    crossbar_switch_inst : entity work.crossbar_switch
        generic map(
            left_side_port_cnt  => left_side_port_cnt,
            right_side_port_cnt => right_side_port_cnt
        )
        port map(
            config          => work.crossbar.uconfig_word_vector(config),
            left_ports_out  => left_ports_out,
            right_ports_out => right_ports_out,
            left_ports_in   => left_ports_in,
            right_ports_in  => right_ports_in
        );

end architecture RTL;
