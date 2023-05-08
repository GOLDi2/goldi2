-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Actuator mask for damage prevention testbench 
-- Module Name:		ACTUATOR_MASK_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--                  -> VIRTUAL_SENSOR_ARRAY.vhd
--                  -> EDGE_DETECTOR.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V2.00.00 - First release
-- Additional Comments:
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;
use work.GOLDI_MODULE_CONFIG.all;



entity ACTUATOR_MASK_TB is
end entity ACTUATOR_MASK_TB;




architecture TB of ACTUATOR_MASK_TB is

    --****DUT****
    component ACTUATOR_MASK
        generic(
            ENC_X_INVERT    :   boolean := false;
            ENC_Z_INVERT    :   boolean := false;
            LIMIT_X_SENSORS :   sensor_limit_array(9 downto 0) := (others => (0,0));
            LIMIT_Z_SENSORS :   sensor_limit_array(5 downto 0) := (others => (0,0))
        );
        port(
            --General
            clk             : in    std_logic;
            rst             : in    std_logic;
            --System data
            sys_io_i        : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            sys_io_o        : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
            --Masked data
            safe_io_o       : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 10 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    signal sys_io_i         :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal sys_io_o         :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
    signal sys_io_o_safe    :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : ACTUATOR_MASK
    port map(
        clk             => clock,
        rst             => reset,
        sys_io_i        => sys_io_i,
        sys_io_o        => sys_io_o,
        safe_io_o       => sys_io_o_safe
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
        --Timing 
        variable init_hold      :   time := 5*clk_period/2;
        variable assert_hold    :   time := 3*clk_period/2;
        variable post_hold      :   time := clk_period/2;
    begin
        sys_io_i <= (others => gnd_io_i);
        sys_io_o <= (others => gnd_io_o);
        wait for init_hold;


        --**SET DIR Step**
        sys_io_o(18) <= (enb => '1', dat => '1');
        sys_io_o(19) <= (enb => '1', dat => '1');


        wait for 2*clk_period;
        sys_io_i(3)  <= (dat => '1');
        wait for 5*clk_period;

        sys_io_o(18) <= (enb => '1', dat => '0');
        wait for clk_period;
        sys_io_o(18) <= (enb => '1', dat => '1');
        wait for 5*clk_period;

        sys_io_o(19) <= (enb => '1', dat => '0');
        sys_io_o(18) <= (enb => '1', dat => '0');
        wait for clk_period;
        sys_io_o(18) <= (enb => '1', dat => '1');

        wait for 50 ns;
        run_sim <= '0';
        wait;

    end process;
    -----------------------------------------------------------------------------------------------


end TB;