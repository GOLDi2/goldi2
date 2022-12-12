library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity synchronizer_array is
    generic(
        stages : natural := 2;
        synchronizer_cnt: positive
    );
    port(
        clk : in std_logic;
        rst : in std_logic;
        bit  : in  std_logic_vector(synchronizer_cnt-1 downto 0);
        sync : out std_logic_vector(synchronizer_cnt-1 downto 0)
    );
end entity synchronizer_array;

architecture RTL of synchronizer_array is
    
begin
    generate_synchronizer : for i in synchronizer_cnt-1 downto 0 generate
        synchronizer_inst : entity work.synchronizer
            generic map(
                stages => stages
            ) 
            port map(
                clk  => clk,
                rst  => rst,
                bit  => bit(i),
                sync => sync(i)
            ) ;
        
    end generate generate_synchronizer;
    
end architecture RTL;
