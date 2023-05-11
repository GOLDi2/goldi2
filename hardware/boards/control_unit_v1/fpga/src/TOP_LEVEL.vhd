-------------------------------------------------------------------------------
-- Company:			Technische UniversitÃƒÂ¤t Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Top Level - Mobile control unit [control_unit_v1] 
-- Module Name:		TOP_LEVEL
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Revisions:
-- Revision V2.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V3.00.00 - First stable release
-- Additional Comments: Release for Mobile Control Unit [control_unit_v1] 
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! MachX02 library
library machxo2;
use machxo2.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_CROSSBAR_DEFAULT.all;




--! @brief Top Level of FPGA system for the Mobile Control Unit 
--! @details
--! The top module contains the drivers for the sensors and actuators 
--! of the control_unit_v1 system.
--!
--! <https://www.goldi-labs.net/>
entity TOP_LEVEL is
    port(
        --General
        ClockFPGA   : in    std_logic;                                        --! External system clock
        FPGA_nReset : in    std_logic;                                          --! Active high reset
        --Communication
        --SPI
        SPI0_SCLK   : in    std_logic;                                          --! SPI - Serial clock (max: system_clk/5)
        SPI0_MOSI   : in    std_logic;                                          --! SPI - Master out / Slave in
        SPI0_MISO   : out   std_logic;                                          --! SPI - Master in / Slave out
        SPI0_nCE0   : in    std_logic;                                          --! SPI - Active low chip enable
        --GPIO
        IO_DATA     : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)    --! FPGA IO pins
    );
end entity TOP_LEVEL;




