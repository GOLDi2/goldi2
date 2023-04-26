-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		TMC2660 Stepper motor driver control 
-- Module Name:		TMC2660_DRIVER
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> REGISTER_TABLE.vhd
--                  -> STREAM_FIFO.vhd
--                  -> TMC2660_CONFIG_FIFO.vhd
--                  -> TMC2660_SD.vhd
--                  -> TMC2660_SPI.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;




--! @brief
--! @details
--!
entity TMC2660_DRIVER is
    generic(
        ADDRESS         :   natural := 1;
        SD_FACTOR       :   natural := 100;
        SCLK_FACTOR     :   natural := 8;
        TMC2660_CONFIG  :   tmc2660_rom := (x"F00FF",x"F00FF")
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        clk_16MHz       : in    std_logic;
        --BUS slave interface
        sys_bus_i       : in    sbus_in;
        sys_bus_o       : out   sbus_out;
        --TMC2660 interface
        tmc2660_clk     : out   io_o;
        tmc2660_enn     : out   io_o;
        tmc2660_sg      : in    io_i;
        tmc2660_dir     : out   io_o;
        tmc2660_step    : out   io_o;
        tmc2660_sclk    : out   io_o;
        tmc2660_ncs     : out   io_o;
        tmc2660_mosi    : out   io_o;
        tmc2660_miso    : in    io_i
    );
end entity TMC2660_DRIVER;




--! General architecture
architecture RTL of TMC2660_DRIVER is
  
    --****INTERNAL SIGNALS****
    --Memory
    constant memory_length      :   natural := getMemoryLength(40);
    constant reg_default        :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_data_in          :   data_word_vector(memory_length-1 downto 0);
    signal reg_data_out         :   data_word_vector(memory_length-1 downto 0);
        alias ctrl_general      :   std_logic_vector(7 downto 0) is reg_data_out(0);
        alias ctrl_speed        :   std_logic_vector(7 downto 0) is reg_data_out(1);
    signal reg_data_stb         :   std_logic_vector(memory_length-1 downto 0);
    signal reg_data_out_buff    :   std_logic_vector(19 downto 0);
    signal reg_data_in_buff     :   std_logic_vector(23 downto 0);
    --Configuration
    signal config_o_tready      :   std_logic;
    signal config_o_tvalid      :   std_logic;
    signal config_o_tdata       :   std_logic_vector(19 downto 0);
    signal stream_o_tready      :   std_logic;
    signal stream_o_tvalid      :   std_logic;
    signal stream_o_tdata       :   std_logic_vector(19 downto 0);
    signal spi_o_tready         :   std_logic;
    signal spi_o_tvalid         :   std_logic;
    signal spi_o_tdata          :   std_logic_vector(19 downto 0);
    signal spi_i_tvalid         :   std_logic;
    signal spi_i_tdata          :   std_logic_vector(19 downto 0);


begin

    --****GENERAL****
    -----------------------------------------------------------------------------------------------
    tmc2660_clk.enb <= '1';
    tmc2660_clk.dat <= clk_16MHz;

    tmc2660_enn.enb <= '1';
    tmc2660_enn.dat <= not ctrl_general(7);
    -----------------------------------------------------------------------------------------------




    --****TMC2660 STEP/DIRECTION INTERFACE****
    -----------------------------------------------------------------------------------------------
    SD_CONTROL : entity work.TMC2660_SD
    generic map(
        SPEED_FACTOR            => SD_FACTOR 
    )
    port map(
        clk                     => clk,
        rst                     => rst,
        sd_enable_neg           => ctrl_general(0),
        sd_enable_pos           => ctrl_general(1),
        sd_nominal_frequency    => ctrl_speed,
        sd_configuration_valid  => reg_data_stb(1),
        step                    => tmc2660_step.dat,
        direction               => tmc2660_dir.dat
    );
    --Output pin configuration
    tmc2660_step.enb <= '1';
    tmc2660_dir.enb  <= '1';
    -----------------------------------------------------------------------------------------------




    --****TMC2660 SPI COMMUNICATION****
    -----------------------------------------------------------------------------------------------
    --Multiplex configuration data and spi communication data
    config_o_tready <= spi_o_tready    when(config_o_tvalid = '1') else '0';
    stream_o_tready <= spi_o_tready    when(config_o_tvalid = '0') else '0';
    spi_o_tvalid    <= config_o_tvalid when(config_o_tvalid = '1') else stream_o_tvalid;
    spi_o_tdata     <= config_o_tdata  when(config_o_tvalid = '1') else stream_o_tdata;
    


    CONFIGURATION_QUEUE : entity work.TMC2660_CONFIG_FIFO
    generic map(
        ROM             => TMC2660_CONFIG
    )
    port map(
        clk             => clk,
        rst             => rst,
        m_read_tready   => config_o_tready,
        m_read_tvalid   => config_o_tvalid,
        m_read_tdata    => config_o_tdata
    );


    STREAM_QUEUE : entity work.STREAM_FIFO
    generic map(
        FIFO_WIDTH      => 20,
        FIFO_DEPTH      => 10
    )
    port map(
        clk             => clk,
        rst             => config_o_tvalid,
        s_write_tready  => open,
        s_write_tvalid  => reg_data_stb(2),
        s_write_tdata   => reg_data_out_buff,
        m_read_tready   => stream_o_tready,
        m_read_tvalid   => stream_o_tvalid,
        m_read_tdata    => stream_o_tdata       
    );


    SPI_COMMS : entity work.TMC2660_SPI
    generic map(
        CLOCK_FACTOR    => SCLK_FACTOR
    )
    port map(
        clk             => clk,
        rst             => rst,
        s_word_i_tready => spi_o_tready,
        s_word_i_tvalid => spi_o_tvalid,
        s_word_i_tdata  => spi_o_tdata,
        m_word_o_tvalid => spi_i_tvalid,
        m_word_o_tdata  => spi_i_tdata,
        m_spi_sclk      => tmc2660_sclk.dat,
        m_spi_ncs       => tmc2660_ncs.dat,
        m_spi_mosi      => tmc2660_mosi.dat,
        m_spi_miso      => tmc2660_miso.dat
    );

    tmc2660_sclk.enb <= '1';
    tmc2660_ncs.enb  <= '1';
    tmc2660_mosi.enb <= '1';    
    -----------------------------------------------------------------------------------------------




    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => ADDRESS,
        NUMBER_REGISTERS    => memory_length,
        REG_DEFAULT_VALUES  => reg_default
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o,
        reg_data_in         => reg_data_in,
        reg_data_out        => reg_data_out,
        reg_data_stb        => reg_data_stb
    );

    reg_data_out_buff <= reg_data_out(4)(3 downto 0) & reg_data_out(3) & reg_data_out(2); 



    MISO_DATA_TRANSFER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                reg_data_in_buff <= (others => '0');
            elsif(spi_i_tvalid = '1') then
                reg_data_in_buff(19 downto 0) <= spi_i_tdata;
            else null;
            end if;
        end if;
    end process;



    --Route output
    reg_data_in(0)(1 downto 0)  <= ctrl_general(1 downto 0);
    reg_data_in(0)(2)           <= tmc2660_sg.dat;
    reg_data_in(0)(7 downto 3)  <= ctrl_general(7 downto 3);
    reg_data_in(1)              <= ctrl_speed;
    reg_data_in(2)              <= reg_data_in_buff( 7 downto  0);
    reg_data_in(3)              <= reg_data_in_buff(15 downto  8);
    reg_data_in(4)              <= reg_data_in_buff(23 downto 16);
    -----------------------------------------------------------------------------------------------


end architecture;