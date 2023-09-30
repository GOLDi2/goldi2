-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		00/00/2023
-- Design Name:		 
-- Module Name:		
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> REGISTER_T_UNIT.vhd
--                  -> STREAM_FIFO.vhd
--                  -> I2C_C_DRIVER.vhd
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
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief
--! @details
--!
entity I2C_C_SMODULE is
    generic(
        g_address       :   natural := 1;       --! Module's base address
        g_scl_factor    :   natural := 480;     --! SCL signal period as a multiple of the system clock
        g_buffer_depth  :   natural := 20       --! Depth of the input and output FIFO structures to queue data
    );
    port(
        --General
        clk             : in    std_logic;      --! System clock
        rst             : in    std_logic;      --! Asynchronous reset
        --BUS slave interface
        sys_bus_i       : in    sbus_in;        --! BUS port input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;       --! BUS port output signals[dat,tag]
        --Flags
        p_i2c_avaliable : out   std_logic;      --! Data avalilable to be read
        p_i2c_error     : out   std_logic;      --! Transmission error encountered (NACK)
        --I2C interface
        --p_i2c_scl_i   : in    io_i;           --! I2C serial clock - input signal (not implemented)
        p_i2c_scl_o     : out   io_o;           --! I2C serial clock - output signal
        p_i2c_sda_i     : in    io_i;           --! I2C serial data - input signal
        p_i2c_sda_o     : out   io_o            --! I2C serial data - output signal (io_o.dat = '0')
    );
end entity I2C_C_SMODULE;




--!
architecture RTL of I2C_C_SMODULE is
  
    --****INTERNAL SIGNALS****
    --Memory
    constant reg_data_default   :   data_word := (others => '0');
    constant reg_tag_default    :   tag_word  := (others => '0');
    signal reg_data_in          :   data_word;
    signal reg_data_out         :   data_word;
    signal reg_tag_out          :   tag_word;
    signal reg_read_stb         :   std_logic;
    signal reg_write_stb        :   std_logic;
    signal reg_buffer_tvalid    :   std_logic;
    signal reg_buffer_tdata     :   data_word;
    --I2C Controller
    signal i2c_tdword_tready    :   std_logic;
    signal i2c_tdword_tvalid    :   std_logic;
    signal i2c_tdword_tdata     :   std_logic_vector(9 downto 0);
    signal i2c_rdword_tready    :   std_logic;
    signal i2c_rdword_tvalid    :   std_logic;
    signal i2c_rdword_tdata     :   std_logic_vector(7 downto 0);
    signal i2c_scl_o            :   std_logic;
    signal i2c_sda_o            :   std_logic;


begin

    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_T_UNIT
    generic map(
        g_address       => g_address,
        g_def_dvalue    => reg_data_default,
        g_def_tvalue    => reg_tag_default
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_data_in       => reg_data_in,
        p_tag_in        => (others => '0'),
        p_data_out      => reg_data_out,
        p_tag_out       => reg_tag_out,
        p_read_stb      => reg_read_stb,
        p_write_stb     => reg_write_stb
    );
    -----------------------------------------------------------------------------------------------



    --****STREAM QUEUES****
    -----------------------------------------------------------------------------------------------
    TRANSMITER_QUEUE : entity work.STREAM_FIFO
    generic map(
        g_fifo_width    => 10,
        g_fifo_depth    => g_buffer_depth
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_write_tready  => open,
        p_write_tvalid  => reg_write_stb,
        p_write_tdata   => (reg_tag_out(1 downto 0) & reg_data_out(7 downto 0)),
        p_read_tready   => i2c_tdword_tready,
        p_read_tvalid   => i2c_tdword_tvalid,
        p_read_tdata    => i2c_tdword_tdata
    );


    RECIVER_QUEUE : entity work.STREAM_FIFO
    generic map(
        g_fifo_width    => 8,
        g_fifo_depth    => g_buffer_depth
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_write_tready  => i2c_rdword_tready,
        p_write_tvalid  => i2c_rdword_tvalid,
        p_write_tdata   => i2c_rdword_tdata,
        p_read_tready   => reg_read_stb,
        p_read_tvalid   => reg_buffer_tvalid,
        p_read_tdata    => reg_buffer_tdata
    );

    --Route data to the register and ground port when FIFO is empty
    reg_data_in(7 downto 0) <= reg_buffer_tdata when(reg_buffer_tvalid = '1') else (others => '0');
    --Route fifo empty flag to indicate available data
    p_i2c_avaliable <= reg_buffer_tvalid;
    -----------------------------------------------------------------------------------------------



    --****I2C CONTROLLER****
    -----------------------------------------------------------------------------------------------
    I2C_CONTROLLER : entity work.I2C_C_DRIVER
    generic map(
        g_scl_factor    => g_scl_factor
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_tdword_tready => i2c_tdword_tready,
        p_tdword_tvalid => i2c_tdword_tvalid,
        p_tdword_start  => i2c_tdword_tdata(9),
        p_tdword_stop   => i2c_tdword_tdata(8),
        p_tdword_tdata  => i2c_tdword_tdata(7 downto 0),
        p_tdword_error  => p_i2c_error,
        p_rdword_tready => i2c_rdword_tready,
        p_rdword_tvalid => i2c_rdword_tvalid,
        p_rdword_tdata  => i2c_rdword_tdata,
        p_i2c_scl_o     => i2c_scl_o,
        p_i2c_sda_i     => p_i2c_sda_i.dat,
        p_i2c_sda_o     => i2c_sda_o
    );


    --Drive outputs using the GOLDi IO standard
    p_i2c_scl_o.enb <= not i2c_scl_o;
    p_i2c_scl_o.dat <= '0';
    p_i2c_sda_o.enb <= not i2c_sda_o;
    p_i2c_scl_o.dat <= '0';
    -----------------------------------------------------------------------------------------------
    
    
end architecture;