library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;
--! @brief TMC2660 Stepper motor controller interface
--! @brief
--! The "TMC2660_SMODULE" is a control interface for the stepper driver controller IC
--! TMC2660. The IC integrates multiple features including a collision detection mechanism
--! (StallGuard2), power consumption reduction system, micro-step interpolation, etc...
--! 
--! The TMC2660_SMODULE supplies the IC with the clock and enable signal needed to use the
--! device. Additionaly, two interfaces used by the TMC2660 to communicate with external
--! devices have been implemented; a SPI interface used to configure the device and a 
--! step/direction interface to manage the step/mico-step cirtuitry driving the stepper motor.
--!
--! After reset or initialization the sub-module waits for an initial delay set by the "g_rst_delay"
--! parameter and then loads the default configuration to the five 20-bit registers of the driver 
--! using the SPI interface. The configuration data is set through the "g_tmc2660_config" parameter,
--! which takes a 24-bit data word per register formated as a list of 16-bit words.
--! (The 16-bit format is required to store the data in general purpose 16-bit PLU ROM units) 
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
--! | +0		|       |       |       |moving	|  sg   |pos_ctl|  dir1 |  dir0 |
--! | +1        | position[7:0]                                          ||||||||
--! | +2        | position[15:8]                                         ||||||||
--! | +3        | velocity [7:0]                                         ||||||||
--! | +4        | velocity [15:8]                                        ||||||||
--! | +5        | acceleration[7:0]                                      ||||||||
--! | +6        | acceleration[15:8]                                     ||||||||
--! | +7        | position_slow_down[7:0]                                ||||||||
--! | +8        | position_slow_down[15:8]                               ||||||||
--!
entity TMC2660_SMODULE is
    generic(
        g_address          : natural      := 1; --! Module's base address
        g_sclk_factor      : natural      := 8; --! SPI serial clock period as a factor of clk
        g_rst_delay        : natural      := 100; --! Initial delay after reset given in clk cycles
        g_tmc2660_config   : array_16_bit := (x"0000", x"0000"); --! Default configuration of TMC2660
        g_enc_invert       : boolean      := false;
        g_enc_internal_bit : natural      := 16
    );
    port(
        --General
        clk            : in  std_logic; --! System clock
        rst            : in  std_logic; --! Asyncrhonous reset

        --BUS slave interface
        sys_bus_i      : in  sbus_in;   --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o      : out sbus_out;  --! BUS output signals [dat,tag,mux]
        --TMC2660 interface
        p_tmc2660_clk  : out io_o;      --! TMC2660 external clock (sys_clock/2)
        p_tmc2660_enn  : out io_o;      --! TMC2660 enable signal ('0'-on | '1'-off)
        p_tmc2660_sg   : in  io_i;      --! TMC2660 StallGuard2 input
        p_tmc2660_dir  : out io_o;      --! TMC2660 direction signal
        p_tmc2660_step : out io_o;      --! TMC2660 step signal
        p_tmc2660_ncs  : out io_o;      --! TMC2660 SPI chip select 
        p_tmc2660_sclk : out io_o;      --! TMC2660 SPI serial clock
        p_tmc2660_mosi : out io_o;      --! TMC2660 SPI master_out/slave-in
        p_tmc2660_miso : in  io_i;      --! TMC2660 SPI master-in/slave-out
        --ENCODER interface
        p_enc_res      : in  std_logic; --! ENCODER reset counter
        p_enc_a        : in  io_i;      --! ENCODER channel a
        p_enc_b        : in  io_i       --! ENCODER channel b
    );
end entity TMC2660_SMODULE;

