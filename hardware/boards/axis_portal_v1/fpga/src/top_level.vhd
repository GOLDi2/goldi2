library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

library machxo2;
use machxo2.all;

entity top_level is
    port(
        LEDPowerR   : out   std_logic;
        SPI0_MISO   : out   std_logic;
        SPI0_SCLK   : inout std_logic;
        SPI0_MOSI   : inout std_logic;
        SPI0_nCE0   : inout std_logic;
        FPGA_nReset : inout std_logic;
        IO          : inout std_logic_vector(63 downto 0)
    );
end entity top_level;

architecture RTL of top_level is
    signal rst : std_logic;
    signal clk : std_logic;
    signal bus_miso : work.GBus.umaster_in;
    signal bus_mosi : work.GBus.umaster_out;
    signal gpio_ports_out : work.crossbar.uport_out_vector(63 downto 0);
    signal gpio_ports_in : work.crossbar.uport_in_vector(63 downto 0);
    signal ports_in : work.crossbar.uport_in_vector(63 downto 0);
    signal ports_out : work.crossbar.uport_out_vector(63 downto 0);
begin
    LEDPowerR <= '1';
    rst <= FPGA_nReset;

    --clk <= ClockFPGA;
    OSCInst0 : component machxo2.components.OSCH
        generic map(
            NOM_FREQ => "133.00"
        )
        port map(
            STDBY    => '0',
            OSC      => clk,
            SEDSTDBY => open
        );

    spi0 : entity work.spi_gbus_bridge_synchronized
        port map(
            clk     => clk,
            rst     => rst,
            mosi    => SPI0_MOSI,
            miso    => SPI0_MISO,
            sck     => SPI0_SCLK,
            cs      => not SPI0_nCE0,
            bus_in  => bus_miso,
            bus_out => bus_mosi
        ) ;
        
    gpio_module_array_inst : entity work.gpio_module_array
        generic map(
            address    => 0,
            module_cnt => 16
        ) 
        port map(
            clk      => clk,
            rst      => rst,
            bus_in   => bus_mosi,
            bus_out  => bus_miso,
            port_out => gpio_ports_out,
            port_in  => gpio_ports_in
        ) ;
    

    crossbar_switch_inst : entity work.crossbar_switch
        generic map(
            left_side_port_cnt  => 64,
            right_side_port_cnt => 64
        ) 
        port map(
            config          => work.crossbar_config.config,
            left_ports_out  => gpio_ports_out,
            right_ports_out  => ports_out,
            left_ports_in   => gpio_ports_in,
            right_ports_in => ports_in
        );
        
    machxo2_pad_array_inst : entity work.machxo2_pad_array
        generic map(
            pad_cnt => 64
        ) 
        port map(
            port_out => ports_out,
            port_in  => ports_in,
            output   => IO
        ) ;
    
end architecture RTL;
