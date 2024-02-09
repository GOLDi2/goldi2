-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		TMC2660 Stepper motor driver control (legacy)
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
--                  -> TMC2660_SPI.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - Default module version for release 2.00.00
-- Additional Comments: -  
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;




--! @brief TMC2660 Stepper motor controller interface (V3.00.00)
--! @details
--! The TMC2660_SMODULE is a control interface for the stepper driver controller IC
--! TMC2660. The IC integrates multiple features including a collision detection mechanism
--! (StallGuard2), power consumption reduction system, micro-step interpolation, etc...
--! 
--! The TMC2660_SMODULE supplies the IC with the clock and enable signal needed to use the
--! device. Additionaly, two interfaces used by the TMC2660 to communicate with external
--! devices have been implemented; a SPI interface used to configure the device and a 
--! step/direction interface to manage the step/mico-step cirtuitry driving the stepper motor.
--!
--! After reset or initialization the sub-module  loads the default configuration to the five 
--! 20-bit registers of the driver using the SPI interface. The configuration data is set 
--! through the "TMC2660_CONFIG" parameter formatted as 24-bit data words.
--!
--! After initialization the module is ready for normal operation. The first of 6 registers in the
--! sub-module controls the movement direction. The second and third registers contain the 16-bit
--! unsigned velocity value given in steps per second. These three registers control the
--! step/direction interface.
--!
--! During operation the IC can be reconfigured or controlled through the SPI interface using the
--! remaining 3 registers. The registers contain the data to be transfered to the IC and the response
--! after a SPI communication cycle. The data is organized in the msbf format and the data transfer
--! to the IC is initialized once if the register with the lowes data bits [8:0] is modified.
--! 
--! ### Register:
--! | g_address | Bit 7 | Bit 6 | Bit 5 | Bit 4 | Bit 3 | Bit 2 | Bit 1 | Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--! | +0		| enb	|		|		|		|		|	sg	|  dir1 |  dir0 |
--! | +1        | speed_value [8:0]                                      ||||||||
--! | +2        | speed_value [15:9]                                     ||||||||
--! | +3        | spi_data[8:0]                                          ||||||||
--! | +4        | spi_data[15:9]                                         ||||||||
--! | +5        | spi_data[23:16]                                        ||||||||
--!
entity TMC2660_DRIVER is
    generic(
        ADDRESS         :   natural := 1;                                                       --! Module's base address
        SCLK_FACTOR     :   natural := 8;                                                       --! SPI serial clock period as a factor of clk
        TMC2660_CONFIG  :   tmc2660_rom := (x"0F00FF",x"0F00FF",x"0F00FF",x"0F00FF",x"0F00FF")  --! Default configuration of TMC2660
    );
    port(
        --General
        clk             : in    std_logic;                                                      --! System clock
        rst             : in    std_logic;                                                      --! Asyncrhonous reset
        --BUS slave interface
        sys_bus_i       : in    sbus_in;                                                        --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;                                                       --! BUS output signals [dat,tag,mux]
        --TMC2660 interface
        tmc2660_clk     : out   io_o;                                                           --! TMC2660 external clock (sys_clock/2)
        tmc2660_enn     : out   io_o;                                                           --! TMC2660 enable signal ('0'-on | '1'-off)
        tmc2660_sg      : in    io_i;                                                           --! TMC2660 StallGuard2 input
        tmc2660_dir     : out   io_o;                                                           --! TMC2660 direction signal
        tmc2660_step    : out   io_o;                                                           --! TMC2660 step signal
        tmc2660_sclk    : out   io_o;                                                           --! TMC2660 SPI serial clock
        tmc2660_ncs     : out   io_o;                                                           --! TMC2660 SPI chip select 
        tmc2660_mosi    : out   io_o;                                                           --! TMC2660 SPI master_out/slave-in
        tmc2660_miso    : in    io_i                                                            --! TMC2660 SPI master-in/slave-out
    );
end entity TMC2660_DRIVER;




