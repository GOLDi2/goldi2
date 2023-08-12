-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		15/04/2023
-- Design Name:		Customizable Register Table 
-- Module Name:		REGISTER_TABLE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--
-- Revisions:
-- Revision V0.01.00 - File Created
-- Additional Comments: First commit
--
-- Revision V1.00.00 - Default module version for release 1.00.00
-- Additional Comments: Release for Axis Portal V1 (AP1)
--
-- Revision V1.01.00 - Refactoring of REGISTER_TABLE
-- Additional Comments: Introduction of REGISTER_UNIT to solve problems
--                      with register indexing and introduction of read_stb
--                      signal for use in fifo structures
--
-- Revision V3.01.00 - Modification to the default generic parameters
-- Additional Comments: Introduction of reg_table_default as parameter
--                      to prevent synthesis errors when changes to the 
--                      SYSTEM_DATA_WIDTH parameter are applied
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! @brief Custom dual port data register set
--! @details
--! The REGISTER_TABLE module is a dual port memory unit capable of storing
--! multiple data words with a width defined by the SYSTEM_DATA_WIDTH parameter
--! in the GOLDI_COMM_STANDARD package.
--!
--! The module allows the data interchange between the individual submodules 
--! building the GOLDi Model and the custom SPI master interface (SPI_TO_BUS).
--! The register counts with two independent ports: the custom BUS port and the
--! internal data port.
--!
--! The custom BUS interface is an addressable port that can access one of the
--! a single data word at a time and perform exclusive write or read operations. 
--! The data word accessed is defined by the address value presented in the input
--! BUS signals. A read operation returns the data present in the "data_in" input
--! corresponding to the data word address; and a write operation overwrites the 
--! data present on the "data_out" output of the address. The custom BUS structure
--! and its corresponding signals are defined in the GOLDI_COMM_STANDARD package.
--!
--! The internal data port can modify multiple "registers" at any moment and can
--! perform simultaneous read and write operations. Additionaly the "read_stb" and
--! "write_stb" flags indicate write and read operations performed by the BUS port
--! on the corresponding "register" allowing for data flow control.
--!
--! The base address of the register table, the table length and the default values
--! of the registers can be configured using generic parameters.
--!
--! Two architectures have been designed for the REGISTER_TABLE. The RTL architecture
--! uses a cascading principle and instantiates multiple REGISTER_UNITs to generate the
--! table. The valid signal of the BUS output signals is used to asynchronously multiplex
--! the output data. The EXPERIMENTAL architecture uses instead data word arrays to 
--! store the data. A decoder converts the address signal into the array index and allows
--! the data to be accessed. This reduces the complexity of the output data multiplexing.
--!
--! **Latency: 1cyc**
entity REGISTER_TABLE is
	generic(
		BASE_ADDRESS		:	integer := 1;                                       --! Register table lowest address
		NUMBER_REGISTERS	:	integer := 3;                                       --! Length of register table
		REG_DEFAULT_VALUES	:	data_word_vector := reg_table_default               --! Reset default values for registers
	);
	port(
		--General
		clk				    : in	std_logic;                                      --! System clock
		rst				    : in	std_logic;                                      --! Asynchronous reset
		--Communication
		sys_bus_i		    : in	sbus_in;                                        --! BUS port input signals [we,adr,dat]
		sys_bus_o		    : out	sbus_out;                                       --! BUS port output signals [dat,valid]
		--Internal port
		data_in		        : in	data_word_vector(NUMBER_REGISTERS-1 downto 0);  --! Data port write data vector - BUS port read data vector
		data_out	        : out   data_word_vector(NUMBER_REGISTERS-1 downto 0);  --! Data port read data vector - BUS port write data vector
		read_stb	        : out	std_logic_vector(NUMBER_REGISTERS-1 downto 0);  --! Read strobe signal indicates a read operation by the BUS port 
        write_stb           : out   std_logic_vector(NUMBER_REGISTERS-1 downto 0)   --! Write strobe signal indicates a write operation by the BUS port 
    );
end entity REGISTER_TABLE;




--! Experimental architecure used to reduce multiplexing
architecture EXPERIMENTAL of REGISTER_TABLE is
  
    --****INTERNAL SIGNALS****
    --Address constants
    constant min_address    :   signed(BUS_ADDRESS_WIDTH downto 0) 
                                := to_signed(BASE_ADDRESS,BUS_ADDRESS_WIDTH+1);
    constant max_address    :   signed(BUS_ADDRESS_WIDTH downto 0)
                                := to_signed(BASE_ADDRESS+NUMBER_REGISTERS,BUS_ADDRESS_WIDTH+1);


begin

    READ_OPERATION : process(clk,rst)
        variable reg_index  :   signed(BUS_ADDRESS_WIDTH downto 0);
        variable adr_buff   :   std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
    begin
        if(rst = '1') then
            sys_bus_o <= gnd_sbus_o;
            read_stb  <= (others => '0');
        
        elsif(rising_edge(clk)) then
            --Ground read strobe to avoid multiple stb when continous reading
            read_stb  <= (others => '0');
            --Decode address 
            adr_buff  := "0" & sys_bus_i.adr;
            reg_index := signed(adr_buff) - min_address;

            --Recover value form data table if address belongs to table
            if((min_address <= signed(adr_buff)) and (signed(adr_buff) < max_address) and
               (sys_bus_i.we = '0'))                                                  then
                
                sys_bus_o.dat <= data_in(to_integer(reg_index));
                sys_bus_o.val <= '1';
                read_stb(to_integer(reg_index)) <= '1';
            
            else
                sys_bus_o <= gnd_sbus_o;
            end if;

        end if;
    end process;



    WRITE_OPERATION : process(clk,rst)
        variable reg_index  :   signed(BUS_ADDRESS_WIDTH downto 0);
        variable adr_buff   :   std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
    begin
        if(rst = '1') then
            data_out  <= REG_DEFAULT_VALUES;
            write_stb <= (others => '1');

        elsif(rising_edge(clk)) then
            --Ground read strobe to avoid multiple stb when continous reading
            write_stb  <= (others => '0');
            --Decode address 
            adr_buff  := "0" & sys_bus_i.adr;
            reg_index := signed(adr_buff) - min_address;

            --Recover value form data table if address belongs to table
            if((min_address <= signed(adr_buff)) and (signed(adr_buff) < max_address) and
               (sys_bus_i.we = '1'))                                                  then
                
                data_out(to_integer(reg_index))  <= sys_bus_i.dat;
                write_stb(to_integer(reg_index)) <= '1';
            else
                write_stb <= (others => '0');
            end if;

        end if;
    end process;


end EXPERIMENTAL;




--! General architecture
architecture RTL of REGISTER_TABLE is

    --****INTERNAL SIGNALS****
    signal bus_o_vector     :   sbus_o_vector(NUMBER_REGISTERS-1 downto 0);


begin

    REGISTERS : for i in 0 to NUMBER_REGISTERS-1 generate
        REG : entity work.REGISTER_UNIT
        generic map(
            ADDRESS     => i+BASE_ADDRESS,
            DEF_VALUE   => REG_DEFAULT_VALUES(i)
        )
        port map(
            clk         => clk,
            rst         => rst,
            sys_bus_i   => sys_bus_i,
            sys_bus_o   => bus_o_vector(i),
            data_in     => data_in(i),
            data_out    => data_out(i),
            read_stb    => read_stb(i),
            write_stb   => write_stb(i)            
        );
    end generate;

    --Multiplex bus vector
    sys_bus_o <= reduceBusVector(bus_o_vector);


end RTL;