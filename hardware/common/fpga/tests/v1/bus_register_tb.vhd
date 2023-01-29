library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

use work.GBus;
use work.bus_register;

entity bus_register_tb is
end bus_register_tb;

architecture behaviour of bus_register_tb is
    constant period : time := 50 ns;
    signal clk      : std_ulogic;
    signal rst      : std_ulogic;
    signal bus_in   : GBus.uslave_in;
    signal bus_out  : GBus.slave_out;
    signal input    : GBus.word;
    signal output   : GBus.word;

    signal run_sim : boolean := true;
begin
    bus_register_inst : entity bus_register
        generic map(
            address => 5
        )
        port map(
            clk     => clk,
            rst     => rst,
            bus_in  => bus_in,
            bus_out => bus_out,
            input   => input,
            output  => output
        );
        
    gen_bus_register_inst : for i in 10 to 20 generate
        reg_inst: entity bus_register
        generic map(
            address => i
        )
        port map(
            clk     => clk,
            rst     => rst,
            bus_in  => bus_in,
            bus_out => bus_out,
            input   => std_logic_vector(to_unsigned(i, 8)),
            output  => open
        );
    end generate gen_bus_register_inst;
    

    clock_driver : process
    begin
        clk <= '0';
        wait for period / 2;
        clk <= '1';
        wait for period / 2;
        if not run_sim then
            wait;
        end if;
    end process clock_driver;
    rst <= '1' after period, '0' after 2 * period;

    test : process
    begin
        wait for 3 * period;
        -- test read
        for i in 0 to 255 loop
            input  <= std_logic_vector(to_unsigned(i, 8));
            bus_in <= GBus.master_read(5);
            wait for period;
            assert bus_out.read_data = input;
            assert output = "00000000";
            wait for period;
        end loop;
        -- test write
        for i in 0 to 255 loop
            input  <= "00000000";
            bus_in <= GBus.master_writeread(5, std_logic_vector(to_unsigned(i, 8)));
            wait for period;
            assert bus_out.read_data = input;
            assert output = std_logic_vector(to_unsigned(i, 8));
            wait for period;
        end loop;
        -- test different addresses
        for i in 10 to 20 loop
            bus_in <= GBus.master_read(i);
            wait for period;
            assert bus_out.read_data = std_logic_vector(to_unsigned(i, 8));
            wait for period;
        end loop;
        run_sim <= false;
        wait;
    end process test;

end architecture behaviour;
