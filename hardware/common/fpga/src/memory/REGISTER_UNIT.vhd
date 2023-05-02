-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Basic memory unit - register
-- Module Name:		REGISTER_UNIT
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! @brief
--! @details
--!
entity REGISTER_UNIT is
    generic(
        ADDRESS     :   natural := 1;
        DEF_VALUE   :   data_word := (others => '0')
    );
    port(
        --General
        clk         : in    std_logic;
        rst         : in    std_logic;
        --BUS interface
        sys_bus_i   : in    sbus_in;
        sys_bus_o   : out   sbus_out;
        --Data interface
        data_in     : in    data_word;
        data_out    : out   data_word;
        read_stb    : out   std_logic;
        write_stb   : out   std_logic
    );
end entity REGISTER_UNIT;




--!General architecture
architecture RTL of REGISTER_UNIT is
begin

    READ_OPERATION : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                sys_bus_o <= gnd_sbus_o;
                read_stb  <= '0';

            elsif(ADDRESS = to_integer(unsigned(sys_bus_i.adr)) and sys_bus_i.we = '0') then
                sys_bus_o.dat <= data_in;
                sys_bus_o.val <= '1';
                read_stb      <= '1';
            
            else
                sys_bus_o <= gnd_sbus_o;
                read_stb  <= '0';
            end if;
        end if;
    end process;



    WRITE_OPERATION : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                data_out  <= DEF_VALUE;
                write_stb <= '1';

            elsif(ADDRESS = to_integer(unsigned(sys_bus_i.adr)) and sys_bus_i.we = '1') then
                data_out  <= sys_bus_i.dat;
                write_stb <= '1';

            else
                write_stb <= '0';
            end if; 
        end if;
    end process;


end architecture;