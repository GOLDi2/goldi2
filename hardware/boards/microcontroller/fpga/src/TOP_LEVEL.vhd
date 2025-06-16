library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
library machxo2;
use machxo2.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_MODULE_CONFIG.all;

--! @brief Top Level of FPGA system for GOLDI Axis Portal V1
--! @details
--! The top module contains the drivers for the sensors and actuators 
--! of the GOLDI Axis Portal V1 system.
entity TOP_LEVEL is
    port(
        --General
        ClockFPGA   : in    std_logic;  --! External system clock
        FPGA_nReset : in    std_logic;  --! Active high reset
        --LEDs:
        LEDPowerG   : out   std_logic;
        LEDPowerR   : out   std_logic;
        --SPI
        SPI0_SCLK   : in    std_logic;  --! SPI - Serial clock
        SPI0_MOSI   : in    std_logic;  --! SPI - Master out / Slave in
        SPI0_MISO   : out   std_logic;  --! SPI - Master in / Slave out
        SPI0_nCE0   : in    std_logic;  --! SPI - Active low chip enable
        -- ISP
        GPIO0       : out   std_logic;  --! ISP - MISO
        GPIO1       : in    std_logic;  --! ISP - MOSI
        SPI0_nCE1   : in    std_logic;  --! ISP - SCK
        SPI1_nCE1   : in    std_logic;  --! ISP - RST

        --Microcontroller Interface
        IO_DATA     : inout std_logic_vector(86 downto 0) --! IO pins
    );
end entity TOP_LEVEL;

--! GOLDi Axis Portal V1 Top Level architecture
architecture RTL of TOP_LEVEL is

    --****INTRENAL SIGNALS****
    --General
    signal clk                : std_logic;
    signal rst                : std_logic;
    signal FPGA_nReset_sync   : std_logic;
    --Communication
    signal spi0_sclk_sync     : std_logic;
    signal spi0_mosi_sync     : std_logic;
    signal spi0_nce0_sync     : std_logic;
    --System Internal communications
    signal master_bus_o       : mbus_out;
    signal master_bus_i       : mbus_in;
    signal sys_bus_i          : sbus_in;
    signal sys_bus_o          : sbus_o_vector(3 downto 0);
    --System memory
    signal ctrl_data          : data_word;
    alias enable_isp          : std_logic is ctrl_data(0);
    --External data interface
    signal system_io_i        : io_i_vector(86 downto 0);
    signal system_io_isp_muxed_o        : io_o_vector(86 downto 0);
    signal system_io_o        : io_o_vector(86 downto 0);
    -- isp rpi
    alias isp_miso_rpi            : std_logic is GPIO0;
    alias isp_mosi_rpi            : std_logic is GPIO1;
    alias isp_sck_rpi             : std_logic is SPI0_nCE1;
    alias isp_rst_rpi             : std_logic is SPI1_nCE1;
    -- isp mc
    alias isp_miso_mc_i : io_i is system_io_i(19);
    alias isp_miso_mc_o : io_o is system_io_isp_muxed_o(19);
    alias isp_mosi_mc_o : io_o is system_io_isp_muxed_o(18);
    alias isp_sck_mc_o : io_o is system_io_isp_muxed_o(17);
    alias isp_rst_mc_o is system_io_isp_muxed_o(86);

