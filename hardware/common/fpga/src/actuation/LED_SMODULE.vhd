-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		LED Control Module
-- Module Name:		LED_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:    -> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_IO_STANDARD.vhd
--					-> REGISTER_UNIT.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V1.01.00 - Memory unit change
-- Additional Comments: New memory modules introduced
--
-- Revision V4.00.00 - Module renaming and change of reset type
-- Additional Comments: Renaming of module to follow V4.00.00 conventions.
--                      (LED_DRIVER.vhd -> LED_SMODULE.vhd)
--						Change from synchronous to asynchronous reset.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! @brief LED driver module
--! @detials
--! The LED driver module is a simple module used to controll a sandard
--! LED. The module is capable of turning the LED on and off or generating
--! a configurable blinking pattern based on the values stored in the module's
--! single register. The module uses the "clk_frequency" generic paramter and 
--! two 3-bit values to set the on/off time of the LED for the blinking pattern. 
--! The "clk_frequency" parameter determines maximum on/off time of the LED. The
--! "clk_frequency" paramter is divided by a factor of 16 and this fraction then
--! multiplied with the corresponding on/off values to set the on/off time of the
--! LED.
--! 
--! #### Register:
--!
--! | Address	| Bit 7	| Bit 6	| Bit 5 | Bit 4	| Bit 3	| Bit 2	| Bit 1	| Bit 0 |
--! |----------:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|
--!	| +0		| brightness | blink_enabled | delay_on ||| delay_off |||
--!
--!
--! Example: REG[0 1 000 001]
--! If the "clk_frequency" parameter is set to 32 then the fractional value is 2. 
--! Setting the "delay_on" = "000/b0001" results in the on time 1*2*clk_period.
--! The "delay_off" = "001/b0011" results in an off time 3*2*clk_period
--!
--!
--! **Latency: 1cyc**
entity LED_SMODULE is
    generic(
        g_address       :   natural := 1;       --! Module's base address
        g_clk_frequency :   natural := 16;      --! LED's frequency factor
        g_inverted      :   boolean := false    --! Inverted on/off
    );
    port(
        --General
        clk             : in    std_logic;      --! System clock
        rst             : in    std_logic;      --! Asynchronous reset
        --BUS slave interface
        sys_bus_i       : in    sbus_in;        --! BUS input signals [stb,we,adr,dat,tag]
        sys_bus_o       : out   sbus_out;       --! BUS output signal [dat,tag]
        --LED signal
        p_led_output    : out   io_o            --! LED output signal
    );
end entity LED_SMODULE;




--! General architecture
architecture RTL of LED_SMODULE is

    --****INTERNAL SIGNALS****
    --Memory
    constant reg_default        :   data_word := (others => '0');
    signal reg_data             :   data_word;
        alias led_enb           :   std_logic is reg_data(7);
        alias led_blink_enb     :   std_logic is reg_data(6);
        alias led_on_delay      :   std_logic_vector(2 downto 0) is reg_data(5 downto 3);
        alias led_off_delay     :   std_logic_vector(2 downto 0) is reg_data(2 downto 0);
    --Counter and Flags
    constant led_counter_high   :   natural := g_clk_frequency/16; 
    signal led_counter          :   natural range 0 to led_counter_high;
    signal blink_counter        :   natural range 0 to 16;
    signal blinker_state        :   std_logic;
    signal blink_counter_enb    :   std_logic;
    signal led_state            :   std_logic;


begin

    --****OUTPUT ROUTING****
    -----------------------------------------------------------------------------------------------
    led_state        <= blinker_state when(led_blink_enb = '1') else led_enb;
    p_led_output.enb <= '1';
    p_led_output.dat <= not led_state when g_inverted else led_state; 
    -----------------------------------------------------------------------------------------------



    --****LED BLINKER****
    -----------------------------------------------------------------------------------------------
    BLINKER : process(clk,rst)
    begin
        if(rst = '1') then
            blink_counter <= 0;
            blinker_state <= '0';
        elsif(rising_edge(clk)) then
            if(blink_counter_enb = '1' and blinker_state = '1') then
                if(blink_counter = unsigned(led_on_delay) & '1') then
                    blink_counter <= 0;
                    blinker_state <= '0';
                else
                    if(blink_counter = 15) then
                        blink_counter <= 0;
                    else
                        blink_counter <= blink_counter + 1;
                    end if;

                    blinker_state <= '1';
                end if;
            

            elsif(blink_counter_enb = '1' and blinker_state = '0') then
                if(blink_counter = unsigned(led_off_delay) & '1') then
                    blink_counter <= 0;
                    blinker_state   <= '1'; 
                else
                    if(blink_counter = 15) then
                        blink_counter <= 0;
                    else
                        blink_counter <= blink_counter + 1;
                    end if;

                    blinker_state <= '0';
                end if;
            else null;
            end if; 
        end if;
    end process;

    
    CLK_DIVIDER : process(clk,rst)
    begin
        if(rst = '1') then
            led_counter       <= 0;
            blink_counter_enb <= '0';
        elsif(rising_edge(clk)) then
            if(led_counter = led_counter_high) then
                led_counter       <= 0;
                blink_counter_enb <= '1';
            else
                led_counter       <= led_counter + 1;
                blink_counter_enb <= '0';
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_UNIT
    generic map(
        ADDRESS     => g_address,
        DEF_VALUE   => reg_default
    )
    port map(
        clk         => clk,
        rst         => rst,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o,
        data_in     => reg_data,
        data_out    => reg_data,
        read_stb    => open,
        write_stb   => open
    );
    -----------------------------------------------------------------------------------------------


end architecture;