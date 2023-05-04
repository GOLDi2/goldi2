-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/12/2022
-- Design Name:		Error detector for 3_axis_portal_v1 testbench
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
            ADDRESS         :   natural
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            sys_io_i        : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            sys_io_o        : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)   
        );
    end component;


    --Intermedate signals
    --Simulation timing
	constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic;
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT i/o
    signal sys_bus_i        :   sbus_in;
    signal sys_bus_o        :   sbus_out;
    signal sys_io_i         :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal sys_io_o         :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    --Buffers
    signal reg_1_buff       :   std_logic_vector(7 downto 0);
    signal reg_2_buff       :   std_logic_vector(7 downto 0);
    signal reg_3_buff       :   std_logic_vector(7 downto 0);
    
    signal input_values     :   std_logic_vector(16 downto 0);
        alias limit_x_neg   :   std_logic is input_values(0);
        alias limit_x_pos   :   std_logic is input_values(1);
        alias limit_x_ref   :   std_logic is input_values(2);
        alias limit_y_neg   :   std_logic is input_values(3);
        alias limit_y_pos   :   std_logic is input_values(4);
        alias limit_y_ref   :   std_logic is input_values(5);
        alias limit_z_neg   :   std_logic is input_values(6);
        alias limit_z_pos   :   std_logic is input_values(7);
        alias x_enable      :   std_logic is input_values(8);
        alias x_out_1       :   std_logic is input_values(9);
        alias x_out_2       :   std_logic is input_values(10);
        alias y_enable      :   std_logic is input_values(11);
        alias y_out_1       :   std_logic is input_values(12);
        alias y_out_2       :   std_logic is input_values(13);
        alias z_enable      :   std_logic is input_values(14);
        alias z_out_1       :   std_logic is input_values(15);
        alias z_out_2       :   std_logic is input_values(16);


begin
    
    

   DUT : ERROR_DETECTOR 
   generic map(
		ADDRESS     => 1
   )
   port map(
        clk         => clock,
        rst         => reset,
        sys_bus_i   => sys_bus_i,
        sys_bus_o   => sys_bus_o,
        sys_io_i    => sys_io_i,
		sys_io_o    => sys_io_o   
    );
    

	--Timing
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 0 ns, '0' after 15 ns;

    
    --Sensors
    sys_io_i(2).dat <= limit_x_neg;
    sys_io_i(3).dat <= limit_x_pos;
    sys_io_i(4).dat <= limit_x_ref;
    sys_io_i(5).dat <= limit_y_neg;
    sys_io_i(6).dat <= limit_y_pos;
    sys_io_i(7).dat <= limit_y_ref;
    sys_io_i(8).dat <= limit_z_neg;
    sys_io_i(9).dat <= limit_z_pos;
    --Actuators
    sys_io_o(17).dat <= x_enable;
    sys_io_o(18).dat <= x_out_1;
    sys_io_o(19).dat <= x_out_2;
    sys_io_o(20).dat <= y_enable;
    sys_io_o(21).dat <= y_out_1;
    sys_io_o(22).dat <= y_out_2;
    sys_io_o(23).dat <= z_enable;
    sys_io_o(24).dat <= z_out_1;
    sys_io_o(25).dat <= z_out_2;


    TEST : process
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset bus signals
        sys_bus_i.we  <= '0';
        sys_bus_i.adr <= "0000000";
        sys_bus_i.dat <= x"00";
        
        wait for init_hold;


        
        for i in 0 to (2**17)-1 loop
            --Simulate possible gpio values
            input_values <= std_logic_vector(to_unsigned(i,17));

            wait for 3*clk_period;
            sys_bus_i.adr <= "0000001";
            wait for clk_period;
            sys_bus_i.adr <= "0000010";
            wait for clk_period/2;
            reg_1_buff <= sys_bus_o.dat;
            wait for clk_period/2;
            sys_bus_i.adr <= "0000011";
            wait for clk_period/2;
            reg_2_buff <= sys_bus_o.dat;
            wait for clk_period;
            reg_3_buff <= sys_bus_o.dat;
            wait for clk_period/2;

            wait for assert_hold;
            if(limit_x_neg = '1' and limit_x_pos = '1') then
                assert(reg_1_buff(0) = '1')
                report "line(168): Expecting error code 0" severity error;
            end if;

            if(limit_x_neg = '1' and limit_x_ref = '1') then
                assert(reg_1_buff(1) = '1')
                report "line(173): Expecting error code 1" severity error;
            end if;

            if(limit_x_pos = '1' and limit_x_ref = '1') then
                assert(reg_1_buff(2) = '1')
                report "line(178): Expecting error code 2" severity error;
            end if;

            if(limit_y_neg = '1' and limit_y_pos = '1') then
                assert(reg_1_buff(3) = '1')
                report "line(183): Expecting error code 3" severity error;
            end if;

            if(limit_y_neg = '1' and limit_y_ref = '1') then
                assert(reg_1_buff(4) = '1')
                report "line(188): Expecting error code 4" severity error;
            end if;

            if(limit_y_pos = '1' and limit_y_ref = '1') then
                assert(reg_1_buff(5) = '1')
                report "line(193): Expecting error code 5" severity error;
            end if;

            if(limit_z_neg = '1' and limit_z_pos = '1') then
                assert(reg_1_buff(6) = '1')
                report "line(198): Expecting error code 6" severity error;
            end if;

            if(x_out_1 = '1' and x_out_2 = '1') then
                assert(reg_1_buff(7) = '1')
                report "line(203): Expecting error code 7" severity error;
            end if;

            if(y_out_1 = '1' and y_out_2 = '1') then
                assert(reg_2_buff(0) = '1')
                report "line(208): Expecting error code 8" severity error;
            end if;

            if(z_out_1 = '1' and z_out_2 = '1') then
                assert(reg_2_buff(1) = '1')
                report "line(213): Expecting error code 9" severity error;
            end if;

            if(limit_z_pos = '0' and x_enable = '1') then
                assert(reg_2_buff(2) = '1')
                report "line(218): Expecting error code 10" severity error;
            end if;

            if(limit_z_pos = '0' and y_enable = '1') then
                assert(reg_2_buff(3) = '1')
                report "line(223): Expecting error code 11" severity error;
            end if;

            if(limit_x_neg = '1' and x_out_1  = '1') then
                assert(reg_2_buff(4) = '1')
                report "line(228): Expecting error code 12" severity error;
            end if;

            if(limit_x_pos = '1' and x_out_2  = '1') then
                assert(reg_2_buff(5) = '1')
                report "line(233): Expecting error code 13" severity error;
            end if;

            if(limit_y_neg = '1' and y_out_1  = '1') then
                assert(reg_2_buff(6) = '1')
                report "line(238): Expecting error code 14" severity error;
            end if;

            if(limit_y_pos = '1' and y_out_2  = '1') then
                assert(reg_2_buff(7) = '1')
                report "line(243): Expecting error code 15" severity error;
            end if;

            if(limit_z_neg = '1' and z_out_1  = '1') then
                assert(reg_3_buff(0) = '1')
                report "line(248): Expecting error code 16" severity error;
            end if;

            if(limit_z_pos = '1' and z_out_2  = '1') then
                assert(reg_3_buff(1) = '1')
                report "line(253): Expecting error code 17" severity error;
            end if;
            wait for post_hold;

            sys_bus_i.adr <= (others => '0');
        end loop;


        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;


end TB;