begin
    clk <= ClockFPGA;

    --****MICROCONTROLLER INTERFACE****
    -----------------------------------------------------------------------------------------------
    --Synchronization of Reset input
    RESET_SYNC : entity work.SYNCHRONIZER
        generic map(
            g_stages => 2
        )
        port map(
            clk       => clk,
            rst       => '0',
            p_io_i    => FPGA_nReset,
            p_io_sync => FPGA_nReset_sync
        );

    rst <= FPGA_nReset_sync;

    --SPI communication
    SCLK_SYNC : entity work.SYNCHRONIZER
        generic map(
            g_stages => 2
        )
        port map(
            clk       => clk,
            rst       => rst,
            p_io_i    => SPI0_SCLK,
            p_io_sync => spi0_sclk_sync
        );

    MOSI_SYNC : entity work.SYNCHRONIZER
        generic map(
            g_stages => 2
        )
        port map(
            clk       => clk,
            rst       => rst,
            p_io_i    => SPI0_MOSI,
            p_io_sync => spi0_mosi_sync
        );

    NCE0_SYNC : entity work.SYNCHRONIZER
        generic map(
            g_stages => 2
        )
        port map(
            clk       => clk,
            rst       => rst,
            p_io_i    => SPI0_nCE0,
            p_io_sync => spi0_nce0_sync
        );

    --SPI communication adaptor
    SPI_BUS_COMMUNICATION : entity work.GOLDI_SPI_SMODULE
        port map(
            clk            => clk,
            rst            => rst,
            p_spi_nce      => spi0_nce0_sync,
            p_spi_sclk     => spi0_sclk_sync,
            p_spi_mosi     => spi0_mosi_sync,
            p_spi_miso     => SPI0_MISO,
            p_master_bus_o => master_bus_o,
            p_master_bus_i => master_bus_i
        );
    -----------------------------------------------------------------------------------------------

    --****INTERNAL COMMUNICATION MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Register for configuration applications
    SYSTEM_CONFIG_REG : entity work.REGISTER_UNIT
        generic map(
            g_address   => CONFIG_REG_ADDRESS,
            g_def_value => (others => '0')
        )
        port map(
            clk         => clk,
            rst         => rst,
            sys_bus_i   => master_bus_o,
            sys_bus_o   => sys_bus_o(0),
            p_data_in   => ctrl_data,
            p_data_out  => ctrl_data,
            p_read_stb  => open,
            p_write_stb => open
        );

    --Multiplexing of BUS 
    sys_bus_i <= master_bus_o;

    BUS_MUX : process(clk)
    begin
        if (rising_edge(clk)) then
            master_bus_i <= reduceBusVector2(sys_bus_o);
        end if;
    end process;
    -----------------------------------------------------------------------------------------------

    --****IO DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Routing IO formatted data between FPGA Pins ([io_i,io_o] <-> inout std_logic)
    FPGA_PIN_INTERFACE : entity work.TRIS_BUFFER_ARRAY
        generic map(
            g_buff_number => 87
        )
        port map(
            clk           => clk,
            rst           => rst,
            port_out      => system_io_isp_muxed_o,
            port_in_async => open,
            port_in_sync  => system_io_i,
            io_vector     => IO_DATA
        );

    -----------------------------------------------------------------------------------------------
    GPIO_MANAGEMENT : entity work.GPIO_SMODULE
        generic map(
            g_address     => GPIO_DRIVER_ADDRESS,
            g_gpio_number => 87
        )
        port map(
            clk             => clk,
            rst             => rst,
            sys_bus_i       => sys_bus_i,
            sys_bus_o       => sys_bus_o(1),
            p_gpio_i_vector => system_io_i(86 downto 0),
            p_gpio_o_vector => system_io_o(86 downto 0)
        );


    -- link to isp
    isp_muxing : process(isp_mosi_rpi, isp_sck_rpi, isp_rst_rpi, enable_isp, isp_miso_mc_i.dat, system_io_o) is
    begin
        system_io_isp_muxed_o <= system_io_o;
        isp_miso_rpi <= '0';
        if enable_isp then
            isp_miso_mc_o.enb <= '0';
            isp_miso_rpi <= isp_miso_mc_i.dat;
            isp_mosi_mc_o.enb <= '1';
            isp_mosi_mc_o.dat <= isp_mosi_rpi;
            isp_sck_mc_o.enb <= '1';
            isp_sck_mc_o.dat <= isp_sck_rpi;
            isp_rst_mc_o.enb <= '1';
            isp_rst_mc_o.dat <= isp_rst_rpi;
        end if;
    end process isp_muxing;
    

    --****LED MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    POWER_RED : entity work.LED_SMODULE
        generic map(
            g_address       => PR_LED_ADDRESS,
            g_clk_frequency => PR_LED_FREQUENCY,
            g_inverted      => PR_LED_INVERTED
        )
        port map(
            clk          => clk,
            rst          => rst,
            sys_bus_i    => sys_bus_i,
            sys_bus_o    => sys_bus_o(2),
            p_led_output => open,
            p_raw_led_output => LEDPowerR
        );

    POWER_GREEN : entity work.LED_SMODULE
        generic map(
            g_address       => PG_LED_ADDRESS,
            g_clk_frequency => PG_LED_FREQUENCY,
            g_inverted      => PG_LED_INVERTED
        )
        port map(
            clk          => clk,
            rst          => rst,
            sys_bus_i    => sys_bus_i,
            sys_bus_o    => sys_bus_o(3),
            p_led_output => open,
            p_raw_led_output => LEDPowerG
        );

end architecture;
