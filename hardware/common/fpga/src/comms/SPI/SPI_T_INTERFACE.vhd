-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		SPI General Transmiter Module
-- Module Name:		SPI_T_INTERFACE
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




--! @brief
--! @details
--!
entity SPI_T_INTERFACE is
    generic(
        g_clk_factor        :   integer := 4;
        g_word_length       :   integer := 8;
        g_cpol              :   std_logic := '1';
        g_cpha              :   std_logic := '0';
        g_msbf              :   boolean := true
    );
    port(
        --General
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        --Parallel interface
        o_tdword_tready     : out   std_logic;
        i_tdword_tvalid     : in    std_logic;
        i_tdword_tdata      : in    std_logic_vector(g_word_length-1 downto 0);
        o_rdword_tvalid     : out   std_logic;
        o_rdword_tdata      : out   std_logic_vector(g_word_length-1 downto 0);
        --SPI interface
        o_spi_ncs           : out   std_logic;
        o_spi_sclk          : out   std_logic;
        o_spi_mosi          : out   std_logic;
        i_spi_miso          : in    std_logic
    );
end entity;




--! General architecture
architecture RTL of SPI_T_INTERFACE is

    --****INTERNAL SIGNALS****
    --Counters
    signal spi_sclk_counter :   integer range 0 to g_clk_factor;
    signal spi_cyc_counter  :   integer range 0 to g_word_length;
    signal spi_ncs_counter  :   integer range 0 to g_clk_factor/2;
    --Data buffers
    signal mosi_buffer_i    :   std_logic_vector(g_word_length-1 downto 0);
    signal miso_buffer_i    :   std_logic_vector(g_word_length-1 downto 0);
    --State machine
    type spi_state is (s_idle, s_slack, s_transfer, s_hold);
    signal ps_spi   :   spi_state;


