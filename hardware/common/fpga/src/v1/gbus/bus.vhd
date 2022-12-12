library ieee;
use ieee.std_logic_1164.all;

package GBus is
    constant ADDRESS_WIDTH   : positive range 8 to 64 := 16;
    constant WORD_WIDTH      : positive range 8 to 64 := 8;
    constant HIGHEST_ADDRESS : positive               := 2 ** ADDRESS_WIDTH - 1;

    subtype word is std_ulogic_vector(WORD_WIDTH - 1 downto 0);
    type word_vector is array (natural range <>) of word;
    subtype address_word is std_ulogic_vector(ADDRESS_WIDTH - 1 downto 0);

    type uslave_in is record
        write_enable : std_ulogic;

        address      : address_word;
        write_data   : word;
    end record;

    type uslave_out is record
        read_data : std_ulogic_vector(WORD_WIDTH - 1 downto 0);
        valid     : std_ulogic;
    end record;
    type uslave_out_vector is array (natural range <>) of uslave_out;

    function resolved(s : uslave_out_vector) return uslave_out;
    subtype slave_out is resolved uslave_out;

    function "or" (L, R : uslave_out) RETURN uslave_out;
    function or_reduce(a : uslave_out_vector) return uslave_out;
        
    alias umaster_out is uslave_in;
    alias umaster_in is uslave_out;
    alias master_in is slave_out;

    constant master_idle : umaster_out := (write_enable => '0', address => (others => '0'), write_data => (others => '0'));
    function master_read(a : address_word) return umaster_out;
    function master_read(a : natural range 0 to HIGHEST_ADDRESS) return umaster_out;
    function master_writeread(a : address_word; d : word) return umaster_out;
    function master_writeread(a : natural range 0 to HIGHEST_ADDRESS; d : word) return umaster_out;

    constant slave_idle : slave_out := (read_data => (others => '0'), valid => '0');
    function slave_data(d : word) return uslave_out;

end GBus;

library ieee;
use ieee.numeric_std.all;

package body GBus is
    function resolved(s : uslave_out_vector) return uslave_out is
        variable read_data : std_ulogic_vector(WORD_WIDTH - 1 downto 0) := (others => '0');
        variable valid_cnt : natural                                    := 0;
        variable valid     : std_ulogic                                 := '0';
    begin
        if (s'length = 1) then
            return s(s'low);
        else
            for i in s'range loop
                read_data := read_data or (s(i).read_data and s(i).valid);
                if (s(i).valid = '1') then
                    valid_cnt := valid_cnt + 1;
                end if;
            end loop;
            valid := '1' when (valid_cnt = 1) else '0';
            assert valid_cnt <= 1 report "multiple slaves writing to GBus";
            return (
                read_data => read_data,
                valid     => valid
            );
        end if;
    end resolved;
    
    function "or" (L, R : uslave_out) RETURN uslave_out is
    begin
        return resolved((L,R));
    end "or";
    
    function or_reduce(a : uslave_out_vector) return uslave_out is
    begin
        return resolved(a);
    end or_reduce;

    function master_read(a : address_word) return umaster_out is
    begin
        return (
            address      => a,
            write_data   => (others => '0'),
            write_enable => '0'
        );
    end master_read;

    function master_read(a : natural range 0 to HIGHEST_ADDRESS) return umaster_out is
    begin
        return master_read(address_word(to_unsigned(a, ADDRESS_WIDTH)));
    end master_read;

    function master_writeread(a : address_word; d : word) return umaster_out is
    begin
        return (
            address      => a,
            write_data   => d,
            write_enable => '1'
        );
    end master_writeread;

    function master_writeread(a : natural range 0 to HIGHEST_ADDRESS; d : word) return umaster_out is
    begin
        return master_writeread(address_word(to_unsigned(a, ADDRESS_WIDTH)), d);
    end master_writeread;

    function slave_data(d : word) return uslave_out is
    begin
        return (
            read_data => d,
            valid     => '1'
        );
    end slave_data;
end package body GBus;
