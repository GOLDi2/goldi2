-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Custom GOLDi BUS adaptor - BUS Master interface
-- Module Name:		BUS_ADAPTOR
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V4.00.00 - Extension of BUS protocol and renaming
-- Additional Comments: Introduction of "stb" signal to the GOLDi BUS master
--                      interface to prevent continuous read and write 
--                      operations. Addition of tags to the BUS interfaces
--                      to extend BUS flexibility. Renaming form BUS_CONVERTER
--                      to BUS_ADAPTOR.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! @brief Custom BUS Master interface
--! @details
--! Module routes the incomming parallel data from an SPI transaction
--! and adapts the data to the GOLDi BUS protocol to communicate with 
--! the slave sub-modules in the system.
--!
--! ### GOLDi BUS Protocol
--!	|Configuration Word										||||
--! |:--:|:--:|:-------------------:|:------------------------:|
--! | WE | SE | TAG[BUS_TAG_BITS:0] | ADR[BUS_ADDRESS_WIDTH:0] |
--!	
--! The SPI data consists of a configuration word and one or more
--! data words transfered in an SPI communication cycle i.e "nCE" 
--! remains in a low state during the entier data transfer.
--!
--! Two default modes of communication have been implemented in the 
--! BUS_ADAPTOR module for the transfer of multiple data word: 
--! "multi-register"-communication and "stream"-communication. 
--! In multi-register mode the data is arranged following the MSBF
--! (most-significnat-bit-first) convention. The first data word is
--! stored in the explicitly addressed register and the following
--! data words are stored in decreasing addresses. This mode simplifies
--! transfer of data to a sub-module with multiple registers and data
--! formats.
--! In the "stream"-mode the data is writen to the register addressed.
--! This mode facilitates the transfer of large data packets to secondary
--! communication sub-modules
--!
--! **Latency:1**
entity BUS_ADAPTOR is
    port(
        --General
        clk             : in    std_logic;                                          --! System clock
        rst             : in    std_logic;                                          --! Asynchronous reset
        --Data interface
        p_nce           : in    std_logic;                                          --! Negated chip enable - active low
        p_word_val      : in    std_logic;                                          --! Parallel data available
        p_config_word_i : in    std_logic_vector(CONFIGURATION_WORD-1 downto 0);    --! Configuration word
        p_data_word_i   : in    std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);     --! Input data word - SPI MOSI data
        p_data_word_o   : out   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);     --! Output data word - SPI MISO data
        --BUS
        p_master_bus_o  : out   mbus_out;                                           --! BUS master interface output signals [stb,we,adr,dat,tag]
        p_master_bus_i  : in    mbus_in                                             --! BUS master interface input signals [dat,tag]
    );
end entity BUS_ADAPTOR;




--! General architecture
architecture RTL of BUS_ADAPTOR is

    --****INTERNAL SIGNALS****
    --Buffers
    signal config_buffer        :   std_logic_vector(CONFIGURATION_WORD-1 downto 0);
        alias we_buffer         :   std_logic is config_buffer(CONFIGURATION_WORD-1);
        alias se_buffer         :   std_logic is config_buffer(CONFIGURATION_WORD-2);
        alias tag_buffer        :   tag_word  is config_buffer(CONFIGURATION_WORD-3 downto BUS_ADDRESS_WIDTH);
        alias adr_buffer        :   address_word is config_buffer(BUS_ADDRESS_WIDTH-1 downto 0);
    signal data_buffer          :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
    --State machine
    type mbus_state is (s_idle, s_config, s_data, s_rvalid, s_wvalid, s_update);
    signal ps_mbus  :   mbus_state;


begin

    --****BUS CONTROL****
    -------------------------------------------------------------------------------------------------------------------
    STATE_MACHINE : process(clk,rst)
    begin
        if(rst = '1') then
            ps_mbus <= s_idle;

        elsif(rising_edge(clk)) then
            case ps_mbus is
            when s_idle   =>    if(p_nce /= '0') then ps_mbus <= s_idle;
                                else ps_mbus <= s_config;
                                end if;

            when s_config =>    if(p_nce /= '0') then ps_mbus <= s_idle;
                                elsif(p_word_val = '1') then ps_mbus <= s_data;
                                else ps_mbus <= s_config;
                                end if;
            
            when s_data   =>    if(p_nce /= '0') then ps_mbus <= s_idle;
                                elsif(p_word_val = '1' and we_buffer = '1') then ps_mbus <= s_wvalid;
                                elsif(p_word_val = '1' and we_buffer = '0') then ps_mbus <= s_rvalid;
                                else ps_mbus <= s_data;
                                end if;
                
            when s_rvalid =>    if(p_nce /= '0') then ps_mbus <= s_idle;
                                else ps_mbus <= s_data;
                                end if;
            
            when s_wvalid =>    if(p_nce /= '0') then ps_mbus <= s_idle;
                                else ps_mbus <= s_data;
                                end if;

            when others   =>    ps_mbus <= s_idle;
            end case;
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------



    --****BUS SIGNALS****
    -------------------------------------------------------------------------------------------------------------------
    C_BUFFER_MANAGEMENT : process(clk,rst)
    begin
        if(rst = '1') then
            config_buffer <= (others => '0');
        elsif(rising_edge(clk)) then
            if(ps_mbus = s_idle) then
                config_buffer <= (others => '0');
            elsif(ps_mbus = s_config and p_word_val = '1') then
                config_buffer <= p_config_word_i;
            elsif(ps_mbus = s_rvalid and se_buffer = '0') then
                adr_buffer <= std_logic_vector(unsigned(adr_buffer)-1);
            elsif(ps_mbus = s_wvalid and se_buffer = '0') then
                adr_buffer <= std_logic_vector(unsigned(adr_buffer)-1);
            else null;
            end if;
        end if;
    end process;


    D_BUFFER_MANAGEMENT : process(clk,rst)
    begin
        if(rst = '1') then
            data_buffer <= (others => '0');
        elsif(rising_edge(clk)) then
            if(ps_mbus = s_idle) then
                data_buffer <= (others => '0');
            elsif(ps_mbus = s_data and p_word_val = '1') then
                data_buffer <= p_data_word_i;
            else null;
            end if;
        end if;
    end process;
    -------------------------------------------------------------------------------------------------------------------



    --****SIGNAL ROUTING****
    -------------------------------------------------------------------------------------------------------------------
    --BUS signals
    p_master_bus_o.stb  <= '1' when(ps_mbus = s_rvalid or ps_mbus = s_wvalid) else '0';
    p_master_bus_o.we   <= '1' when(ps_mbus = s_wvalid) else '0';
    p_master_bus_o.adr  <= adr_buffer;
    p_master_bus_o.dat  <= data_buffer;
    p_master_bus_o.tag  <= tag_buffer;

    --Parallel data port
    p_data_word_o <= p_master_bus_i.dat;
    -------------------------------------------------------------------------------------------------------------------


end architecture;