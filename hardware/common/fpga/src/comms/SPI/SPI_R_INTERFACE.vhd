-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/07/2023
-- Design Name:		SPI General Reciver Module
-- Module Name:		SPI_R_INTERFACE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V3.01.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @breif
--! @details
--!
entity SPI_R_INTERFACE is
    generic(
        g_word_length       :   integer   := 8;
        g_cpol              :   std_logic := '1';
        g_cpha              :   std_logic := '0';
        g_msbf              :   boolean   := true
    );
    port(
        --General
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        --Parallel interface
        i_dword_tvalid      : in    std_logic;
        i_dword_tdata       : in    std_logic_vector(g_word_length-1 downto 0);
        o_dword_tvalid      : out   std_logic;
        o_dword_tdata       : out   std_logic_vector(g_word_length-1 downto 0);
        --SPI interface
        i_spi_ncs           : in    std_logic;
        i_spi_sclk          : in    std_logic;
        i_spi_mosi          : in    std_logic;
        o_spi_miso          : out   std_logic;
        o_spi_miso_highz    : out   std_logic
    );
end entity SPI_R_INTERFACE;




--! General architecture
architecture RTL of SPI_R_INTERFACE is
    
    --****INTERNAL SIGNALS****
    --Constansts
    constant cpha_sclk_old  :   std_logic := g_cpha xor g_cpol;
    constant cpha_sclk      :   std_logic := g_cpha xnor g_cpol;
    --Data buffers
    signal miso_buff_i      :   std_logic_vector(g_word_length-1 downto 0);
    signal spi_sclk_old     :   std_logic;
    --Counter
    signal spi_cyc_counter  :   integer range 0 to g_word_length;


begin

    
    SCLK_SREGISTER : process(clk,rst)
    begin
        if(rst = '1') then
            spi_sclk_old <= g_cpol;

        elsif(rising_edge(clk)) then
            if(i_spi_ncs = '1') then
                spi_sclk_old <= g_cpol;
            else
                spi_sclk_old <= i_spi_sclk;
            end if;
        end if;
    end process;


    
    PDATA_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            miso_buff_i <= (others => '0');
        elsif(rising_edge(clk)) then
            if(i_dword_tvalid = '1') then
                miso_buff_i <= i_dword_tdata;
            end if;        
        end if;
    end process;


    MOSI_DATA_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            o_dword_tvalid  <= '0';
            o_dword_tdata   <= (others => '0');
            spi_cyc_counter <= 0;

        elsif(rising_edge(clk)) then
            --Serial to parallel data conversion
            if(i_spi_ncs = '1') then
                spi_cyc_counter <= 0;

            --Detect register edge based on cpha configuration    
            elsif((i_spi_sclk = cpha_sclk) and (spi_sclk_old = cpha_sclk_old)) then
                --Shift register with incoming data (mosi) based on MSBF
                if(g_msbf = true) then
                    o_dword_tdata((g_word_length-1) - spi_cyc_counter) <= i_spi_mosi;
                else
                    o_dword_tdata(spi_cyc_counter) <= i_spi_mosi;
                end if;

                --Control transaction length through cyc_mosi_counter
                if(spi_cyc_counter = g_word_length-1) then
                    spi_cyc_counter <= 0;
                    o_dword_tvalid  <= '1';
                else
                    spi_cyc_counter <= spi_cyc_counter + 1;
                end if;

            else
                --Ground valid flag to avoid multiple transfers
                o_dword_tvalid <= '0';
            end if;
        end if;
    end process;



    MISO_DATA_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            o_spi_miso       <= '0';
            o_spi_miso_highz <= '1';
            
        elsif(rising_edge(clk)) then
            if(i_spi_ncs = '1') then
                o_spi_miso       <= '0';
                o_spi_miso_highz <= '1';
            
            else
                --Enable bus line
                o_spi_miso_highz <= '0';
                
                --Shift data by comparing sclk value with cpol and MSBF
                if(g_cpha = '0' and g_cpol = i_spi_sclk and g_msbf = true) then
                    o_spi_miso <= miso_buff_i((g_word_length-1)-spi_cyc_counter);
                elsif(g_cpha = '0' and g_cpol = i_spi_sclk and g_msbf = false) then
                    o_spi_miso <= miso_buff_i(spi_cyc_counter);
                elsif(g_cpha = '1' and g_cpol = not i_spi_sclk and g_msbf = true) then
                    o_spi_miso <= miso_buff_i((g_word_length-1)-spi_cyc_counter);
                elsif(g_cpha = '1' and g_cpol = not i_spi_sclk and g_msbf = false) then
                    o_spi_miso <= miso_buff_i(spi_cyc_counter);
                else null;
                end if;

            end if;
        end if;
    end process;



end architecture;