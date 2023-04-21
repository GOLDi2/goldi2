-------------------------------------------------------------------------------
-- Company: 		Technische Universität Ilmenau
-- Engineer: 		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name: 	Customizable FIFO structure
-- Module Name: 	QUEUE
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



--! @brief Queue structure for data transmission
--! @details
--! Queue structure to backload transmission data and prevent
--! delays for the user. The queue's size and element width can
--! be customized to increase reusability
--!
--! **Latency: 1**
entity QUEUE is 
    generic(
        QUEUE_LENGTH    :   natural := 10;
        DATA_WIDTH      :   natural := 8
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        --Queue control
        write_enb       : in    std_logic;
        read_enb        : in    std_logic;
        queue_empty     : out   std_logic;
        queue_full      : out   std_logic;
        --Data
        data_in         : in    std_logic_vector(DATA_WIDTH-1 downto 0);
        data_out        : out   std_logic_vector(DATA_WIDTH-1 downto 0)
    );
end entity QUEUE;



--! General architecture
architecture RTL of QUEUE is

    --Intermediate signals
    signal empty        :   std_logic;
    signal full         :   std_logic;
    signal wr_pointer   :   natural;
    signal rd_pointer   :   natural;
    --Memory
    type data_vector is array (QUEUE_LENGTH-1 downto 0) of std_logic_vector(DATA_WIDTH-1 downto 0);
    signal memory   :   data_vector;


begin

    --Route flags
    queue_empty <= empty;
    queue_full  <= full;
    


    QUEUE_STRUCTURE : process(clk)
        variable num_elements   :   natural;
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                --Reset flags and counters
                wr_pointer <= 0;
                rd_pointer <= 0;
                num_elements := 0;
                --Reset output
                data_out <= (others => '0');

            else
                if(write_enb = '1' and full = '0') then
                    memory(wr_pointer) <= data_in;
                    num_elements := num_elements + 1;
                    
                    --Manage write pointer
                    if(wr_pointer = QUEUE_LENGTH-1) then
                        wr_pointer <= 0;
                    else
                        wr_pointer <= wr_pointer + 1;
                    end if;

                elsif(read_enb = '1' and empty = '0') then
                    data_out <= memory(rd_pointer);
                    num_elements := num_elements - 1;

                    --Manage read pointer
                    if(rd_pointer = QUEUE_LENGTH-1) then
                        rd_pointer <= 0;
                    else
                        rd_pointer <= rd_pointer + 1;
                    end if;
                end if;
            end if;


            --Flag Management
            if(num_elements = 0) then
                empty <= '1';
                full  <= '0';
            elsif(num_elements = QUEUE_LENGTH) then
                empty <= '0';
                full  <= '1';
            else
                empty <= '0';
                full  <= '0';
            end if;

        end if;
    end process;


end RTL;