--! General architecture
architecture RTL of TMC2660_SMODULE is

    --****INTERNAL SIGNALS****
    signal reg_data_in               : data_word_vector(8 downto 0);
    signal reg_data_out              : data_word_vector(8 downto 0);
    signal reg_data_in_buff          : std_logic_vector(8 * (8 + 1) - 1 downto 0);
    alias reg_ctrl_driveDir0_in      : std_logic is reg_data_in_buff(0);
    alias reg_ctrl_driveDir1_in      : std_logic is reg_data_in_buff(1);
    alias reg_ctrl_pos_ctl_in        : std_logic is reg_data_in_buff(2);
    alias reg_ctrl_sg_in             : std_logic is reg_data_in_buff(3);
    alias reg_ctrl_moving_in         : std_logic is reg_data_in_buff(4);
    alias reg_position_in            : std_logic_vector(15 downto 0) is reg_data_in_buff(8 * (2 + 1) - 1 downto 8 * 1);
    alias reg_velocity_in            : std_logic_vector(15 downto 0) is reg_data_in_buff(8 * (4 + 1) - 1 downto 8 * 3);
    alias reg_acceleration_in        : std_logic_vector(15 downto 0) is reg_data_in_buff(8 * (6 + 1) - 1 downto 8 * 5);
    alias reg_position_slow_down_in  : std_logic_vector(15 downto 0) is reg_data_in_buff(8 * (8 + 1) - 1 downto 8 * 7);
    signal reg_data_out_buff         : std_logic_vector(8 * (8 + 1) - 1 downto 0);
    alias reg_ctrl_driveDir0_out     : std_logic is reg_data_out_buff(0);
    alias reg_ctrl_driveDir1_out     : std_logic is reg_data_out_buff(1);
    alias reg_ctrl_pos_ctl_out       : std_logic is reg_data_out_buff(2);
    alias reg_velocity_out           : std_logic_vector(15 downto 0) is reg_data_out_buff(8 * (4 + 1) - 1 downto 8 * 3);
    alias reg_acceleration_out       : std_logic_vector(15 downto 0) is reg_data_out_buff(8 * (6 + 1) - 1 downto 8 * 5);
    alias reg_position_slow_down_out : std_logic_vector(15 downto 0) is reg_data_out_buff(8 * (8 + 1) - 1 downto 8 * 7);

    --Clocking
    -- signal clock_buffer         :   unsigned(1 downto 0);
    signal s_clk_enb_tmc2660  : std_logic;
    --Configuration data
    signal config_word_tvalid : std_logic;
    signal config_word_tdata  : std_logic_vector(23 downto 0);
    --SPI interface
    signal spi_t_tready       : std_logic;
    -- States
    type tState is (z_stop, z_dir1, z_dir2);
    signal s_currentState     : tState;
    signal s_moving           : std_logic;
    signal s_velocityTarget   : std_logic_vector(15 downto 0);
    signal rst_enc            : std_logic;
    signal s_enc_counter      : std_logic_vector(15 downto 0);
    signal tmc2660_clk        : std_logic;

