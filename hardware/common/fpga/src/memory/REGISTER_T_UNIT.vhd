-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		20/08/2023
-- Design Name:		Basic memory unit with tagged data
-- Module Name:		REGISTER_T_UNIT
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! @brief Custom dual port single data word register with tagged data
--! @details
--! The REGISTER_T_UNIT is a dual port memory unit capable of storing a single
--! data word with a width defined by the SYSTEM_DATA_WIDTH parameter and the
--! corresponding tag word with a width defined by the BUS_TAG_BITS parameter.
--! The constant parameters are defined in the GOLDI_COMM_STANDARD package.
--!
--! The module allows the data interchange between the individual submodules 
--! in the GOLDi Board Models and the custom SPI master interface 
--! (GOLDI_SPI_SMODULE). The register counts with two independent ports: the 
--! custom BUS port and the internal data port.
--!
--! The custom BUS interface is an addressable port that can perform exclusive
--! write or read operations. A read operation returns the data present in the
--! "p_data_in" and "p_tag_in" inputs and a write operation overwrites the data 
--! present on the "p_data_out" and "p_tag_out" outputs. The custom BUS structure
--! and its corresponding signals are defined in the GOLDI_COMM_STANDARD package.
--!
--! The internal data port can perform simultaneous read an write operations.
--! Additionaly the "p_read_stb" and "p_write_stb" flags indicate write and read
--! operations performed by the BUS port when the transfer is validated allowing
--! data flow control.
--!
--! The address and default values of the register can be configured using generic 
--! parameters.
--!
--! **Latency: 1cyc**
entity REGISTER_T_UNIT is
    generic(
        g_address       :   natural   := 1;                     --! Register address
        g_def_dvalue    :   data_word := reg_unit_d_default;    --! Register data reset value
        g_def_tvalue    :   tag_word  := reg_unit_t_default     --! Register tag reset value
    );
    port(
        --General
        clk             : in    std_logic;                      --! System clock
        rst             : in    std_logic;                      --! Asynchronous reset
        --BUS interface
        sys_bus_i       : in    sbus_in;                        --! BUS port input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;                       --! BUS port output signals [dat,tag,mux]
        --Data interface
        p_data_in       : in    data_word;                      --! Data port write data - BUS port read data
        p_tag_in        : in    tag_word;                       --! Data port write tag  - BUS port read tag
        p_data_out      : out   data_word;                      --! Data port read data - BUS port write data
        p_tag_out       : out   tag_word;                       --! Data port read tag  - BUS port write tag
        p_read_stb      : out   std_logic;                      --! Read strobe signal indicates a valid read operation by the BUS port
        p_write_stb     : out   std_logic                       --! Write strobe signal indicates a valid write operation by the BUS port
    );
end entity REGISTER_T_UNIT;




--! General architecture
architecture RTL of REGISTER_T_UNIT is
begin

    READ_OPERATION : process(clk,rst)
        variable bus_address    :   integer;
    begin
        if(rst = '1') then
            sys_bus_o  <= gnd_sbus_o;
            p_read_stb <= '0';

        elsif(rising_edge(clk)) then
            --Typecast bus address to decode
            bus_address := to_integer(unsigned(sys_bus_i.adr));

            --Decode master bus interface and drive response
            if(sys_bus_i.we = '0' and sys_bus_i.stb = '1' and bus_address = g_address) then
                sys_bus_o.dat <= p_data_in;
                sys_bus_o.tag <= p_tag_in;
                sys_bus_o.mux <= '1';
                p_read_stb    <= '1';
            elsif(sys_bus_i.we = '0' and bus_address = g_address) then
                sys_bus_o.dat <= p_data_in;
                sys_bus_o.tag <= p_tag_in;
                sys_bus_o.mux <= '1';
                p_read_stb    <= '0';
            else
                sys_bus_o  <= gnd_sbus_o;
                p_read_stb <= '0';
            end if;
        end if;
    end process;



    WRITE_OPERATION : process(clk,rst)
        variable bus_address    :   integer;
    begin
        if(rst = '1') then
            p_data_out  <= g_def_dvalue;
            p_tag_out   <= g_def_tvalue;
            p_write_stb <= '1';
        
        elsif(rising_edge(clk)) then
            --Typecast bus address to decode
            bus_address := to_integer(unsigned(sys_bus_i.adr));

            --Decode master bus interface and drive response
            if(sys_bus_i.we = '1' and sys_bus_i.stb = '1' and bus_address = g_address) then
                p_data_out  <= sys_bus_i.dat;
                p_tag_out   <= sys_bus_i.tag;
                p_write_stb <= '1';
            else
                p_write_stb <= '0';
            end if;

        end if;
    end process;


end architecture;