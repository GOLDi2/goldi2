-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/08/2023
-- Design Name:		UART Dynamic Data Rate Sub-Module
-- Module Name:		UART_D_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> UART_RX_DDRIVER.vhd
--                  -> UART_TX_DDRIVER.vhd
--                  -> UART_STD_ENCODER.vhd
--                  -> UART_STD_DECODER.vhd
--                  -> STREAM_FIFO.vhd
--                  -> REGISTER_TABLE.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief Standard UART dynamic communication sub-module
--! @details
--! The UART dynamic sub-module is a communication interface to connect the FPGA with a
--! microcontroller or IC. The module takes the data writen to the first register in the 
--! module and queues the data for its encoding into a suitable data packet and tansmission.
--! In parallel to this, a second structure detects incomming data transmissions and decodes
--! the data and checks for errors. The recived data is then queued for the register to read
--! it. 
--!
--! The five parameters "g_data_width", "g_stop_bits", "g_parity_bit", "g_parity_even" 
--! and "g_msbf" are used to configure the data packet format. Assuming a "0"-start-bit 
--! at the beginning of the vector and a "1"-stop-bit at the end, the minimum packet 
--! length is the data width + 2 bits. The "g_parity_bit" sets the bit after the data word 
--! as a parity bit. Eventhough the "g_parity_bit" parameter is defined as an integer only 
--! 1 parity bit is analysed when the value is larger than 0. A larger value results in 
--! additional stop bits. The "g_even_pol" selects the polarity of the parity bit. A true
--! value performs an xor operation over the data word and a false value a xnor.
--! 
--! When the module is in an idle state the trasfer rate of the module can be selected from
--! a list of common used values using the second register of the module.
--!
--! Between the module's register and the UART transmitter and reciver there are two
--! FIFO stuctures that prevent data loses in both directions. The depth of these structure
--! can be configured using the "g_buffer_width". Depending on the difference between
--! the UART and the FPGA tansfer rates a suitable can be selected. However, it is 
--! recommended to reduce the size of these structures when possible given that they
--! use PLU elements and not dedicated RAM. 
--!
--! ### Transfer rates:
--!     + 000 - 9600
--!     + 001 - 19200
--!     + 010 - 38400
--!     + 011 - 57600
--!     + 100 - 115200
--!     + 101 - 230400
--!     + 110 - 460800
--!     + 111 - 921600
--!
--! ###Encoding format:
--!
--!     |<-------------------------- g_encoded_length --------------------------->|    
--!     | stop-bits |  (parity-bit)     |           data_word          |start-bit |
--!     |           | [g_data_width+1]  |       [g_data_width:1]       |  [0]     |
--! 
--!
--! ###Register:
--!
--!     | g_address |           data            |
--!     |:---------:|:-------------------------:|
--!     | +0        |      TX/RX data word      |
--!     | +1        |     transfer_rate[2:0]    |
--!
entity UART_D_SMODULE is
    generic(
        g_address       :   integer := 1;           --! Module's base address
        g_clk_frequency :   integer := 48000000;    --! System clock frequency in Hz
        g_buffer_width  :   integer := 20;          --! Depth of the input and output FIFO structures to queue data
        g_data_width    :   integer := 8;           --! Width of the data word (max: SYSTEM_DATA_WIDTH)
        g_stop_bits     :   integer := 1;           --! Number of stop bits in the data packet
        g_parity_bit    :   integer := 1;           --! Use of a parity bit in data packet (1-true | 0-false)
        g_parity_even   :   boolean := false;       --! Polarity of the parity bit 
        g_msbf          :   boolean := false        --! Format of the data packet
    );
    port(
        --General
        clk             : in    std_logic;          --! System data width
        rst             : in    std_logic;          --! Asynchronous reset
        --BUS slave interface
        sys_bus_i       : in    sbus_in;            --! BUS port input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;           --! BUS port output signals[dat,tag]
        --Serial interface
        p_rx            : in    io_i;               --! UART RX port
        p_rx_available  : out   std_logic;          --! Data avalilable to be read
        p_rx_error      : out   std_logic;          --! Error detected in the recived data encoding (parity error, stop or start bit possition)
        p_tx            : out   io_o                --! UART TX port
    );
end entity UART_D_SMODULE;




--! General architecture
architecture RTL of UART_D_SMODULE is

    --****INTERNAL SIGNALS****
    constant c_encoded_length   :   integer := g_data_width+g_stop_bits+g_parity_bit+1;
    --Memory
    constant reg_default        :   data_word_vector(1 downto 0) := (others => (others => '0'));
    signal reg_data_in          :   data_word_vector(1 downto 0);
    signal reg_data_out         :   data_word_vector(1 downto 0);
    signal reg_r_stb_i          :   std_logic_vector(1 downto 0);
    signal reg_w_stb_i          :   std_logic_vector(1 downto 0);
    signal reg_dword_data_i     :   std_logic_vector(g_data_width-1 downto 0);
    signal reg_dword_valid_i    :   std_logic;
    --Transmiter data
    signal tx_dword_ready_i     :   std_logic;
    signal tx_dword_valid_i     :   std_logic;
    signal tx_dword_data_i      :   std_logic_vector(g_data_width-1 downto 0);
    signal tx_eword_ready_i     :   std_logic;
    signal tx_eword_valid_i     :   std_logic;
    signal tx_eword_data_i      :   std_logic_vector(c_encoded_length-1 downto 0);
    --Reciver data
    signal rx_dword_ready_i     :   std_logic;
    signal rx_dword_valid_i     :   std_logic;
    signal rx_dword_data_i      :   std_logic_vector(g_data_width-1 downto 0);
    signal rx_eword_ready_i     :   std_logic;
    signal rx_eword_valid_i     :   std_logic;
    signal rx_eword_data_i      :   std_logic_vector(c_encoded_length-1 downto 0);
    signal rx_error_flag        :   std_logic;
    --UART
    signal rx                   :   std_logic;
    signal tx                   :   std_logic;


