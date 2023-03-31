-------------------------------------------------------------------------------
-- Company: 		Technische Universität Ilmenau
-- Engineer: 		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/03/202
-- Design Name: 	Rom fifo for module configuration
-- Module Name: 	AXI_ROM_FIFO
-- Project Name: 	GOLDi_FPGA_CORE
-- Target Devices: 	LCMXO2-7000HC-4TG144C
-- Tool versions: 	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
library work;
use work.GOLDI_MODULE_CONFIG.all;



--! @brief
--! @details
--!
entity AXI_ROM_FIFO is
    generic(
        FIFO_WIDTH      :   natural := 8;
        FIFO_DEPTH      :   natural := 16;
        ROM             :   rom_type := (others=> (others => '0'))
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --Data
        m_read_tready   : in    std_logic;
        m_read_tvalid   : out   std_logic;
        m_read_tdata    : out   std_logic_vector(FIFO_WIDTH-1 downto 0)
    );
end entity AXI_ROM_FIFO;




--General architecture
architecture RTL of AXI_ROM_FIFO is

    --****Internal signals****
    --Memory pointer
    signal rd_pointer   :   natural range 0 to FIFO_DEPTH-1;
    signal memory_count :   natural range 0 to FIFO_DEPTH;
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
            if(index = 0) then
                return 0;
            else
                return index - 1;
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



    --****FIFO control****
    -----------------------------------------------------------------------------------------------
    PoINTER_CONTROL : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                rd_pointer <= FIFO_DEPTH-1;
            else
                rd_pointer <= getIndex(rd_pointer,m_read_tready,read_valid_i);
            end if;
        end if;
    end process;


    MEMORY_COUNTER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                memory_count <= FIFO_DEPTH;
            elsif(memory_count = 0) then
                memory_count <= 0;
            elsif(m_read_tready = '1' and read_valid_i = '1') then
                memory_count <= memory_count - 1;
            else null;
            end if;
        end if;
    end process;


    READ_VALID_FLAG : process(memory_count)
    begin
        if(memory_count = 0) then
            read_valid_i <= '0';
        else
            read_valid_i <= '1';
        end if;
    end process;

    m_read_tvalid <= read_valid_i;
    -----------------------------------------------------------------------------------------------


end RTL;