-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/08/2023
-- Design Name:		UART Dynamic Data Rate Sub-Module Testbench
-- Module Name:		UART_D_SMODULE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> UART_S_SMODULE.vhd
--                  -> UART_RX_SDRIVER.vhd
--                  -> UART_TX_SDRIVER.vhd
--                  -> UART_STD_ENCODER.vhd
--                  -> UART_STD_DECODER.vhd
--                  -> STREAM_FIFO.vhd
--                  -> REGISTER_UNIT.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation flow control and assertions
library std;
use std.standard.all;
use std.env.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality Simulation
entity UART_D_SMODULE_TB is
end entity UART_D_SMODULE_TB;




--! Simulation architecture
architecture TB of UART_D_SMODULE_TB is

    --****DUT****
    component UART_D_SMODULE
        generic(
            g_address       :   integer;
            g_clk_frequency :   integer;
            g_buffer_width  :   integer;
            g_data_width    :   integer;
            g_stop_bits     :   integer;
            g_parity_bit    :   integer;
            g_parity_even   :   boolean;
            g_msbf          :   boolean
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            p_rx            : in    io_i;
            p_rx_available  : out   std_logic;
            p_rx_error      : out   std_logic;
            p_tx            : out   io_o
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 20 ns;
	signal run_sim			:	std_logic := '1';
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
    --DUT IOs
    signal sys_bus_i        :   sbus_in  := gnd_sbus_i;
    signal sys_bus_o        :   sbus_out := gnd_sbus_o;
    signal p_rx             :   io_i := high_io_i;
    signal p_rx_available   :   std_logic := '0';
    signal p_rx_error       :   std_logic := '0';
    signal p_tx             :   io_o := high_io_o; 
    --Testbench
    constant c9600          :   integer := 5208;
    constant c115200        :   integer := 434;
    signal data             :   std_logic_vector(10 downto 0) := "10110011000";

    
begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : UART_D_SMODULE
    generic map(
        g_address       => 1,
        g_clk_frequency => 50000000,
        g_buffer_width  => 5,
        g_data_width    => 8,
        g_stop_bits     => 1,
        g_parity_bit    => 1,
        g_parity_even   => true,
        g_msbf          => false
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        p_rx            => p_rx,
        p_rx_available  => p_rx_available,
        p_rx_error      => p_rx_error,
        p_tx            => p_tx
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
    clock <= run_sim and (not clock) after clk_period/2;
    reset <= '1' after 10 ns, '0' after 30 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        --Timing
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 9*clk_period/2;
        variable post_hold      :   time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;



        --**Test reset state**
        wait for assert_hold;
        assert(sys_bus_o = gnd_sbus_o)
            report "ID01: Test reset - expecting sys_bus_o = gnd_sbus_o"
            severity error;
        assert(p_rx_error = '0')
            report "ID02: Test reset - expecting p_rx_error = '0'"
            severity error;
        assert(p_tx = high_io_o)
            report "ID03: Test reset - expecting p_tx = high_io_o"
            severity error;
        wait for post_hold;



        --**Test 9600 data transmission**
        sys_bus_i <= writeBus(1,204);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 0 to 10 loop
            wait for c9600*clk_period/2;
            assert(p_tx.enb = '1' and p_tx.dat = data(i))
                report "ID04: Test 9600 data transmission - expecting p_tx = data(" & integer'image(i) & ")"
                severity error;
            wait for c9600*clk_period/2;
        end loop;


        wait for 5*clk_period;


        --**Test 9600 data reception**
        for i in 0 to 10 loop
            p_rx.dat <= data(i);
            wait for c9600*clk_period;
        end loop;

        wait for assert_hold;
        assert(p_rx_available = '1')
            report "ID05: Test 9600 data reception - expecting p_rx_available = '1'"
            severity error;
            
        sys_bus_i <= readBus(1);
        wait for 3*clk_period/2;
        
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(204,SYSTEM_DATA_WIDTH)))
            report "ID05: Test 9600 data reception - expecting reg(1) = data"
            severity error;
        wait for post_hold;
        

        wait for 5*clk_period;


        --**Test 115200 data transmission**
        sys_bus_i <= writeBus(2,4);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        sys_bus_i <= writeBus(1,204);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 0 to 10 loop
            wait for c115200*clk_period/2;
            assert(p_tx.enb = '1' and p_tx.dat = data(i))
                report "ID06: Test 115200 data transmission - expecting p_tx = data(" & integer'image(i) & ")"
                severity error;
            wait for c115200*clk_period/2;
        end loop;


        wait for 5*clk_period;


        --**Test 115200 data reception**
        for i in 0 to 10 loop
            p_rx.dat <= data(i);
            wait for c115200*clk_period;
        end loop;

        wait for assert_hold;
        assert(p_rx_available = '1')
            report "ID07: Test 115200 data reception - expecting p_rx_available = '1'"
            severity error;
            
        sys_bus_i <= readBus(1);
        wait for 3*clk_period/2;
        
        assert(sys_bus_o.dat = std_logic_vector(to_unsigned(204,SYSTEM_DATA_WIDTH)))
            report "ID08: Test 115200 data reception - expecting reg(1) = data"
            severity error;
        wait for post_hold;


        --**End simulation**
        wait for 50 ns;
        report"UART_D_SMODULE_TB - testbench completed";
        --Simulation end using vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries not supported)
        -- run_sim <= '0';
        -- wait;        

    end process;
    -----------------------------------------------------------------------------------------------

    
end architecture;