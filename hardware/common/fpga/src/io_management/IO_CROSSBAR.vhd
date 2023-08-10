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
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_CROSSBAR_DEFAULT.all;




--! @brief Crossbar structure for IO data
--! @details
--! Crossbar structure for IO simplified IO data routing
--! The crossbar configuration can be accessed through the cross_bus
--! which follows the same conventions as the sys_bus. The virtual
--! io data represents the data generated or used by dsp modules inside
--! the fpga while the physical io data is the incomming or outgoing
--! data from the FPGA pins.
--!
--! The default layout of the crossbar is to be defined in the
--! GOLDI_MODULE_CONFIG package. Changes to the layout can be performed
--! when the LAYOUT_BLOCKED parameter is false.
--! 
--! #### Cross_bus :
--! |we     |adr                    |data                   |
--! |:------|:---------------------:|:----------------------|
--! |1/0    |physical_pin_index +2  |virtual_pin_index      |
--!
--! *Example:* Physical pin 0 changes form virtual pin 1 to virtual pin 2                           
--! 
--! |we     |adr                    |data                   |
--! |:------|:---------------------:|:----------------------|
--! |1      |2                      |2                      |
entity IO_CROSSBAR is
    generic(
        LEFT_PORT_LENGTH    :   natural := 6;                                   --! Left Crossbar port - System IO Interface
        RIGHT_PORT_LENGTH   :   natural := 3;                                   --! Right Crossbar port - FPGA Pin Interface
        LAYOUT_BLOCKED      :   boolean := false;                               --! Block access to crossbar
        DEFAULT_CB_LAYOUT   :   cb_right_port_ram := DEFAULT_CROSSBAR_LAYOUT    --! Default crossbar configuration
    );
    port(
        --General
        clk                 : in    std_logic;                                  --! System clock
        rst                 : in    std_logic;                                  --! Synchronous reset
        --Communication
        cb_bus_i            : in    sbus_in;                                    --! BUS slave input signals [we,adr,dat] 
        cb_bus_o            : out   sbus_out;                                   --! BUS slave output signals [dat,val]
        --System io pin interface
        left_io_i_vector    : out   io_i_vector(LEFT_PORT_LENGTH-1 downto 0);   --! Virtual data in vector
        left_io_o_vector    : in    io_o_vector(LEFT_PORT_LENGTH-1 downto 0);   --! Virtual data out vector
        --FPGA pin interface
        right_io_i_vector   : in    io_i_vector(RIGHT_PORT_LENGTH-1 downto 0);  --! Physical data in vector
        right_io_o_vector   : out   io_o_vector(RIGHT_PORT_LENGTH-1 downto 0)   --! Physical data out vector
    );
end entity IO_CROSSBAR;




--! General architecture
architecture RTL of IO_CROSSBAR is

    --****INTERNAL SIGNALS****
    --RAM Address
    constant min_adr    :   unsigned(BUS_ADDRESS_WIDTH-1 downto 0)
        := to_unsigned(2,BUS_ADDRESS_WIDTH);
    constant max_adr    :   unsigned(BUS_ADDRESS_WIDTH-1 downto 0)
        := to_unsigned(RIGHT_PORT_LENGTH+2,BUS_ADDRESS_WIDTH);
    --Crossbar Matrix
    signal ram_left_port_layout     :   cb_left_port_ram(LEFT_PORT_LENGTH-1 downto 0);
    signal ram_right_port_layout    :   cb_right_port_ram(RIGHT_PORT_LENGTH-1 downto 0);
    


begin

    --****Crossbar Routing****
    -----------------------------------------------------------------------------------------------
    LEFT_PORT_ROUTING : for i in 0 to LEFT_PORT_LENGTH-1 generate
        left_io_i_vector(i) <= right_io_i_vector(to_integer(ram_left_port_layout(i)));
    end generate;

    RIGHT_PORT_ROUTING : for i in 0 to RIGHT_PORT_LENGTH-1 generate
        right_io_o_vector(i) <= left_io_o_vector(to_integer(ram_right_port_layout(i)));
    end generate;
    -----------------------------------------------------------------------------------------------




    --****Layout Modification****
    -----------------------------------------------------------------------------------------------
    LAYOUT_READ : process(clk)
        variable index  :   integer;
    begin
        if(rising_edge(clk)) then
            --Decode bus address
            index := to_integer(unsigned(cb_bus_i.adr))-2;
            
            if(rst = '1') then
                cb_bus_o <= gnd_sbus_o;
            elsif((min_adr <= unsigned(cb_bus_i.adr)) and 
                  (unsigned(cb_bus_i.adr) <= max_adr) and
                  (cb_bus_i.we = '0'))                then
                --Return the configuration of the FPGA Pin interface
                cb_bus_o.dat <= std_logic_vector(ram_right_port_layout(index));
                cb_bus_o.val <= '1';
            else
                cb_bus_o <= gnd_sbus_o;                    
            end if;

        end if;
    end process;



    LAYOUT_WRITE : process(clk)
        variable index          :   integer;
    begin
        if(rising_edge(clk)) then
            --Decode bus address
            index := to_integer(unsigned(cb_bus_i.adr))-2;
            
            if(rst = '1') then
                --Load ram with predefined layout
                --Right port ram uses predefined layout 
                ram_right_port_layout <= DEFAULT_CB_LAYOUT;
                
                --Left port extracts layout form right port
                ram_left_port_layout <= (others => (others => '0'));
                for i in 0 to RIGHT_PORT_LENGTH-1 loop
                    ram_left_port_layout(to_integer(DEFAULT_CB_LAYOUT(i))) 
                        <= to_unsigned(i,BUS_ADDRESS_WIDTH);
                end loop;

            elsif((min_adr <= unsigned(cb_bus_i.adr))   and
                  (unsigned(cb_bus_i.adr) <= max_adr)   and
                  (cb_bus_i.we = '1')                   and
                  (LAYOUT_BLOCKED = false))             then
                --Write bus data to right port configuration and 
                --addres to left port configuration
                ram_right_port_layout(index) <= unsigned(cb_bus_i.dat);
                ram_left_port_layout(to_integer(unsigned(cb_bus_i.dat)))
                    <= unsigned(cb_bus_i.adr)-2;

            else null;            
            end if;

        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;