begin

    --***TRANSITER DATA CHAIN****
    -----------------------------------------------------------------------------------------------
    TX_FIFO : entity work.STREAM_FIFO
    generic map(
        g_fifo_width    => g_data_width,
        g_fifo_depth    => g_buffer_width
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_write_tready  => open,
        p_write_tvalid  => reg_w_stb_i(0),
        p_write_tdata   => reg_data_out(0)(g_data_width-1 downto 0),      
        p_read_tready   => tx_dword_ready_i,
        p_read_tvalid   => tx_dword_valid_i,
        p_read_tdata    => tx_dword_data_i
    );


    TX_PACKET_ENCODER : entity  work.UART_STD_ENCODER
    generic map(
        g_encoded_length    => c_encoded_length,
        g_data_width        => g_data_width,
        g_parity_bit        => g_parity_bit,         
        g_even_pol          => g_parity_even
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        p_dword_tready      => tx_dword_ready_i,
        p_dword_tvalid      => tx_dword_valid_i,
        p_dword_tdata       => tx_dword_data_i,
        p_eword_tready      => tx_eword_ready_i,
        p_eword_tvalid      => tx_eword_valid_i,
        p_eword_tdata       => tx_eword_data_i
    );


    UART_TRANSMITTER : entity work.UART_TX_DDRIVER
    generic map(
        g_clk_frequency => g_clk_frequency,
        g_packet_width  => c_encoded_length,
        g_msbf          => g_msbf
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_drate_tready  => open,
        p_drate_tvalid  => reg_w_stb_i(1),
        p_drate_tdata   => reg_data_in(1)(2 downto 0),
        p_dword_tready  => tx_eword_ready_i,
        p_dword_tvalid  => tx_eword_valid_i,
        p_dword_tdata   => tx_eword_data_i,
        p_tx            => tx
    );

    --Route Transmitter
    p_tx.enb <= '1';
    p_tx.dat <= tx;
    -----------------------------------------------------------------------------------------------



    --****RECIVER DATA CHAIN****
    -----------------------------------------------------------------------------------------------
    UART_RECIVER : entity work.UART_RX_DDRIVER
    generic map(
        g_clk_frequency => g_clk_frequency,
        g_packet_width  => c_encoded_length,
        g_msbf          => false
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_drate_tready  => open,
        p_drate_tvalid  => reg_w_stb_i(1),
        p_drate_tdata   => reg_data_in(1)(2 downto 0),
        p_dword_tready  => rx_eword_ready_i,
        p_dword_tvalid  => rx_eword_valid_i,
        p_dword_tdata   => rx_eword_data_i,
        p_rx            => rx
    );

    --Route reciver
    rx <= p_rx.dat;


    UART_PACKET_DECODER : entity work.UART_STD_DECODER
    generic map(
        g_encoded_length    => c_encoded_length,
        g_data_width        => g_data_width,
        g_parity_bit        => g_parity_bit,     
        g_even_pol          => g_parity_even
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        p_eword_tready      => rx_eword_ready_i,
        p_eword_tvalid      => rx_eword_valid_i,
        p_eword_tdata       => rx_eword_data_i,
        p_dword_tready      => rx_dword_ready_i,
        p_dword_tvalid      => rx_dword_valid_i,
        p_dword_tdata       => rx_dword_data_i,
        p_dword_error       => rx_error_flag
    );
    
    --Route fifo empty flag to the outside
    p_rx_error <= rx_error_flag;
    

    RX_FIFO : entity work.STREAM_FIFO
    generic map(
        g_fifo_width    => g_data_width,
        g_fifo_depth    => g_buffer_width
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_write_tready  => rx_dword_ready_i,
        p_write_tvalid  => rx_dword_valid_i,
        p_write_tdata   => rx_dword_data_i,  
        p_read_tready   => reg_r_stb_i(0),
        p_read_tvalid   => reg_dword_valid_i,
        p_read_tdata    => reg_dword_data_i
    );

    --Route data to register and ground port when FIFO is empty
    reg_data_in(0)(g_data_width-1 downto 0) <= reg_dword_data_i when(reg_dword_valid_i = '1') else
                                               (others => '0');

    --Route fifo empty flag to the outside
    p_rx_available <= reg_dword_valid_i;   
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
    generic map(
        g_address       => g_address,
        g_reg_number	=> 2,
        g_def_values    => reg_default
    )
    port map(
        clk             => clk, 
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_data_in       => reg_data_in,
        p_data_out      => reg_data_out,
        p_read_stb      => reg_r_stb_i,
        p_write_stb     => reg_w_stb_i
    );

    reg_data_in(1) <= reg_data_out(1);
    -----------------------------------------------------------------------------------------------


end architecture;