-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmai.com>
--
-- Create Date:		15/04/2023
-- Design Name:		IO Crossbar Structure
-- Module Name:		IO_CROSSBAR
-- Project Name:	GOLDIi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd;
--                  -> GOLDI_IO_STANDARD.vhd; 
--                  -> GOLDI_CROSSBAR_DEFAULT.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V4.00.00 - Modification to reset type and process
-- Additional Comments: Change from synchronous to asynchronous reset.
--                      Changes to the generic ana port signal names.
--                      Introduction of "g_default_left_layout" parameter
--                      to simplify the reset process
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_CROSSBAR_STANDARD.all;




--! @brief Crossbar structure for GOLDi tri-state IO signals
--! @details
--! The crossbar structure for IO tri-state IO signals allows a GOLDi Board Model
--! to perform multiple functions for a selected subgrup of FPAG pins. The stucture
--! allows multiple GOLDi sub-modules to access the data present on a pin simultanously
--! and also to drive the tri-state pin.
--! 
--! The crossbar works by storing two matrices containing the correspondance between
--! left and right ports. The first matrix, the "left_port_layout" contain the routing
--! of FPGA input data. The second matrix the "right_port_layout" contains the routing
--! of the internal system output data.
--!
--! The dimensions of the crossbar structure are set by the "g_left_port_length" and 
--! "g_right_port_length" parameters under the assumtion that the left side is always
--! larger or equal to the right side. The right side pin number then equals a value
--! in the range [0:g_right_port_length-1] and the equally the left pin number equals
--! a value in the range [0:g_left_port_length-1]. The default layout of the crossbar
--! after reset is given by the "g_default_left_layout" and the "g_default_right_layout"
--! parameters defined in the GOLDI_CORSSBAR_STANDARD package. 
--!
--! The configuration of the crossbar i.e. the matices contents can be modified through
--! a crossbar BUS structure. The BUS interface is the same as the GOLDi BUS standard,
--! however the data is interpreted differently. The crossbar BUS interprets the "adr"
--! vector as the right pin number and the "dat" vector as the corresponding left pin
--! to be connected. To ensure that a control register can be used to multiplex multiple
--! instances of the crossbar the right pin number has been offset by 2.
--!
--! #### Crossbar BUS :
--! |we     |adr                    |data                   |
--! |:------|:---------------------:|:----------------------|
--! |1/0    |right_pin_index +2  |virtual_pin_index      |
--!
--! *Example:* Physical pin 0 changes form virtual pin 1 to virtual pin 2                           
--! 
--! |we     |adr                    |data                   |
--! |:------|:---------------------:|:----------------------|
--! |1      |2                      |2                      |
entity IO_CROSSBAR is
    generic(
        g_left_port_length      :   natural := TB_CB_LEFT_SIZE;                         --! Length of the crossbar's left side port
        g_right_port_length     :   natural := TB_CB_RIGHT_SIZE;                        --! Length of the crossbar's right side port
        g_default_left_layout   :   cb_left_port_ram  := TB_DEFAULT_LEFT_CB_LAYOUT;     --! Default layout for input data
        g_default_right_layout  :   cb_right_port_ram := TB_DEFAULT_RIGHT_CB_LAYOUT     --! Defualt layout for output data
    );
    port(
        --General
        clk                     : in    std_logic;                                      --! System clock
        rst                     : in    std_logic;                                      --! Asynchronous reset
        --Communication
        cb_bus_i                : in    sbus_in;                                        --! Crossbar BUS input signals [stb,we,adr,dat,tag]
        cb_bus_o                : out   sbus_out;                                       --! Crossbar BUS output signal [dat,tag]
        --Internal system io pin interface
        left_io_i_vector        : out   io_i_vector(g_left_port_length-1 downto 0);     --! Internal system input signals
        left_io_o_vector        : in    io_o_vector(g_left_port_length-1 downto 0);     --! Internal system output signals
        --FPGA pin interface
        right_io_i_vector       : in    io_i_vector(g_right_port_length-1 downto 0);    --! FPGA pin input signals 
        right_io_o_vector       : out   io_o_vector(g_right_port_length-1 downto 0)     --! FPGA pin output signals
    );
end entity IO_CROSSBAR;




--! General architecture
architecture RTL of IO_CROSSBAR is

    --****INTERNAL SIGNALS****
    --RAM Address
    constant c_min_adr  :   unsigned(BUS_ADDRESS_WIDTH-1 downto 0) := 
        to_unsigned(2,BUS_ADDRESS_WIDTH);
    constant c_max_adr  :   unsigned(BUS_ADDRESS_WIDTH-1 downto 0) := 
        to_unsigned(g_right_port_length+2,BUS_ADDRESS_WIDTH);
    --Crossbar Matrix
    signal ram_left_port_layout     :   cb_left_port_ram(g_left_port_length-1 downto 0);
    signal ram_right_port_layout    :   cb_right_port_ram(g_right_port_length-1 downto 0);


begin

    --****CROSSBAR ROUTING****
    -----------------------------------------------------------------------------------------------
    LEFT_PORT_ROUTING : for i in 0 to g_left_port_length-1 generate
        left_io_i_vector(i) <= right_io_i_vector(to_integer(ram_left_port_layout(i)));
    end generate;

    RIGHT_PORT_ROUTING : for i in 0 to g_right_port_length-1 generate
        right_io_o_vector(i) <= left_io_o_vector(to_integer(ram_right_port_layout(i)));
    end generate;
    -----------------------------------------------------------------------------------------------



    --****LAYOUT MODIFICATION CONTROL****
    -----------------------------------------------------------------------------------------------
    READ_LAYOUT : process(clk,rst)
        variable index  :   integer;
    begin
        if(rst = '1') then
            cb_bus_o <= gnd_sbus_o;

        elsif(rising_edge(clk)) then
            if((c_min_adr <= unsigned(cb_bus_i.adr))  and 
               (unsigned(cb_bus_i.adr) < c_max_adr)   and
               (cb_bus_i.we = '0'))                 then

                --Decode BUS address
                index := to_integer(unsigned(cb_bus_i.adr))-2;
                --Return the configuration of the FPGA Pin interface
                cb_bus_o.dat <= std_logic_vector(ram_right_port_layout(index));
                cb_bus_o.tag <= (others => '0');

            else
                cb_bus_o <= gnd_sbus_o;
            end if;

        end if;
    end process;


    WRITE_LAYOUT : process(clk,rst)
        variable index  :   integer;
    begin
        if(rst = '1') then
            ram_left_port_layout  <= g_default_left_layout;
            ram_right_port_layout <= g_default_right_layout;

        elsif(rising_edge(clk)) then
            if((c_min_adr <= unsigned(cb_bus_i.adr))  and
               (unsigned(cb_bus_i.adr) < c_max_adr)   and
               (cb_bus_i.we = '1')                    and
               (cb_bus_i.stb = '1'))                  then
            
                --Decode BUS address
                index := to_integer(unsigned(cb_bus_i.adr))-2;
                --Write BUS "dat" to right port configuration and "adr" to left port configuration
                ram_right_port_layout(index) <= unsigned(cb_bus_i.dat);
                ram_left_port_layout(to_integer(unsigned(cb_bus_i.dat))) <= unsigned(cb_bus_i.adr)-2;
        
            else null;
            end if;

        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;