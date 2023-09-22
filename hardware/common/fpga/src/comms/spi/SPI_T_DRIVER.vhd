-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/07/2023
-- Design Name:		SPI General Transmiter Module
-- Module Name:		SPI_T_DRIVER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @breif Customizable SPI controller interface 
--! @details
--! SPI controller/master interface for general communication applications. The 
--! module can be configure to be used in all 3 SPI modes through the generic
--! parameters:
--!
--! The "g_cpol" parameter sets the value of the sclk signal when the module is
--! in an idle state.
--!
--! The "g_cpha" parameters selects the edge used to register and shift data. If
--! "g_cpha" is set to low the leading edge is used to register data and the 
--! trailing edge to shift data. If "g_cpha" is set to high then the behaviour is
--! inverted
--! 
--! + Mode 0:
--!     -> [g_cpol='0']: sclk low when module idle
--!     -> [g_cpha='0']: data registered on rising edge and shifted on falling edge
--! + Mode 1:
--!     -> [g_cpol='0']: sclk low when module idle
--!     -> [g_cpha='1']: data registered on falling edge and shifted on rising edge
--! + Mode 2:
--!     -> [g_cpol='1']: sclk high when module idle
--!     -> [g_cpha='0']: data registered on falling edge and shifted on rising edge
--! + Mode 3:
--!     -> [g_cpol='1']: sclk high when module idle
--!     -> [g_cpha='1']: data registered on rising edge and shifted on falling edge
--!
--! Both the transfered data width and direction can be controled with the parameters
--! "g_word_length" and "g_msbf". The transfer rate is controlled by the "g_clk_factor"
--! parameter and corresponds to the period of the "p_spi_sclk" signal in clock cycles.
--! It is recommended to use an even value to have 50% duty cycle.
--!
--! The transfer data is registered when both the tdword_ready and tdword_valid flags
--! are valid. This allows a transfer cycle to occur when the module is in an idle 
--! state or after the current data transfer has finished but the ncs signal remains
--! low. This allows the user to stream data for multiple continuous data words.
--! 
--! **Latency: 1cyc**
entity SPI_T_DRIVER is
    generic(
        g_clk_factor        :   integer := 4;                                   --! Period of the serial clock signal
        g_word_length       :   integer := 8;                                   --! Data width of the SPI transfered data word
        g_cpol              :   std_logic := '1';                               --! Value of the sclk input when module in idle mode
        g_cpha              :   std_logic := '0';                               --! Edge used to register or shift data
        g_msbf              :   boolean := true                                 --! Transfer data format
    );
    port(
        --General
        clk                 : in    std_logic;                                  --! System clock
        rst                 : in    std_logic;                                  --! Asynchronous clock
        --Parallel interface
        p_tdword_tready     : out   std_logic;                                  --! Parallel input data word ready
        p_tdword_tvalid     : in    std_logic;                                  --! Parallel input data word valid
        p_tdword_tdata      : in    std_logic_vector(g_word_length-1 downto 0); --! Parallel input data word - "MOSI" data
        p_rdword_tvalid     : out   std_logic;                                  --! Parallel output data word valid
        p_rdword_tdata      : out   std_logic_vector(g_word_length-1 downto 0); --! Parallel output data word - "MOSI" data
        --SPI interface
        p_spi_ncs           : out   std_logic;                                  --! SPI Chip select input signal - logic low
        p_spi_sclk          : out   std_logic;                                  --! SPI Serial clock input signal
        p_spi_mosi          : out   std_logic;                                  --! SPI Master out / Slave in data
        p_spi_miso          : in    std_logic                                   --! SPI Master in  / Slave out data 
    );
end entity SPI_T_DRIVER;




--! General architecture
architecture RTL of SPI_T_DRIVER is

    --****INTERNAL SIGNALS****
    --Counters
    signal spi_sclk_counter :   integer range 0 to g_clk_factor;
    signal spi_cyc_counter  :   integer range 0 to g_word_length;
    signal spi_ncs_counter  :   integer range 0 to g_clk_factor/2;
    --Data buffer
    signal mosi_buffer_i    :   std_logic_vector(g_word_length-1 downto 0);
    signal miso_buffer_i    :   std_logic_vector(g_word_length-1 downto 0);
    --State machine
    type spi_state is (s_idle, s_setup, s_transfer, s_hold);
    signal ps_spi   :   spi_state;


