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
--
-- Revision V4.00.00 - Extension of BUS protocol and new simulation resources
-- Additional Comments: Introduction of "stb" signal to the GOLDi BUS master
--                      interface to prevent continuous read and write 
--                      operations. Addition of tags to the BUS interfaces
--                      to extend BUS flexibility
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




package GOLDI_COMM_STANDARD is


    --****GOLDi SYSTEM BUS CONSTANTS****
    -------------------------------------------------------------------------------------------------------------------
	--The "address width" constant sets the width of the address bus of the custom GOLDi BUS.
    --It also sets the amount of slave interfaces that can be connected to the system bus.
    constant BUS_ADDRESS_WIDTH	    :	natural range 7 to 31 := 10;

    --Tag bits to modify and label the BUS data transfered by the interfaces.  
    constant BUS_TAG_BITS           :   natural range 0 to 8 := 4;

    --Main parameter of the GOLDi BUS and system. Sets the width of standard "data_word" vector 
    --which is the data unit used by the GOLDi system's registers, bus structure, and 
    --main communication modules.
	constant SYSTEM_DATA_WIDTH	    :	natural range 8 to 32 := 8;
    -------------------------------------------------------------------------------------------------------------------



    --****CUSTOM GOLDi SPI CONSTANTS****
    -------------------------------------------------------------------------------------------------------------------
    --The GOLDi SPI communication protocol consists of a configuration word and one or more
    --data words transfered in a single SPI operation i.e. without driving the nCE signal high. 
    --
    --The configuration word is used to transfer the address of the slave interface 
    --and the corresponding tags for the following data to the system master interface 
    --including the two default tags: "write enable" and "stream enable"
    --
    --Configuration word format:
    -- | WE | SE | TAGS[BUS_TAG_BITS:0] | ADDRESS[BUS_ADDRESS_WIDTH:0] |
    
    --Length of the configuration word used in the custom GOLDi SPI communication modules.  
    constant CONFIGURATION_WORD     :   natural := 2 + BUS_TAG_BITS + BUS_ADDRESS_WIDTH;

    --SPI word length defined by the number of bits needed for a single SPI transaction.
    constant SPI_DATA_WIDTH         :   natural := CONFIGURATION_WORD + SYSTEM_DATA_WIDTH;
    -------------------------------------------------------------------------------------------------------------------



    --****SYSTEM DATA VECTORS****
    -------------------------------------------------------------------------------------------------------------------
    --Definition of the sub-buses used in the GOLDi BUS
    subtype address_word  is std_logic_vector(BUS_ADDRESS_WIDTH-1 downto 0);
    subtype data_word     is std_logic_vector(SYSTEM_DATA_WIDTH-1 downto 0);
    subtype tag_word      is std_logic_vector(BUS_TAG_BITS-1 downto 0);

    --Definition of sub-bus vectors used by the GOLDi BUS
    type data_word_vector is array(natural range <>) of data_word;
    type tag_word_vector  is array(natural range <>) of tag_word;
    -------------------------------------------------------------------------------------------------------------------



    --****GOLDi SYSTEM BUS****
    -------------------------------------------------------------------------------------------------------------------
    --Master interface structures
    --Output signals:
    -- + stb: signal is used to validate a transfer by the master ending a tansaction
    -- + we:  write enable indicates a write operation when high and read operation when low
    -- + adr: address of accessed register in the GOLDi system
    -- + dat: write data for accessed register (ignored in read operation)
    -- + tag: tags used to label data by the master interface
    type mbus_out is record 
        stb :   std_logic;
        we  :   std_logic;
        adr :   address_word;
        dat :   data_word;
        tag :   tag_word;
    end record;

    --Input signals:
    -- + dat: read data of accessed register (ignored in write operation)
    -- + tag: tags used to label data by the slave interface
    type mbus_in is record
        dat :   data_word;
        tag :   tag_word;
    end record;


    --Slave interface structures
    alias sbus_in  is mbus_out;
    alias sbus_out is mbus_in;


    --GOLDi BUS Array Structures
    type mbus_o_vector is array(natural range <>) of mbus_out;
    type mbus_i_vector is array(natural range <>) of mbus_in;
    type sbus_i_vector is array(natural range <>) of sbus_in;
    type sbus_o_vector is array(natural range <>) of sbus_out;
    -------------------------------------------------------------------------------------------------------------------



    --****GOLDi BUS CONSTANTS****
    -------------------------------------------------------------------------------------------------------------------
    --BUS Constants 
    --Master interface constants
    constant gnd_mbus_o     :   mbus_out :=(
        stb => '0',
        we  => '0',
        adr => (others => '0'),
        dat => (others => '0'),
        tag => (others => '0')
    );

    constant gnd_mbus_i     :   mbus_in := (
        dat => (others => '0'),
        tag => (others => '0')
    );

    --Slave interface constants
    constant gnd_sbus_i     :   sbus_in := (
        stb => '0',
        we  => '0',
        adr => (others => '0'),
        dat => (others => '0'),
        tag => (others => '0')
    );

    constant gnd_sbus_o     :   sbus_out := (
        dat => (others => '0'),
        tag => (others => '0')
    );
    -------------------------------------------------------------------------------------------------------------------



    --****REGISTER GENERIC CONSTANTS****
    -------------------------------------------------------------------------------------------------------------------
    --Initialization constant used as default generic paramter for REGISTER_UNIT. Constant
    --allows changes to the SYSTEM_DATA_WIDTH constant for simulation or synthesis of the 
    --module as an independent unit. 
    constant reg_unit_d_default     :   data_word := (others => '0');

    --Initialization constant used as default generic parameter for REGISTER_T_UNIT. Constant
    --allows changes to the BUS_TAG_BITS constant for simulation o synthesis of the module as
    --an independend unit.
    constant reg_unit_t_default     :   tag_word := (others => '0');

    --Initialization constant used as default generic paramter for REGISTER_TABLE. Constant
    --allows changes to the SYSTEM_DATA_WIDTH constant for simulation or synthesis of the 
    --module as an independent unit. 
    constant reg_table_d_default    :   data_word_vector(2 downto 0) :=
        (std_logic_vector(to_unsigned(255,SYSTEM_DATA_WIDTH)),
         std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)),
         std_logic_vector(to_unsigned( 15,SYSTEM_DATA_WIDTH)));

    --Initialization constant used as default generic paramter for REGISTER_T_TABLE. Constant
    --allows changes to the BUS_TAG_BITS constant for simulation or synthesis of the module as
    --an independent unit. 
    constant reg_table_t_default   :    tag_word_vector(2 downto 0) := 
        (others => (others => '0'));   
    -------------------------------------------------------------------------------------------------------------------



    --****FUNCTIONS****
    -------------------------------------------------------------------------------------------------------------------
    --Synthesisable functions
    --Parametrization functions
    function getMemoryLength(vector_length : natural) return natural;
    function getMemoryLengthT(vector_length : natural) return natural;

    --Data management functions
    function getDescendingVector(data_vector : std_logic_vector) return std_logic_vector;
    function resize(vector : std_logic_vector; size : natural) return std_logic_vector;

    --GOLDi BUS management functions
    function reduceBusVector(bus_vector : sbus_o_vector) return sbus_out;
    function reduceRegStrobe(stb_vector : std_logic_vector) return std_logic;
    function setMemory(data_vector : std_logic_vector) return data_word_vector;
    function getMemory(data_vector : data_word_vector) return std_logic_vector;
    function setTag(tag_vector : std_logic_vector) return tag_word_vector;
    function getTag(tag_vector : tag_word_vector) return std_logic_vector;

    --Simulation functions
    function readBus(adr : std_logic_vector) return mbus_out;
    function readBus(adr : std_logic_vector; tag : std_logic_vector) return mbus_out;
    function readBus(adr : natural) return mbus_out;
    function readBus(adr : natural; tag : natural) return mbus_out;
    function writeBus(adr : std_logic_vector; dat : std_logic_vector) return mbus_out;
    function writeBus(adr : std_logic_vector; dat : std_logic_vector; tag : std_logic_vector) return mbus_out;
    function writeBus(adr : natural; dat : natural) return mbus_out;
    function writeBus(adr : natural; dat : natural; tag : natural) return mbus_out;
    -------------------------------------------------------------------------------------------------------------------



    --****SIMULATIONS POCEDURES****
    -------------------------------------------------------------------------------------------------------------------
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
    -------------------------------------------------------------------------------------------------------------------