begin
    --****GENERAL****
    -----------------------------------------------------------------------------------------------
    p_tmc2660_clk.enb <= '1';
    --p_tmc2660_clk.dat <= clock_buffer(1);
    p_tmc2660_clk.dat <= tmc2660_clk;

    p_tmc2660_enn.enb <= '1';
    p_tmc2660_enn.dat <= not s_moving;

    --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    TMC2660_CLOCK_DRIVER : entity work.Clock_Divider
        generic map(
            gDivideFactor => 2
        )
        port map(
            clk         => clk,
            reset       => rst,
            clk_enb_out => s_clk_enb_tmc2660
        );

    TMC2660_CLK_TOGGLE : process(clk, rst) is
    begin
        if rst = '1' then
            tmc2660_clk <= '0';
        elsif rising_edge(clk) then
            if s_clk_enb_tmc2660 then
                tmc2660_clk <= not tmc2660_clk;
            else
                tmc2660_clk <= tmc2660_clk;
            end if;
        end if;
    end process TMC2660_CLK_TOGGLE;

    --****TMC2660 SPI COMMUNICATION****
    -----------------------------------------------------------------------------------------------
    CONFIGURATION_FIFO : entity work.ROM16XN_FIFO
        generic map(
            g_data_width  => 24,
            g_init_delay  => g_rst_delay,
            g_init_values => g_tmc2660_config
        )
        port map(
            clk            => clk,
            rst            => rst,
            p_fifo_empty   => open,
            p_cword_tready => spi_t_tready,
            p_cword_tvalid => config_word_tvalid,
            p_cword_tdata  => config_word_tdata
        );
    SPI_INTERFACE : entity work.SPI_T_DRIVER
        generic map(
            g_clk_factor  => g_sclk_factor,
            g_word_length => 24,
            g_cpol        => '1',
            g_cpha        => '1',
            g_msbf        => true
        )
        port map(
            clk             => clk,
            rst             => rst,
            p_stream_enb    => '0',
            p_tdword_tready => spi_t_tready,
            p_tdword_tvalid => config_word_tvalid,
            p_tdword_tdata  => config_word_tdata,
            p_rdword_tvalid => open,
            p_rdword_tdata  => open,
            p_spi_ncs       => p_tmc2660_ncs.dat,
            p_spi_sclk      => p_tmc2660_sclk.dat,
            p_spi_mosi      => p_tmc2660_mosi.dat,
            p_spi_miso      => p_tmc2660_miso.dat
        );

    --Configura IOs to output
    p_tmc2660_sclk.enb <= '1';
    p_tmc2660_ncs.enb  <= '1';
    p_tmc2660_mosi.enb <= '1';

    --****Stepping****
    -----------------------------------------------------------------------------------------------
    StepperControl : entity work.StepperControl
        generic map(
            velocity_scaling     => 2 ** 25,
            acceleration_scaling => 1
        )
        port map(
            clk              => clk,
            rst              => rst,
            p_step           => p_tmc2660_step.dat,
            p_velocityTarget => s_velocityTarget,
            p_velocity       => open,
            p_acceleration   => reg_acceleration_out,
            p_busyMoving     => s_moving
        );

    -- Output mode configuration
    p_tmc2660_step.enb <= '1';
    p_tmc2660_dir.enb  <= '1';

    velocity : process(reg_data_in_buff, reg_data_out_buff, s_currentState) is
    begin
        if reg_ctrl_pos_ctl_out = '0' then
            -- speed control
            if (s_currentState = z_dir1 and reg_ctrl_driveDir0_out = '1') or (s_currentState = z_dir2 and reg_ctrl_driveDir1_out = '1') then
                s_velocityTarget <= reg_velocity_out;
            else
                s_velocityTarget <= (others => '0');
            end if;
        else
            -- position control
            if (s_currentState = z_dir1) then
                if reg_position_in > reg_position_slow_down_out then
                    s_velocityTarget <= reg_velocity_out;
                else
                    s_velocityTarget <= (others => '0');
                end if;
            elsif (s_currentState = z_dir2) then
                if reg_position_in < reg_position_slow_down_out then
                    s_velocityTarget <= reg_velocity_out;
                else
                    s_velocityTarget <= (others => '0');
                end if;
            else
                s_velocityTarget <= (others => '0');
            end if;
        end if;
    end process velocity;

    p_tmc2660_dir.dat <= '1' when s_currentState = z_dir2 else '0';

    --State machine control
    FSM_Stepper : process(clk, rst)
    begin
        if (rst = '1') then
            s_currentState <= z_stop;
        elsif (rising_edge(clk)) then
            case s_currentState is
                when z_stop =>
                    if (reg_ctrl_driveDir0_out = '0' and reg_ctrl_driveDir1_out = '1') then
                        s_currentState <= z_dir2;
                    elsif (reg_ctrl_driveDir0_out = '1' and reg_ctrl_driveDir1_out = '0') then
                        s_currentState <= z_dir1;
                    else
                        s_currentState <= z_stop;
                    end if;

                when z_dir1 =>
                    if ((reg_ctrl_driveDir0_out /= '1') and s_moving = '0') then
                        s_currentState <= z_stop;
                    else
                        s_currentState <= z_dir1;
                    end if;

                when z_dir2 =>
                    if ((reg_ctrl_driveDir1_out /= '1') and s_moving = '0') then
                        s_currentState <= z_stop;
                    else
                        s_currentState <= z_dir2;
                    end if;
            end case;
        end if;
    end process;

    --****Encoder****
    -----------------------------------------------------------------------------------------------
    ENCODER : entity work.ENCODER
        generic map(
            g_invert_dir       => g_enc_invert,
            g_enc_internal_bit => g_enc_internal_bit
        )
        port map(
            clk         => clk,
            rst         => rst_enc,
            p_channel_a => p_enc_a.dat,
            p_channel_b => p_enc_b.dat,
            p_enc_count => s_enc_counter
        );
    --User accessible rst to zero encoder acumulator
    rst_enc <= rst or p_enc_res;

    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_TABLE
        generic map(
            g_address    => g_address,
            g_reg_number => 9,
            g_def_values => (others => (others => '0'))
        )
        port map(
            clk         => clk,
            rst         => rst,
            sys_bus_i   => sys_bus_i,
            sys_bus_o   => sys_bus_o,
            p_data_in   => reg_data_in,
            p_data_out  => reg_data_out,
            p_read_stb  => open,
            p_write_stb => open
        );

    --Recover memory from register tabel and typecast it to std_logic_vector
    reg_data_out_buff <= getMemory(reg_data_out);

    --Route outputs
    reg_ctrl_driveDir0_in     <= reg_ctrl_driveDir0_out;
    reg_ctrl_driveDir1_in     <= reg_ctrl_driveDir1_out;
    reg_ctrl_pos_ctl_in       <= reg_ctrl_pos_ctl_out;
    reg_ctrl_sg_in            <= p_tmc2660_sg.dat;
    reg_ctrl_moving_in        <= s_moving;
    reg_position_in           <= s_enc_counter;
    reg_velocity_in           <= reg_velocity_out;
    reg_acceleration_in       <= reg_acceleration_out;
    reg_position_slow_down_in <= reg_position_slow_down_out;

    reg_data_in <= setMemory(reg_data_in_buff);

    -----------------------------------------------------------------------------------------------

end architecture;
