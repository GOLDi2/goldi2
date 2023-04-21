-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/04/2023
-- Design Name:		TMC2660 Driver
-- Module Name:		TMC2660
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_MODULE_CONFIG.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> REGISTER_TABLE.vhd
--                  -> AXI_FIFO.vhd
--                  -> TMC2660_SPI.vhd
--                  -> TMC2660_STEP_DRIVER.vhd
--
-- Revisions:
-- Revision V0.01.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -  
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




--! @brief
--! @details
--!
entity TMC2660 is
    generic(
        ADDRESS             :   natural := 1
    );
    port(
        --General
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        clk_16_MHz          : in    std_logic;
        --Bus 
        sys_bus_i           : in    sbus_in;
        sys_bus_o           : out   sbus_out;
        --Flags
        sdi_neg_valid       : out   std_logic;
        sdi_pos_valid       : out   std_logic;
        --TMC2660 interface
        tmc2660_clk         : out   io_o;
        tmc2660_enn         : out   io_o;
        tmc2660_sg          : in    io_i;
        --SPI
        tmc2660_spi_sclk    : out   io_o;
        tmc2660_spi_ncs     : out   io_o;
        tmc2660_spi_mosi    : out   io_o;
        tmc2660_spi_miso    : in    io_i;
        --Step/Dir
        tmc2660_dir         : out   io_o;
        tmc2660_step        : out   io_o
    );
end entity TMC2660;




--! General architecture
architecture RTL of TMC2660 is

    --****Internal Signals****
    --Memory setup
    constant sdi_memory_length  :   natural := 2;
    constant spi_memory_length  :   natural := getMemoryLength(20);
	constant sdi_memory_def	 	:	 data_word_vector(sdi_memory_length-1 downto 0) :=(others => (others => '0'));
	constant spi_memory_def	 	:	 data_word_vector(spi_memory_length-1 downto 0) :=(others => x"F0");
    signal sys_bus_o_vector     :   sbus_o_vector(1 downto 0);
    --Step interface memory
    signal sdi_memory_in        :   data_word_vector(sdi_memory_length-1 downto 0);
    signal sdi_memory_out       :   data_word_vector(sdi_memory_length-1 downto 0);
    signal sdi_memory_stb       :   std_logic_vector(sdi_memory_length-1 downto 0);
    --SPI interface memory
    signal spi_memory_in        :   data_word_vector(spi_memory_length-1 downto 0);
    signal spi_memory_out       :   data_word_vector(spi_memory_length-1 downto 0);
    signal spi_memory_stb       :   std_logic_vector(spi_memory_length-1 downto 0);
    --Buffers
	signal spi_data_in 			:	std_logic_vector(19 downto 0);
    signal stream_data_i_tready :   std_logic;
    signal stream_data_i_tvalid :   std_logic;
    signal stream_data_i_tdata  :   std_logic_vector(19 downto 0);
    signal stream_data_o_tvalid :   std_logic;
    signal stream_data_o_tdata  :   std_logic_vector(19 downto 0);



begin

    --****Step/Dir interface****
    -----------------------------------------------------------------------------------------------
    SDI_REGISTERS : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => ADDRESS,
        NUMBER_REGISTERS    => sdi_memory_length,
        REG_DEFAULT_VALUES  => sdi_memory_def
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o_vector(0),
        reg_data_in         => sdi_memory_out,
        reg_data_out        => sdi_memory_in,
        reg_data_stb        => sdi_memory_stb
    );
    sdi_memory_out(7 downto 3) <= sdi_memory_in(7 downto 3);
    sdi_memory_out(2)          <= tmc2660_sg.dat;
    sdi_memory_out(1 downto 0) <= sdi_memory_in(1 downto 0);



    SDI_INTERFACE : entity work.TMC2660_STEP_DRIVER 
    port map(
        clk                     => clk,
        rst                     => rst,
        sd_move_enable          => sdi_memory_in(0)(0),
        sd_move_direction       => sdi_memory_in(0)(1),
        sd_nominal_frequency    => sdi_memory_in(1)(7 downto 0),
        sd_configuration_valid  => sdi_memory_stb(1),
        tmc2660_step            => tmc2660_step.dat,
        tmc2660_dir             => tmc2660_dir.dat
    );
    tmc2660_step.enb <= '1';
    tmc2660_dir.enb  <= '1';


    sdi_neg_valid <= sdi_memory_out(0)(1) and sdi_memory_out(0)(0);
    sdi_pos_valid <= sdi_memory_out(0)(1) and (not sdi_memory_out(0)(0));
    -----------------------------------------------------------------------------------------------




    --****Step/Dir Interface****
    -----------------------------------------------------------------------------------------------
    SPI_MEMORY : entity work.REGISTER_TABLE
    generic map(
        BASE_ADDRESS        => ADDRESS + 2,
        NUMBER_REGISTERS    => spi_memory_length,
        REG_DEFAULT_VALUES  => spi_memory_def
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o_vector(1),
        reg_data_in         => spi_memory_out,
        reg_data_out        => spi_memory_in,
        reg_data_stb        => spi_memory_stb
    );


    OUTPUT_DATA_REGISTER : process(clk)
    begin
        if(rising_edge(clk)) then
            if(rst = '1') then
                spi_memory_out <= (others => (others => '0'));
            elsif(stream_data_o_tvalid = '1') then
                spi_memory_out <= assignMemory(stream_data_o_tdata);
            else null;
            end if;
        end if;
    end process;


    
    STREAM_QUEUE : entity work.AXI_FIFO
    generic map(
        FIFO_WIDTH      => 20,
        FIFO_DEPTH      => 10
    )
    port map(
        clk             => clk,
        rst             => rst,
        s_write_tready  => open,
        s_write_tvalid  => spi_memory_stb(spi_memory_length-1),
        s_write_tdata   => spi_data_in,
        m_read_tready   => stream_data_i_tready,
        m_read_tvalid   => stream_data_i_tvalid,
        m_read_tdata    => stream_data_i_tdata
    );

	spi_data_in <= registerToVector(spi_memory_in)(19 downto 0);


    SPI_INTERFACE : entity work.TMC2660_SPI
    port map(
        clk                 => clk,
        rst                 => rst,
        s_transfer_i_tready => stream_data_i_tready,
        s_transfer_i_tvalid => stream_data_i_tvalid,
        s_transfer_i_tdata  => stream_data_i_tdata,
        m_transfer_o_tvalid => stream_data_o_tvalid,
        m_transfer_o_tdata  => stream_data_o_tdata,
        m_spi_sclk          => tmc2660_spi_sclk.dat,
        m_spi_ncs           => tmc2660_spi_ncs.dat,
        m_spi_mosi          => tmc2660_spi_mosi.dat,
        m_spi_miso          => tmc2660_spi_miso.dat
    );

    --Configure IO's
    tmc2660_spi_sclk.enb <= '1';
    tmc2660_spi_ncs.enb  <= '1';
    tmc2660_spi_mosi.enb <= '1';
    -----------------------------------------------------------------------------------------------




    --****Aditional interface signals****
    -----------------------------------------------------------------------------------------------
    sys_bus_o <= reduceBusVector(sys_bus_o_vector);
    tmc2660_clk <= (enb => '1', dat => clk_16_MHz);
    tmc2660_enn <= (enb => '1', dat => '1');
    -----------------------------------------------------------------------------------------------


end RTL;