end package GOLDI_COMM_STANDARD;





package body GOLDI_COMM_STANDARD is


    --****PARAMETRIZATION FUNCTIONS****
    -------------------------------------------------------------------------------------------------------------------
    --! @brief Returns the number of registers needed for a number of data bits
    --! @details 
    --! Returns the minimum number of registers needed to save a data vector 
    --! of a given length using registers with a data width set by the system
    --! parameter SYSTEM_DATA_WIDTH.
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
    

    --! @brief Returns the number of registers needed for a number of tag bits
    --! @details
    --! Returns the minimum number of registers needed to save a tag vector
    --! of a given lenth using registers with a tag vector with set by the 
    --! system parameter BUS_TAG_BITS. It is assumed that a tag vector 
    --! corresponding to a slice with the width BUS_TAG_BITS corresponds
    --! to a data word with the width SYSTEM_DATA_WIDTH.
    function getMemoryLengthT(vector_length : natural) return natural is
        variable quotient   :   natural;
        variable rest       :   natural;   
    begin
        quotient := vector_length/BUS_TAG_BITS;
        rest     := vector_length mod BUS_TAG_BITS;

        if(rest /= 0) then
            quotient := quotient + 1;
        end if;

        return quotient;
    end function;
    -------------------------------------------------------------------------------------------------------------------




    --****DATA MANAGEMENT FUNCTIONS****
    -------------------------------------------------------------------------------------------------------------------
    --! @brief Returns a vector with the "downto" property
    --! @details
    --! Function transforms an std_logic_vector from the ascending to the descending
    --! vector type. Returns a vector with same slice length; slice upper index and 
    --! lower index; and the "downto" property.
    function getDescendingVector(data_vector : std_logic_vector) return std_logic_vector is
        variable data_buff : std_logic_vector(data_vector'high downto data_vector'low);
    begin
        if(data_vector'ascending) then
            for i in data_vector'range loop
                data_buff(data_vector'high-(i-data_vector'low)) := data_vector(i);
            end loop;
        else
            data_buff := data_vector;
        end if;

        return data_buff;
    end function;  
    
    
    --! @brief Function returns a std_logic_vector with range bounds 0 to size
    --! @details
    --! The function returns an std_logic_vector with a new range with the low
    --! index 0 and high index size. The std_logic_vector mantains the original
    --! ascending/descending property. If the provided vector is resized to a 
    --! smaller range the upper bits of the vector are discarded. If the vector
    --! is resized to a larger range the upper bits are filled with '0's.
    function resize(vector : std_logic_vector; size : natural) return std_logic_vector is
        variable asc_buffer     :   std_logic_vector(0 to size-1);
        variable dsc_buffer     :   std_logic_vector(size-1 downto 0);
    begin
        if(vector'ascending) then
            --Resize
            if(vector'length < size) then
                asc_buffer := vector & (vector'length to size-1 => '0');
            else
                asc_buffer := vector(0 to size-1);
            end if;

            return asc_buffer;

        else
            if(vector'length < size) then
                dsc_buffer := (size-1 downto vector'length => '0') & vector;
            else
                dsc_buffer := vector(size-1 downto 0);
            end if;

            return dsc_buffer;
        end if;

    end function;
    -------------------------------------------------------------------------------------------------------------------




    --****GOLDi BUS MANAGEMENT FUNCTIONS****
    -------------------------------------------------------------------------------------------------------------------
    --! @brief Multiplexing of a sbus_out vector
    --! @details
    --! Returns a sbus_out structure corresponding to the addressed register. The 
    --! function performs an "or" function accross the vector. Because all sbus_out
    --! interfaces are grounded when not addressed, the result equals the addressed 
    --! register interface. The function is used in synthesis to arbitrate the data
    --! of multiple register tables and register.
    function reduceBusVector(bus_vector : sbus_o_vector) return sbus_out is
        variable rbus   :   sbus_out := gnd_sbus_o;
    begin
        for i in bus_vector'range loop
            for j in data_word'range loop
                rbus.dat(j) := rbus.dat(j) or bus_vector(i).dat(j);
            end loop;

            for j in tag_word'range loop
                rbus.tag(j) := rbus.tag(j) or bus_vector(i).tag(j);
            end loop;
        end loop;

        return rbus;
    end function;


    --! @brief Conversion of a strobe vector to a strobe signal
    --! @details
    --! Function reduces a strobe vector used to flag read or write operations
    --! and returns single signal indicating that at least one signal in the
    --! vector has been asserted. The function performs an "or" function 
    --! accross the strobe vector.
    function reduceRegStrobe(stb_vector : std_logic_vector) return std_logic is
    begin
        if((stb_vector'range => '0') = stb_vector) then
            return '0';
        else
            return '1';
        end if;
    end function;


    --! @brief Conversion of an std_logic_vector into a data_word_vector
    --! @details
    --! The function converts a data std_logic_vector into a data_word_vector
    --! used to store data. The function returns a data_word_vector with a
    --! length corresponding to the minimum number of data_words to store the
    --! provided data. The lower index of the std_logic_vector is taken as the
    --! index 0 of the data_word 0 in the data_word_vector the following bits 
    --! are assigned in ascending order. The returned data_word_vector therefore
    --! follows the most-significant-bit-first (msbf) convention.
    function setMemory(data_vector : std_logic_vector) return data_word_vector is
        constant memory_length  :   natural := getMemoryLength(data_vector'length);
        variable memory         :   data_word_vector(memory_length-1 downto 0);
        variable data_buff      :   std_logic_vector((memory_length*SYSTEM_DATA_WIDTH)-1 downto 0);
    begin
        --Allocate data to data buffer
        if(data_buff'length /= data_vector'length) then
            data_buff(data_vector'length-1 downto 0) := getDescendingVector(data_vector);
            data_buff(data_buff'length-1 downto data_vector'length) := (others => '0');
        else
            data_buff := getDescendingVector(data_vector);
        end if;

        --Assign to data word vector
        for i in memory'range loop
            memory(i) := data_buff(((i+1)*SYSTEM_DATA_WIDTH)-1 downto (i*SYSTEM_DATA_WIDTH));
        end loop;

        return memory;
    end function;


    --! @brief Conversion of a data_word_vector into an std_logic_vector
    --! @details
    --! The function converts a data_word_vector into an std_logic_vector
    --! to recover stored data. The function returns an std_logic_vector with
    --! a length equivalent to the data_word_vector length multiplied with the
    --! system parameter SYSTEM_DATA_WIDTH. The index 0 of the std_logic_vector
    --! corresponds to the lowest index in the lowest data_word in the vector.
    --! The data is ordered in the descending order.
    function getMemory(data_vector : data_word_vector) return std_logic_vector is
        variable lower_index    :   natural;
        variable upper_index    :   natural;
        variable vector         :   std_logic_vector((data_vector'length*SYSTEM_DATA_WIDTH)-1 downto 0);
  	begin
		for i in data_vector'range loop
            lower_index := ((i-data_vector'low)*SYSTEM_DATA_WIDTH);
            upper_index := ((i+1-data_vector'low)*SYSTEM_DATA_WIDTH)-1;
            vector(upper_index downto lower_index) := data_vector(i);
		end loop;

		return vector;
	end function;


    --! @brief Conversion of an std_logic_vector into a tag_word_vector
    --! @details
    --! The function converts a std_logic_vector into a tag_word_vector
    --! used to allocate tags. The function returns a tag_word_vector with a
    --! length corresponding to the minimum number of tag_words to store the
    --! provided tags. The lower index of the std_logic_vector is taken as the
    --! index 0 of the tag_word 0 in the tag_word_vector the following bits 
    --! are assigned in ascending order. The returned tag_word_vector therefore
    --! follows the most-significant-bit-first (msbf) convention.
    function setTag(tag_vector : std_logic_vector) return tag_word_vector is
        constant memory_length  :   natural := getMemoryLengthT(tag_vector'length);
        variable tags           :   tag_word_vector(memory_length-1 downto 0);
        variable tag_buff       :   std_logic_vector((memory_length*BUS_TAG_BITS)-1 downto 0);
    begin
        --Allocate data to data buffer
        if(tag_buff'length /= tag_vector'length) then
            tag_buff(tag_vector'length-1 downto 0) := getDescendingVector(tag_vector);
            tag_buff(tag_buff'length-1 downto tag_vector'length) := (others => '0');
        else
            tag_buff := getDescendingVector(tag_vector);
        end if;

        --Assign data to tag word vector
        for i in tags'range loop
            tags(i) :=tag_buff(((i+1)*BUS_TAG_BITS)-1 downto (i*BUS_TAG_BITS));
        end loop;

        return tags;
    end function;


    --! @brief Conversion of a tag_word_vector into an std_logic_vector
    --! @details
    --! The function converts a tag_word_vector into an std_logic_vector
    --! to recover stored tags. The function returns an std_logic_vector with
    --! a length equivalent to the tag_word_vector length multiplied with the
    --! system parameter BUS_TAG_BITS. The index 0 of the std_logic_vector
    --! corresponds to the lowest index in the lowest tag_word in the vector.
    --! The tags are ordered in the descending order.
    function getTag(tag_vector : tag_word_vector) return std_logic_vector is
        variable lower_index    :   natural;
        variable upper_index    :   natural;
        variable vector :   std_logic_vector((tag_vector'length*BUS_TAG_BITS)-1 downto 0);
    begin
        for i in tag_vector'range loop
            lower_index := ((i-tag_vector'low)*SYSTEM_DATA_WIDTH);
            upper_index := ((i+1-tag_vector'low)*SYSTEM_DATA_WIDTH)-1;
            vector(upper_index downto lower_index) := tag_vector(i);
        end loop;

        return vector;
    end function;
    -------------------------------------------------------------------------------------------------------------------




    --****SIMULATION FUNCTIONS****
    -------------------------------------------------------------------------------------------------------------------
    --! @brief Returns a master interface configured for a read operation
    --! @details
    --! Function used for simulation. Uses an address std_logic_vector 
    --! to configure a GOLDi BUS master interface for a read operation.
    --! The master interface asserts the read operation (stb = '1'); grounds
    --! the tag sub-bus; and uses the address std_logic_vector to address
    --! the slave interface.
    function readBus(adr : std_logic_vector) return mbus_out is
        variable adr_buff   :   std_logic_vector(adr'length-1 downto 0);
        variable sys_bus    :   mbus_out;
    
    begin
        --Normalize address to "downto" convention
        adr_buff := getDescendingVector(adr);
        --Read bus operation
        sys_bus.stb := '1';
        sys_bus.we  := '0';
        sys_bus.adr := resize(adr_buff,BUS_ADDRESS_WIDTH);
        sys_bus.dat := (others => '0');
        sys_bus.tag := (others => '0');

        return sys_bus;
    end function;


    --! @brief Returns a master interface configured for a read operation
    --! @details
    --! Function used for simulation. Uses an address std_logic_vector and
    --! a tag std_logic_vector to configure a GOLDi BUS master interface 
    --! for a read operation. The master interface asserts the read operation
    --! (stb = '1'); uses the tag std_logic_vector to configure the master tag
    --! sub-bus; and uses the address std_logic_vector to address the slave 
    --! interface.
    function readBus(adr : std_logic_vector; tag : std_logic_vector) return mbus_out is
        variable adr_buff   :   std_logic_vector(adr'length-1 downto 0);
        variable tag_buff   :   std_logic_vector(tag'length-1 downto 0);
        variable sys_bus    :   mbus_out;
    begin
        --Normalize address and tags to "downto" convention
        adr_buff := getDescendingVector(adr)(adr'high downto adr'low);
        tag_buff := getDescendingVector(tag)(tag'high downto tag'low);

        --Read bus operation
        sys_bus.stb := '1';
        sys_bus.we  := '0';
        sys_bus.adr := resize(adr_buff,BUS_ADDRESS_WIDTH);
        sys_bus.dat := (others => '0');
        sys_bus.tag := resize(tag_buff,BUS_TAG_BITS);

        return sys_bus;
    end function;

    
    --! @brief Returns a master interface configured for a read operation
    --! @details
    --! Function used for simulation. Uses an address integer to configure
    --! a GOLDi BUS master interface for a read operation. The master 
    --! interface asserts the read operation (stb = '1'); grounds the tag
    --! sub-bus; and uses the address unsigned integer to address the slave
    --! interface.
    function readBus(adr : natural) return mbus_out is
        variable sys_bus : mbus_out;
    begin
        --Read bus operation
        sys_bus.stb := '1';
        sys_bus.we  := '0';
        sys_bus.adr := std_logic_vector(to_unsigned(adr,BUS_ADDRESS_WIDTH));
        sys_bus.dat := (others => '0');
        sys_bus.tag := (others => '0');

        return sys_bus;
    end function;


    --! @brief Returns a master interface configured for a read operation
    --! @details
    --! Function used for simulation. Uses an address anda tag integer to
    --! configure a GOLDi BUS master interface for a read operation. The 
    --! master interface asserts the read operation (stb = '1'); uses the 
    --! tag unsigned integer to configure the master tag sub-bus; and uses
    --! the address unsigned integer to address the slave interface.
    function readBus(adr : natural; tag : natural) return mbus_out is
        variable sys_bus : mbus_out;
    begin
        --Read bus operation
        sys_bus.stb := '1';
        sys_bus.we  := '0';
        sys_bus.adr := std_logic_vector(to_unsigned(adr,BUS_ADDRESS_WIDTH));
        sys_bus.dat := (others => '0');
        sys_bus.tag := std_logic_vector(to_unsigned(tag,BUS_TAG_BITS));

        return sys_bus;
    end function;


    --! @brief Returns a master interface configured for a write operation
    --! @details
    --! Function used for simulation. Uses the address and data std_logic_vector's 
    --! to configure a GOLDi BUS master interface for a write operation. The 
    --! master interface asserts the read operation (stb = '1'); grounds the tag 
    --! sub-bus; uses the address std_logic_vector to address the slave interface;
    --! and transfers the data std_logic_vector.
    function writeBus(adr : std_logic_vector; dat : std_logic_vector) return mbus_out is
        variable adr_buff   :   std_logic_vector(adr'length-1 downto 0);
        variable dat_buff   :   std_logic_vector(dat'length-1 downto 0);
        variable sys_bus    :   mbus_out;
    begin
        --Normalize address and data to "downto" convention
        adr_buff := getDescendingVector(adr)(adr'high downto adr'low);
        dat_buff := getDescendingVector(dat)(dat'high downto dat'low);

        --Write bus operation
        sys_bus.stb := '1';
        sys_bus.we  := '1';
        sys_bus.adr := resize(adr_buff,BUS_ADDRESS_WIDTH);
        sys_bus.dat := resize(dat_buff,SYSTEM_DATA_WIDTH);
        sys_bus.tag := (others => '0');

        return sys_bus;
    end function;


    --! @brief Returns a master interface configured for a write operation
    --! @details
    --! Function used for simulation. Uses the address,data and tag std_logic_vector's 
    --! to configure a GOLDi BUS master interface for a write operation. The master
    --! interface asserts the read operation (stb = '1'); uses tag std_logic_vector 
    --! to configure the tag sub-bus; uses the address std_logic_vector to address 
    --!the slave interface; and transfers the data std_logic_vector.
    function writeBus(adr : std_logic_vector; dat : std_logic_vector; tag : std_logic_vector) return mbus_out is
        variable adr_buff   :   std_logic_vector(adr'length-1 downto 0);
        variable dat_buff   :   std_logic_vector(dat'length-1 downto 0);
        variable tag_buff   :   std_logic_vector(tag'length-1 downto 0);
        variable sys_bus    :   mbus_out;
    begin
        --Normalize address and data to "downto" convention and proper range
        adr_buff := getDescendingVector(adr)(adr'high downto adr'low);
        dat_buff := getDescendingVector(dat)(dat'high downto dat'low);
        tag_buff := getDescendingVector(tag)(tag'high downto tag'low);

        --Write bus operation
        sys_bus.stb := '1';
        sys_bus.we  := '1';
        sys_bus.adr := resize(adr_buff,BUS_ADDRESS_WIDTH);
        sys_bus.dat := resize(dat_buff,SYSTEM_DATA_WIDTH);
        sys_bus.tag := resize(tag_buff,BUS_TAG_BITS);

        return sys_bus;
    end function;


    --! @brief Returns a master interface configured for a write operation
    --! @details
    --! Function used for simulation. Uses the address and data integers to 
    --!configure a GOLDi BUS master interface for a write operation. The master
    --! interface asserts the read operation (stb = '1'); grounds the tag 
    --! sub-bus; uses the address unsigned integer to address the slave interface;
    --! and transfers the data unsigned integer.
    function writeBus(adr : natural; dat : natural) return mbus_out is
        variable sys_bus : mbus_out;
    begin
        --Write bus operation
        sys_bus.stb := '1';
        sys_bus.we  := '1';
        sys_bus.adr := std_logic_vector(to_unsigned(adr,BUS_ADDRESS_WIDTH));
        sys_bus.dat := std_logic_vector(to_unsigned(dat,SYSTEM_DATA_WIDTH));
        sys_bus.tag := (others => '0');

        return sys_bus;
    end function;


    --! @brief Returns a master interface configured for a write operation
    --! @details
    --! Function used for simulation. Uses the address,data and tag integers to 
    --! configure a GOLDi BUS master interface for a write operation. The master
    --! interface asserts the read operation (stb = '1'); uses tag unsigned integer 
    --! to configure the tag sub-bus; uses the address unsigned integer to address 
    --! the slave interface; and transfers the data unsigned integer.
    function writeBus(adr : natural; dat : natural; tag : natural) return mbus_out is  
        variable sys_bus : mbus_out;
    begin
        --Write bus operation
        sys_bus.stb := '1';
        sys_bus.we  := '1';
        sys_bus.adr := std_logic_vector(to_unsigned(adr,BUS_ADDRESS_WIDTH));
        sys_bus.dat := std_logic_vector(to_unsigned(dat,SYSTEM_DATA_WIDTH));
        sys_bus.tag := std_logic_vector(to_unsigned(tag,BUS_TAG_BITS));

        return sys_bus;
    end function;
    -------------------------------------------------------------------------------------------------------------------
 


    
    --****SIMULATION PROCEDURES****
    -------------------------------------------------------------------------------------------------------------------
    --! @brief Custom SPI master interface for use in GOLDi board's "_BS.vhd" simulations
    --! @details
    --! The procedure simulates a SPI master unit that drives the FPGA unit in the GOLDi model.
    --! This is used in the verification simulation for the top modules of the GOLDi models to
    --! simulate the microcontroller that controlls the FPGA. The procedure simulates a single
    --! SPI transaction.
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
    -------------------------------------------------------------------------------------------------------------------
 
 
end package body GOLDI_COMM_STANDARD;