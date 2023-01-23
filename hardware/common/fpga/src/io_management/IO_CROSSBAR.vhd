-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmai.com>
--
-- Create Date:		15/12/2022
-- Design Name:		IO Crossbar Structure
-- Module Name:		IO_CROSSBAR
-- Project Name:	GOLDIi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd;
--                  -> GOLDI_COMM_STANDARD.vhd;
--                  -> GOLDI_IO_STANDARD.vhd; 
--                  -> GOLDI_CROSSBAR_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom libraries
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




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
        LAYOUT_BLOCKED  :   boolean := false                                --! Block access to crossbar
    );
    port(
        --General
        clk         : in    std_logic;                                      --! System clock
        rst         : in    std_logic;                                      --! Synchronous reset
        --Communication
        cross_bus_i : in    sbus_in;                                        --! BUS slave input signals [we,adr,dat] 
        cross_bus_o : out   sbus_out;                                       --! BUS slave output signals [dat,val]
        --Virtual io pin interface
        vir_io_in   : out   io_i_vector(VIRTUAL_PIN_NUMBER-1 downto 0);     --! Virtual data in vector
        vir_io_out  : in    io_o_vector(VIRTUAL_PIN_NUMBER-1 downto 0);     --! Virtual data out vector
        --Physical io pin interface
        phy_io_in   : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);    --! Physical data in vector
        phy_io_out  : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)     --! Physical data out vector
    );
end entity IO_CROSSBAR;




--! General architecture
architecture RTL of IO_CROSSBAR is
    
    --Intermediate signals
    --RAM
    signal ram_phy_io_layout    :   phy_io_layout;
    signal ram_vir_io_layout    :   vir_io_layout;
    --RAM address
    constant min_address        :   unsigned(BUS_ADDRESS_WIDTH-1 downto 0)
                                    := to_unsigned(2,BUS_ADDRESS_WIDTH);
    constant max_address        :   unsigned(BUS_ADDRESS_WIDTH-1 downto 0)
                                    := to_unsigned(PHYSICAL_PIN_NUMBER+2,BUS_ADDRESS_WIDTH);


begin


    --Main routing
    ROUTING_SYSTEM_OUTPUTS : for i in 0 to PHYSICAL_PIN_NUMBER-1 generate
        phy_io_out(i) <= vir_io_out(to_integer(ram_phy_io_layout(i))); 
    end generate;

    ROUTING_SYSTEM_INPUTS : for i in 0 to VIRTUAL_PIN_NUMBER-1 generate
        vir_io_in(i) <= phy_io_in(to_integer(ram_vir_io_layout(i)));
    end generate;



    LAYOUT_WRITE : process(clk)
        variable index      :   natural := 0;
        variable vir_value  :   unsigned(BUS_ADDRESS_WIDTH-1 downto 0) := (others => '0');
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                --Load ram with predefined layout
                ram_phy_io_layout <= DEFAULT_IO_LAYOUT;
				
				ram_vir_io_layout <= (others => (others => '0'));
                for i in 0 to PHYSICAL_PIN_NUMBER-1 loop
                    index := to_integer(DEFAULT_IO_LAYOUT(i));
                    vir_value := to_unsigned(i,BUS_ADDRESS_WIDTH); 

                    ram_vir_io_layout(index) <= vir_value;
                end loop;
            
            elsif((min_address <= unsigned(cross_bus_i.adr)) and
                  (unsigned(cross_bus_i.adr) <= max_address) and
                  (cross_bus_i.we = '1') and (LAYOUT_BLOCKED = false)) then

                index := to_integer(unsigned(cross_bus_i.adr))-2;
                ram_phy_io_layout(index) <= unsigned(cross_bus_i.dat);
                ram_vir_io_layout(to_integer(unsigned(cross_bus_i.dat))) <= to_unsigned(index,BUS_ADDRESS_WIDTH);

            else
                index := 0;
            end if;
        end if;
    end process;
    
    

    LAYOUT_READ : process(clk)
        variable index  :   natural := 0;
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                cross_bus_o.dat <= (others => '0');
                cross_bus_o.val <= '0';

            elsif((min_address <= unsigned(cross_bus_i.adr)) and
                  (unsigned(cross_bus_i.adr) <= max_address) and
                  (cross_bus_i.we = '0')) then

                index := to_integer(unsigned(cross_bus_i.adr))-2;
                cross_bus_o.dat <= std_logic_vector(ram_phy_io_layout(index));
                cross_bus_o.val <= '1';

            else
                index := 0;
                cross_bus_o.dat <= (others => '0');
                cross_bus_o.val <= '0';
            end if;
        end if;
    end process;


end architecture;