-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		TMC2660 Stepper motor driver control 
-- Module Name:		TMC2660_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> REGISTER_TABLE.vhd
--                  -> STREAM_FIFO.vhd
--                  -> ROM16XN_FIFO.vhd
--                  -> SPI_T_DRIVER.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
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
use work.GOLDI_DATA_TYPES.all;




--! @brief TMC2660 Stepper motor controller interface
--! @brief
--!
entity TMC2660_SMODULE is
    generic(
        g_address           :   natural := 1;
        g_sclk_factor       :   natural := 8;
        g_rst_delay         :   natural := 100;
        g_tmc2660_config    :   array_16_bit := (x"0000",x"0000")        
    );
    port(
        --General
        clk                 : in    std_logic;
        rst                 : in    std_logic;
        --BUS slave interface
        sys_bus_i           : in    sbus_in;
        sys_bus_o           : out   sbus_out;
        --TMC2660 interface
        p_tmc2660_clk       : out   io_o;
        p_tmc2660_enn       : out   io_o;
        p_tmc2660_sg        : in    io_i;
        p_tmc2660_dir       : out   io_o;
        p_tmc2660_step      : out   io_o;
        p_tmc2660_ncs       : out   io_o;
        p_tmc2660_sclk      : out   io_o;
        p_tmc2660_mosi      : out   io_o;
        p_tmc2660_miso      : in    io_i
    );
end entity TMC2660_SMODULE;




--! General architecture
architecture RTL of TMC2660_SMODULE is

    --****INTERNAL SIGNALS****
    --Memory
    constant memory_length      :   natural := getMemoryLength(48);
    constant c_reg_default      :   data_word_vector(memory_length-1 downto 0) := (x"00",x"00",x"00",x"09",x"C4",x"00");
    signal reg_data_in          :   data_word_vector(memory_length-1 downto 0);
    signal reg_data_out         :   data_word_vector(memory_length-1 downto 0);
    signal reg_data_in_buff     :   std_logic_vector(47 downto 0);
    signal reg_data_out_buff    :   std_logic_vector(47 downto 0);
        alias reg_driveDri0     :   std_logic is reg_data_out_buff(0);
        alias reg_driveDir1     :   std_logic is reg_data_out_buff(1);
        alias reg_enn           :   std_logic is reg_data_out_buff(7);
        alias reg_speed         :   std_logic_vector(15 downto 0) is reg_data_out_buff(23 downto 8);
        alias reg_spi_data      :   std_logic_vector(23 downto 0) is reg_data_out_buff(47 downto 24);
    signal reg_write_stb        :   std_logic_vector(memory_length-1 downto 0);
    --Clocking
    signal clock_buffer         :   unsigned(1 downto 0);
    --Configuration data
    signal config_word_tready   :   std_logic;
    signal config_word_tvalid   :   std_logic;
    signal config_word_tdata    :   std_logic_vector(23 downto 0);
    signal config_fifo_empty    :   std_logic;   
    --Stream data
    signal stream_rst           :   std_logic;
    signal stream_word_tready   :   std_logic;
    signal stream_word_tvalid   :   std_logic;
    signal stream_word_tdata    :   std_logic_vector(23 downto 0);
    --SPI interface
    signal spi_t_tready         :   std_logic;
    signal spi_t_tvalid         :   std_logic;
    signal spi_t_tdata          :   std_logic_vector(23 downto 0);
    signal spi_r_tvalid         :   std_logic;
    signal spi_r_tdata          :   std_logic_vector(23 downto 0);


    --##############################################################################################
    -- Adapded module
    --##############################################################################################
    type tState is  (z_StandBy, z_Idle, z_DriveDir0, z_DriveDir1, z_Stop, z_Stop2);
    signal sCurrentState    :   tState;
    signal sStartMovement   :   std_logic;
    signal sStopMovement    :   std_logic;


