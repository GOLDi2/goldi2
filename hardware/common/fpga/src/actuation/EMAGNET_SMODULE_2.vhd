-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		26/05/2023
-- Design Name:		Electromagnet driver 
-- Module Name:		EMAGNET_DRIVER_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> EMAGNET_DRIVER.vhd
--
-- Revisions:
-- Revision V3.00.01 - File Created
-- Additional Comments: First commitment
--
-- Revision V3.00.01 - First release
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




--! @brief
--! @details
--!
entity EMAGNET_DRIVER_2 is
    generic(
        ADDRESS         :   integer := 1;
        MAGNET_TAO      :   integer := 10;
        PULSE_REDUCTION :   integer := 10
    );
    port(
        clk             : in    std_logic;
        rst             : in    std_logic;
        sys_bus_i       : in    sbus_in;
        sys_bus_o       : out   sbus_out;
        emag_enb        : out   io_o;
        emag_out_1      : out   io_o;
        emag_out_2      : out   io_o
    );
end entity EMAGNET_DRIVER_2;




--! General architecture
architecture RTL of EMAGNET_DRIVER_2 is

    --****INTERNAL SIGNALS****
    --Memory
    constant reg_default    :   data_word := (others => '0');
    signal reg_data         :   data_word;
        alias power         :   std_logic is reg_data(7);
        alias pulse_factor  :   std_logic_vector(6 downto 0) is reg_data(6 downto 0);  
    --Data buffers
    signal pulse_width      :   integer;
    --Counters
    signal tao_counter      :   integer range 0 to MAGNET_TAO;
    signal pulse_counter    :   integer;
    --State machines
    type magnet_state is (IDLE, POWER_ON, POWER_OFF);
    type pulse_state is (HOLD_TAO, PULSE_NEG, PULSE_POS);
    signal ps_magnet    :   magnet_state;
    signal ps_pulse     :   pulse_state;
    signal ns_pulse     :   pulse_state;


begin

    --****CONTROL OF MAGNET POWER ON/OFF CYCLE****
    -----------------------------------------------------------------------------------------------
    MAGNET_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            ps_magnet <= POWER_OFF;
        elsif(rising_edge(clk)) then
            --Magnet state machine
            case ps_magnet is
            when IDLE =>        if(power = '1') then ps_magnet <= POWER_ON;  
                                else ps_magnet <= IDLE;
                                end if;
            when POWER_ON =>    if(power = '0') then ps_magnet <= POWER_OFF; 
                                else ps_magnet <= POWER_ON;
                                end if;
            when POWER_OFF =>   if(pulse_width < PULSE_REDUCTION) then ps_magnet <= IDLE;  
                                else ps_magnet <= POWER_OFF;
                                end if;
            when others =>  ps_magnet <= IDLE;
            end case;
        end if;
    end process;


    PULSE_CONTROL : process(clk,rst)
    begin
        if(rst = '1') then
            ps_pulse    <= HOLD_TAO;
            ns_pulse    <= PULSE_NEG;
            pulse_width <= 0;
        elsif(rising_edge(clk)) then
            if(ps_magnet /= POWER_OFF) then
                ps_pulse    <= HOLD_TAO;
                ns_pulse    <= PULSE_NEG;
                pulse_width <= 1000*to_integer(unsigned(pulse_factor));
            else
                --Control pulse generation
                case ps_pulse is
                when HOLD_TAO =>    if(tao_counter = MAGNET_TAO-1) then ps_pulse <= ns_pulse;
                                    else ps_pulse <= HOLD_TAO;
                                    end if;
                when PULSE_NEG =>   if(pulse_counter = pulse_width-1) then
                                        ps_pulse <= HOLD_TAO;
                                        ns_pulse <= PULSE_POS;
                                        pulse_width <= pulse_width - PULSE_REDUCTION;
                                    else ps_pulse <= PULSE_NEG;
                                    end if;
                when PULSE_POS =>   if(pulse_counter = pulse_width-1) then
                                        ps_pulse <= HOLD_TAO;
                                        ns_pulse <= PULSE_NEG;
                                    else ps_pulse <= PULSE_POS;
                                    end if;
                when others =>      ps_pulse <= HOLD_TAO;
                end case;
            end if;
        end if;
    end process;
    -----------------------------------------------------------------------------------------------


    
    --****COUNTERS****
    -----------------------------------------------------------------------------------------------
    PULSE_WIDTH_GENERATION : process(clk,rst)
    begin
        if(rst = '1') then
            pulse_counter <= 0;
        elsif(rising_edge(clk)) then
            if(ps_magnet /= POWER_OFF) then
                pulse_counter <= 0;
            elsif(ps_magnet = POWER_OFF and ps_pulse = HOLD_TAO) then
                pulse_counter <= 0;
            elsif(pulse_counter = pulse_width-1) then
                pulse_counter <= 0;
            else
                pulse_counter <= pulse_counter + 1;
            end if;
        end if;
    end process;

    
    TAO_OFF_COUNTER : process(clk,rst)
    begin
        if(rst = '1') then
            tao_counter <= 0;
        elsif(rising_edge(clk)) then
            --Reset counter as long as the magnet is not in power off mode
            if(ps_magnet /= POWER_OFF) then
                tao_counter <= 0;
            elsif(ps_pulse /= HOLD_TAO) then
                tao_counter <= 0;
            elsif(tao_counter = MAGNET_TAO-1) then
                tao_counter <= 0;
            else 
                tao_counter <= tao_counter + 1;
            end if;        
        end if;
    end process;
    -----------------------------------------------------------------------------------------------



    --****H-BRIDGE SIGNALS****
    -----------------------------------------------------------------------------------------------
    --Enable signal for the H-Bridge
    emag_enb.enb <= '1';
    emag_enb.dat <= '1' when((ps_magnet = POWER_ON)                             or 
                             (ps_magnet = POWER_OFF and ps_pulse = PULSE_NEG)   or
                             (ps_magnet = POWER_OFF and ps_pulse = PULSE_POS))  else
                    '0';

    --Out 1 for H-Bridge. Main power signal for electromagnet
    emag_out_1.enb <= '1';
    emag_out_1.dat <=   '1' when((ps_magnet = POWER_ON)                             or
                                 (ps_magnet = POWER_OFF and ps_pulse = PULSE_POS))  else
                        '0';

    --Out 2 for H-Bridge. Demagnetization line
    emag_out_2.enb <= '1';
    emag_out_2.dat <=   '1' when((ps_magnet = POWER_OFF and ps_pulse = PULSE_NEG))  else
                        '0';
    -----------------------------------------------------------------------------------------------



    --****MEMORY****
    -----------------------------------------------------------------------------------------------
    MEMORY : entity work.REGISTER_UNIT
    generic map(
        ADDRESS     => ADDRESS,
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


end RTL;