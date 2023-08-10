-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Custom communication data types for Goldi_FPGA_SRC project
-- Module Name:		GOLDI_COMM_STANDARD
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition 
--
-- Dependencies: 	none
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commitment
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V2.00.00 - Defualt module version for release 2.00.00
-- Additional Comments: Release of Warehouse_V2. Correction of
--                      slice ranges
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




package GOLDI_COMM_STANDARD is

    --****SYSTEM GENERAL CONSTANTS****
    -----------------------------------------------------------------------------------------------
	--Address width sets the protocol for SPI communication and the number of possible registers
    --SPI communication protocol takes first bit of the configuration byte's for write enable
    --because of that BUS_ADDRESS_WIDTH = (n*bytes)-1
    constant BUS_ADDRESS_WIDTH	    :	natural range 7 to 31 := 15;

    --Main parameter of the system. Sets the width of data words 
	constant SYSTEM_DATA_WIDTH	    :	natural range 8 to 32 := 8;
    -----------------------------------------------------------------------------------------------



    --****SYSTEM DATA VECTORS****
    -----------------------------------------------------------------------------------------------
    subtype address_word  is std_logic_vector(BUS_ADDRESS_WIDTH-1 downto 0);
    subtype data_word     is std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
    
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
    alias sbus_in  is mbus_out;
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
    function reduceRegStrobe(stb_vector : std_logic_vector) return std_logic;
    function getMemoryLength(vector_length : natural) return natural;
    function setMemory(data_vector : std_logic_vector) return data_word_vector;
    function getMemory(data_vector : data_word_vector) return std_logic_vector;
    function invertIndex(data_vector : std_logic_vector) return std_logic_vector;
    --Simulation functions
    function readBus(adr : std_logic_vector) return mbus_out;
    function readBus(adr : natural) return mbus_out;
    function writeBus(adr : std_logic_vector; dat : std_logic_vector) return mbus_out;
    function writeBus(adr : natural; dat : natural) return mbus_out;
    -----------------------------------------------------------------------------------------------



    --****POCEDURES****
    -----------------------------------------------------------------------------------------------
    --SPI transfered word length. Used in simulations.
    constant SPI_DATA_WIDTH     :   natural := BUS_ADDRESS_WIDTH + SYSTEM_DATA_WIDTH +1;

    --Simulation procedures
    procedure p_spiTransaction(
        constant c_sclk_period  : in    time;
        signal i_mosi_data      : in    std_logic_vector(SPI_DATA_WIDTH-1 downto 0);
        signal o_miso_data      : out   std_logic_vector(SPI_DATA_WIDTH-1 downto 0);
        signal o_spi_nce        : out   std_logic;
        signal o_spi_sclk       : out   std_logic;
        signal o_spi_mosi       : out   std_logic;
        signal i_spi_miso       : in    std_logic 
    );
    -----------------------------------------------------------------------------------------------

end package GOLDI_COMM_STANDARD;




