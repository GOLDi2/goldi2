-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Top level - High-bay warehouse
-- Module Name:		TOP_LEVEL
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	->
--
-- Revisions:
-- Revision V0.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_CROSSBAR_DEFAULT.all;
--! MachXO2 libary
library machxo2;
use machxo2.all;




--! @brief
--! @details
--!
entity TOP_LEVEL is
    port(
        --General
        ClockFPGA   : in    std_logic;
        FPGA_nReset : in    std_logic;   
        --Communication
        --SPI
        SPI0_SCLK   : in    std_logic;
        SPI0_MOSI   : in    std_logic;
        SPI0_MISO   : out   std_logic;
        SPI0_nCE0   : in    std_logic;
        --FPGA Pins
        IO_DATA     : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
    );
end entity TOP_LEVEL;




--! General architecture
architecture RTL of TOP_LEVEL is
    
    --****INTERNAL SIGNALS****
    signal clk                  :   std_logic;
    signal rst                  :   std_logic;
    --Communication
    signal spi0_sclk_sync       :   std_logic;
    signal spi0_mosi_sync       :   std_logic;
    signal spi0_nce0_sync       :   std_logic;
    signal spi0_ce0             :   std_logic;
    --System Internal communications
    signal master_bus_o         :   mbus_out;
    signal master_bus_i         :   mbus_in;
    signal cb_bus_i             :   sbus_in;
    signal cb_bus_o             :   sbus_o_vector(1 downto 0);
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_o_vector(14 downto 0);
    --Configuration memory
    constant REG_CONFIG_DEFAULT :   data_word_vector(0 downto 0) :=  (others => (others => '0'));
    signal config_reg_data      :   data_word_vector(0 downto 0);
        alias selected_bus      :   std_logic is config_reg_data(0)(0);
        alias encoder_ref       :   std_logic is config_reg_data(0)(1);
    --External data interface
    signal internal_io_i        :   io_i_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    signal internal_io_o        :   io_o_vector(VIRTUAL_PIN_NUMBER-1 downto 0);
    signal external_io_i        :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o_safe   :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);



begin

    --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    --clk <= ClockFPGA;
    INTERNAL_CLOCK : component machxo2.components.OSCH
    generic map(
        NOM_FREQ => "53.2"
    )
    port map(
        STDBY    => '0',
        OSC      => clk,
        SEDSTDBY => open
    );
    -----------------------------------------------------------------------------------------------




    --****MICROCONTROLLER INTERFACE****
    -----------------------------------------------------------------------------------------------
    --Synchronization of Reset input
    RESET_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => '0',
        io_i    => FPGA_nReset,
        io_sync => rst
    );


    --SPI communication
    SCLK_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => SPI0_SCLK,
        io_sync => spi0_sclk_sync
    );

    MOSI_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => SPI0_MOSI,
        io_sync => spi0_mosi_sync
    );

    NCE0_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => SPI0_nCE0,
        io_sync => spi0_nce0_sync
    );
    --Negate nce for use in comm modules
    spi0_ce0 <= not spi0_nce0_sync;


    --SPI comm modules
    SPI_BUS_COMMUNICATION : entity work.SPI_TO_BUS
    port map(
        clk             => clk,
        rst             => rst,
        ce              => spi0_ce0,
        sclk            => spi0_sclk_sync,
        mosi            => spi0_mosi_sync,
        miso            => SPI0_MISO,
        master_bus_o    => master_bus_o,
        master_bus_i    => master_bus_i
    );
    -----------------------------------------------------------------------------------------------




    --****INTERNAL COMMUNICATION MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Register to select the main communication bus or the io crossbar structure module
    SYSTEM_CONFIG_REG : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => CONFIG_REG_ADDRESS,
        NUMBER_REGISTERS    => 1,
        REG_DEFAULT_VALUES  => REG_CONFIG_DEFAULT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => master_bus_o,
        sys_bus_o           => sys_bus_o(0),
        reg_data_in         => config_reg_data,
        reg_data_out        => config_reg_data,
        reg_data_stb        => open
    );
    
    --Mirror output bus to make register accessible in both modes of operation
    cb_bus_o(0) <= sys_bus_o(0); 


    --Multiplexing of BUS 
    sys_bus_i <= master_bus_o when(selected_bus = '0') else gnd_sbus_i;
    cb_bus_i  <= master_bus_o when(selected_bus = '1') else gnd_sbus_i;

    BUS_MUX : process(clk)
    begin
        if(rising_edge(clk)) then
            if(selected_bus = '0') then
                master_bus_i <= reduceBusVector(sys_bus_o);
            elsif(selected_bus = '1') then
                master_bus_i <= reduceBusVector(cb_bus_o);
            else
                master_bus_i <= gnd_mbus_i;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****IO DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Routing IO formatted data between FPGA Pins ([io_i,io_o] <-> inout std_logic)
    FPGA_PIN_INTERFACE : entity work.TRIS_BUFFER_ARRAY
    generic map(
        BUFF_NUMBER     => PHYSICAL_PIN_NUMBER
    )
    port map(
        clk             => clk,
        rst             => rst,
        port_out        => external_io_o_safe,
        port_in_async   => open,
        port_in_sync    => external_io_i,
        io_vector       => IO_DATA
    );


    --Route IO formatted data from pins tos system modules
    IO_ROUTING : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => VIRTUAL_PIN_NUMBER,
        RIGHT_PORT_LENGTH   => PHYSICAL_PIN_NUMBER,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        cb_bus_i            => cb_bus_i,
        cb_bus_o            => cb_bus_o(1),
        left_io_i_vector    => internal_io_i,
        left_io_o_vector    => internal_io_o,
        right_io_i_vector   => external_io_i,
        right_io_o_vector   => external_io_o
    );
    -----------------------------------------------------------------------------------------------




    --****INCREMENTAL ENCODERS****
    

end architecture RTL;