--! General architecture
architecture RTL of TOP_LEVEL is
    
    --****INTRENAL SIGNALS****
    --General
    signal clk                  :   std_logic;
    signal FPGA_nReset_sync     :   std_logic;
    signal rst                  :   std_logic;
    --Communication
    signal spi0_sclk_sync       :   std_logic;
    signal spi0_mosi_sync       :   std_logic;
    signal spi0_nce0_sync       :   std_logic;
    signal spi0_ce0             :   std_logic;
    --System Internal communications
    signal master_bus_o         :   mbus_out;
    signal master_bus_i   	    :   mbus_in;
    signal cb_bus_i             :   sbus_i_vector(7 downto 0);
    signal cb_bus_o             :   sbus_o_vector(8 downto 0);
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_o_vector(19 downto 0);
    --System memory
    constant ctrl_default       :   data_word :=  x"30";
    signal ctrl_data            :   data_word;
        alias selected_bus      :   std_logic_vector(3 downto 0) is ctrl_data(3 downto 0);
    --External data interface
    signal internal_io_i        :   io_i_vector((L_BANK_SIZE*8)-1 downto 0);
        alias i_bank_1_i        :   io_i_vector(L_BANK_SIZE-1 downto 0) is internal_io_i(L_BANK_SIZE-1 downto 0);
        alias i_bank_2_i        :   io_i_vector(L_BANK_SIZE-1 downto 0) is internal_io_i((2*L_BANK_SIZE)-1 downto 1*L_BANK_SIZE);
        alias i_bank_3_i        :   io_i_vector(L_BANK_SIZE-1 downto 0) is internal_io_i((3*L_BANK_SIZE)-1 downto 2*L_BANK_SIZE); 
        alias i_bank_4_i        :   io_i_vector(L_BANK_SIZE-1 downto 0) is internal_io_i((4*L_BANK_SIZE)-1 downto 3*L_BANK_SIZE);
        alias i_bank_5_i        :   io_i_vector(L_BANK_SIZE-1 downto 0) is internal_io_i((5*L_BANK_SIZE)-1 downto 4*L_BANK_SIZE);
        alias i_bank_6_i        :   io_i_vector(L_BANK_SIZE-1 downto 0) is internal_io_i((6*L_BANK_SIZE)-1 downto 5*L_BANK_SIZE);
        alias i_bank_7_i        :   io_i_vector(L_BANK_SIZE-1 downto 0) is internal_io_i((7*L_BANK_SIZE)-1 downto 6*L_BANK_SIZE);
        alias i_bank_8_i        :   io_i_vector(L_BANK_SIZE-1 downto 0) is internal_io_i((8*L_BANK_SIZE)-1 downto 7*L_BANK_SIZE);
    signal internal_io_o        :   io_o_vector((L_BANK_SIZE*8)-1 downto 0);
        alias i_bank_1_o        :   io_o_vector(L_BANK_SIZE-1 downto 0) is internal_io_o(L_BANK_SIZE-1 downto 0);
        alias i_bank_2_o        :   io_o_vector(L_BANK_SIZE-1 downto 0) is internal_io_o((2*L_BANK_SIZE)-1 downto 1*L_BANK_SIZE);
        alias i_bank_3_o        :   io_o_vector(L_BANK_SIZE-1 downto 0) is internal_io_o((3*L_BANK_SIZE)-1 downto 2*L_BANK_SIZE); 
        alias i_bank_4_o        :   io_o_vector(L_BANK_SIZE-1 downto 0) is internal_io_o((4*L_BANK_SIZE)-1 downto 3*L_BANK_SIZE);
        alias i_bank_5_o        :   io_o_vector(L_BANK_SIZE-1 downto 0) is internal_io_o((5*L_BANK_SIZE)-1 downto 4*L_BANK_SIZE);
        alias i_bank_6_o        :   io_o_vector(L_BANK_SIZE-1 downto 0) is internal_io_o((6*L_BANK_SIZE)-1 downto 5*L_BANK_SIZE);
        alias i_bank_7_o        :   io_o_vector(L_BANK_SIZE-1 downto 0) is internal_io_o((7*L_BANK_SIZE)-1 downto 6*L_BANK_SIZE);
        alias i_bank_8_o        :   io_o_vector(L_BANK_SIZE-1 downto 0) is internal_io_o((8*L_BANK_SIZE)-1 downto 7*L_BANK_SIZE);
    signal external_io_i        :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
        alias e_bank_1_i        :   io_i_vector(R_BANK_SIZE-1 downto 0) is external_io_i(R_BANK_SIZE-1 downto 0);
        alias e_bank_2_i        :   io_i_vector(R_BANK_SIZE-1 downto 0) is external_io_i((2*R_BANK_SIZE)-1 downto 1*R_BANK_SIZE);
        alias e_bank_3_i        :   io_i_vector(R_BANK_SIZE-1 downto 0) is external_io_i((3*R_BANK_SIZE)-1 downto 2*R_BANK_SIZE); 
        alias e_bank_4_i        :   io_i_vector(R_BANK_SIZE-1 downto 0) is external_io_i((4*R_BANK_SIZE)-1 downto 3*R_BANK_SIZE);
        alias e_bank_5_i        :   io_i_vector(R_BANK_SIZE-1 downto 0) is external_io_i((5*R_BANK_SIZE)-1 downto 4*R_BANK_SIZE);
        alias e_bank_6_i        :   io_i_vector(R_BANK_SIZE-1 downto 0) is external_io_i((6*R_BANK_SIZE)-1 downto 5*R_BANK_SIZE);
        alias e_bank_7_i        :   io_i_vector(R_BANK_SIZE-1 downto 0) is external_io_i((7*R_BANK_SIZE)-1 downto 6*R_BANK_SIZE);
        alias e_bank_8_i        :   io_i_vector(R_BANK_SIZE-1 downto 0) is external_io_i((8*R_BANK_SIZE)-1 downto 7*R_BANK_SIZE);
    signal external_io_o        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
        alias e_bank_1_o        :   io_o_vector(R_BANK_SIZE-1 downto 0) is external_io_o(R_BANK_SIZE-1 downto 0);
        alias e_bank_2_o        :   io_o_vector(R_BANK_SIZE-1 downto 0) is external_io_o((2*R_BANK_SIZE)-1 downto 1*R_BANK_SIZE);
        alias e_bank_3_o        :   io_o_vector(R_BANK_SIZE-1 downto 0) is external_io_o((3*R_BANK_SIZE)-1 downto 2*R_BANK_SIZE); 
        alias e_bank_4_o        :   io_o_vector(R_BANK_SIZE-1 downto 0) is external_io_o((4*R_BANK_SIZE)-1 downto 3*R_BANK_SIZE);
        alias e_bank_5_o        :   io_o_vector(R_BANK_SIZE-1 downto 0) is external_io_o((5*R_BANK_SIZE)-1 downto 4*R_BANK_SIZE);
        alias e_bank_6_o        :   io_o_vector(R_BANK_SIZE-1 downto 0) is external_io_o((6*R_BANK_SIZE)-1 downto 5*R_BANK_SIZE);
        alias e_bank_7_o        :   io_o_vector(R_BANK_SIZE-1 downto 0) is external_io_o((7*R_BANK_SIZE)-1 downto 6*R_BANK_SIZE);
        alias e_bank_8_o        :   io_o_vector(R_BANK_SIZE-1 downto 0) is external_io_o((8*R_BANK_SIZE)-1 downto 7*R_BANK_SIZE);
    --GPIO Pins
    signal gpio_io_i            :   io_i_vector(63 downto 0);
    signal gpio_io_o            :   io_o_vector(63 downto 0);
    --PWM Pins
    signal pwm_io_o             :   io_o_vector(15 downto 0);   