begin

    --****GENERAL****
    -----------------------------------------------------------------------------------------------
    p_tmc2660_clk.enb <= '1';
    p_tmc2660_clk.dat <= clock_buffer(1);

    p_tmc2660_enn.enb <= '1';
    p_tmc2660_enn.dat <= reg_data_out_buff(7);
    -----------------------------------------------------------------------------------------------



    --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    TMC2660_CLOCK_DRIVER : process(clk,rst)
    begin
        if(rst = '1') then
            clock_buffer <= (others => '0');
        elsif(rising_edge(clk)) then
            clock_buffer <= clock_buffer + 1;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****TMC2660 SPI COMMUNICATION****
    -----------------------------------------------------------------------------------------------
    --Multiplexing configuration data and stream data
    config_word_tready <= spi_t_tready when(config_fifo_empty = '0') else '0';
    stream_word_tready <= spi_t_tready when(config_fifo_empty = '1') else '0';
    spi_t_tvalid       <= config_word_tvalid when(config_fifo_empty = '0') else stream_word_tvalid;
    spi_t_tdata        <= config_word_tdata  when(config_fifo_empty = '0') else stream_word_tdata;
    

    CONFIGURATION_FIFO : entity work.ROM16XN_FIFO
    generic map(
        g_data_width    => 24,
        g_init_delay    => g_rst_delay,
        g_init_values   => g_tmc2660_config
    )
    port map(
        clk             => clk,
        rst             => rst,
        p_fifo_empty    => config_fifo_empty,
        p_cword_tready  => config_word_tready,
        p_cword_tvalid  => config_word_tvalid,
        p_cword_tdata   => config_word_tdata
    );


    --Reset stream fifo to prevent auto-loading from the register
    stream_rst <= rst or (not config_fifo_empty);

    STREAM_FIFO : entity work.STREAM_FIFO
    generic map(
        g_fifo_width    => 24,
        g_fifo_depth    => 5
    )
    port map(
        clk             => clk,
        rst             => stream_rst,
        p_write_tready  => open,
        p_write_tvalid  => reg_write_stb(3),
        p_write_tdata   => reg_spi_data,
        p_read_tready   => stream_word_tready,
        p_read_tvalid   => stream_word_tvalid,
        p_read_tdata    => stream_word_tdata
    );


    SPI_INTERFACE : entity work.SPI_T_DRIVER
    generic map(
        g_clk_factor        => g_sclk_factor,
        g_word_length       => 24,
        g_cpol              => '1',
        g_cpha              => '0',
        g_msbf              => true    
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        p_stream_enb        => '0',
        p_tdword_tready     => spi_t_tready,
        p_tdword_tvalid     => spi_t_tvalid,
        p_tdword_tdata      => spi_t_tdata,
        p_rdword_tvalid     => spi_r_tvalid,
        p_rdword_tdata      => spi_r_tdata,
        p_spi_ncs           => p_tmc2660_ncs.dat,
        p_spi_sclk          => p_tmc2660_sclk.dat,
        p_spi_mosi          => p_tmc2660_mosi.dat,
        p_spi_miso          => p_tmc2660_miso.dat
    );
    
    --Configura IOs to output
    p_tmc2660_sclk.enb <= '1';
    p_tmc2660_ncs.enb  <= '1';
    p_tmc2660_mosi.enb <= '1';
    -----------------------------------------------------------------------------------------------



    --#############################################################################################
    --Adapted module
    StepperControl : entity work.StepperControl_v1_00              
    port map (   
        pClock                  => clk,
        pReset                  => rst,
        pStep                   => p_tmc2660_step.dat,
        pDoStartMovement        => sStartMovement,
        pDoStopMovement         => sStopMovement,
        pStartFrequency         => X"0500",
        pMovementFrequency      => reg_speed,
        pAcceleration           => std_logic_vector(to_unsigned(10, 16)), 
        pBusyMoving             => open
    );

    --Output mode configuration
    p_tmc2660_step.enb <= '1';
    p_tmc2660_dir.enb  <= '1';



    --Drive signals of StepperControl
    sStartMovement      <=  '1' when sCurrentState = z_DriveDir0 else
                            '1' when sCurrentState = z_DriveDir1 else
                            '0';

    sStopMovement       <=  '1' when sCurrentState = z_Stop  else
                            '1' when sCurrentState = z_Stop2 else
                            '0';

    p_tmc2660_dir.dat   <=  '1' when sCurrentState = z_DriveDir1 else
                            '0';



    --State machine control
    FSMProcess: process (clk,rst)
    begin
        if(rst = '1') then
            sCurrentState <= z_StandBy;
        elsif(rising_edge(clk)) then
            --Modified state machine
            case sCurrentState is
                when z_StandBy      =>  if(config_fifo_empty = '1') then sCurrentState <= z_Idle; 
                                        else sCurrentState <= z_StandBy;
                                        end if;

                when z_Idle         =>  if(reg_driveDri0 = '1') then sCurrentState <= z_DriveDir0;
                                        elsif(reg_driveDir1 = '1') then sCurrentState <= z_DriveDir1;
                                        else sCurrentState <= z_Idle;
                                        end if;

                when z_DriveDir0    =>  if(reg_driveDri0 = '1') then sCurrentState <= z_DriveDir0;
                                        else sCurrentState <= z_Stop;
                                        end if;

                when z_DriveDir1    =>  if(reg_driveDir1 = '1') then sCurrentState <= z_DriveDir1;
                                        else sCurrentState <= z_Stop;
                                        end if;
                
                when z_Stop         =>  sCurrentState   <= z_Stop2;

                when z_Stop2        =>  sCurrentState   <= z_Idle;

                when others         =>  sCurrentState   <= z_StandBy;
            end case;
        end if;
    end process;
    --#############################################################################################



    
    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
    generic map(
        g_address       => g_address,
        g_reg_number    => memory_length,
        g_def_values    => c_reg_default
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_data_in       => reg_data_in,
        p_data_out      => reg_data_out,
        p_read_stb      => open,
        p_write_stb     => reg_write_stb
    );

    --SPI read data - route into memory
    MISO_DATA_TRANSFER : process(clk)
    begin
        if(rst = '1') then
            reg_data_in_buff(47 downto 24) <= (others =>'0');
        elsif(rising_edge(clk)) then
            if(spi_r_tvalid = '1') then
                reg_data_in_buff(47 downto 24) <= spi_r_tdata;
            else null;
            end if;
        end if;
    end process;

    --Recover memory from register tabel and typecast it to std_logic_vector
    reg_data_out_buff <= getMemory(reg_data_out);

    --Route outputs
    reg_data_in_buff(1 downto 0)  <= reg_data_out_buff( 1 downto 0);
    reg_data_in_buff(2)           <= p_tmc2660_sg.dat;
    reg_data_in_buff(23 downto 3) <= reg_data_out_buff(23 downto 3);
    reg_data_in <= setMemory(reg_data_in_buff);
    -----------------------------------------------------------------------------------------------


end architecture;