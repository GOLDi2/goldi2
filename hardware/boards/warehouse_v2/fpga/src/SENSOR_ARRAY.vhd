-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Warehouse sensor array
-- Module Name:		SENSOR_ARRAY
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> REGISTER_TABLE.vhd
--                  -> VIRTUAL_SENSOR_ARRAY.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
-- 
-- Revision V2.00.00 - First release
-- Additional Comments:
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
entity SENSOR_ARRAY is
    generic(
        ADDRESS         :   natural := 1;
        ENC_X_INVERT    :   boolean := false;
        ENC_Z_INVERT    :   boolean := false;
        LIMIT_X_SENSORS :   sensor_limit_array(9 downto 0) := (others => (10,0));
        LIMIT_Z_SENSORS :   sensor_limit_array(4 downto 0) := (others => (10,0))
    );
    port(
        --General
        clk             : in    std_logic;
        rst             : in    std_logic;
        rst_virtual_x   : in    std_logic;
        rst_virtual_z   : in    std_logic;
        --BUS slave interface
        sys_bus_i       : in    sbus_in;
        sys_bus_o       : out   sbus_out;
        --Mechanical limit swiches
        lim_x_neg       : in    io_i;
        lim_x_pos       : in    io_i;
        lim_y_neg       : in    io_i;
        lim_y_pos       : in    io_i;
        lim_z_neg       : in    io_i;
        lim_z_pos       : in    io_i;
        inductive       : in    io_i;
        --Encoder signals
        enc_channel_x_a : in    io_i;
        enc_channel_x_b : in    io_i;
        enc_channel_z_a : in    io_i;
        enc_channel_z_b : in    io_i
    );
end entity SENSOR_ARRAY;




--! General architecture
architecture RTL of SENSOR_ARRAY is

    --****INTERNAL SIGNALS****
    --Memory
    constant memory_length  :   natural := getMemoryLength(23);
    constant reg_default    :   data_word_vector(memory_length-1 downto 0) := (others => (others => '0'));
    signal reg_data         :   data_word_vector(memory_length-1 downto 0); 
    --Sensor buffer
    signal sensor_buff      :   std_logic_vector(22 downto 0);


begin

    --****LIMIT SENSORS****
    -----------------------------------------------------------------------------------------------
    sensor_buff(0) <= lim_x_neg.dat;
    sensor_buff(1) <= lim_x_pos.dat;
    sensor_buff(2) <= lim_y_neg.dat;
    sensor_buff(3) <= lim_y_pos.dat;
    sensor_buff(4) <= lim_z_neg.dat;
    sensor_buff(5) <= lim_z_pos.dat;
    sensor_buff(6) <= not inductive.dat;
    sensor_buff(7) <= '0';
    -----------------------------------------------------------------------------------------------



    --****VIRTUAL SENSORS X AXIS****
    -----------------------------------------------------------------------------------------------
    X_SENSORS : entity work.VIRTUAL_SENSOR_ARRAY
    generic map(
        INVERT          => ENC_X_INVERT,
        NUMBER_SENSORS  => 10,
        SENSOR_LIMITS   => LIMIT_X_SENSORS
    )
    port map(
        clk             => clk,
        rst             => rst_virtual_x,
        enc_channel_a   => enc_channel_x_a.dat,
        enc_channel_b   => enc_channel_x_b.dat,
        sensor_data_out => sensor_buff(17 downto 8)
    );
    -----------------------------------------------------------------------------------------------



    --****VIRTUAL SENSORS Z AXIS****
    -----------------------------------------------------------------------------------------------
    Z_SENSORS : entity work.VIRTUAL_SENSOR_ARRAY
    generic map(
        INVERT          => ENC_Z_INVERT,
        NUMBER_SENSORS  => 5,
        SENSOR_LIMITS   => LIMIT_Z_SENSORS
    )
    port map(
        clk             => clk,
        rst             => rst_virtual_z,
        enc_channel_a   => enc_channel_z_a.dat,
        enc_channel_b   => enc_channel_z_b.dat,
        sensor_data_out => sensor_buff(22 downto 18)
    );
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
        data_in             => reg_data,
        data_out            => open,
        read_stb            => open,
        write_stb           => open
    );
	
	reg_data <= setMemory(sensor_buff);
    -----------------------------------------------------------------------------------------------


end RTL; 