-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/07/2023
-- Design Name:		SPI General Reciver Module - Peripheral Interface
-- Module Name:		SPI_R_DRIVER
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
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @breif Customizable SPI peripheral interface 
--! @details
--! SPI peripheral/slave interface for general communication applications. The 
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
--!     - [g_cpol='0']: sclk low when module idle
--!     - [g_cpha='0']: data registered on rising edge and shifted on falling edge
--! + Mode 1:
--!     - [g_cpol='0']: sclk low when module idle
--!     - [g_cpha='1']: data registered on falling edge and shifted on rising edge
--! + Mode 2:
--!     - [g_cpol='1']: sclk high when module idle
--!     - [g_cpha='0']: data registered on falling edge and shifted on rising edge
--! + Mode 3:
--!     - [g_cpol='1']: sclk high when module idle
--!     - [g_cpha='1']: data registered on rising edge and shifted on falling edge
--!
--! Both the transfered data width and direction can be controled with the parameters
--! "g_word_length" and "g_msbf". The module uses an internal flip-flop to register
--! the sclk signal and detect rising and falling edges, therfore the module can 
--! properly register driven at a rate of up to clk_period/2. However it is recommended
--! to synchronize the input data and reduce maximum transfer rate to arround
--! clk_period/6.
--! The "p_dword_tdata" is stored in a register when the i_dword_valid signal is 
--! asserted and used to drive the "p_spi_miso" signal when an SPI transfer is 
--! performed. The "o_dword_tvalid" is asserted for a clk cycle after the last
--! bit of the spi word is registered.
--! The "p_spi_miso_highz" indicates when data is not valid in the miso output to
--! allow the module to use tri-state buffers and multi-slave bus stuctures.
--! 
--! ***Latency: 1cyc***
entity SPI_R_DRIVER is
    generic(
        g_word_length       :   integer   := 8;                                 --! Data width of the SPI transfered data word
        g_cpol              :   std_logic := '1';                               --! Value of the sclk input when module in idle mode
        g_cpha              :   std_logic := '0';                               --! Edge used to register or shift data
        g_msbf              :   boolean   := true                               --! Transfer data format
    );
    port(
        --General
        clk                 : in    std_logic;                                  --! System clock
        rst                 : in    std_logic;                                  --! Asynchronous clock
        --Parallel interface
        p_tdword_tvalid     : in    std_logic;                                  --! Parallel input data word valid 
        p_tdword_tdata      : in    std_logic_vector(g_word_length-1 downto 0); --! Parallel input data word - "MISO" data
        p_rdword_tvalid     : out   std_logic;                                  --! Parallel output data word valid
        p_rdword_tdata      : out   std_logic_vector(g_word_length-1 downto 0); --! Parallel output data word - "MOSI" data
        --SPI interface
        p_spi_ncs           : in    std_logic;                                  --! SPI Chip select input signal - logic low
        p_spi_sclk          : in    std_logic;                                  --! SPI Serial clock input signal 
        p_spi_mosi          : in    std_logic;                                  --! SPI Master out / Slave in data
        p_spi_miso          : out   std_logic;                                  --! SPI Master in  / Slave out data 
        p_spi_miso_highz    : out   std_logic                                   --! SPI miso output in high ipedance state (Multi-slave bus)
    );
end entity SPI_R_DRIVER;




--! General architecture
architecture RTL of SPI_R_DRIVER is
    
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
            if(p_spi_ncs = '1') then
                spi_sclk_old <= g_cpol;
            else
                spi_sclk_old <= p_spi_sclk;
            end if;
        end if;
    end process;


    PARALLEL_DATA_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            miso_buff_i <= (others => '0');
        elsif(rising_edge(clk)) then
            if(p_tdword_tvalid = '1') then
                miso_buff_i <= p_tdword_tdata;
            end if;        
        end if;
    end process;


    MOSI_DATA_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            p_rdword_tvalid <= '0';
            p_rdword_tdata  <= (others => '0');
            spi_cyc_counter <= 0;

        elsif(rising_edge(clk)) then
            --Serial to parallel data conversion
            if(p_spi_ncs = '1') then
                spi_cyc_counter <= 0;

            --Detect register edge based on cpha configuration    
            elsif((p_spi_sclk = cpha_sclk) and (spi_sclk_old = cpha_sclk_old)) then
                --Shift register with incoming data (mosi) based on MSBF
                if(g_msbf = true) then
                    p_rdword_tdata((g_word_length-1) - spi_cyc_counter) <= p_spi_mosi;
                else
                    p_rdword_tdata(spi_cyc_counter) <= p_spi_mosi;
                end if;

                --Control transaction length through cyc_mosi_counter
                if(spi_cyc_counter = g_word_length-1) then
                    spi_cyc_counter <= 0;
                    p_rdword_tvalid  <= '1';
                else
                    spi_cyc_counter <= spi_cyc_counter + 1;
                end if;

            else
                --Ground valid flag to avoid multiple transfers
                p_rdword_tvalid <= '0';
            end if;
        end if;
    end process;


    MISO_DATA_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            p_spi_miso       <= '0';
            p_spi_miso_highz <= '1';
            
        elsif(rising_edge(clk)) then
            if(p_spi_ncs = '1') then
                p_spi_miso       <= '0';
                p_spi_miso_highz <= '1';
            
            else
                --Enable bus line
                p_spi_miso_highz <= '0';
                
                --Shift data by comparing sclk value with cpol and MSBF
                if(g_cpha = '0' and g_cpol = p_spi_sclk and g_msbf = true) then
                    p_spi_miso <= miso_buff_i((g_word_length-1)-spi_cyc_counter);
                elsif(g_cpha = '0' and g_cpol = p_spi_sclk and g_msbf = false) then
                    p_spi_miso <= miso_buff_i(spi_cyc_counter);
                elsif(g_cpha = '1' and g_cpol = not p_spi_sclk and g_msbf = true) then
                    p_spi_miso <= miso_buff_i((g_word_length-1)-spi_cyc_counter);
                elsif(g_cpha = '1' and g_cpol = not p_spi_sclk and g_msbf = false) then
                    p_spi_miso <= miso_buff_i(spi_cyc_counter);
                else null;
                end if;

            end if;
        end if;
    end process;



end architecture;