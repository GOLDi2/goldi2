-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Test design for Breakout-board
-- Module Name:		TOP_LEVEL
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! MachX02 library
library machxo2;
use machxo2.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;
use work.GOLDI_MODULE_CONFIG.all;




entity TOP_LEVEL is
    port(
        --General
        FPGA_nReset : in    std_logic;   
        --Communication
        --SPI
        SPI0_SCLK   : in    std_logic;
        SPI0_MOSI   : in    std_logic;
        SPI0_MISO   : out   std_logic;
        SPI0_nCE0   : in    std_logic;
        --IO
        IO_DATA     : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
    );
end entity TOP_LEVEL;





--! General architecture
architecture RTL of TOP_LEVEL is
    
    --****INTERNAL SIGNALS****
    --General
    signal clk                  :   std_logic;
    signal FPGA_nReset_sync     :   std_logic;
    signal rst                  :   std_logic;
    --Communication
    signal spi0_sclk_sync       :   std_logic;
    signal spi0_mosi_sync       :   std_logic;
    signal spi0_nce0_sync       :   std_logic;
    signal spi0_ce0             :   std_logic;
    --System Internal communications
    signal master_bus_o         :   mbus_out;
    signal master_bus_i   	    :   mbus_in;
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_o_vector(9 downto 0) := (others => gnd_sbus_o);
    --Control memory
    constant reg_default_1      :   data_word_vector(0 downto 0) := (others => x"0F");
    constant reg_default_2      :   data_word_vector(1 downto 0) := (others => x"F0");
    constant reg_default_3      :   data_word_vector(2 downto 0) := (others => x"FF");
    signal reg_data_1           :   data_word_vector(0 downto 0);
    signal reg_data_2           :   data_word_vector(1 downto 0);
    signal reg_data_3           :   data_word_vector(2 downto 0);
    signal reg_data_1_buff      :   data_word_vector(0 downto 0);
    signal reg_data_2_buff      :   data_word_vector(1 downto 0);
    signal reg_data_3_buff      :   data_word_vector(2 downto 0);
    --Data interface
    signal external_io_i        :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal external_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);


begin

    --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    --clk <= ClockFPGA;
    OSCInst0 : component machxo2.components.OSCH
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
        io_sync => FPGA_nReset_sync
    );
    rst <=  not FPGA_nReset_sync;


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
    --Multiplexing of BUS
    sys_bus_i <= master_bus_o;

    BUS_MUX : process(clk)
    begin
        if(rising_edge(clk)) then
            master_bus_i <= reduceBusVector(sys_bus_o);
        end if;
    end process;
    -----------------------------------------------------------------------------------------------




    --****IO DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    FPGA_PIN_INTERFACE : entity work.TRIS_BUFFER_ARRAY
    generic map(
        BUFF_NUMBER     => PHYSICAL_PIN_NUMBER
    )
    port map(
        clk             => clk,
        rst             => rst,
        port_out        => external_io_o,
        port_in_async   => open,
        port_in_sync    => external_io_i,
        io_vector       => IO_DATA
    );
    external_io_o <= (others => gnd_io_o);
    -----------------------------------------------------------------------------------------------




    --****INCREMENTAL ENCODERS****
    -----------------------------------------------------------------------------------------------
    TB_1 : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => 1,
        NUMBER_REGISTERS    => 1,
        REG_DEFAULT_VALUES  => reg_default_1
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o(0),
        data_in             => reg_data_1_buff,
        data_out            => reg_data_1,
        read_stb            => open,
        write_stb           => open
    );
    reg_data_1_buff(0) <= x"10" or reg_data_1(0);


      
    TB_2 : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => 2,
        NUMBER_REGISTERS    => 2,
        REG_DEFAULT_VALUES  => reg_default_2
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o(1),
        data_in             => reg_data_2_buff,
        data_out            => reg_data_2,
        read_stb            => open,
        write_stb           => open
    );
    reg_data_2_buff(0) <= x"20" or reg_data_2(0);
    reg_data_2_buff(1) <= x"30" or reg_data_2(1);



    TB_3 : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => 4,
        NUMBER_REGISTERS    => 3,
        REG_DEFAULT_VALUES  => reg_default_3
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o(2),
        data_in             => reg_data_3_buff,
        data_out            => reg_data_3,
        read_stb            => open,
        write_stb           => open
    );
    reg_data_3_buff(0) <= x"40" or reg_data_3(0);
    reg_data_3_buff(1) <= x"50" or reg_data_3(1);
    reg_data_3_buff(2) <= x"60" or reg_data_3(2);
    -----------------------------------------------------------------------------------------------


end architecture RTL;
