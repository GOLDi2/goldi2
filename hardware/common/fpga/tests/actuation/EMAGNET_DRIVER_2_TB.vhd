-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		26/05/2023
-- Design Name:		Electromagnet driver testbench
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
-- Revision V3.01.00 - First release
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
--! Use assert library for simulation
library std;
use std.standard.all;




--! Functionality simulation
entity EMAGNET_DRIVER_2_TB is
end entity EMAGNET_DRIVER_2_TB;




--! Simulation architecture
architecture TB of EMAGNET_DRIVER_2_TB is

    --****DUT****
    component EMAGNET_DRIVER_2
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
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal sys_bus_i        :   sbus_in;
    signal sys_bus_o        :   sbus_out;
    signal emag_enb         :   io_o;
    signal emag_out_1       :   io_o;
    signal emag_out_2       :   io_o;

  
begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : EMAGNET_DRIVER_2
    generic map(
        ADDRESS         => 1,
        MAGNET_TAO      => 1000,
        PULSE_REDUCTION => 1000
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => sys_bus_i,
        sys_bus_o       => sys_bus_o,
        emag_enb        => emag_enb,
        emag_out_1      => emag_out_1,
        emag_out_2      => emag_out_2
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 5 ns, '0' after 15 ns;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset signals
        sys_bus_i <= gnd_sbus_i;
        wait for init_hold;


        --**Test reset state**
        wait for assert_hold;
        assert(emag_enb = ('1','0'))
            report "ID01: Test reset - expecting emag_enb = (1,0)" severity error;
        assert(emag_out_1 = ('1','0'))
            report "ID02: Test reset - expecting emag_out_1 = (1,0)" severity error;
        assert(emag_out_2 = ('1','0'))
            report "ID03: Test reset - expecting emag_out_2 = (1,0)" severity error;
        wait for post_hold;


        --**Test power on**
        sys_bus_i <= writeBus(1,128);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        assert(emag_enb = ('1','1'))
            report "ID04: Test power on - expecting emag_enb = (1,1)" severity error;
        assert(emag_out_1 = ('1','1'))
            report "ID05: Test power on - expecting emag_out_1 = (1,1)" severity error;
        assert(emag_out_2 = ('1','0'))
            report "ID06: Test power on - expecting emag_out_2 = (1,0)" severity error;
        wait for post_hold;


        wait for 5*clk_period;



        --**Test power off**
        sys_bus_i <= writeBus(1,5);
        wait for clk_period;
        sys_bus_i <= gnd_sbus_i;

        wait for assert_hold;
        for i in 1 to 5 loop

            for j in 1 to 10 loop
                assert(emag_enb = ('1','0'))
                    report "ID07: Test power off - expecting emag_enb = (1,0) ["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                assert(emag_out_1 = ('1','0'))
                    report "ID08: Test power off - expecting emag_out_1 = (1,0) ["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                assert(emag_out_2 = ('1','0'))
                    report "ID09: Test power off - expecting emag_out_2 = (1,0)["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                wait for 100*clk_period;
            end loop;

            for j in 1 to (6-i) loop
                assert(emag_enb = ('1','1'))
                    report "ID10: Test power off - expecting emag_enb = (1,1)["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                assert(emag_out_1 = ('1','0'))
                    report "ID11: Test power off - expecting emag_out_1 = (1,0)["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                assert(emag_out_2 = ('1','1'))
                    report "ID12: Test power off - expecting emag_out_2 = (1,1)["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                wait for 1000*clk_period;
            end loop;

            for j in 1 to 10 loop
                assert(emag_enb = ('1','0'))
                    report "ID14: Test power off - expecting emag_enb = (1,0) ["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                assert(emag_out_1 = ('1','0'))
                    report "ID15: Test power off - expecting emag_out_1 = (1,0) ["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                assert(emag_out_2 = ('1','0'))
                    report "ID16: Test power off - expecting emag_out_2 = (1,0)["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                wait for 100*clk_period;
            end loop;
        
            for j in 1 to (5-i) loop
                assert(emag_enb = ('1','1'))
                    report "ID17: Test power off - expecting emag_enb = (1,1)["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                assert(emag_out_1 = ('1','1'))
                    report "ID18: Test power off - expecting emag_out_1 = (1,0)["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                assert(emag_out_2 = ('1','0'))
                    report "ID19: Test power off - expecting emag_out_2 = (1,1)["
                    & integer'image(i) & "," & integer'image(j) & "]"
                    severity error;
                wait for 1000*clk_period;
            end loop;
        end loop;


        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end architecture;
