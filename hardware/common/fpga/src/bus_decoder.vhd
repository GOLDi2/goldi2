library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

package decoder_types is
    type address_boundary is array(natural range 0 to 1) of integer;
    type address_boundaries is array(natural range <>) of address_boundary;
    type data_array is array (natural range <>) of std_logic_vector(7 downto 0);
end package decoder_types;

library ieee;
use ieee.std_logic_1164.all;
use work.decoder_types.all;
use ieee.numeric_std.all;

entity bus_decoder is
    generic(
        addresses: address_boundaries;
        address_width: natural
    );
    port(
        address: in std_logic_vector(address_width-1 downto 0);
        one_hot: out std_logic_vector(0 to addresses'length-1)
    );
end entity bus_decoder;

architecture RTL of bus_decoder is
begin
    decoder : for i in 0 to addresses'length-1 generate
        constant lower_bound : unsigned :=to_unsigned(addresses(i)(0),address_width);
        constant upper_bound : unsigned :=to_unsigned(addresses(i)(1),address_width);
    begin
        one_hot(i) <= '1' when unsigned(address)>=lower_bound and unsigned(address)<=upper_bound else '0';
    end generate decoder;
    
end architecture RTL;