package body GOLDI_COMM_STANDARD is

    --****SYNTHESIS FUNCTIONS****
    -----------------------------------------------------------------------------------------------
    --! @brief BUS vector "sbus_out" multiplexer 
    --! @details
    --! Returns a sbus_out structure corresponding to the addressed register.
	--! Used in synthesis to generate multiplexer for multiple register tables.
    function reduceBusVector(bus_vector : sbus_o_vector) return sbus_out is
    begin
        for i in bus_vector'range loop
            if(bus_vector(i).val = '1') then
                return bus_vector(i);
            end if;
        end loop;

        return gnd_sbus_o;
    end function;



    --! @brief Strobe vector reduction
    --! @details
    --! Function reduces the strobe vector of the REGISTER_TABLE to a  
    --! std_logic signal equivalent to the "or" operation
    function reduceRegStrobe(stb_vector : std_logic_vector) return std_logic is
    begin
        if((stb_vector'range => '0') = stb_vector) then
            return '0';
        else
            return '1';
        end if;
    end function;



    --! @brief Get number of registers for a std_logic_vector range
    --! @details 
    --! Returns the minimum number of registers needed to save a vector of  a given 
    --! size; based on the SYSTEM_DATA_WIDTH of the GOLDI_MODULE_CONFIG package.
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


    --! @brief Convert std_logic_vector to data_word_vector
    --! @details
    --! Returns a data_word_vector corresponding to the minimum number
	--! of register to save "data". The index 0 of the logic_vector is taken
	--! as the lowest index of the register 0 and "data" is assigned in ascending
	--! order.
    function setMemory(data_vector : std_logic_vector) return data_word_vector is
        variable memory         :   data_word_vector(getMemoryLength(data_vector'length)-1 downto 0);
        variable data_buff      :   std_logic_vector((getMemoryLength(data_vector'length)*SYSTEM_DATA_WIDTH)-1 downto 0);
    begin
        --Ground unused bits
        if(data_buff'high /= data_vector'high) then
            data_buff(data_buff'high downto data_vector'high+1) := (others => '0');
        end if;

        --Format data to "downto" standard
        if(data_vector'ascending = true) then
            data_buff(data_vector'reverse_range) := invertIndex(data_vector);
        else
            data_buff(data_vector'range) := data_vector;
        end if;

        --Assign to data word vector
        for i in memory'range loop
            memory(i) := data_buff(((i+1)*SYSTEM_DATA_WIDTH)-1 downto (i*SYSTEM_DATA_WIDTH));
        end loop;

        return memory;
    end function;



    --! @brief Convert data_word_vector to std_logic_vector
    --! @details
    --! Function converts a subset of registers into a std_logic_vector
	--! Use for vector divided in multiple registers.
    function getMemory(data_vector : data_word_vector) return std_logic_vector is
		variable vector : std_logic_vector((data_vector'length*SYSTEM_DATA_WIDTH)-1 downto 0);
  	begin
		for i in data_vector'range loop
			vector((SYSTEM_DATA_WIDTH*(i+1))-1 downto SYSTEM_DATA_WIDTH*i) := data_vector(i);
		end loop;

		return vector;
	end function;



    --! @brief Invert index "to" to "downto" <-> "downto" to "to"
    --! @details
    --! Function used to invert the index of a std_logic_vector in case of
    --! "to" use instead of standard "downto"
    function invertIndex(data_vector : std_logic_vector) return std_logic_vector is
        variable data_buff : std_logic_vector(data_vector'reverse_range);
    begin
        for i in data_vector'range loop
            data_buff(i) := data_vector((data_vector'length-1) - i);
        end loop;

        return data_buff;
    end function;  
    -----------------------------------------------------------------------------------------------




    --****SIMULATION FUNCTIONS****
    -----------------------------------------------------------------------------------------------
    --! @brief Configure BUS to read register
    --! @details
    --! Function used for simulation. Converts std_logic_vector into 
    --! master bus input configured for read operation
    function readBus(adr : std_logic_vector) return mbus_out is
        variable adr_buff   :   std_logic_vector(adr'length-1 downto 0);
        variable sys_bus    :   mbus_out;
    
    begin
        --Normalize address to "downto" convention
        if(adr'ascending = true) then
            adr_buff := invertIndex(adr);
        else
            adr_buff := adr;
        end if;

        --Read bus configuration
        sys_bus.we  := '0';
        sys_bus.adr := adr_buff(BUS_ADDRESS_WIDTH-1 downto 0);
        sys_bus.dat := (others => '0');
        
        return sys_bus;
    end function;



    --! @brief Configure BUS to read register
    --! @details
    --! Function used for simulation. Converts natural integer into 
    --! master bus input configured for read operation
    function readBus(adr : natural) return mbus_out is
        variable sys_bus : mbus_out;
    begin
        sys_bus.we  := '0';
        sys_bus.adr := std_logic_vector(to_unsigned(adr,BUS_ADDRESS_WIDTH));
        sys_bus.dat := (others => '0');
        return sys_bus;
    end function;



    --! @brief Configure BUS to write register
    --! @details
    -- Function used for simulation. Converts std_logic_vector into 
    -- master bus input configured for read operation
    function writeBus(adr : std_logic_vector; dat : std_logic_vector) return mbus_out is
        variable adr_buff   :   std_logic_vector(adr'high downto adr'low);
        variable dat_buff   :   std_logic_vector(dat'high downto dat'low);
        variable sys_bus    :   mbus_out;
    begin
        --Normalize address to "downto" convention
        if(adr'ascending = false) then
            adr_buff := invertIndex(adr);
        else 
            adr_buff := adr;
        end if;

        --Nomalize data to "downto" convention
        if(dat'ascending = true) then
            dat_buff := invertIndex(dat);
        else
            dat_buff := dat;
        end if;

        --Write bus
        sys_bus.we  := '1';
        sys_bus.adr := adr_buff(BUS_ADDRESS_WIDTH-1 downto 0);
        sys_bus.dat := dat_buff(SYSTEM_DATA_WIDTH-1 downto 0);
        
        return sys_bus;
    end function;



    --! @brief Configure BUS to write register
    --! @details
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
    -----------------------------------------------------------------------------------------------  
 


    
    --****SIMULATION PROCEDURES****
    -----------------------------------------------------------------------------------------------
    procedure p_spiTransaction(
        constant c_sclk_period  : in    time;
        signal i_mosi_data      : in    std_logic_vector(SPI_DATA_WIDTH-1 downto 0);
        signal o_miso_data      : out   std_logic_vector(SPI_DATA_WIDTH-1 downto 0);
        signal o_spi_nce        : out   std_logic;
        signal o_spi_sclk       : out   std_logic;
        signal o_spi_mosi       : out   std_logic;
        signal i_spi_miso       : in    std_logic 
    ) is
    begin
        --SPI operation
        o_spi_nce <= '0';
        for i in 0 to SPI_DATA_WIDTH-1 loop
            wait for c_sclk_period/2;
            o_spi_mosi <= i_mosi_data((SPI_DATA_WIDTH-1)-i);
            o_spi_sclk <= '0';
            wait for c_sclk_period/2;
            o_miso_data((SPI_DATA_WIDTH-1)-i) <= i_spi_miso;
            o_spi_sclk <= '1';
        end loop;
        wait for c_sclk_period/2;
        o_spi_nce <= '1';

        wait for c_sclk_period;            

    end procedure;
    -----------------------------------------------------------------------------------------------
 
 
end package body GOLDI_COMM_STANDARD;