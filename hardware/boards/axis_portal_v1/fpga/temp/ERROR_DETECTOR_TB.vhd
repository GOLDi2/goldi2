-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
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
--
-- Revision V3.00.01 - Standarization of testbenches
-- Additional Comments: Modification to message format and test cases
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

    --****DUT****
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


    --****INTERNAL SIGNALS****
    --Simulation timing
	constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
    signal sys_bus_i        :   sbus_in;
    signal sys_bus_o        :   sbus_out;
    signal sys_io_i         :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_i);
    signal sys_io_o         :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0) := (others => gnd_io_o);
    --Buffers
    signal reg_1_buff       :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0) := (others => '0');
    signal reg_2_buff       :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0) := (others => '0');
    signal reg_3_buff       :   std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0) := (others => '0');
    
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
        alias x_out_pos     :   std_logic is input_values(9);
        alias x_out_neg     :   std_logic is input_values(10);
        alias y_enable      :   std_logic is input_values(11);
        alias y_out_neg     :   std_logic is input_values(12);
        alias y_out_pos     :   std_logic is input_values(13);
        alias z_enable      :   std_logic is input_values(14);
        alias z_out_pos     :   std_logic is input_values(15);
        alias z_out_neg     :   std_logic is input_values(16);


begin
    
    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
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
    -----------------------------------------------------------------------------------------------



	--****SIMULATION TIMING****
    -----------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 5 ns, '0' after 15 ns;
    -----------------------------------------------------------------------------------------------
    


    --****SIGNAL ASSIGNMENT****
    -----------------------------------------------------------------------------------------------
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
    sys_io_o(18).dat <= x_out_pos;
    sys_io_o(19).dat <= x_out_neg;
    sys_io_o(20).dat <= y_enable;
    sys_io_o(21).dat <= y_out_neg;
    sys_io_o(22).dat <= y_out_pos;
    sys_io_o(23).dat <= z_enable;
    sys_io_o(24).dat <= z_out_pos;
    sys_io_o(25).dat <= z_out_neg;
    -----------------------------------------------------------------------------------------------



    --****TEST****
    -----------------------------------------------------------------------------------------------
    TEST : process
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        --Preset bus signals
        sys_bus_i <= gnd_sbus_i;        
        wait for init_hold;


        
        for i in 0 to (2**17)-1 loop
            --Simulate possible gpio values
            input_values <= std_logic_vector(to_unsigned(i,17));


            wait for 3*clk_period;
            sys_bus_i  <= readBus(1);
            wait for clk_period;
            sys_bus_i  <= readBus(2);
            wait for clk_period;
            reg_1_buff <= sys_bus_o.dat;
            sys_bus_i  <= readBus(3);
            wait for clk_period;
            reg_2_buff <= sys_bus_o.dat;
            sys_bus_i  <= gnd_sbus_i;
            wait for clk_period;
            reg_3_buff <= sys_bus_o.dat;


            wait for assert_hold;
            --Multi-sensor activation
            if(limit_x_neg = '1' and limit_x_pos = '1') then
                assert(reg_1_buff(0) = '1')
                report "ID01: Expecting error code 0" severity error;
            end if;

            if(limit_x_neg = '1' and limit_x_ref = '1') then
                assert(reg_1_buff(1) = '1')
                report "ID02: Expecting error code 1" severity error;
            end if;

            if(limit_x_pos = '1' and limit_x_ref = '1') then
                assert(reg_1_buff(2) = '1')
                report "ID03: Expecting error code 2" severity error;
            end if;

            if(limit_y_neg = '1' and limit_y_pos = '1') then
                assert(reg_1_buff(3) = '1')
                report "ID04: Expecting error code 3" severity error;
            end if;

            if(limit_y_neg = '1' and limit_y_ref = '1') then
                assert(reg_1_buff(4) = '1')
                report "ID05: Expecting error code 4" severity error;
            end if;

            if(limit_y_pos = '1' and limit_y_ref = '1') then
                assert(reg_1_buff(5) = '1')
                report "ID06: Expecting error code 5" severity error;
            end if;

            if(limit_z_neg = '1' and limit_z_pos = '1') then
                assert(reg_1_buff(6) = '1')
                report "ID07: Expecting error code 6" severity error;
            end if;

            --Motor direction errors
            if(x_out_pos = '1' and x_out_neg = '1') then
                assert(reg_1_buff(7) = '1')
                report "ID08: Expecting error code 7" severity error;
            end if;

            if(y_out_neg = '1' and y_out_pos = '1') then
                assert(reg_2_buff(0) = '1')
                report "ID09: Expecting error code 8" severity error;
            end if;

            if(z_out_pos = '1' and z_out_neg = '1') then
                assert(reg_2_buff(1) = '1')
                report "ID10: Expecting error code 9" severity error;
            end if;

            --Crane position errors
            if(limit_z_pos = '0' and x_out_neg = '1') then
                assert(reg_2_buff(2) = '1')
                report "ID11: Expecting error code 10" severity error;
            end if;

            if(limit_z_pos = '0' and x_out_pos = '1') then
                assert(reg_2_buff(3) = '1')
                report "ID12: Expecting error code 11" severity error;
            end if;

            if(limit_z_pos = '0' and y_out_neg = '1') then
                assert(reg_2_buff(4) = '1')
                report "ID13: Expecting error code 12" severity error;
            end if;

            if(limit_z_pos = '0' and y_out_pos = '1') then
                assert(reg_2_buff(5) = '1')
                report "ID14: Expecting error code 13" severity error;
            end if;

            --AP operation errors
            if(limit_x_neg = '1' and x_out_neg  = '1') then
                assert(reg_2_buff(6) = '1')
                report "ID15: Expecting error code 14" severity error;
            end if;

            if(limit_x_pos = '1' and x_out_pos  = '1') then
                assert(reg_2_buff(7) = '1')
                report "ID16: Expecting error code 15" severity error;
            end if;

            if(limit_y_neg = '1' and y_out_neg  = '1') then
                assert(reg_3_buff(0) = '1')
                report "ID17: Expecting error code 16" severity error;
            end if;

            if(limit_y_pos = '1' and y_out_pos  = '1') then
                assert(reg_3_buff(1) = '1')
                report "ID18: Expecting error code 17" severity error;
            end if;

            if(limit_z_neg = '1' and z_out_neg  = '1') then
                assert(reg_3_buff(2) = '1')
                report "ID19: Expecting error code 18" severity error;
            end if;

            if(limit_z_pos = '1' and z_out_pos  = '1') then
                assert(reg_3_buff(3) = '1')
                report "ID20: Expecting error code 19" severity error;
            end if;

            wait for post_hold;

            sys_bus_i.adr <= (others => '0');
        end loop;


        --End simulation
        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------
    

end TB;