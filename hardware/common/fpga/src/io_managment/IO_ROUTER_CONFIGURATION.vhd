-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmai.com>
--
-- Create Date:		01/12/2022
-- Design Name:		IO router configuration
-- Module Name:		IO_ROUTER_CONFIGURATION
-- Project Name:	GOLDIi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_DATA_TYPES.vhd; 
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commit
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom library
use work.GOLDI_DATA_TYPES.all;


--! Custom package for IO_ROUTER
package IO_ROUTER_CONFIGURATION is
	--*****************************************************************************************************************
	--***IO Router global constants***
	constant PIN_IO_NUMBER			:	natural := 4;
	constant PIN_IO_ADDRESS_WIDTH	:	natural := 7;
	constant SYS_IO_ADDRESS_WIDTH	:	natural := 8;

	
	
	--*****************************************************************************************************************
	--***Data types***
	type pin_io_layout is array(0 to ((2**PIN_IO_ADDRESS_WIDTH)-1)) of std_logic_vector(SYS_IO_ADDRESS_WIDTH-1 downto 0);
	type sys_io_layout is array(0 to ((2**SYS_IO_ADDRESS_WIDTH)-1)) of std_logic_vector(PIN_IO_ADDRESS_WIDTH-1 downto 0);
	type pin_io_layout_table is array (natural range <>) of pin_io_layout;
	type sys_io_layout_table is array (natural range <>) of sys_io_layout;
	
	
	--*******************************************************************************************************************
	--***Data structures***
	--! io arrays
	type io_i_array is array (natural range <>) of io_i;
	type io_o_array is array (natural range <>) of io_o;

	
	
	--*********************************************************************************************
	--***User Constants***
	--***WARNING***
	-- The definition of io_config_rom uses the "to" keyword for range
	-- declaration. The GOLDIi_FPGA_CORE system uses the "downto" convention
	-- instead. The change was implemented to improve readebility when
	-- managing this file and the pin declaration.
	--***WARNING***
	constant TEST_LAYOUT_INDEX		: natural := 1;
	--constant TEST_LAYOUT			: pin_io_layout := (x"00",x"01",x"02",x"03");
	-- constant AXIS_PORTAL_V1_INDEX	: natural := 1;
	-- constant AXIS_PORTAL_V1_LAYOUT 	: pin_io_layout := (others => (others => '0'));
	-- constant AXIS_PORTAL_V2_INDEX	: natural := 2;
	-- constant AXIS_PORTAL_V2_LAYOUT 	: pin_io_layout := (others => (others => '1'));
	-- constant LIFT_V1_INDEX			: natural := 3;
	-- constant LIFT_V1				: pin_io_layout := (others => (others => '1'));
	
	
	constant LAYOUT_ROM	: pin_io_layout_table(7 downto 0) := ( 
		-- AXIS_PORTAL_V1_INDEX => AXIS_PORTAL_V1_LAYOUT,
		-- AXIS_PORTAL_V2_INDEX => AXIS_PORTAL_V2_LAYOUT,
		-- LIFT_V1_INDEX => LIFT_V1,
		others => (others => (others => '1'))
	);
	
	
end package;