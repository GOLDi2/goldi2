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
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! @brief Configurable table of registers
--! @details
--! Table of registers with configurable base address, length and 
--! initialization values. BUS interface reads the internal port input
--! data and writes to the internal output data registers while
--! also flaging the internal system of the changes through the stb signals.
--! The module uses assertions for verification of proper parameters configured
--! in the GOLDI_MODULE_CONFIG package during synthesis.
--!
--! **Latency: 1**
entity REGISTER_TABLE is
	generic(
		BASE_ADDRESS		:	integer := 1;                                       --! Base address of module
		NUMBER_REGISTERS	:	integer := 3;                                       --! Length of register table
		REG_DEFAULT_VALUES	:	data_word_vector := (x"0F",x"F0",x"FF")             --! Reset default values for registers
	);
	port(
		--General
		clk				    : in	std_logic;                                      --! System clock
		rst				    : in	std_logic;                                      --! Synchronous reset
		--Communication
		sys_bus_i		    : in	sbus_in;                                        --! BUS input signals [we,adr,dat]
		sys_bus_o		    : out	sbus_out;                                       --! BUS output signals [dat,val]
		--Internal port
		data_in		        : in	data_word_vector(NUMBER_REGISTERS-1 downto 0);  --! Register read data
		data_out	        : out   data_word_vector(NUMBER_REGISTERS-1 downto 0);  --! Register write data
		read_stb	        : out	std_logic_vector(NUMBER_REGISTERS-1 downto 0);  --! Strobe signal - bus read performed
        write_stb           : out   std_logic_vector(NUMBER_REGISTERS-1 downto 0)   --! Strobe signal - bus write performed
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