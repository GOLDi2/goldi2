library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity machxo2_pad_array is
    generic(
        pad_cnt : positive
    );
    port(
        port_out : in  work.crossbar.uport_out_vector(pad_cnt-1 downto 0);
        port_in  : out work.crossbar.uport_in_vector(pad_cnt-1 downto 0);
        output : out std_ulogic_vector(pad_cnt-1 downto 0)
    );
end entity machxo2_pad_array;

architecture RTL of machxo2_pad_array is

begin
    generate_pads : for i in 0 to pad_cnt - 1 generate
        pad_inst : entity work.machxo2_pad
            port map(
                port_out => port_out(i),
                port_in  => port_in(i),
                output   => output(i)
            ) ;
    end generate generate_pads;

end architecture RTL;