--! General architecture
architecture RTL of TMC2660_DRIVER is
  
    --****INTERNAL SIGNALS****
    --Memory
    constant memory_length      :   natural := getMemoryLength(48);
    constant reg_default        :   data_word_vector(memory_length-1 downto 0) := (x"00",x"00",x"00",x"09",x"C4",x"00");
    signal reg_data_in          :   data_word_vector(memory_length-1 downto 0);
    signal reg_data_out         :   data_word_vector(memory_length-1 downto 0);
    signal reg_data_in_buff     :   std_logic_vector(47 downto 0);
    signal reg_data_out_buff    :   std_logic_vector(47 downto 0);
        alias reg_driveDri0     :   std_logic is reg_data_out_buff(0);
        alias reg_driveDir1     :   std_logic is reg_data_out_buff(1);
        alias reg_enn           :   std_logic is reg_data_out_buff(7);
        alias reg_speed         :   std_logic_vector(15 downto 0) is reg_data_out_buff(23 downto 8);
        alias reg_spi_data      :   std_logic_vector(23 downto 0) is reg_data_out_buff(47 downto 24);
    signal reg_write_stb        :   std_logic_vector(5 downto 0);
    --Clocking
    signal clock_buff           :   unsigned(1 downto 0);
    --Configuration data
    signal config_o_tready      :   std_logic;
    signal config_o_tvalid      :   std_logic;
    signal config_o_tdata       :   std_logic_vector(23 downto 0);
    --Stream data
    signal stream_o_tready      :   std_logic;
    signal stream_o_tvalid      :   std_logic;
    signal stream_o_tdata       :   std_logic_vector(23 downto 0);
    --SPI Interface
    signal spi_o_tready         :   std_logic;
    signal spi_o_tvalid         :   std_logic;
    signal spi_o_tdata          :   std_logic_vector(23 downto 0);
    signal spi_i_tvalid         :   std_logic;
    signal spi_i_tdata          :   std_logic_vector(23 downto 0);


    --##############################################################################################
    -- Adapded module
    --##############################################################################################
    type tState is  (   z_StandBy,
                        z_Idle,
                        z_DriveDir0,
                        z_DriveDir1,
                        z_Stop,
                        z_Stop2
                    );
    signal sCurrentState    :   tState;
    signal sStartMovement   :   STD_LOGIC;
    signal sStopMovement    :   STD_LOGIC;
    

begin

    --****GENERAL****
    -----------------------------------------------------------------------------------------------
    tmc2660_clk.enb <= '1';
    tmc2660_clk.dat <= clock_buff(1);

    tmc2660_enn.enb <= '1';
    tmc2660_enn.dat <= reg_data_out_buff(7);
    -----------------------------------------------------------------------------------------------




    --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    TMC2660_CLOCK_DRIVER : process(clk,rst)
    begin
        if(rst = '1') then
            clock_buff <= (others => '0');
        elsif(rising_edge(clk)) then
            clock_buff <= clock_buff + 1;
        end if;
    end process;
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
        g_fifo_width    => 24,
        g_fifo_depth    => 5
    )
    port map(
        clk             => clk,
        rst             => config_o_tvalid,
        p_write_tready  => open,
        p_write_tvalid  => reg_write_stb(3),
        p_write_tdata   => reg_spi_data,
        p_read_tready   => stream_o_tready,
        p_read_tvalid   => stream_o_tvalid,
        p_read_tdata    => stream_o_tdata       
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
    --Configura IOs to output
    tmc2660_sclk.enb <= '1';
    tmc2660_ncs.enb  <= '1';
    tmc2660_mosi.enb <= '1';
    -----------------------------------------------------------------------------------------------



    --#############################################################################################
    --Adapted module
    StepperControl : entity work.StepperControl_v1_00              
    port map (   
        pClock                  => clk,
        pReset                  => rst,
        pStep                   => tmc2660_step.dat,
        pDoStartMovement        => sStartMovement,
        pDoStopMovement         => sStopMovement,
        pStartFrequency         => X"0500",
        pMovementFrequency      => reg_speed,
        pAcceleration           => std_logic_vector(to_unsigned(10, 16)), 
        pBusyMoving             => open
    );

    --Output mode configuration
    tmc2660_step.enb <= '1';
    tmc2660_dir.enb  <= '1';



    --Drive signals of StepperControl
    sStartMovement  <=  '1' when sCurrentState = z_DriveDir0 else
                        '1' when sCurrentState = z_DriveDir1 else
                        '0';

    sStopMovement   <=  '1' when sCurrentState = z_Stop else
                        '1' when sCurrentState = z_Stop2 else
                        '0';

    tmc2660_dir.dat <=  '1' when sCurrentState = z_DriveDir1 else
                        '0';



    --State machine control
    FSMProcess: process (clk,rst)
    begin
        if(rst = '1') then
            sCurrentState <= z_StandBy;
        elsif(rising_edge(clk)) then
            --Modified state machine
            case sCurrentState is
                when z_StandBy      =>  if(config_o_tvalid = '0') then sCurrentState <= z_Idle; 
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
        g_address       => ADDRESS,
        g_reg_number    => memory_length,
        g_def_values    => reg_default
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
            if(spi_i_tvalid = '1') then
                reg_data_in_buff(47 downto 24) <= spi_i_tdata;
            else null;
            end if;
        end if;
    end process;

    --Recover memory from register tabel and typecast it to std_logic_vector
    reg_data_out_buff <= getMemory(reg_data_out);

    --Route outputs
    reg_data_in_buff( 1 downto 0) <= reg_data_out_buff( 1 downto 0);
    reg_data_in_buff(2)           <= tmc2660_sg.dat;
    reg_data_in_buff(23 downto 3) <= reg_data_out_buff(23 downto 3);
    reg_data_in <= setMemory(reg_data_in_buff);
    -----------------------------------------------------------------------------------------------


end architecture;