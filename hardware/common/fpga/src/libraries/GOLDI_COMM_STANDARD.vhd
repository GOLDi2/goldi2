-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Custom communication data types for Goldi_FPGA_SRC project
-- Module Name:		GOLDI_BUS_STANDARD
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	-> GOLDI_MODULE_CONFIG.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom configuration package
library work;
use work.GOLDI_MODULE_CONFIG.all;




package GOLDI_COMM_STANDARD is

    --****SYSTEM GENERAL CONSTANTS****
    -----------------------------------------------------------------------------------------------
	--Address width sets the protocol for SPI communication and the number of possible registers
    --SPI communication protocol takes first bit of the configuration byte's for write enable
    --because of that BUS_ADDRESS_WIDTH = (n*bytes)-1
    constant BUS_ADDRESS_WIDTH	    :	natural range 7 to 63 := 7;

    --Main parameter of the system. Sets the width of data words 
	constant SYSTEM_DATA_WIDTH	    :	natural range 8 to 64 := 8;
    -----------------------------------------------------------------------------------------------



    --****SYSTEM DATA VECTORS****
    -----------------------------------------------------------------------------------------------
    subtype address_word is std_logic_vector(BUS_ADDRESS_WIDTH-1 downto 0);
    subtype data_word is std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
    
    type data_word_vector is array(natural range <>) of data_word;
    -----------------------------------------------------------------------------------------------



    --****SYSTEM BUS****
    -----------------------------------------------------------------------------------------------
    --Master interface structures
    type mbus_out is record
        we  :   std_logic;
        adr :   address_word;
        dat :   data_word;
    end record;

    type mbus_in is record
        dat :   data_word;
        val :   std_logic;
    end record;

    --Slave interface structures
    alias sbus_in is mbus_out;
    alias sbus_out is mbus_in;

    --Vectors
    type mbus_o_vector is array(natural range <>) of mbus_out;
    type mbus_i_vector is array(natural range <>) of mbus_in;
    type sbus_i_vector is array(natural range <>) of sbus_in;
    type sbus_o_vector is array(natural range <>) of sbus_out;
    -----------------------------------------------------------------------------------------------



    --****BUS CONSTANTS****
    -----------------------------------------------------------------------------------------------
    --Master interface constants
    constant gnd_mbus_o     :   mbus_out :=(
        we  => '0',
        adr => (others => '0'),
        dat => (others => '0')
    );

    constant gnd_mbus_i     :   mbus_in := (
        dat => (others => '0'),
        val => '0'
    );

    constant gnd_sbus_i     :   sbus_in := (
        we  => '0',
        adr => (others => '0'),
        dat => (others => '0')
    );

    constant gnd_sbus_o     :   sbus_out := (
        dat => (others => '0'),
        val => '0'
    );
    -----------------------------------------------------------------------------------------------



    --****FUNCTIONS****
    -----------------------------------------------------------------------------------------------
    --Synthesisable functions
    function reduceBusVector(bus_vector : sbus_o_vector) return sbus_out;
    function getMemoryLength(vector_length : natural) return natural;
    function setMemory(data_vector : std_logic_vector) return data_word_vector;
    function getMemory(data_vector : data_word_vector) return std_logic_vector;
    --Simulation functions
    function readBus(adr : std_logic_vector; dat : std_logic_vector) return mbus_out;
    function readBus(adr : natural; dat : natural) return mbus_out;
    function writeBus(adr : std_logic_vector; dat : std_logic_vector) return mbus_out;
    function writeBus(adr : natural; dat : natural) return mbus_out;
    -----------------------------------------------------------------------------------------------


end package;




