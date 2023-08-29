-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		20/08/2023
-- Design Name:		Customizable register table with tagged data
-- Module Name:		REGISTER_T_TABLE
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> REGISTER_T_UNIT.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! @brief Custom dual port data register set with tagged data
--! @details
--! The REGISTER_T_TABLE module is a dual port memroy unit capable of storing
--! multiple data words with a width defined by the SYSTEM_DATA_WIDTH parameter and
--! the corresponding tag word with a width defined by the BUS_TAG_BITS parameter.
--! The constant parameters are defined in the GOLDI_COMM_STANDARD package.
--!
--! The module allows the data interchange between the individual submodules 
--! in the GOLDi Board Models and the custom SPI master interface 
--! (GOLDI_SPI_SMODULE). The register counts with two independent ports: the
--! custom BUS port and the internal data port.
--!
--! The custom BUS interface is an addressable port that can access one data and tag
--! word at a time and perform exclusive write or read operations. 
--! The data and tag words accessed are defined by the address value presented in 
--! the input BUS signals. A read operation returns the data present in the "data_in"
--! and "tag_in" inputs corresponding to the data word address; and a write operation
--! overwrites the data present on the "data_out" and "tag_out" outputs of the address.
--! The custom BUS structure and its corresponding signals are defined in the 
--! GOLDI_COMM_STANDARD package.
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
entity REGISTER_T_TABLE is
    generic(
        g_base_address      :   integer := 1;                                           --! Register table lowest address
        g_number_registers  :   integer := 3;                                           --! Length of register table
        g_reg_def_dvalues   :   data_word_vector := reg_table_d_default;                --! Registers reset data values
        g_reg_def_tvalues   :   tag_word_vector  := reg_table_t_default                 --! Registers reset tag values
    );
    port(
        --General
        clk                 : in    std_logic;                                          --! System clock
        rst                 : in    std_logic;                                          --! Asynchronous reset
        --BUS interface
        sys_bus_i           : in    sbus_in;                                            --! BUS port input signals [stb,we,adr,dat,tag]
        sys_bus_o           : out   sbus_out;                                           --! BUS port output signals [dat,tag]
        --Data interface
        data_in             : in    data_word_vector(g_number_registers-1 downto 0);    --! Data port write data vector - BUS port read data vector
        tag_in              : in    tag_word_vector(g_number_registers-1 downto 0);     --! Data port write tag vector  - BUS port read tag vector 
        data_out            : out   data_word_vector(g_number_registers-1 downto 0);    --! Data port read data vector - BUS port write data vector
        tag_out             : out   tag_word_vector(g_number_registers-1 downto 0);     --! Data port read tag vector  - BUS port write tag vector
        read_stb            : out   std_logic_vector(g_number_registers-1 downto 0);    --! Read strobe signal indicates a valid read operation by the BUS port
        write_stb           : out   std_logic_vector(g_number_registers-1 downto 0)     --! Write strobe signal indicates a valid write operation by the BUS port
    );
end entity REGISTER_T_TABLE;





--! Secondary architecture used to reduce multiplexing fan-in
architecture BH of REGISTER_T_TABLE is
    
    --****INTERNAL SIGNALS****
    --Address constants
    constant min_address    :   signed(BUS_ADDRESS_WIDTH downto 0)
        := to_signed(g_base_address,BUS_ADDRESS_WIDTH+1);
    constant max_address    :   signed(BUS_ADDRESS_WIDTH downto 0)
        := to_signed(g_base_address+g_number_registers,BUS_ADDRESS_WIDTH+1);

begin

    READ_OPERATION : process(clk,rst)
        variable bus_adr    :   std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
        variable reg_index  :   signed(BUS_ADDRESS_WIDTH downto 0);
    begin
        if(rst = '1') then
            sys_bus_o <= gnd_sbus_o;
            read_stb  <= (others => '0');

        elsif(rising_edge(clk)) then
            --Ground read strobe vector to avoid multiple stb pulses when continuous
            --read operations accross different registers happen.
            read_stb <= (others => '0');
            
            --Norm bus address and get an array index
            bus_adr   := "0" & sys_bus_i.adr;
            reg_index := signed(bus_adr) - min_address;

            --Recover value from data table if address is in the index range
            if((min_address <= signed(bus_adr)) and (signed(bus_adr) < max_address) and (sys_bus_i.we = '0')) then
                --Drive BUS interface
                sys_bus_o.dat <= data_in(to_integer(reg_index));
                sys_bus_o.tag <= tag_in(to_integer(reg_index));

                if(sys_bus_i.stb = '1') then
                    read_stb(to_integer(reg_index)) <= '1';
                end if;
            else
                sys_bus_o <= gnd_sbus_o;
                read_stb  <= (others => '0');
            end if;    
        
        end if;
    end process;


    WRITE_OPERATION : process(clk,rst)
        variable bus_adr    :   std_logic_vector(BUS_ADDRESS_WIDTH downto 0);
        variable reg_index  :   signed(BUS_ADDRESS_WIDTH downto 0);
    begin
        if(rst = '1') then
            data_out  <= g_reg_def_dvalues;
            tag_out   <= g_reg_def_tvalues;
            write_stb <= (others => '1');

        elsif(rising_edge(clk)) then
            --Ground write strobe vector to avoid multiple stb pulsed when contiuous
            --write operations accross different registers happen
            write_stb <= (others => '0');
            
            --Norm bus address and get an array index
            bus_adr   := "0" & sys_bus_i.adr;
            reg_index := signed(bus_adr) - min_address;

            --Overwrite values to the registers if address is in the index range
            if((min_address <= signed(bus_adr)) and (signed(bus_adr) < max_address) and (sys_bus_i.we = '1')) then
                --Drive data interface
                if(sys_bus_i.stb = '1') then
                    data_out(to_integer(reg_index)) <= sys_bus_i.dat;
                    tag_out(to_integer(reg_index))  <= sys_bus_i.tag;
                    write_stb(to_integer(reg_index)) <= '1';
                end if;
            else
                write_stb <= (others => '0');
            end if;

        end if;
    end process;

end architecture;





--! General architecture
architecture RTL of REGISTER_T_TABLE is
    --****INTERNAL SIGNALS****
    signal bus_o_vector :   sbus_o_vector(g_number_registers-1 downto 0);    
begin

    REGISTERS : for i in 0 to g_number_registers-1 generate
        REG : entity work.REGISTER_T_UNIT
        generic map(
            g_address       => i + g_base_address,
            g_def_dvalue    => g_reg_def_dvalues(i),
            g_def_tvalue    => g_reg_def_tvalues(i)
        )
        port map(
            clk             => clk,
            rst             => rst,
            sys_bus_i       => sys_bus_i,
            sys_bus_o       => bus_o_vector(i),
            data_in         => data_in(i),
            tag_in          => tag_in(i),
            data_out        => data_out(i),
            tag_out         => tag_out(i),
            read_stb        => read_stb(i),
            write_stb       => write_stb(i)
        );
    end generate;

    --Multiplex bus vector
    sys_bus_o <= reduceBusVector(bus_o_vector);

end architecture;