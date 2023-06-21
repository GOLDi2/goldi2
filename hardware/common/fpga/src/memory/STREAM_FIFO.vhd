-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Dynamic FIFO Structure for data stream queuing 
-- Module Name:		STREAM_FIFO
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:    none
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief
--! @details
--!
entity STREAM_FIFO is
    generic(
        FIFO_WIDTH      :   natural := 16;
        FIFO_DEPTH      :   natural := 16
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --Data
        s_write_tready  : out   std_logic;
        s_write_tvalid  : in    std_logic;
        s_write_tdata   : in    std_logic_vector(FIFO_WIDTH-1 downto 0);        
        m_read_tready   : in    std_logic;
        m_read_tvalid   : out   std_logic;
        m_read_tdata    : out   std_logic_vector(FIFO_WIDTH-1 downto 0)        
    );
end entity STREAM_FIFO;




--! General architecture
architecture RTL of STREAM_FIFO is

    --****INTERNAL SIGNALS****
    --Memory
    type ram_type is array(FIFO_DEPTH-1 downto 0) of std_logic_vector(FIFO_WIDTH-1 downto 0);
    signal memory       :   ram_type;
    --Memory pointers
    signal wr_pointer       :   natural range 0 to FIFO_DEPTH-1;
    signal rd_pointer       :   natural range 0 to FIFO_DEPTH-1;
    signal memory_count     :   natural range 0 to FIFO_DEPTH;
    signal memory_count_1   :   natural range 0 to FIFO_DEPTH;
    --Flags
    signal write_ready_i    :   std_logic;
    signal read_valid_i     :   std_logic;
    signal read_write_valid :   std_logic;


    --****Functions****
    function getIndex(
        index   :   natural;
        ready   :   std_logic;
        valid   :   std_logic
    ) return natural is
    begin
        if(ready = '1' and valid = '1') then
            if(index = FIFO_DEPTH-1) then
                return 0;
            else
                return index + 1;
            end if;
        end if;

        return index;
    end function;


begin

    --****RAM****
    -----------------------------------------------------------------------------------------------
    FIFO_RAM : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                memory <= (others => (others => '0'));
            elsif(write_ready_i = '1' and s_write_tvalid = '1') then
                memory(wr_pointer) <= s_write_tdata;
            else null;
            end if;

            m_read_tdata <= memory(getIndex(rd_pointer,m_read_tready,read_valid_i));
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****FIFO control****
    -----------------------------------------------------------------------------------------------
    --Update write and read pointers to output input/output data to ram
    POINTER_CONTROL : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                rd_pointer <= 0;
                wr_pointer <= 0;
            else
                wr_pointer <= getIndex(wr_pointer,write_ready_i,s_write_tvalid);
                rd_pointer <= getIndex(rd_pointer,m_read_tready,read_valid_i);
            end if;
        end if;
    end process;


    MEMORY_COUNTER : process(clk)
        variable counter    :   natural range 0 to FIFO_DEPTH;
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                counter := 0;
            else
                if(write_ready_i = '1' and s_write_tvalid = '1') then
                    counter := counter + 1;
                end if;

                if(m_read_tready = '1' and read_valid_i = '1') then
                    counter := counter - 1;
                end if;
            end if;
        end if;

        memory_count <= counter;
    end process;


    MEMORY_COUTER_DELAY : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                memory_count_1 <= 0;
            else
                memory_count_1 <= memory_count;
            end if;
        end if;
    end process;


    READ_WRITE_FLAG : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then  
                read_write_valid <= '0';
            elsif(write_ready_i = '1' and s_write_tvalid = '1' and
                  m_read_tready = '1' and read_valid_i = '1') then
                read_write_valid <= '1';
            else
                read_write_valid <= '0';
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****Flag management****
    -----------------------------------------------------------------------------------------------
    WRITE_READY_FLAG : process(memory_count)
    begin
        if(memory_count < FIFO_DEPTH) then
            write_ready_i <= '1';
        else
            write_ready_i <= '0';
        end if;
    end process;


    READ_VALID_FLAG : process(memory_count,memory_count_1,read_write_valid)
    begin
        if(memory_count = 0 or memory_count_1 = 0) then
            read_valid_i <= '0';
        elsif(memory_count_1 = 1 and read_write_valid = '1') then
            read_valid_i <= '0';
        else
            read_valid_i <= '1';
        end if;
    end process;

    
    s_write_tready <= write_ready_i;
    m_read_tvalid <= read_valid_i;
    -----------------------------------------------------------------------------------------------


end RTL;
