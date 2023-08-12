-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Basic memory unit - Register
-- Module Name:		REGISTER_UNIT
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V1.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V3.01.00 - Modification of reset 
-- Additional Comments: Change from synchronous to asynchronous reset
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! @brief Custom dual port single data register
--! @details
--! The REGISTER_UNIT is a dual port memory unit capable of storing a single
--! data word with a width defined by the SYSTEM_DATA_WIDTH parameter in the
--! GOLDI_COMM_STANDARD package. 
--!
--! The module allows the data interchange between the individual submodules 
--! building the GOLDi Model and the custom SPI master interface (SPI_TO_BUS).
--! The register counts with two independent ports: the custom BUS port and the 
--! internal data port.
--!
--! The custom BUS interface is an addressable port that can perform exclusive
--! write or read operations. A read operation returns the data present in the
--! "data_in" input and a write operation overwrites the data present on the 
--! "data_out" output. The custom BUS structure and its corresponding signals
--! are defined in the GOLDI_COMM_STANDARD package.
--!
--! The internal data port can perform simultaneous read and write operations.
--! Additionaly the "read_stb" and "write_stb" flags indicate write and read 
--! operations performed by the BUS port allowing for data flow control.
--!
--! The address and default values of the register can be configured using generic
--! parameters.
--!
--! **Latency: 1cyc**
entity REGISTER_UNIT is
    generic(
        ADDRESS     :   natural := 1;                   --! Register address 
        DEF_VALUE   :   data_word := reg_unit_default   --! Register reset value
    );
    port(
        --General
        clk         : in    std_logic;                  --! System clock 
        rst         : in    std_logic;                  --! Asynchronous reset
        --BUS interface     
        sys_bus_i   : in    sbus_in;                    --! BUS port input signals [we,adr,dat]
        sys_bus_o   : out   sbus_out;                   --! BUS port output signals [dat,valid]
        --Data interface
        data_in     : in    data_word;                  --! Data port write data - BUS port read data
        data_out    : out   data_word;                  --! Data port read data - BUS port write data
        read_stb    : out   std_logic;                  --! Read strobe signal indicates a read operation by the BUS port
        write_stb   : out   std_logic                   --! Write strobe signal indicates a wirte operation by the BUS port
    );
end entity REGISTER_UNIT;




--! General architecture
architecture RTL of REGISTER_UNIT is
begin

    READ_OPERATION : process(clk)
    begin
        if(rst = '1') then
            sys_bus_o <= gnd_sbus_o;
            read_stb  <= '0';

        elsif(rising_edge(clk)) then
            --Decode master bus interface (address and write enable)
            if(ADDRESS = to_integer(unsigned(sys_bus_i.adr)) and sys_bus_i.we = '0') then
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
        if(rst = '1') then
            data_out  <= DEF_VALUE;
            write_stb <= '1';

        elsif(rising_edge(clk)) then
            --Decode master bus interface (address and write enable)
            if(ADDRESS = to_integer(unsigned(sys_bus_i.adr)) and sys_bus_i.we = '1') then
                data_out  <= sys_bus_i.dat;
                write_stb <= '1';
            else
                write_stb <= '0';
            end if; 
        end if;
    end process;


end architecture;