-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/04/2023
-- Design Name:		Error detector for 3_axis_portal_v2 testbench
-- Module Name:		ERROR_DETECTOR_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_MODULE_CONFIG.vhd
--                  -> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> ERROR_DETECTOR.vhd
--
-- Revisions:
-- Revision V0.01.03 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: -
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom libraries
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;




--! Functionality Simulation
entity ERROR_DETECTOR_TB is
end entity ERROR_DETECTOR_TB;




--! Simulation architecture
architecture TB of ERROR_DETECTOR_TB is

    --CUT
    component ERROR_DETECTOR 
        generic(
            ADDRESS             :   natural
        );
        port(
            clk                 : in    std_logic;
            rst                 : in    std_logic;
            sys_bus_i           : in    sbus_in;
            sys_bus_o           : out   sbus_out;
            sys_io_i            : in    io_i_vector(42 downto 0);
            actuator_driver_i   : in    std_logic_vector(6 downto 0)   
        );
    end component;


    --Intermedate signals
    --Simulation timing
	constant clk_period		    :	time := 10 ns;
	signal reset			    :	std_logic;
	signal clock			    :	std_logic := '0';
	signal run_sim			    :	std_logic := '1';
	--DUT i/o
    signal sys_bus_i            :   sbus_in;
    signal sys_bus_o            :   sbus_out;
    signal sys_io_i             :   io_i_vector(42 downto 0);
    --Buffers
    signal reg_1_buff       :   std_logic_vector(7 downto 0);
    signal reg_2_buff       :   std_logic_vector(7 downto 0);
    
    signal input_values     :   std_logic_vector(12 downto 0);
        alias limit_x_neg   :   std_logic is input_values(0);
        alias limit_x_pos   :   std_logic is input_values(1);
        alias limit_y_neg   :   std_logic is input_values(2);
        alias limit_y_pos   :   std_logic is input_values(3);
        alias limit_z_neg   :   std_logic is input_values(4);
        alias limit_z_pos   :   std_logic is input_values(5);
        alias x_neg_valid   :   std_logic is input_values(6);
        alias x_pos_valid   :   std_logic is input_values(7);
        alias y_neg_valid   :   std_logic is input_values(8);
        alias y_pos_valid   :   std_logic is input_values(9);
        alias z_dc_enb      :   std_logic is input_values(10);
        alias z_out_1       :   std_logic is input_values(11);
        alias z_out_2       :   std_logic is input_values(12);


begin
    
    

   DUT : ERROR_DETECTOR 
   generic map(
		ADDRESS             => 1
   )
   port map(
        clk                 => clock,
        rst                 => reset,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o,
        sys_io_i            => sys_io_i,
		actuator_driver_i   => input_values(12 downto 6)  
    );
    

	--Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 0 ns, '0' after 15 ns;

    
    --Sensors
    sys_io_i(2).dat <= limit_x_neg;
    sys_io_i(3).dat <= limit_x_pos;
    sys_io_i(4).dat <= limit_y_neg;
    sys_io_i(5).dat <= limit_y_pos;
    sys_io_i(6).dat <= limit_z_neg;
    sys_io_i(7).dat <= limit_z_pos;



    TEST : process
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := clk_period/2;
    begin
        --Preset bus signals
        sys_bus_i.we  <= '0';
        sys_bus_i.adr <= "0000000";
        sys_bus_i.dat <= x"00";
        
        wait for init_hold;


        
        for i in 0 to (2**13)-1 loop
            --Simulate possible gpio values
            input_values <= std_logic_vector(to_unsigned(i,13));

            wait for 3*clk_period;
            sys_bus_i.adr <= "0000001";
            wait for clk_period;
            sys_bus_i.adr <= "0000010";
            wait for clk_period/2;
            reg_1_buff <= sys_bus_o.dat;
            wait for clk_period;
            reg_2_buff <= sys_bus_o.dat;
            wait for clk_period/2;
            

            wait for assert_hold;
            if(limit_x_neg = '1' and limit_x_pos = '1') then
                assert(reg_1_buff(0) = '1')
                report "line(159): Expecting error code 0" severity error;
            end if;

            if(limit_y_neg = '1' and limit_y_pos = '1') then
                assert(reg_1_buff(1) = '1')
                report "line(164): Expecting error code 1" severity error;
            end if;

            if(limit_z_neg = '1' and limit_z_pos = '1') then
                assert(reg_1_buff(2) = '1')
                report "line(169): Expecting error code 2" severity error;
            end if;

            if(z_out_1 = '1' and z_out_2 = '1') then
                assert(reg_1_buff(3) = '1')
                report "line(174): Expecting error code 3" severity error;
            end if;

            if(limit_z_pos = '0' and (x_neg_valid = '1' or x_pos_valid = '1')) then
                assert(reg_1_buff(4) = '1')
                report "line(179): Expecting error code 4" severity error;
            end if;

            if(limit_z_pos = '0' and (y_neg_valid = '1' and y_pos_valid = '1')) then
                assert(reg_1_buff(5) = '1')
                report "line(184): Expecting error code 5" severity error;
            end if;

            if(limit_x_neg = '1' and x_neg_valid = '1') then
                assert(reg_1_buff(6) = '1')
                report "line(189): Expecting error code 6" severity error;
            end if;

            if(limit_x_pos = '1' and x_pos_valid = '1') then
                assert(reg_1_buff(7) = '1')
                report "line(194): Expecting error code 7" severity error;
            end if;

            if(limit_y_neg = '1' and y_neg_valid = '1') then
                assert(reg_2_buff(0) = '1')
                report "line(199): Expecting error code 8" severity error;
            end if;

            if(limit_y_pos = '1' and y_pos_valid = '1') then
                assert(reg_2_buff(1) = '1')
                report "line(204): Expecting error code 9" severity error;
            end if;

            if(limit_z_neg = '1' and z_out_1 = '1') then
                assert(reg_2_buff(2) = '1')
                report "line(209): Expecting error code 10" severity error;
            end if;

            if(limit_z_pos = '1' and z_out_2 = '1') then
                assert(reg_2_buff(3) = '1')
                report "line(214): Expecting error code 11" severity error;
            end if;

            sys_bus_i.adr <= (others => '0');
        end loop;


        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;


end TB;