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
--					-> REGISTER_UNIT.vhd
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
-- Revision V4.00.00 - Extension of BUS protocol and reset change
-- Additional Comments: Change from synchronous to asynchronous reset and
--                      introduction of "stb" signal to the GOLDi BUS 
--                      interface to prevent continuous read and write 
--                      operations. Addition of tags to the BUS interfaces
--                      to extend BUS flexibility
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
--! in the GOLDi Board Models and the custom SPI master interface 
--! (GOLDI_SPI_SMODULE). The register counts with two independent ports: the
--! custom BUS port and the internal data port.
--!
--! The custom BUS interface is an addressable port that can access one data word 
--! at a time and perform exclusive write or read operations. 
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
--! Two architectures have been designed for the REGISTER_T_TABLE. The RTL architecture
--! uses a cascading principle and instantiates multiple REGISTER_T_UNITs to generate the
--! table. An "or" operation is used to return the data from the addressed regiseter. The 
--! EXPERIMENTAL architecture uses instead data word arrays to store the data. A decoder 
--! converts the address signal into the array index and allows the data to be accessed.
--! This reduces the timing of the output data routing.
--!
--! **Latency: 1cyc**
entity REGISTER_TABLE is
	generic(
		BASE_ADDRESS		:	integer := 1;                                       --! Register table lowest address
		NUMBER_REGISTERS	:	integer := 3;                                       --! Length of register table
		REG_DEFAULT_VALUES	:	data_word_vector := reg_table_d_default             --! Reset default values for registers
	);
	port(
		--General
		clk				    : in	std_logic;                                      --! System clock
		rst				    : in	std_logic;                                      --! Asynchronous reset
        --BUS interface
		sys_bus_i		    : in	sbus_in;                                        --! BUS port input signals [stb,we,adr,dat,tag]
		sys_bus_o		    : out	sbus_out;                                       --! BUS port output signals [dat,tag]
     	--Data interface
		data_in		        : in	data_word_vector(NUMBER_REGISTERS-1 downto 0);  --! Data port write data vector - BUS port read data vector
		data_out	        : out   data_word_vector(NUMBER_REGISTERS-1 downto 0);  --! Data port read data vector - BUS port write data vector
		read_stb	        : out	std_logic_vector(NUMBER_REGISTERS-1 downto 0);  --! Read strobe signal indicates a read operation by the BUS port 
        write_stb           : out   std_logic_vector(NUMBER_REGISTERS-1 downto 0)   --! Write strobe signal indicates a write operation by the BUS port 
    );
end entity REGISTER_TABLE;




--! Secondary architecture used to reduce multiplexing fan-in
architecture BH of REGISTER_TABLE is

	--****INTERNAL SIGNALS****
	--Address constants
	constant min_address	:	signed(BUS_ADDRESS_WIDTH downto 0)
		:= to_signed(BASE_ADDRESS,BUS_ADDRESS_WIDTH+1);
	constant max_address	:	signed(BUS_ADDRESS_WIDTH downto 0)
		:= to_signed(BASE_ADDRESS+NUMBER_REGISTERS,BUS_ADDRESS_WIDTH+1);

begin

	READ_OPERATION : process(clk,rst)
		variable bus_adr	:	std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
		variable reg_index	:	signed(BUS_ADDRESS_WIDTH downto 0);
	begin
		if(rst = '1') then
			sys_bus_o <= gnd_sbus_o;
			read_stb  <= (others => '0');

		elsif(rising_edge(clk)) then
            --Ground read strobe vector to avoid multiple stb pulses when continuous
            --read operations accross different registers happen
			read_stb <= (others => '0');
			--Norm bus address and get an array index
			bus_adr   := "0" & sys_bus_i.adr;
			reg_index := (signed(bus_adr)) - min_address;

			--Recover value from data table if address belongs to table
			if((min_address <= signed(bus_adr)) and (signed(bus_adr) < max_address) and
			   (sys_bus_i.we = '0') and (sys_bus_i.stb = '1')) then
			   
			   sys_bus_o.dat <= data_in(to_integer(reg_index));
			   sys_bus_o.tag <= (others => '0');
			   read_stb(to_integer(reg_index)) <= '1';

			elsif((min_address <= signed(bus_adr)) and (signed(bus_adr) < max_address) and 
                  (sys_bus_i.we = '0')) then
				
                sys_bus_o.dat <= data_in(to_integer(reg_index));
				sys_bus_o.tag <= (others => '0');
				read_stb 	  <= (others => '0');
			
			else
				sys_bus_o <= gnd_sbus_o;
				read_stb  <= (others => '0');
			end if;
		
		end if;
	end process;


	WRITE_OPERATION : process(clk,rst)
		variable bus_adr	:	std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
		variable reg_index	:	signed(BUS_ADDRESS_WIDTH downto 0);
	begin
		if(rst = '1') then
			data_out  <= REG_DEFAULT_VALUES;
			write_stb <= (others => '1');
		
		elsif(rising_edge(clk)) then
			--Ground wirte strobe vector to avoid multiple stb pulses when a continuous
			--write operations accross different registers happen
			write_stb <= (others => '0');
			--Norm bus address and get an array index
			bus_adr   := "0" & sys_bus_i.adr;
			reg_index := signed(bus_adr) - min_address;

			--Overwrite values to the registers if address belongs to table
			if((min_address <= signed(bus_adr)) and (signed(bus_adr) < max_address) and
			   (sys_bus_i.we = '1') and (sys_bus_i.stb = '1')) then

				data_out(to_integer(reg_index))  <= sys_bus_i.dat;
				write_stb(to_integer(reg_index)) <= '1';
			else
				write_stb <= (others => '0');
			end if;

		end if;
	end process;


end architecture;




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