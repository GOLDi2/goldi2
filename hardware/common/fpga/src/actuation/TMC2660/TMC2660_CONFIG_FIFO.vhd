-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Configuration FIFO for initial configuration of chips
-- Module Name:		CONFIGURATION_FIFO
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_DATA_TYPES.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Custom packages
library work;
use work.GOLDI_DATA_TYPES.all;




--! @brief Configuration loading module for initialization of TMC2660 (V3.00.00)
--! @details
--! The TMC2660_CONFIG_FIFO is used to load the default configuration of the TMC2660
--! after reset or initialization. The default configuration is set through the "ROM"
--! parameter, which consists of a list of 24-bit data words formatted as register
--! data (see TMC2660 datasheet).
--!
--! After the reset signal has been asserted the module enables the valid flag. A
--! ready/valid handsake is needed for the data to be transfered. Once the list is
--! empty the valid flag is grounded until a new reset occurs.
--!
--! ***Latency: 1cyc***
entity TMC2660_CONFIG_FIFO is
    generic(
        ROM             :   tmc2660_rom := (x"00000F",x"00000F",x"00000F")  --! TMC2660 default configuration
    );
    port(
        --General
        clk             : in    std_logic;                                  --! System clock
        rst             : in    std_logic;                                  --! Synchronous reset
        --Data
        m_read_tready   : in    std_logic;                                  --! Configuration data - ready flag
        m_read_tvalid   : out   std_logic;                                  --! Configuration data - valid flag
        m_read_tdata    : out   std_logic_vector(23 downto 0)               --! Configuration data - data
    );
end entity TMC2660_CONFIG_FIFO;




--! General architecture
architecture RTL of TMC2660_CONFIG_FIFO is

    --****INTERAL SIGNALS****
    --Memory pointer
    constant ROM_DEPTH  :   natural := ROM'length;
    signal rd_pointer   :   natural range 0 to ROM_DEPTH-1;
    signal memory_count :   natural range 0 to ROM_DEPTH;
    --Flags
    signal read_valid_i :   std_logic;


    --****Function****
    function getIndex(
        index   :   natural;
        ready   :   std_logic;
        valid   :   std_logic
    ) return natural is
    begin
        if(ready = '1' and valid = '1') then
            if(index = ROM_DEPTH-1) then
                return ROM_DEPTH-1;
            else
                return index + 1;
            end if;
        end if;
		
		return index;
    end function;


begin

    --****ROM****
    -----------------------------------------------------------------------------------------------
    ROM_CONTROL : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                m_read_tdata <= (others => '0');
            else
                m_read_tdata <= ROM(getIndex(rd_pointer,m_read_tready,read_valid_i));
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****FIFO Control****
    -----------------------------------------------------------------------------------------------
    POINTER_CONTROL : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                rd_pointer <= 0;
            else
                rd_pointer <= getIndex(rd_pointer,m_read_tready,read_valid_i);
            end if;
        end if;
    end process;


    MEMORY_COUTNER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                memory_count <= 0;
            elsif(memory_count <= ROM_DEPTH and m_read_tready = '1' and read_valid_i = '1') then
                memory_count <= memory_count + 1;
            else null;
            end if;
        end if;
    end process;


    READ_VALID_FLAG : process(rst,memory_count)
    begin
        if(rst = '1') then
            read_valid_i <= '0';
        elsif(memory_count = ROM_DEPTH) then
            read_valid_i <= '0';
        else
            read_valid_i <= '1';
        end if; 
    end process;
    m_read_tvalid <= read_valid_i;
    -----------------------------------------------------------------------------------------------


end RTL;