begin

    --****TRANSFER CONTROL****
    -----------------------------------------------------------------------------------------------
    MODULE_CONTROL : process(clk,rst)
    begin
        --Module control based on the g_cpha parameter
        case g_cpha is
        --Slack at the end of cycle
        when '0' =>
        if(rst = '1') then
            ps_spi <= s_idle;
        elsif(rising_edge(clk)) then
            case ps_spi is
            when s_idle =>
                if(i_tdword_tvalid = '1') then ps_spi <= s_slack;
                else ps_spi <= s_idle;
                end if;

            when s_slack =>
                if(spi_ncs_counter = g_clk_factor/2-1) then ps_spi <= s_transfer;
                else ps_spi <= s_slack;
                end if;

            when s_transfer =>
                if(spi_cyc_counter = 0 and spi_sclk_counter = g_clk_factor/2-1) then ps_spi <= s_hold;
                else ps_spi <= s_transfer;
                end if;

            when s_hold =>
                if(spi_ncs_counter = g_clk_factor/2-1) then ps_spi <= s_idle;
                else ps_spi <= s_hold;
                end if;

            when others => null;
            end case;
        end if;


        --Slack at the begining of cycle    
        when '1' =>
        if(rst = '1') then
            ps_spi <= s_idle;
        elsif(rising_edge(clk)) then
            case ps_spi is
            when s_idle =>
                if(i_tdword_tvalid = '1') then ps_spi <= s_slack;
                else ps_spi <= s_idle;
                end if;
            
            when s_slack =>
                if(spi_ncs_counter = g_clk_factor/2-1) then ps_spi <= s_transfer;
                else ps_spi <= s_slack;
                end if;

            when s_transfer =>
                if(spi_cyc_counter = g_word_length-1 and spi_sclk_counter = g_clk_factor-1) then ps_spi <= s_hold;
                else ps_spi <= s_transfer;
                end if;

            when s_hold =>
                if(spi_ncs_counter = g_clk_factor/2-1) then ps_spi <= s_idle;
                else ps_spi <= s_hold;
                end if;
            when others => null;
            end case;
        end if;


        when others => null;
        end case;
    end process;
    -----------------------------------------------------------------------------------------------



    --****PARALLEL INTERFACE****
    -----------------------------------------------------------------------------------------------
    INPUT_DATA_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            mosi_buffer_i <= (others => '0');
        elsif(rising_edge(clk)) then
            if(ps_spi = s_idle and i_tdword_tvalid = '1') then
                mosi_buffer_i <= i_tdword_tdata;
            end if;
        end if;
    end process;


    OUTPUT_DATA_CONTROL : process(clk,rst)
    begin
        --Counter offset based on g_cpha parameter
        case g_cpha is
        --Counter starts after valid flag -> slack at the end of the cycle
        when '0' =>
            if(rst = '1') then
                o_rdword_tvalid <= '0';
                o_rdword_tdata  <= (others => '0');
            elsif(rising_edge(clk)) then
                if(spi_cyc_counter = 0 and spi_sclk_counter = g_clk_factor/2-1) then
                    o_rdword_tvalid <= '1';
                    o_rdword_tdata  <= miso_buffer_i;
                else
                    o_rdword_tvalid <= '0';
                end if;
            end if;

        --Counter starts after g_clk_factor/2 -> slack at the begining of cycle
        when '1' =>
            if(rst = '1') then
                o_rdword_tvalid <= '0';
                o_rdword_tdata  <= (others => '0');
            elsif(rising_edge(clk)) then
                if(spi_cyc_counter = g_clk_factor-1 and spi_sclk_counter = g_clk_factor-1) then
                    o_rdword_tvalid <= '1';
                    o_rdword_tdata  <= miso_buffer_i;
                else
                    o_rdword_tvalid <= '0';
                end if;
            end if;

        when others => null;
        end case;
    end process;


    READY_FLAG_CONTROL : process(rst,ps_spi)
    begin
        if(rst = '1') then
            o_tdword_tready <= '0';
        elsif(ps_spi = s_idle) then
            o_tdword_tready <= '1';
        else
            o_tdword_tready <= '0';
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****SPI INTERFACE****
    -----------------------------------------------------------------------------------------------
    NCS_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            o_spi_ncs <= '1';
        elsif(rising_edge(clk)) then
            if(ps_spi = s_idle or ps_spi = s_hold) then
                o_spi_ncs <= '1';
            else
                o_spi_ncs <= '0';
            end if;
        end if;
    end process;


    SCLK_CONTROL : process(clk,rst)
    begin   
        case g_cpha is
        when '0' =>
            if(rst = '1') then
                o_spi_sclk <= g_cpol;
            elsif(rising_edge(clk)) then
                if(ps_spi /= s_transfer) then
                    o_spi_sclk <= g_cpol;
                elsif(spi_sclk_counter < g_clk_factor/2) then
                    o_spi_sclk <= g_cpol;
                else
                    o_spi_sclk <= not g_cpol;
                end if;
            end if;


        when '1' =>
            if(rst = '1') then
                o_spi_sclk <= g_cpol;
            elsif(rising_edge(clk)) then
                if(ps_spi /= s_transfer) then
                    o_spi_sclk <= g_cpol;
                elsif(spi_sclk_counter < g_clk_factor/2) then
                    o_spi_sclk <= not g_cpol;
                else
                    o_spi_sclk <= g_cpol;
                end if;
            end if;

        when others => null;
        end case;
    end process;


    MOSI_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            o_spi_mosi <= '0';
        elsif(rising_edge(clk)) then
            if(ps_spi = s_idle or ps_spi = s_hold) then
                o_spi_mosi <= '0';
            elsif(ps_spi = s_slack and g_msbf = true) then
                o_spi_mosi <= mosi_buffer_i(g_word_length-1);
            elsif(ps_spi = s_slack and g_msbf = false) then
                o_spi_mosi <= mosi_buffer_i(0);
            elsif(spi_sclk_counter = 0 and g_msbf = true) then
                o_spi_mosi <= mosi_buffer_i((g_word_length-1) - spi_cyc_counter);
            elsif(spi_sclk_counter = 0 and g_msbf = false) then
                o_spi_mosi <= mosi_buffer_i(spi_cyc_counter);
            else null;
            end if;
        end if;
    end process;


    MISO_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            miso_buffer_i <= (others => '0');
        elsif(rising_edge(clk)) then
            if(ps_spi = s_transfer and spi_sclk_counter = g_clk_factor/2 and g_msbf = true) then
                miso_buffer_i((g_word_length-1) - spi_cyc_counter) <= i_spi_miso;
            elsif(ps_spi = s_transfer and spi_sclk_counter = g_clk_factor and g_msbf = false) then
                miso_buffer_i(spi_cyc_counter) <= i_spi_miso;
            else null;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
    SPI_PERIOD_COUNTER : process(clk,rst)
    begin
        --Counter offset based on g_cpha parameter
        case g_cpha is
        --Counter starts after valid flag -> slack at the end of the cycle
        when '0' =>
            if(rst = '1') then
                spi_sclk_counter <= g_clk_factor/2;
            elsif(rising_edge(clk)) then
                if(ps_spi /= s_transfer) then
                    spi_sclk_counter <= g_clk_factor/2;
                elsif(spi_sclk_counter = g_clk_factor-1) then
                    spi_sclk_counter <= 0;
                else
                    spi_sclk_counter <= spi_sclk_counter + 1;
                end if;
            end if;

        --Counter starts after g_clk_factor/2 -> slack at the begining of cycle
        when '1' =>
            if(rst = '1') then
                spi_sclk_counter <= 0;
            elsif(rising_edge(clk)) then
                if(ps_spi /= s_transfer) then
                    spi_sclk_counter <= 0;
                elsif(spi_sclk_counter = g_clk_factor-1) then 
                    spi_sclk_counter <= 0;
                else
                    spi_sclk_counter <= spi_sclk_counter + 1;
                end if;
            end if;

        when others => null;
        end case;
    end process;


    
    NCS_SLACK_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            spi_ncs_counter <= 0;
        elsif(rising_edge(clk)) then
            if(ps_spi = s_idle or ps_spi = s_transfer) then
                spi_ncs_counter <= 0;
            elsif(spi_ncs_counter = g_clk_factor/2-1) then
                spi_ncs_counter <= 0;
            else
                spi_ncs_counter <= spi_ncs_counter + 1; 
            end if;
        end if;
    end process;
    

    
    SPI_CYCLE_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            spi_cyc_counter <= 0;
        elsif(rising_edge(clk)) then
            if(ps_spi /= s_transfer) then
                spi_cyc_counter <= 0;
            elsif(spi_cyc_counter = g_word_length-1 and spi_sclk_counter = g_clk_factor-1) then
                spi_cyc_counter <= 0;
            elsif(spi_sclk_counter = g_clk_factor-1) then
                spi_cyc_counter <= spi_cyc_counter + 1;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


end architecture;