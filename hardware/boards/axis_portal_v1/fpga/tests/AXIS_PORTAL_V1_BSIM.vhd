library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_MODULE_CONFIG.all;

entity AXIS_PORTAL_V1_BSIM is
end entity AXIS_PORTAL_V1_BSIM;

architecture TB of AXIS_PORTAL_V1_BSIM is

    --****INTERNAL SIGNALS****
    --Simulation timing
    constant sclk_period  : time                                          := 160 ns;
    constant clk_period   : time                                          := 20 ns;
    signal clock          : std_logic                                     := '0';
    signal reset          : std_logic                                     := '0';
    -- DUT IOs
    signal SPI0_SCLK      : std_logic                                     := '1';
    signal SPI0_MOSI      : std_logic                                     := '0';
    signal SPI0_MISO      : std_logic                                     := '0';
    signal SPI0_nCE0      : std_logic                                     := '1';
    signal IO_DATA        : std_logic_vector(PHYSICAL_PIN_NUMBER - 1 downto 0);
    --Testbench
    signal mosi_data_buff : std_logic_vector(SPI_DATA_WIDTH - 1 downto 0) := (others => '0');
    alias mosi_config     : std_logic_vector(CONFIGURATION_WORD-1 downto 0) is mosi_data_buff(SPI_DATA_WIDTH - 1 downto SYSTEM_DATA_WIDTH);
    alias mosi_data       : std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0) is mosi_data_buff(SYSTEM_DATA_WIDTH - 1 downto 0);
    signal miso_data_buff : std_logic_vector(SPI_DATA_WIDTH - 1 downto 0) := (others => '0');

begin

    DUT : entity work.TOP_LEVEL
        port map(
            ClockFPGA   => clock,
            FPGA_nReset => reset,
            SPI0_SCLK   => SPI0_SCLK,
            SPI0_MOSI   => SPI0_MOSI,
            SPI0_MISO   => SPI0_MISO,
            SPI0_nCE0   => SPI0_nCE0,
            IO_DATA     => IO_DATA
        );

    clock <= not clock after clk_period / 2;
    reset <= '1' after 10 ns, '0' after 110 ns;

    TEST : process
        --Timing
        constant init_hold   : time := 30 * clk_period / 2;
        constant assert_hold : time := 3 * clk_period / 2;
        constant post_hold   : time := 1 * clk_period / 2;
    begin
        --**Initial setup**
        --Ground input pins
        IO_DATA(10 downto 0)  <= (others => '0');
        IO_DATA(16 downto 11) <= (others => '0');
        IO_DATA(40 downto 33) <= (others => '0');
        wait for init_hold;

        --**Test communication with AP1**
        --Read configuration register
        mosi_config <= "00" & std_logic_vector(to_unsigned(0, BUS_TAG_BITS)) & std_logic_vector(to_unsigned(1, BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(15, SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period, mosi_data_buff, miso_data_buff, SPI0_nCE0, SPI0_SCLK, SPI0_MOSI, SPI0_MISO);

        wait for assert_hold;
        assert (miso_data_buff = std_logic_vector(to_unsigned(16, SPI_DATA_WIDTH)))
        report "ID01: Test communication - expecting ctrl_reg = 16/x10"
        severity error;
        wait for post_hold;

        wait for 5 * clk_period;

        --**Test actuation modules in the AP1**
        --Turn environment LED red on
        mosi_config <= "10" & std_logic_vector(to_unsigned(0, BUS_TAG_BITS)) & std_logic_vector(to_unsigned(22, BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128, SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period, mosi_data_buff, miso_data_buff, SPI0_nCE0, SPI0_SCLK, SPI0_MOSI, SPI0_MISO);

        --Turn environment LED white on
        mosi_config <= "10" & std_logic_vector(to_unsigned(0, BUS_TAG_BITS)) & std_logic_vector(to_unsigned(23, BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128, SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period, mosi_data_buff, miso_data_buff, SPI0_nCE0, SPI0_SCLK, SPI0_MOSI, SPI0_MISO);

        --Turn environment LED green on
        mosi_config <= "10" & std_logic_vector(to_unsigned(0, BUS_TAG_BITS)) & std_logic_vector(to_unsigned(24, BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(128, SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period, mosi_data_buff, miso_data_buff, SPI0_nCE0, SPI0_SCLK, SPI0_MOSI, SPI0_MISO);

        wait for assert_hold;
        assert (IO_DATA(32 downto 30) = "111")
        report "ID02: Test AP1 operation - expecting environment LEDs = '1'"
        severity error;
        wait for post_hold;

        wait for 5 * clk_period;

        --**Test processing modules in the AP1**
        --Limit sensors active
        IO_DATA(9 downto 0) <= (others => '1');
        --Read sensor register
        mosi_config         <= "00" & std_logic_vector(to_unsigned(0, BUS_TAG_BITS)) & std_logic_vector(to_unsigned(3, BUS_ADDRESS_WIDTH));
        mosi_data           <= std_logic_vector(to_unsigned(0, SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period, mosi_data_buff, miso_data_buff, SPI0_nCE0, SPI0_SCLK, SPI0_MOSI, SPI0_MISO);

        wait for assert_hold;
        assert (miso_data_buff = std_logic_vector(to_unsigned(255, SPI_DATA_WIDTH)))
        report "ID03: Test AP1 operation - expecting sensor_reg = 255/xFF"
        severity error;
        wait for post_hold;

        wait for 5 * clk_period;

        --**Test DC Motor drivers**
        --Sensors z_positive and x_negative asserted
        IO_DATA(9 downto 2) <= "10000001";
        --Set pwm to maximum
        mosi_config         <= "10" & std_logic_vector(to_unsigned(0, BUS_TAG_BITS)) & std_logic_vector(to_unsigned(14, BUS_ADDRESS_WIDTH));
        mosi_data           <= std_logic_vector(to_unsigned(255, SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period, mosi_data_buff, miso_data_buff, SPI0_nCE0, SPI0_SCLK, SPI0_MOSI, SPI0_MISO);
        --Enable motor in locked direction        
        mosi_config         <= "10" & std_logic_vector(to_unsigned(0, BUS_TAG_BITS)) & std_logic_vector(to_unsigned(13, BUS_ADDRESS_WIDTH));
        mosi_data           <= std_logic_vector(to_unsigned(1, SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period, mosi_data_buff, miso_data_buff, SPI0_nCE0, SPI0_SCLK, SPI0_MOSI, SPI0_MISO);

        wait for assert_hold;
        assert (IO_DATA(17) = '1' and IO_DATA(18) = '0' and IO_DATA(19) = '0')
        report "ID04: Test AP1 operation - expecting IO_DATA(19,18,17) = '0','0','1'"
        severity error;
        wait for post_hold;

        --Enable motor in free direction        
        mosi_config <= "10" & std_logic_vector(to_unsigned(0, BUS_TAG_BITS)) & std_logic_vector(to_unsigned(13, BUS_ADDRESS_WIDTH));
        mosi_data   <= std_logic_vector(to_unsigned(2, SYSTEM_DATA_WIDTH));
        p_spiTransaction(sclk_period, mosi_data_buff, miso_data_buff, SPI0_nCE0, SPI0_SCLK, SPI0_MOSI, SPI0_MISO);

        wait for assert_hold;
        assert (IO_DATA(17) = '1' and IO_DATA(18) = '1' and IO_DATA(19) = '0')
        report "ID05: Test AP1 operation - expecting IO_DATA(19,18,17) = '0','1','1'"
        severity error;
        wait for post_hold;

        std.env.finish;

    end process;

end architecture;
