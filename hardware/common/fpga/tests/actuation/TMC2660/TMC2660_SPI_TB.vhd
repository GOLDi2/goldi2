library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;

--! Functionality testbench
entity TMC2660_SPI_TB is
end entity TMC2660_SPI_TB;

--! Simulation architecture
architecture TB of TMC2660_SPI_TB is

    --****DUT****
    component TMC2660_SPI
        generic(
            CLOCK_FACTOR : natural := 8
        );
        port(
            clk             : in  std_logic;
            rst             : in  std_logic;
            s_word_i_tready : out std_logic;
            s_word_i_tvalid : in  std_logic;
            s_word_i_tdata  : in  std_logic_vector(23 downto 0);
            m_word_o_tvalid : out std_logic;
            m_word_o_tdata  : out std_logic_vector(23 downto 0);
            m_spi_sclk      : out std_logic;
            m_spi_ncs       : out std_logic;
            m_spi_mosi      : out std_logic;
            m_spi_miso      : in  std_logic
        );
    end component;

    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period    : time                          := 10 ns;
    signal reset           : std_logic                     := '0';
    signal clock           : std_logic                     := '0';
    --DUT io
    signal s_word_i_tready : std_logic;
    signal s_word_i_tvalid : std_logic;
    signal s_word_i_tdata  : std_logic_vector(23 downto 0);
    signal m_word_o_tvalid : std_logic;
    signal m_word_o_tdata  : std_logic_vector(23 downto 0);
    signal m_spi_sclk      : std_logic;
    signal m_spi_ncs       : std_logic;
    signal m_spi_mosi      : std_logic;
    signal m_spi_miso      : std_logic;
    --Testbench
    constant input_data    : std_logic_vector(23 downto 0) := x"333333";
    signal output_data     : std_logic_vector(23 downto 0);

begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : TMC2660_SPI
        generic map(
            CLOCK_FACTOR => 8
        )
        port map(
            clk             => clock,
            rst             => reset,
            s_word_i_tready => s_word_i_tready,
            s_word_i_tvalid => s_word_i_tvalid,
            s_word_i_tdata  => s_word_i_tdata,
            m_word_o_tvalid => m_word_o_tvalid,
            m_word_o_tdata  => m_word_o_tdata,
            m_spi_sclk      => m_spi_sclk,
            m_spi_ncs       => m_spi_ncs,
            m_spi_mosi      => m_spi_mosi,
            m_spi_miso      => m_spi_miso
        );
    -----------------------------------------------------------------------------------------------

    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= not clock after clk_period / 2;
    reset <= '1' after 5 ns, '0' after 15 ns;
    -----------------------------------------------------------------------------------------------

    --****TEST****
    -----------------------------------------------------------------------------------------------
    SPI_SLAVE : process(m_spi_ncs, m_spi_sclk)
        variable edge_count : natural := 0;
    begin
        if (m_spi_ncs = '0') then
            if (falling_edge(m_spi_sclk)) then
                m_spi_miso <= input_data(23 - edge_count);
            end if;

            if (rising_edge(m_spi_sclk)) then
                output_data(23 - edge_count) <= m_spi_mosi;
                edge_count                   := edge_count + 1;
            end if;
        else
            edge_count := 0;
        end if;
    end process;

    TEST : process
        constant init_hold   : time := 5 * clk_period / 2;
        constant assert_hold : time := clk_period / 2;
        constant post_hold   : time := clk_period / 2;
    begin
        --Preset signals
        s_word_i_tvalid <= '0';
        s_word_i_tdata  <= (others => '0');
        wait for init_hold;

        --Test idle state of module
        wait for assert_hold;
        assert (s_word_i_tready = '1')
        report "ID01: Test idle - expecting s_word_i_tready = '1'" severity error;
        assert (m_word_o_tvalid = '0')
        report "ID02: Test idle - expecting m_word_o_tvalid = '0'" severity error;
        assert (m_word_o_tdata = (m_word_o_tdata'range => '0'))
        report "ID03: Test idle - expecting m_word_o_tdata = x0000" severity error;
        assert (m_spi_sclk = '1')
        report "ID04: Test idle - expecting m_spi_sclk = '1'" severity error;
        assert (m_spi_ncs = '1')
        report "ID05: Test idle - expecting m_spi_ncs = '1'" severity error;
        assert (m_spi_mosi = '0')
        report "ID06: Test idle - expecting m_spi_mosi = '0'" severity error;
        wait for post_hold;

        --****Test data transaction****
        --Run transfer cycle with same input and output data expecting 
        --spi transaction to meet timing constrains as well as data_in = data_out
        s_word_i_tdata  <= input_data;
        s_word_i_tvalid <= '1';
        wait for clk_period;
        s_word_i_tvalid <= '0';
        wait for 210 * clk_period;

        wait for assert_hold;
        assert (m_word_o_tvalid = '1')
        report "ID07: Test comms - expecting m_word_tvalid = '1'" severity error;
        assert (m_word_o_tdata = input_data)
        report "ID08: Test comms - expecting m_word_tdata = input_data" severity error;
        assert (output_data = input_data)
        report "ID09: Test comms - expecting output_data = input_data" severity error;
        wait for post_hold;

        std.env.finish;

    end process;
    -----------------------------------------------------------------------------------------------

end TB;
