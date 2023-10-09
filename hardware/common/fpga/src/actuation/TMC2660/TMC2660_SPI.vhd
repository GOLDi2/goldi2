-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		TMC2660 SPI Driver 
-- Module Name:		TMC2660_SPI
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
-- Revision V2.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief Custom SPI master interface for TMC2660 (V3.00.00)
--! @details
--! The TMC2660_SPI module acts as a custom master interface to control and 
--! configure the TMC2660 stepper motor driver IC. The module takes a 24-bit
--! data word formatted as register data (see TMC2660 datasheet) and transfers
--! it to the IC. The module also reads the read response of the IC and presents
--! it in the read port "m_word_o_tdata".
--!
--! The clock frequency for the SCLK serial clock can be configured using the 
--! "CLOCK_FACTOR" parameter, which gives the serial clock period as a multiple
--! of clock cycles.
--!
entity TMC2660_SPI is
    generic(
        CLOCK_FACTOR    :   natural := 8                        --! SPI serial clock period as a multiple of clk cycles
    );
    port(
        --General
        clk             : in    std_logic;                      --! System clock
        rst             : in    std_logic;                      --! Synchronous reset
        --Parallel interface
        s_word_i_tready : out   std_logic;                      --! SPI mosi data - ready flag
        s_word_i_tvalid : in    std_logic;                      --! SPI mosi data - valid flag
        s_word_i_tdata  : in    std_logic_vector(23 downto 0);  --! SPI mosi data - data
        m_word_o_tvalid : out   std_logic;                      --! SPI miso data - valid flag 
        m_word_o_tdata  : out   std_logic_vector(23 downto 0);  --! SPI miso data - data
        --Serial interface
        m_spi_sclk      : out   std_logic;                      --! SPI serial clock
        m_spi_ncs       : out   std_logic;                      --! SPI chip select signal
        m_spi_mosi      : out   std_logic;                      --! SPI master-out/slave-in data
        m_spi_miso      : in    std_logic                       --! SPI master-in/salve-out data
    );
end entity TMC2660_SPI;




--! General architecture
architecture RTL of TMC2660_SPI is

    --****INTERNAL SIGNALS****
    --Reset delay
    signal rst_buff     :   std_logic;
    --Data buffers
    signal word_i_buff  :   std_logic_vector(23 downto 0);
    signal word_o_buff  :   std_logic_vector(23 downto 0);
    --Counter
    signal sclk_counter :   natural range 0 to CLOCK_FACTOR;
    signal bit_counter  :   natural range 0 to 23;
    --Flags
    signal s_ready_i    :   std_logic;
    signal m_valid_i    :   std_logic;
    signal tx_valid     :   std_logic;
    --State machine
    type spi_state is (IDLE, ENABLE, TRANSFER, DISABLE);
    signal spi_ps   :   spi_state;


begin

    --****MODULE CONTROL****
    -----------------------------------------------------------------------------------------------
    STATE_MACHINE : process(clk)
    begin
        if(rising_edge(clk)) then
            --SPI Transaction control
            case spi_ps is
                when IDLE =>
                    word_i_buff     <= s_word_i_tdata;
                    --Start transfer once a new data word has been registered
                    if(s_word_i_tvalid = '1' and s_ready_i = '1') then
                        spi_ps <= ENABLE;
                    end if;

                when ENABLE =>
                    --Hold for 1 sclk cycle to ensure correct ncs high time
                    if(sclk_counter = CLOCK_FACTOR-1) then
                        spi_ps <= TRANSFER;
                    end if;

                when TRANSFER =>
                    if(bit_counter = 23 and sclk_counter = CLOCK_FACTOR-1) then
                        spi_ps   <= DISABLE;
                        tx_valid <= '1';
                    end if;

                when DISABLE =>
                    if(sclk_counter = CLOCK_FACTOR-1) then
                        m_word_o_tdata  <= word_o_buff;
                        spi_ps          <= IDLE;
                    end if;
                
                when others => null;
            end case;


            --Reset conditions for modle
            if(rst = '1') then
                m_word_o_tdata  <= (others => '0');
                word_i_buff     <= (others => '0');
                rst_buff        <= '1';
                tx_valid        <= '0';
                spi_ps          <= IDLE;
            else
                rst_buff    <= '0';
            end if;

        end if;
    end process;


    S_READY_FLAG_MANAGEMENT : process(rst_buff,spi_ps)
    begin
        --Manage ready flag
        if(rst_buff = '1') then
            s_ready_i <= '0';
        elsif(spi_ps = IDLE) then
            s_ready_i <= '1';
        else
            s_ready_i <= '0';
        end if;
    end process;


    M_VALID_FLAG_MANAGEMENT : process(rst_buff,spi_ps,tx_valid)
    begin
        if(rst_buff = '1') then
            m_valid_i <= '0';
        elsif(spi_ps = IDLE and tx_valid = '1') then
            m_valid_i <= '1';
        else
            m_valid_i <= '0';
        end if;
    end process;

    s_word_i_tready <= s_ready_i;
    m_word_o_tvalid <= m_valid_i;
    -----------------------------------------------------------------------------------------------




    --****SPI INTERFACE****
    -----------------------------------------------------------------------------------------------
    SPI_SCLK_DIRVER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                m_spi_sclk <= '1';
            elsif(spi_ps /= TRANSFER) then
                m_spi_sclk <= '1';
            else
                if(sclk_counter < CLOCK_FACTOR/2) then
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
            elsif(spi_ps = IDLE or spi_ps = DISABLE) then
                m_spi_ncs <= '1';
            else
                m_spi_ncs <= '0';
            end if;
        end if;
    end process;


    SPI_MOSI_DRIVER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                m_spi_mosi <= '0';
            elsif(spi_ps /= TRANSFER) then
                m_spi_mosi <= '0';
            else 
                m_spi_mosi <= word_i_buff(23 - bit_counter);
            end if;
        end if;
    end process;


    SPI_MISO_DRIVER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                word_o_buff <= (others => '0');
            --Delay sample by two clk cycles to compensate for synchronizer latency
            elsif(spi_ps = TRANSFER and sclk_counter = CLOCK_FACTOR/2+1) then
                word_o_buff(23 - bit_counter) <= m_spi_miso;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
    SCLK_PERIOD_COUNTER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                sclk_counter <= 0;
            elsif(spi_ps = IDLE) then
                sclk_counter <= 0;
            else
                if(sclk_counter = CLOCK_FACTOR-1) then
                    sclk_counter <= 0;
                else
                    sclk_counter <= sclk_counter + 1;
                end if;
            end if;
        end if;
    end process;


    TRANSFER_BIT_COUNTER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                bit_counter <= 0;
            elsif(spi_ps /= TRANSFER) then
                bit_counter <= 0;
            else
                if(bit_counter = 23 and sclk_counter = CLOCK_FACTOR-1) then
                    bit_counter <= 0;
                elsif(sclk_counter = CLOCK_FACTOR-1) then
                    bit_counter <= bit_counter+1;
                else null;
                end if;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end RTL;