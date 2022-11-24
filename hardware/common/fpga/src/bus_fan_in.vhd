library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

use work.decoder_types.all;

entity bus_fan_in is
    generic(
        addresses: address_boundaries;
        address_width: natural
    );
    port(
        address: in std_logic_vector(address_width-1 downto 0);
        bus_do: out std_logic_vector(7 downto 0);
        bus_do_fanin: in data_array
    );
end entity bus_fan_in;

architecture RTL of bus_fan_in is
    component bus_decoder
        generic(
            addresses     : address_boundaries;
            address_width : natural
        );
        port(
            address : in  std_logic_vector(address_width-1 downto 0);
            one_hot : out std_logic_vector(0 to addresses'length-1)
        );
    end component bus_decoder;
    
    signal one_hot: std_logic_vector(0 to addresses'length-1);
begin
    decoder: component bus_decoder
        generic map(
            addresses     => addresses,
            address_width => address_width
        )
        port map(
            address => address,
            one_hot => one_hot
        );
        
    mux : process(bus_do_fanin, one_hot) is
        variable result: std_logic_vector(7 downto 0);
    begin
        result := "00000000";
        for i in 0 to address'length-1 loop
            result := result or bus_do_fanin(i) when one_hot(i) else result;
        end loop;
        bus_do <= result;
    end process mux;
    
end architecture RTL;
