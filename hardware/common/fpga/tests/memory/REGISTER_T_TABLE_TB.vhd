-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		20/08/2023
-- Design Name:		Register table with tagged data testbench
-- Module Name:		REGISTER_T_TABLE_TB
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> REGISTER_T_UNIT.vhd
--                  -> REGISTER_T_TABLE.vhd
--
-- Revisions:
-- Revision V4.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation flow control and assertions
library std;
use std.standard.all;
--use std.env.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;




--! Functionality testbench
entity REGISTER_T_TABLE_TB is
end entity REGISTER_T_TABLE_TB;



--! Simulation architecture
architecture TB of REGISTER_T_TABLE_TB is
  
    --****DUT****
    component REGISTER_T_TABLE
        generic(
            g_base_address      :   integer;
            g_number_registers  :   integer;
            g_reg_def_dvalues   :   data_word_vector;
            g_reg_def_tvalues   :   tag_word_vector
        );
        port(
            clk                 : in    std_logic;
            rst                 : in    std_logic;
            sys_bus_i           : in    sbus_in;
            sys_bus_o           : out   sbus_out;
            data_in             : in    data_word_vector(g_number_registers-1 downto 0);
            tag_in              : in    tag_word_vector(g_number_registers-1 downto 0);
            data_out            : out   data_word_vector(g_number_registers-1 downto 0);
            tag_out             : out   tag_word_vector(g_number_registers-1 downto 0);
            read_stb            : out   std_logic_vector(g_number_registers-1 downto 0);
            write_stb           : out   std_logic_vector(g_number_registers-1 downto 0)
        );
    end component;


    --****INTERNAL SIGNALS****
	--Simulation timing
	constant clk_period		:	time := 20 ns;
	signal reset			:	std_logic := '0';
	signal clock			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
	--DUT IOs
	constant reg_d_default	:	data_word_vector(2 downto 0) := (
		std_logic_vector(to_unsigned(255,SYSTEM_DATA_WIDTH)),
		std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)),
		std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)));
    constant reg_t_default  :   tag_word_vector(2 downto 0)  := (
        std_logic_vector(to_unsigned(1,BUS_TAG_BITS)),
        std_logic_vector(to_unsigned(3,BUS_TAG_BITS)),
        std_logic_vector(to_unsigned(2,BUS_TAG_BITS))
    );
    signal sys_bus_i        :   sbus_in  := gnd_sbus_i;
    signal sys_bus_o        :   sbus_out := gnd_sbus_o;
    signal data_in          :   data_word_vector(2 downto 0) := (others => (others => '0'));
    signal tag_in           :   tag_word_vector(2 downto 0)  := (others => (others => '0'));
    signal data_out         :   data_word_vector(2 downto 0) := (others => (others => '0'));
    signal tag_out          :   tag_word_vector(2 downto 0)  := (others => (others => '0'));
    signal read_stb         :   std_logic_vector(2 downto 0) := (others => '0');
    signal write_stb        :   std_logic_vector(2 downto 0) := (others => '0');
    --Testbench
    signal data_buff		:	std_logic_vector(3*SYSTEM_DATA_WIDTH-1 downto 0) :=
		std_logic_vector(to_unsigned(3,SYSTEM_DATA_WIDTH)) &
		std_logic_vector(to_unsigned(2,SYSTEM_DATA_WIDTH)) &
		std_logic_vector(to_unsigned(1,SYSTEM_DATA_WIDTH));
    signal tag_buff         :   std_logic_vector(3*BUS_TAG_BITS-1 downto 0) := 
		std_logic_vector(to_unsigned(3,BUS_TAG_BITS)) &
		std_logic_vector(to_unsigned(2,BUS_TAG_BITS)) &
		std_logic_vector(to_unsigned(1,BUS_TAG_BITS));


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : REGISTER_T_TABLE
    generic map(
        g_base_address      => 1,
        g_number_registers  => 3,
        g_reg_def_dvalues   => reg_d_default,
        g_reg_def_tvalues   => reg_t_default
    )
    port map(
        clk                 => clock,
        rst                 => reset,
        sys_bus_i           => sys_bus_i,
        sys_bus_o           => sys_bus_o,
        data_in             => data_in,
        tag_in              => tag_in,
        data_out            => data_out,
        tag_out             => tag_out,
        read_stb            => read_stb,
        write_stb           => write_stb
    );
    -----------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
	-----------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 10 ns, '0' after 30 ns;
	-----------------------------------------------------------------------------------------------


	
	--****TEST****
	-----------------------------------------------------------------------------------------------
	TEST : process
		--Timing
		variable init_hold			:	time :=	5*clk_period/2;
		variable assert_hold		:	time := 3*clk_period/2;
		variable post_hold			:	time := 1*clk_period/2;
	begin
		--**Initial setup**
		wait for init_hold;


        --**Test reset conditions**
        wait for assert_hold;
  		assert(data_out(0) = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH))) 
			report "ID01: Test reset - expecting data_out(0) = x0F" severity error;
		assert(data_out(1) = std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH))) 
			report "ID02: Test reset - expecting data_out(1) = xF0" severity error;
		assert(data_out(2) = std_logic_vector(to_unsigned(255,SYSTEM_DATA_WIDTH))) 
            report "ID03: Test reset - expecting data_out(2) = xFF" severity error;
        assert(tag_out(0) = std_logic_vector(to_unsigned(2,BUS_TAG_BITS)))
            report "ID04: Test reset - expecting tag_out(0) = x02" severity error;
        assert(tag_out(1) = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID05: Test reset - expecting tag_out(1) = x03" severity error;
        assert(tag_out(2) = std_logic_vector(to_unsigned(1,BUS_TAG_BITS)))
            report "ID06: Test reset - expecting tag_out(2) = x01" severity error;
		assert(read_stb = (read_stb'range => '0'))
			report "ID07: Test reset - expecting read_stb = 000" severity error;
		assert(write_stb = (write_stb'range => '0'))
			report "ID08: Test reset - expecting write_stb = 000" severity error;
		assert(sys_bus_o = gnd_sbus_o)
            report "ID09: Test reset - expecting sys_bus_o = gnd_sbus_o" severity error;
        wait for post_hold;



        wait for 5*clk_period;



        --**Test read bus**
        data_in <= setMemory(data_buff);
        tag_in  <= setTag(tag_buff);
        wait for clk_period;
        for i in 1 to 3 loop
            --Load address, write enable, data and tags
            sys_bus_i.we  <= '0';
			sys_bus_i.adr <= std_logic_vector(to_unsigned(i,BUS_ADDRESS_WIDTH));
			sys_bus_i.dat <= std_logic_vector(to_unsigned(1,SYSTEM_DATA_WIDTH));
            sys_bus_i.tag <= std_logic_vector(to_unsigned(0,BUS_TAG_BITS));

            wait for assert_hold;
            assert(sys_bus_o.dat = std_logic_vector(to_unsigned(i,SYSTEM_DATA_WIDTH)))
                report "ID10: Test bus read - expecting sys_bus_o.dat = " & integer'image(i)
                severity error;
            assert(sys_bus_o.tag = std_logic_vector(to_unsigned(i,BUS_TAG_BITS)))
                report "ID11: Test bus read - expecting sys_bus_o.tag = " & integer'image(i)
                severity error;
            assert(read_stb = (read_stb'range => '0'))
				report "ID12: Test bus read - expecting read_stb = '0'" 
				severity error;
			wait for post_hold;

            --Validate transaction
            sys_bus_i.stb <= '1';
            wait for assert_hold;
            assert(sys_bus_o.dat = std_logic_vector(to_unsigned(i,SYSTEM_DATA_WIDTH)))
                report "ID13: Test bus read - expecting sys_bus_o.dat = " & integer'image(i)
                severity error;
            assert(sys_bus_o.tag = std_logic_vector(to_unsigned(i,BUS_TAG_BITS)))
                report "ID14: Test bus read - expecting sys_bus_o.tag = " & integer'image(i)
                severity error;
            assert(read_stb(i-1) = '1')
                report "ID15: Test bus read - expecting read_stb(" & integer'image(i-1) & ") = '1'"
				severity error;
			wait for post_hold;
            sys_bus_i <= gnd_sbus_i;

        end loop;



        wait for 5*clk_period;



        --**Test write bus**
        for i in 1 to 3 loop
            --Load address, write enable, data and tags
            sys_bus_i.we  <= '1';
			sys_bus_i.adr <= std_logic_vector(to_unsigned(i,BUS_ADDRESS_WIDTH));
			sys_bus_i.dat <= std_logic_vector(to_unsigned(10,SYSTEM_DATA_WIDTH));
            sys_bus_i.tag <= std_logic_vector(to_unsigned(0,BUS_TAG_BITS));
        
            wait for assert_hold;
			assert(data_out(i-1) = reg_d_default(i-1))
				report "ID16: Test bus write - expecting data_out(i) = reg_default(i)"
				severity error;
            assert(tag_out(i-1) = reg_t_default(i-1))
                report "ID17: Test bus write - expecting tag_out(i) = reg_d_default(i)"
                severity error;    
			assert(write_stb = (write_stb'range => '0'))
				report "ID18: Test bus write - expecting write_stb = '0'"
				severity error;
			wait for post_hold;

            sys_bus_i.stb <= '1';
            wait for assert_hold;
            assert(data_out(i-1) = std_logic_vector(to_unsigned(10,SYSTEM_DATA_WIDTH))) 
				report "ID19: Test bus write - expecting data_out("& integer'image(i-1)&") = x0A"
				severity error;
            assert(tag_out(i-1) = std_logic_vector(to_unsigned(0,BUS_TAG_BITS))) 
				report "ID20: Test bus write - expecting tag_out("& integer'image(i-1)&") = x00"
				severity error;
            assert(write_stb(i-1) = '1')
				report "ID21: Test bus write - expecting write_stb(" & integer'image(i-1) & ") = '1'"
				severity error;
            wait for post_hold;
            sys_bus_i <= gnd_sbus_i;

        end loop;



        --**End simulation**
		wait for 50 ns;
        report "REGISTER_TABLE_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
       --std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        run_sim <= '0';
        wait;
		
	end process;
    -----------------------------------------------------------------------------------------------
    

end architecture;