begin
	
   --****CLOCKING****
    -----------------------------------------------------------------------------------------------
    --External 48 MHz clock used in the models
    clk <= ClockFPGA;
    
    --Internal clock for testing ["53.2"/"44.33"]
    --INTERNAL_CLOCK : component machxo2.components.OSCH
     --generic map(
         --NOM_FREQ => "53.2"
     --)
     --port map(
         --STDBY    => '0',
         --OSC      => clk,
         --SEDSTDBY => open
     --);
    -----------------------------------------------------------------------------------------------



    --****MICROCONTROLLER INTERFACE****
    -----------------------------------------------------------------------------------------------
    --Synchronization of Reset input
    RESET_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => '0',
        io_i    => FPGA_nReset,
        io_sync => FPGA_nReset_sync
    );
    --Reset routing for use in the models
    rst <= FPGA_nReset_sync;    --Incorrect port name for signal FPGA_nReset -> Signal active high
    --Reset routing for use in the test Breakoutboard
    -- rst <= not FPGA_nReset_sync;


    --SPI communication
    SCLK_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => SPI0_SCLK,
        io_sync => spi0_sclk_sync
    );

    MOSI_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => SPI0_MOSI,
        io_sync => spi0_mosi_sync
    );

    NCE0_SYNC : entity work.SYNCHRONIZER
    port map(
        clk     => clk,
        rst     => rst,
        io_i    => SPI0_nCE0,
        io_sync => spi0_nce0_sync
    );
    
    --Negate nce for use in comm modules
    spi0_ce0 <= not spi0_nce0_sync;


    --SPI comm modules
    SPI_BUS_COMMUNICATION : entity work.SPI_TO_BUS
    port map(
        clk             => clk,
        rst             => rst,
        ce              => spi0_ce0,
        sclk            => spi0_sclk_sync,
        mosi            => spi0_mosi_sync,
        miso            => SPI0_MISO,
        master_bus_o    => master_bus_o,
        master_bus_i    => master_bus_i
    );
    -----------------------------------------------------------------------------------------------



    --****INTERNAL COMMUNICATION MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Register to select the main communication bus or the io crossbar structure module
    SYSTEM_CONFIG_REG : entity work.REGISTER_UNIT
    generic map(
        ADDRESS         => CTRL_REG_ADDRESS,
        DEF_VALUE       => ctrl_default
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => master_bus_o,
        sys_bus_o       => sys_bus_o(0),
        data_in         => ctrl_data,
        data_out        => ctrl_data,
        read_stb        => open,
        write_stb       => open
    );
    
    --Mirror output bus to make register accessible in both modes of operation
    cb_bus_o(0) <= sys_bus_o(0); 


    --Multiplexing of BUS 
    sys_bus_i    <= master_bus_o when(selected_bus = x"0") else gnd_sbus_i;
    cb_bus_i(0)  <= master_bus_o when(selected_bus = x"1") else gnd_sbus_i;
    cb_bus_i(1)  <= master_bus_o when(selected_bus = x"2") else gnd_sbus_i;
    cb_bus_i(2)  <= master_bus_o when(selected_bus = x"3") else gnd_sbus_i;    
    cb_bus_i(3)  <= master_bus_o when(selected_bus = x"4") else gnd_sbus_i;
    cb_bus_i(4)  <= master_bus_o when(selected_bus = x"5") else gnd_sbus_i;
    cb_bus_i(5)  <= master_bus_o when(selected_bus = x"6") else gnd_sbus_i;
    cb_bus_i(6)  <= master_bus_o when(selected_bus = x"7") else gnd_sbus_i;
    cb_bus_i(7)  <= master_bus_o when(selected_bus = x"8") else gnd_sbus_i;
    
    
    BUS_MUX : process(clk)
    begin
        if(rising_edge(clk)) then
            if(selected_bus = (selected_bus'range => '0')) then
                if((unsigned(master_bus_o.adr) >= to_unsigned(1,master_bus_o.adr'length))   and
				   (unsigned(master_bus_o.adr) <= to_unsigned(83,master_bus_o.adr'length))) then
					master_bus_i.dat <= sys_bus_o(to_integer(unsigned(master_bus_o.adr))).dat;
				else
					master_bus_i <= gnd_mbus_i;
				end if;
			else
                master_bus_i <= reduceBusVector(cb_bus_o);
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------
    
    
    

    --****IO DATA MANAGEMENT****
    -----------------------------------------------------------------------------------------------
    --Routing IO formatted data between FPGA Pins ([io_i,io_o] <-> inout std_logic)
    FPGA_PIN_INTERFACE : entity work.TRIS_BUFFER_ARRAY
    generic map(
        BUFF_NUMBER     => PHYSICAL_PIN_NUMBER
    )
    port map(
        clk             => clk,
        rst             => rst,
        port_out        => external_io_o,
        port_in_async   => open,
        port_in_sync    => external_io_i,
        io_vector       => IO_DATA
    );
    -----------------------------------------------------------------------------------------------




    --****GPIO DRIVERS****
    -----------------------------------------------------------------------------------------------
    FPGA_GPIOs : entity work.GPIO_DRIVER_ARRAY
    generic map(
        ADDRESS         => GPIO_BASE_ADDRESS,
        GPIO_NUMBER     => 64
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(1),
        gpio_i_vector   => gpio_io_i,
        gpio_o_vector   => gpio_io_o
    );



    PWM_SIGNALS : for i in 0 to 15 generate
        PWM_DRIVER : entity work.PWM_GENERATOR_UNIT
        generic map(
            ADDRESS     => PWM_BASE_ADDRESS + i,
            FRQ_SYSTEM  => SYS_CLOCK_FREQUENCY,
            FRQ_PWM     => PWM_FREQUENCY
        )
        port map(
            clk         => clk,
            rst         => rst,
            sys_bus_i   => sys_bus_i,
            sys_bus_o   => sys_bus_o(i+2),
            pwm_out     => pwm_io_o(i)
        );
    end generate;
    -----------------------------------------------------------------------------------------------



    --****LEDs****
    -----------------------------------------------------------------------------------------------
    POWER_RED : entity work.LED_DRIVER
    generic map(
        ADDRESS         => PR_LED_ADDRESS,
        CLK_FREQUENCY   => PR_LED_FREQUENCY,
        INVERTED        => PR_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(18),
        led_output      => external_io_o(64)
    );

    
    POWER_GREEN : entity work.LED_DRIVER
    generic map(
        ADDRESS         => PG_LED_ADDRESS,
        CLK_FREQUENCY   => PG_LED_FREQUENCY,
        INVERTED        => PG_LED_INVERTED
    )
    port map(
        clk             => clk,
        rst             => rst,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o(19),
        led_output      => external_io_o(65)
    );
    -----------------------------------------------------------------------------------------------



    --****ROUTING BANK 1****
    -----------------------------------------------------------------------------------------------
    IO_ROUTING_BANK_1 : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => L_BANK_SIZE,
        RIGHT_PORT_LENGTH   => R_BANK_SIZE,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        cb_bus_i            => cb_bus_i(0),
        cb_bus_o            => cb_bus_o(1),
        left_io_i_vector    => i_bank_1_i,
        left_io_o_vector    => i_bank_1_o,
        right_io_i_vector   => e_bank_1_i,
        right_io_o_vector   => e_bank_1_o
    );

    --Route bandk inputs
    gpio_io_i(7 downto 0)  <= i_bank_1_i(7 downto 0);
    --Route bank outputs
    i_bank_1_o(7 downto 0) <= gpio_io_o(7 downto 0);
    i_bank_1_o(9 downto 8) <= pwm_io_o(1 downto 0);
    -----------------------------------------------------------------------------------------------



    --****ROUTING BANK 2****
    -----------------------------------------------------------------------------------------------
    IO_ROUTING_BANK_2 : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => L_BANK_SIZE,
        RIGHT_PORT_LENGTH   => R_BANK_SIZE,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        cb_bus_i            => cb_bus_i(1),
        cb_bus_o            => cb_bus_o(2),
        left_io_i_vector    => i_bank_2_i,
        left_io_o_vector    => i_bank_2_o,
        right_io_i_vector   => e_bank_2_i,
        right_io_o_vector   => e_bank_2_o
    );

    --Route bandk inputs
    gpio_io_i(15 downto 8)  <= i_bank_2_i(7 downto 0);
    --Route bank outputs
    i_bank_2_o(7 downto 0) <= gpio_io_o(15 downto 8);
    i_bank_2_o(9 downto 8) <= pwm_io_o(3 downto 2);
    -----------------------------------------------------------------------------------------------



    --****ROUTING BANK 3****
    -----------------------------------------------------------------------------------------------
    IO_ROUTING_BANK_3 : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => L_BANK_SIZE,
        RIGHT_PORT_LENGTH   => R_BANK_SIZE,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        cb_bus_i            => cb_bus_i(2),
        cb_bus_o            => cb_bus_o(3),
        left_io_i_vector    => i_bank_3_i,
        left_io_o_vector    => i_bank_3_o,
        right_io_i_vector   => e_bank_3_i,
        right_io_o_vector   => e_bank_3_o
    );

    --Route bandk inputs
    gpio_io_i(23 downto 16)  <= i_bank_3_i(7 downto 0);
    --Route bank outputs
    i_bank_3_o(7 downto 0) <= gpio_io_o(23 downto 16);
    i_bank_3_o(9 downto 8) <= pwm_io_o(5 downto 4);
    -----------------------------------------------------------------------------------------------



    --****ROUTING BANK 4****
    -----------------------------------------------------------------------------------------------
    IO_ROUTING_BANK_4 : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => L_BANK_SIZE,
        RIGHT_PORT_LENGTH   => R_BANK_SIZE,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        cb_bus_i            => cb_bus_i(3),
        cb_bus_o            => cb_bus_o(4),
        left_io_i_vector    => i_bank_4_i,
        left_io_o_vector    => i_bank_4_o,
        right_io_i_vector   => e_bank_4_i,
        right_io_o_vector   => e_bank_4_o
    );

    --Route bandk inputs
    gpio_io_i(31 downto 24)  <= i_bank_4_i(7 downto 0);
    --Route bank outputs
    i_bank_4_o(7 downto 0) <= gpio_io_o(31 downto 24);
    i_bank_4_o(9 downto 8) <= pwm_io_o(7 downto 6);
    -----------------------------------------------------------------------------------------------



    --****ROUTING BANK 5****
    -----------------------------------------------------------------------------------------------
    IO_ROUTING_BANK_5 : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => L_BANK_SIZE,
        RIGHT_PORT_LENGTH   => R_BANK_SIZE,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        cb_bus_i            => cb_bus_i(4),
        cb_bus_o            => cb_bus_o(5),
        left_io_i_vector    => i_bank_5_i,
        left_io_o_vector    => i_bank_5_o,
        right_io_i_vector   => e_bank_5_i,
        right_io_o_vector   => e_bank_5_o
    );

    --Route bandk inputs
    gpio_io_i(39 downto 32)  <= i_bank_5_i(7 downto 0);
    --Route bank outputs
    i_bank_5_o(7 downto 0) <= gpio_io_o(39 downto 32);
    i_bank_5_o(9 downto 8) <= pwm_io_o(9 downto 8);
    -----------------------------------------------------------------------------------------------



    --****ROUTING BANK 6****
    -----------------------------------------------------------------------------------------------
    IO_ROUTING_BANK_6 : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => L_BANK_SIZE,
        RIGHT_PORT_LENGTH   => R_BANK_SIZE,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        cb_bus_i            => cb_bus_i(5),
        cb_bus_o            => cb_bus_o(6),
        left_io_i_vector    => i_bank_6_i,
        left_io_o_vector    => i_bank_6_o,
        right_io_i_vector   => e_bank_6_i,
        right_io_o_vector   => e_bank_6_o
    );

    --Route bandk inputs
    gpio_io_i(47 downto 40)  <= i_bank_6_i(7 downto 0);
    --Route bank outputs
    i_bank_6_o(7 downto 0) <= gpio_io_o(47 downto 40);
    i_bank_6_o(9 downto 8) <= pwm_io_o(11 downto 10);
    -----------------------------------------------------------------------------------------------



    --****ROUTING BANK 7****
    -----------------------------------------------------------------------------------------------
    IO_ROUTING_BANK_7 : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => L_BANK_SIZE,
        RIGHT_PORT_LENGTH   => R_BANK_SIZE,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        cb_bus_i            => cb_bus_i(6),
        cb_bus_o            => cb_bus_o(7),
        left_io_i_vector    => i_bank_7_i,
        left_io_o_vector    => i_bank_7_o,
        right_io_i_vector   => e_bank_7_i,
        right_io_o_vector   => e_bank_7_o
    );

    --Route bandk inputs
    gpio_io_i(55 downto 48)  <= i_bank_7_i(7 downto 0);
    --Route bank outputs
    i_bank_7_o(7 downto 0) <= gpio_io_o(55 downto 48);
    i_bank_7_o(9 downto 8) <= pwm_io_o(13 downto 12);
    -----------------------------------------------------------------------------------------------



    --****ROUTING BANK 8****
    -----------------------------------------------------------------------------------------------
    IO_ROUTING_BANK_8 : entity work.IO_CROSSBAR
    generic map(
        LEFT_PORT_LENGTH    => L_BANK_SIZE,
        RIGHT_PORT_LENGTH   => R_BANK_SIZE,
        LAYOUT_BLOCKED      => block_layout,
        DEFAULT_CB_LAYOUT   => DEFAULT_CROSSBAR_LAYOUT
    )
    port map(
        clk                 => clk,
        rst                 => rst,
        cb_bus_i            => cb_bus_i(7),
        cb_bus_o            => cb_bus_o(8),
        left_io_i_vector    => i_bank_8_i,
        left_io_o_vector    => i_bank_8_o,
        right_io_i_vector   => e_bank_8_i,
        right_io_o_vector   => e_bank_8_o
    );

    --Route bandk inputs
    gpio_io_i(63 downto 56)  <= i_bank_8_i(7 downto 0);
    --Route bank outputs
    i_bank_8_o(7 downto 0) <= gpio_io_o(63 downto 56);
    i_bank_8_o(9 downto 8) <= pwm_io_o(15 downto 14);
    -----------------------------------------------------------------------------------------------


end architecture RTL;
