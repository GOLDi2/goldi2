library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std_unsigned.all;

entity ram is
    generic(
        address_width : natural := 8;
        data_width    : natural := 8
    );
    port(
        clk           : in  std_logic;
        rst           : in  std_logic;
        write_address : in  std_logic_vector(address_width - 1 downto 0);
        read_address  : in  std_logic_vector(address_width - 1 downto 0);
        write_en      : in  std_logic;
        din           : in  std_logic_vector(data_width - 1 downto 0);
        dout          : out std_logic_vector(data_width - 1 downto 0)
    );
end entity ram;

architecture RTL of ram is
    type mem_type is array ((2 ** address_width) - 1 downto 0) of std_logic_vector(data_width - 1 downto 0);
    signal mem : mem_type;
begin
    process(clk)
    begin
        if (rising_edge(clk)) then
            if (write_en) then
                mem(to_integer(write_address)) <= din;
            end if;
            dout <= mem(to_integer(read_address));
        end if;
    end process;
end architecture RTL;
