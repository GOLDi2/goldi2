-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		TMC2660 SPI Driver 
-- Module Name:		TMC2660_SPI
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:    none
--
-- Revisions:
-- Revision V0.01.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief
--! @details
--!
entity TMC2660_SPI is
    port(
        --General
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        --Axi Interface
        s_transfer_i_tready : out   std_logic;
        s_transfer_i_tvalid : in    std_logic;
        s_transfer_i_tdata  : in    std_logic_vector(19 downto 0);
        m_transfer_o_tvalid : out   std_logic;
        m_transfer_o_tdata  : out   std_logic_vector(19 downto 0);
        --SPI Interface
        m_spi_sclk          : out   std_logic;
        m_spi_ncs           : out   std_logic;
        m_spi_mosi          : out   std_logic;
        m_spi_miso          : in    std_logic
    );
end entity TMC2660_SPI;




--! General architecture
architecture RTL of TMC2660_SPI is

    --****Internal signals****
    --Data buffers
    signal transfer_i_data_buff     :   std_logic_vector(19 downto 0);
    signal transfer_o_data_buff     :   std_logic_vector(19 downto 0);
    --AXI
    signal transfer_i_ready_buff    :   std_logic;
    --Counters
    signal sclk_counter             :   natural range 0 to 5;
    signal spi_cycle_counter        :   natural range 0 to 19;
    --Flags
    signal spi_transfer_valid       :   std_logic;
    --State machine
    type spi_state is (IDLE, ENABLE, TRANSFER, DISABLE);
    signal spi_ps   :   spi_state := IDLE;


begin

    --****Module control****
    -----------------------------------------------------------------------------------------------
    STATE_MACHINE : process(clk)
    begin
        if(rising_edge(clk)) then
            case spi_ps is
            when IDLE =>
                if(spi_transfer_valid = '1') then
                    spi_ps <= ENABLE;
                end if;

            when ENABLE =>
                spi_ps <= TRANSFER;
            
            when TRANSFER =>
                if(spi_cycle_counter = 19 and sclk_counter = 5) then
                    spi_ps <= DISABLE;
                end if;
            when DISABLE =>
                spi_ps <= IDLE;

            when others => null;
            end case;

            if(rst = '1') then
                spi_ps <= IDLE;
            end if; 
        end if;
    end process;


    SYSTEM_COUNTERS : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then 
                sclk_counter      <= 0;
                spi_cycle_counter <= 0;
            elsif(spi_ps /= TRANSFER) then
                sclk_counter      <= 0;
                spi_cycle_counter <= 0;
            else
                if(sclk_counter = 5) then
                    sclk_counter <= 0;
                else
                    sclk_counter <= sclk_counter + 1;
                end if;

                if(spi_cycle_counter = 19 and sclk_counter = 5) then
                    spi_cycle_counter <= 0;
                elsif(sclk_counter = 5) then
                    spi_cycle_counter <= spi_cycle_counter + 1;
                end if;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****AXI Interface****
    -----------------------------------------------------------------------------------------------
    SYSTEM_INTERFACE : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                transfer_i_ready_buff <= '0';
                transfer_i_data_buff  <= (others => '0');
                m_transfer_o_tvalid   <= '0';
                m_transfer_o_tdata    <= (others => '0');
                spi_transfer_valid    <= '0';
            
            elsif(spi_ps = IDLE) then
                m_transfer_o_tvalid   <= '1';
                m_transfer_o_tdata    <= transfer_o_data_buff;
                
                if(s_transfer_i_tvalid = '1' and transfer_i_ready_buff = '1') then
                    transfer_i_data_buff  <= s_transfer_i_tdata;
                    transfer_i_ready_buff <= '0';
                    spi_transfer_valid    <= '1';
                elsif(spi_transfer_valid = '1') then
                    transfer_i_ready_buff <= '0';
                    spi_transfer_valid    <= '1';
                else
                    transfer_i_ready_buff <= '1';
                    spi_transfer_valid    <= '0';
                end if;

            else
                transfer_i_ready_buff <= '0';
                m_transfer_o_tvalid   <= '0';
                m_transfer_o_tdata    <= (others => '0');
                spi_transfer_valid    <= '0';
            end if;
        end if;
    end process;

    s_transfer_i_tready <= transfer_i_ready_buff;
    -----------------------------------------------------------------------------------------------
    
    
    
    --****SPI Interface****
    -----------------------------------------------------------------------------------------------
    SPI_SCLK_DRIVER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                m_spi_sclk <= '1';
            elsif(spi_ps /= TRANSFER) then
                m_spi_sclk <= '1';
            else
                if(sclk_counter < 3) then
                    m_spi_sclk <= '0';
                else
                    m_spi_sclk <= '1';
                end if;
            end if;
        end if;
    end process;


    SPI_NCS_DRIVER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                m_spi_ncs <= '1';
            elsif(spi_ps = ENABLE or spi_ps = TRANSFER) then
                m_spi_ncs <= '0';
            else
                m_spi_ncs <= '1';
            end if;
        end if;
    end process;


    SPI_MOSI_DRIVER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                m_spi_mosi <= '0';
            elsif(spi_ps = TRANSFER) then
                m_spi_mosi <= transfer_i_data_buff(19 - spi_cycle_counter);
            else
                m_spi_mosi <= '0';
            end if;
        end if;
    end process;


    SPI_MISO_DRIVER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                transfer_o_data_buff <= (others => '0');
            elsif(spi_ps = TRANSFER and sclk_counter = 5) then
                transfer_o_data_buff(19 - spi_cycle_counter) <= m_spi_miso;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    
end RTL;