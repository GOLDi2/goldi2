-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		31/07/2023
-- Design Name:		Incremental encoder signal processing unit
-- Module Name:		INC_ENCODER_DSP
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:    none
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief Incremental encoder dsp module 
--! @details
--! Incremental encoder processing unit for 2 channel encoder. The module reacts
--! to the data of the a channel providing an impulse count for the "p_channel_a" 
--! edges and uses the "p_channel_b" to determine the movement direction. 
--! The counter value is stored in a unsigned 16 bit data word and is then 
--! presented in the "p_enc_counter" signal.
--!
--! The parameter "g_invert_dir" selects the direction of the positive axis of
--! rotation. By setting the parameter to true the moduel increases the counter
--! when the encoder is rotated in the clockwise direction. A rising edge on the
--! "p_channel_a" and a high state in the "p_channel_b" increase the counter. If
--! the parameter is set to false this behaviour is inverted an the counter
--! clockwise movement produces an increment in the module's counter. A rising
--! edge on the "p_channel_a" and a low state in the "p_channel_b" increase the
--! counter.
--!
--! + g_invert = false 
--!     - [channel_a: 01 | channel_b: 0] counter --
--!     - [channel_a: 01 | channel_b: 1] counter ++
--!     - [channel_a: 10 | channel_b: 0] counter ++
--!     - [channel_a: 10 | channel_b: 1] counter --
--! 
--! + g_invert = true
--!     - [channel_a: 01 | channel_b: 0] counter ++
--!     - [channel_a: 01 | channel_b: 1] counter --
--!     - [channel_a: 10 | channel_b: 0] counter --
--!     - [channel_a: 10 | channel_b: 1] counter ++
--!
--! ***Latency: 3cyc***
entity ENCODER_DRIVER is
    generic(
        g_invert_dir    :   boolean := false                    --! Select positive direction [false -> CCW | true -> CC]
    );
    port(
        --General
        clk             : in    std_logic;                      --! System clock
        rst             : in    std_logic;                      --! Asynchronous reset
        enb             : in    std_logic;                      --! Module enable
        --Data interface
        p_channel_a     : in    std_logic;                      --! Encoder channel_a input
        p_channel_b     : in    std_logic;                      --! Encoder channel_b input
        p_enc_count     : out   std_logic_vector(15 downto 0)   --! Encoder position counter
    );
end entity ENCODER_DRIVER;




--! General architecture
architecture RTL of ENCODER_DRIVER is

    --****INTERNAL SIGNAL****
    signal enc_counter      :   unsigned(15 downto 0);
    signal channel_a_buff   :   std_logic;

begin

    --****REGISTER****
    -----------------------------------------------------------------------------------------------
    CHANNEL_A_REGISTER : process(clk,rst)
    begin
        if(rst = '1') then
            channel_a_buff <= '0';
        elsif(rising_edge(clk)) then
            if(enb = '1') then
                channel_a_buff <= p_channel_a;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****ARITHMETIC****
    -----------------------------------------------------------------------------------------------
    SIGNAL_DECODER : process(clk,rst)
    begin
        if(rst = '1') then
            enc_counter <= (others => '0');
        elsif(rising_edge(clk)) then
            --Detect rising edge when module is enabled
            if((enb = '1') and (p_channel_a = '1') and (channel_a_buff = '0')) then
                if((p_channel_b = '1') and (g_invert_dir = false)) then
                    enc_counter <= enc_counter + 1;
                elsif((p_channel_b = '1') and (g_invert_dir = true)) then
                    enc_counter <= enc_counter - 1;
                elsif((p_channel_b = '0') and (g_invert_dir = false)) then
                    enc_counter <= enc_counter - 1;
                elsif((p_channel_b = '1') and (g_invert_dir = true)) then
                    enc_counter <= enc_counter + 1;
                else null;
                end if;                

            --Detect falling edge when module is enabled
            elsif((enb = '1') and (p_channel_a = '0') and (channel_a_buff = '1')) then
                if((p_channel_b = '1') and (g_invert_dir = false)) then
                    enc_counter <= enc_counter - 1;
                elsif((p_channel_b = '1') and (g_invert_dir = true)) then
                    enc_counter <= enc_counter + 1;
                elsif((p_channel_b = '0') and (g_invert_dir = false)) then
                    enc_counter <= enc_counter + 1;
                elsif((p_channel_b = '0') and (g_invert_dir = true)) then
                    enc_counter <= enc_counter - 1;
                else null;
                end if;

            else null;           
            end if;
        end if;
    end process;


    --Route ouput signal
    p_enc_count <= std_logic_vector(enc_counter);
    -----------------------------------------------------------------------------------------------


end architecture;