begin

    --****TRANSFER CONTROL****
    -----------------------------------------------------------------------------------------------
    MODULE_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            ps_spi <= s_idle;
        elsif(rising_edge(clk)) then
            --State machine control
            case ps_spi is
            when s_idle =>  --Idle state waits for a valid data transfer to start transmission 
                if(p_tdword_tvalid = '1') then ps_spi <= s_setup;
                else ps_spi <= s_idle;
                end if;

            when s_setup => --Select peripheral interface and start transmission
                if(spi_ncs_counter = g_clk_factor/2-1) then ps_spi <= s_transfer;
                else ps_spi <= s_setup;
                end if;

            when s_transfer =>  --Drive SCLK, MOSI and MISO signals and transfer data
                if(spi_cyc_counter = g_word_length-1 and spi_sclk_counter = g_clk_factor-1) then ps_spi <= s_hold;
                else ps_spi <= s_transfer;
                end if;
            
            when s_hold =>  --Hold for a possible stream data word. Hold chip selected
                if(p_tdword_tvalid = '1') then ps_spi <= s_setup;
                elsif(spi_ncs_counter = g_clk_factor/2-1) then ps_spi <= s_idle;
                else ps_spi <= s_hold;
                end if;
            
            when others => 
                ps_spi <= s_idle;
                
            end case;

        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****PARALLEL INTERFACE****
    -----------------------------------------------------------------------------------------------
    OUTPUT_DATA_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            p_rdword_tvalid <= '0';
            p_rdword_tdata  <= (others => '0');
        elsif(rising_edge(clk)) then
            if(spi_cyc_counter = g_word_length-1 and spi_sclk_counter = g_clk_factor-1) then
                p_rdword_tvalid <= '1';
                p_rdword_tdata  <= miso_buffer_i;
            else
                p_rdword_tvalid <= '0';
            end if;
        end if;
    end process;


    READY_FLAG_CONTROL : process(rst,ps_spi)
    begin
        if(rst = '1') then 
            p_tdword_tready <= '0';
        elsif(ps_spi = s_idle or ps_spi = s_hold) then
            p_tdword_tready <= '1';
        else
            p_tdword_tready <= '0';
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****SPI INTERFACE****
    -----------------------------------------------------------------------------------------------
    NCS_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            p_spi_ncs <= '1';
        elsif(rising_edge(clk)) then
            if(ps_spi = s_idle) then
                p_spi_ncs <= '1';
            else
                p_spi_ncs <= '0';
            end if;
        end if;
    end process;


    SCLK_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            p_spi_sclk <= g_cpol;
        elsif(rising_edge(clk)) then
            if(ps_spi /= s_transfer) then
                p_spi_sclk <= g_cpol;
            elsif(spi_sclk_counter < g_clk_factor/2) then
                p_spi_sclk <= not g_cpol;
            else
                p_spi_sclk <= g_cpol;
            end if;
        end if;
    end process;


    MOSI_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            mosi_buffer_i <= (others => '0');

        elsif(rising_edge(clk)) then
            if((ps_spi = s_idle or ps_spi = s_hold) and (p_tdword_tvalid = '1')) then
                mosi_buffer_i <= p_tdword_tdata;

            elsif(g_cpha = '0' and ps_spi = s_transfer and spi_sclk_counter = g_clk_factor/2) then
                if(g_msbf = true) then
                    mosi_buffer_i <= mosi_buffer_i(g_word_length-2 downto 0) & "0";
                else
                    mosi_buffer_i <= "0" & mosi_buffer_i(g_word_length-1 downto 1);
                end if;

            elsif(g_cpha = '1' and ps_spi = s_transfer and spi_sclk_counter = 0 and spi_cyc_counter > 0) then
                if(g_msbf = true) then
                    mosi_buffer_i <= mosi_buffer_i(g_word_length-2 downto 0) & "0";
                else
                    mosi_buffer_i <= "0" & mosi_buffer_i(g_word_length-1 downto 1);
                end if;

            else null;
            end if;
        end if;
    end process;

    --Route mosi port
    p_spi_mosi <= mosi_buffer_i(g_word_length-1) when(g_msbf) else mosi_buffer_i(0);


    MISO_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            miso_buffer_i <= (others => '0');

        elsif(rising_edge(clk)) then
            if(ps_spi = s_transfer and g_cpha = '0' and spi_sclk_counter = 0) then
                if(g_msbf = true) then
                    miso_buffer_i((g_word_length-1) - spi_cyc_counter) <= p_spi_miso;
                else
                    miso_buffer_i(spi_cyc_counter) <= p_spi_miso;
                end if;

            elsif(ps_spi = s_transfer and g_cpha = '1' and spi_sclk_counter = g_clk_factor/2-1) then
                if(g_msbf = true) then
                    miso_buffer_i((g_word_length-1) - spi_cyc_counter) <= p_spi_miso;
                else
                    miso_buffer_i(spi_cyc_counter) <= p_spi_miso;
                end if;
            
            else null;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
    SPI_PERIOD_COUNTER : process(clk,rst)
    begin
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


    SPI_SLACK_COUNTER : process(clk,rst)
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
    -----------------------------------------------------------------------------------------------


end architecture;