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
-- Revision V4.00.00 - Extension of BUS protocol and reset change
-- Additional Comments: Change from synchronous to asynchronous reset and
--                      introduction of "stb" signal to the GOLDi BUS 
--                      interface to prevent continuous read and write 
--                      operations. Addition of tags to the BUS interfaces
--                      to extend BUS flexibility
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! @brief Custom dual port single data word register
--! @details
--! The REGISTER_UNIT is a dual port memory unit capable of storing a single
--! data word with a width defined by the SYSTEM_DATA_WIDTH parameter in the
--! GOLDI_COMM_STANDARD package. 
--!
--! The module allows the data interchange between the individual submodules 
--! in the GOLDi Board Models and the custom SPI master interface 
--! (GOLDI_SPI_SMODULE).The register counts with two independent ports: the 
--! custom BUS port and the internal data port.
--!
--! The custom BUS interface is an addressable port that can perform exclusive
--! write or read operations. A read operation returns the data present in the
--! "data_in" input and a write operation overwrites the data present on the 
--! "data_out" output. The custom BUS structure and its corresponding signals
--! are defined in the GOLDI_COMM_STANDARD package.
--!
--! The internal data port can perform simultaneous read an write operations.
--! Additionaly the "read_stb" and "write_stb" flags indicate write and read
--! operations performed by the BUS port when the transfer is validated allowing
--! data flow control.
--!
--! The address and default values of the register can be configured using generic
--! parameters.
--!
--! **Latency: 1cyc**
entity REGISTER_UNIT is
    generic(
        ADDRESS     :   natural := 1;                   --! Register address 
        DEF_VALUE   :   data_word := reg_unit_d_default --! Register reset value
    );
    port(
        --General
        clk         : in    std_logic;                  --! System clock 
        rst         : in    std_logic;                  --! Asynchronous reset
        --BUS interface     
        sys_bus_i   : in    sbus_in;                    --! BUS port input signals [stb,we,adr,dat,tag]
        sys_bus_o   : out   sbus_out;                   --! BUS port output signals [dat,tag]
        --Data interface
        data_in     : in    data_word;                  --! Data port write data - BUS port read data
        data_out    : out   data_word;                  --! Data port read data - BUS port write data
        read_stb    : out   std_logic;                  --! Read strobe signal indicates a valid read operation by the BUS port
        write_stb   : out   std_logic                   --! Write strobe signal indicates a valid write operation by the BUS port
    );
end entity REGISTER_UNIT;




--! General architecture
architecture RTL of REGISTER_UNIT is
begin

    READ_OPERATION : process(clk,rst)
        variable bus_address    :   integer;
    begin
        if(rst = '1') then
            sys_bus_o <= gnd_sbus_o;
            read_stb  <= '0';

        elsif(rising_edge(clk)) then
            --Typecast bus address to decode
            bus_address := to_integer(unsigned(sys_bus_i.adr));

            --Decode master bus interface and drive response
            if(sys_bus_i.we = '0' and sys_bus_i.stb = '1' and bus_address = ADDRESS) then
                sys_bus_o.dat <= data_in;
                sys_bus_o.tag <= (others => '0');
                read_stb      <= '1';
            elsif(sys_bus_i.we = '0' and bus_address = ADDRESS) then
                sys_bus_o.dat <=  data_in;
                sys_bus_o.tag <= (others => '0');
                read_stb      <= '0';
            else
                sys_bus_o     <= gnd_sbus_o;
                read_stb      <= '0';
            end if;

        end if;
    end process;



    WRITE_OPERATION : process(clk,rst)
        variable bus_address    :   integer;
    begin
        if(rst = '1') then
            data_out  <= DEF_VALUE;
            write_stb <= '1';

        elsif(rising_edge(clk)) then
            --Typecast bus address to decode
            bus_address := to_integer(unsigned(sys_bus_i.adr));

            --Decode master bus interface and drive response
            if(sys_bus_i.we = '1' and sys_bus_i.stb = '1' and bus_address = ADDRESS) then
                data_out  <= sys_bus_i.dat;
                write_stb <= '1';
            else
                write_stb <= '0';
            end if;

        end if;
    end process;

    
end architecture;