package body GOLDI_COMM_STANDARD is

    -- Returns a sbus_out structure corresponding to the addressed register.
	-- Used in synthesis to generate multiplexer for multiple register tables.
    function reduceBusVector(bus_vector : sbus_o_vector) return sbus_out is
        variable index  :   natural;
    begin
        for i in 0 to bus_vector'length-1 loop
            if(bus_vector(i).val = '1') then
                index := i;
            end if;
        end loop;

        return bus_vector(index);
    end function;


    -- Returns the minimum number of registers needed to save a vector of  a given 
    -- size; based on the SYSTEM_DATA_WIDTH of the GOLDI_MODULE_CONFIG package.
    function getMemoryLength(vector_length : natural) return natural is
        variable quotient   :   natural;
        variable rest       :   natural;
    begin
        quotient := vector_length/SYSTEM_DATA_WIDTH;
        rest     := vector_length mod SYSTEM_DATA_WIDTH;

        if(rest /= 0) then
            quotient := quotient + 1;
        end if;

        return quotient; 
    end function;


    -- Returns a data_word_vector corresponding to the minimum number
	-- of register to save "data". The index 0 of the logic_vector is taken
	-- as the lowest index of the register 0 and "data" is assigned in ascending
	-- order.
    function setMemory(data_vector : std_logic_vector) return data_word_vector is
        variable memory_length  :   natural := getMemoryLength(data_vector'length);
        variable memory         :   data_word_vector(memory_length-1 downto 0);
        variable vector_buff    :   std_logic_vector((memory_length*SYSTEM_DATA_WIDTH)-1 downto 0);
    begin
        vector_buff := (others => '0');
        vector_buff(data_vector'range) := data_vector;

        for i in 0 to memory_length-1 loop
            memory(i) := vector_buff(((i+1)*SYSTEM_DATA_WIDTH)-1 downto (i*SYSTEM_DATA_WIDTH));
        end loop;

        return memory;
    end function;


    -- Function converts a subset of registers into a std_logic_vector
	-- Use for vector divided in multiple registers.
    function getMemory(data_vector : data_word_vector) return std_logic_vector is
		variable vector : std_logic_vector((data_vector'length*SYSTEM_DATA_WIDTH)-1 downto 0);
  	begin
		for i in 0 to data_vector'length-1 loop
			vector((SYSTEM_DATA_WIDTH*(i+1))-1 downto SYSTEM_DATA_WIDTH*i) := data_vector(i);
		end loop;

		return vector;
	end function;


    -- Function used for simulation. Converts std_logic_vector into 
    -- master bus input configured for read operation
    function readBus(adr : std_logic_vector; dat : std_logic_vector) return mbus_out is
        variable sys_bus : mbus_out;
    begin
        sys_bus.we  := '0';
        sys_bus.adr := adr(1 to BUS_ADDRESS_WIDTH);
        sys_bus.dat := dat(0 to SYSTEM_DATA_WIDTH-1);
        return sys_bus;
    end function;

    -- Function used for simulation. Converts natural integer into 
    -- master bus input configured for read operation
    function readBus(adr : natural; dat : natural) return mbus_out is
        variable sys_bus : mbus_out;
    begin
        sys_bus.we  := '0';
        sys_bus.adr := std_logic_vector(to_unsigned(adr,BUS_ADDRESS_WIDTH));
        sys_bus.dat := std_logic_vector(to_unsigned(dat,SYSTEM_DATA_WIDTH));
        return sys_bus;
    end function;


    -- Function used for simulation. Converts std_logic_vector into 
    -- master bus input configured for read operation
    function writeBus(adr : std_logic_vector; dat : std_logic_vector) return mbus_out is
        variable sys_bus : mbus_out;
    begin
        sys_bus.we  := '1';
        sys_bus.adr := adr(1 to BUS_ADDRESS_WIDTH);
        sys_bus.dat := dat(0 to SYSTEM_DATA_WIDTH-1);
        return sys_bus;
    end function;


    -- Function used for simulation. Converts natural integer into 
    -- master bus input configured for read operation
    function writeBus(adr : natural; dat : natural) return mbus_out is
        variable sys_bus : mbus_out;
    begin
        sys_bus.we  := '1';
        sys_bus.adr := std_logic_vector(to_unsigned(adr,BUS_ADDRESS_WIDTH));
        sys_bus.dat := std_logic_vector(to_unsigned(dat,SYSTEM_DATA_WIDTH));
        return sys_bus;
    end function;


end package body GOLDI_COMM_STANDARD;