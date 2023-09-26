-------------------------------------------------------------------------------
-- Company:			Technische Universitaet Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		01/01/2023
-- Design Name:		SPI-Register Communication testbench
-- Module Name:		COMMS_TB
-- Project Name:	GOLDi_FPGA_CORE
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--					-> GOLDI_SPI_SMODULE
--					-> REGISTER_UNIT.vhd
--                  -> REGISTER_T_UNIT.vhd
--
-- Revisions:
-- Revision V0.01.01 - File Created
-- Additional Comments: First commit
--
-- Revision V3.00.01 - Extension of testbench
-- Additional Comments: Modificatio of testbench to adapt to multipele
--						vector sizes.
--
-- Revision V4.00.00 - Extension of BUS protocol and module renaming
-- Additional Comments: Introduction of "stb" signal to the GOLDi BUS master
--                      interface to prevent continuous read and write 
--                      operations. Addition of tags to the BUS interfaces
--                      to extend BUS flexibility. Renaming form multiple 
--                      communication modules.
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use standard library for simulation control and assertions
library std;
use std.standard.all;
use std.env.all;
--! Use custom communication library
library work;
use work.GOLDI_COMM_STANDARD.all;




--! Verification Testbench
entity COMMS_TB is
end entity COMMS_TB;




--! Simulation architecture
architecture TB of COMMS_TB is

    --****COMPONENTS****
    component GOLDI_SPI_SMODULE
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            p_spi_nce       : in    std_logic;
            p_spi_sclk      : in    std_logic;
            p_spi_mosi      : in    std_logic;
            p_spi_miso      : out   std_logic;
            p_master_bus_o  : out   mbus_out;
            p_master_bus_i  : in    mbus_in 
        );
    end component;

    component REGISTER_UNIT
        generic(
            ADDRESS     :   natural := 1;
            DEF_VALUE   :   data_word := reg_unit_d_default 
        );
        port(
            clk         : in    std_logic;
            rst         : in    std_logic;
            sys_bus_i   : in    sbus_in;
            sys_bus_o   : out   sbus_out;
            data_in     : in    data_word;
            data_out    : out   data_word;
            read_stb    : out   std_logic;
            write_stb   : out   std_logic
        );
    end component;


    component REGISTER_T_UNIT
        generic(
            g_address       :   natural   := 1;
            g_def_dvalue    :   data_word := reg_unit_d_default;
            g_def_tvalue    :   tag_word  := reg_unit_t_default
        );
        port(
            clk             : in    std_logic;
            rst             : in    std_logic;
            sys_bus_i       : in    sbus_in;
            sys_bus_o       : out   sbus_out;
            data_in         : in    data_word;
            tag_in          : in    tag_word;
            data_out        : out   data_word;
            tag_out         : out   tag_word;
            read_stb        : out   std_logic;
            write_stb       : out   std_logic
        );
    end component;


    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period		:	time := 20 ns;
	constant sclk_period	:	time := 80 ns;
    signal clock			:	std_logic := '0';
	signal reset			:	std_logic := '0';
	signal run_sim			:	std_logic := '1';
    --DUT IOs
    --GOLDi SPI Sub-Module
    signal p_spi_nce        :   std_logic := '1';
    signal p_spi_sclk       :   std_logic := '1';
    signal p_spi_mosi       :   std_logic := '0';
    signal p_spi_miso       :   std_logic := '0';
    signal master_bus_o     :   mbus_out  := gnd_mbus_o;
    signal master_bus_i     :   mbus_in   := gnd_mbus_i;
    --Register Unit and TUnit
    signal sys_bus_o        :   sbus_o_vector(1 downto 0) := (others => gnd_sbus_o);
    signal data_in          :   data_word := (others => '0');
    signal data_out         :   data_word := (others => '0');
    signal tdata_in         :   data_word := (others => '0');
    signal tdata_out        :   data_word := (others => '0');
    signal ttag_in          :   tag_word  := (others => '0');
    signal ttag_out         :   tag_word  := (others => '0');
    --Testbench
    signal mosi_buffer      :   std_logic_vector(SPI_DATA_WIDTH-1 downto 0) := (others => '0');
        alias we_buffer     :   std_logic    is mosi_buffer(mosi_buffer'high);
        alias se_buffer     :   std_logic    is mosi_buffer(mosi_buffer'high-1);
        alias tag_buffer    :   tag_word     is mosi_buffer(mosi_buffer'high-2 downto BUS_ADDRESS_WIDTH+SYSTEM_DATA_WIDTH);
        alias adr_buffer    :   address_word is mosi_buffer(BUS_ADDRESS_WIDTH+SYSTEM_DATA_WIDTH-1 downto SYSTEM_DATA_WIDTH);
        alias dat_buffer    :   data_word    is mosi_buffer(SYSTEM_DATA_WIDTH-1 downto 0);
    signal miso_buffer      :   std_logic_vector(SPI_DATA_WIDTH-1 downto 0) := (others => '0');
        alias result_buffer :   data_word    is miso_buffer(SYSTEM_DATA_WIDTH-1 downto 0);


begin

    --****COMPONENTS****
    -------------------------------------------------------------------------------------------------------------------
    DUT_SPI : GOLDI_SPI_SMODULE
    port map(
        clk             => clock,
        rst             => reset,
        p_spi_nce       => p_spi_nce,
        p_spi_sclk      => p_spi_sclk,
        p_spi_mosi      => p_spi_mosi,
        p_spi_miso      => p_spi_miso,
        p_master_bus_o  => master_bus_o,
        p_master_bus_i  => master_bus_i
    );


    DUT_MEMORY_1 : REGISTER_UNIT
    generic map(
        ADDRESS         => 15,
        DEF_VALUE       => std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)) 
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => master_bus_o,
        sys_bus_o       => sys_bus_o(0),
        data_in         => data_in,
        data_out        => data_out,
        read_stb        => open,
        write_stb       => open
    );


    DUT_MEMORY_2 : REGISTER_T_UNIT
    generic map(
        g_address       => 16,
        g_def_dvalue    => std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)),
        g_def_tvalue    => std_logic_vector(to_unsigned(3,BUS_TAG_BITS))
    )
    port map(
        clk             => clock,
        rst             => reset,
        sys_bus_i       => master_bus_o,
        sys_bus_o       => sys_bus_o(1),
        data_in         => tdata_in,
        tag_in          => ttag_in,
        data_out        => tdata_out,
        tag_out         => ttag_out,
        read_stb        => open,
        write_stb       => open
    );

    master_bus_i <= reduceBusVector(sys_bus_o);
    -------------------------------------------------------------------------------------------------------------------



    --****SIMULATION TIMING****
	-------------------------------------------------------------------------------------------------------------------
	clock <= run_sim and (not clock) after clk_period/2;
	reset <= '1' after 10 ns, '0' after 30 ns;
	-------------------------------------------------------------------------------------------------------------------



    --****TEST****
    -------------------------------------------------------------------------------------------------------------------
    TEST : process
        --Timing
		variable init_hold		:	time := 5*clk_period/2; 
		variable assert_hold	:	time := 3*clk_period/2;
		variable post_hold		:	time := 1*clk_period/2;
    begin
        --**Initial setup**
        wait for init_hold;


        --**Test idle state**
        wait for assert_hold;
        assert(data_out = std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)))
            report "ID01: Test idle state - expecting data_out = xF0"
            severity error;
        assert(tdata_out = std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)))
            report "ID02: Test idle state - expecting tdata_out = xF0"
            severity error;
        assert(ttag_out = std_logic_vector(to_unsigned(3,BUS_TAG_BITS)))
            report "ID03: Test idle state - expecting ttag_out = x3"
            severity error;
        wait for post_hold;
    

        wait for 5*clk_period;


        --**Test read operations**
        data_in  <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));
        tdata_in <= std_logic_vector(to_unsigned(16,SYSTEM_DATA_WIDTH));
        ttag_in  <= std_logic_vector(to_unsigned(1,BUS_TAG_BITS));
        

        --Address: 15
        we_buffer  <= '0';
        se_buffer  <= '0';
        tag_buffer <= (others => '0');
        adr_buffer <= std_logic_vector(to_unsigned(15,BUS_ADDRESS_WIDTH));
        dat_buffer <= (others => '0');

        p_spiTransaction(
            sclk_period,
            mosi_buffer,
            miso_buffer,
            p_spi_nce,
            p_spi_sclk,
            p_spi_mosi,
            p_spi_miso
        );

        wait for assert_hold;
        assert(data_out = std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)))
            report "ID04: Test read reg_unit - expecting data_out = xF0"
            severity error;
        assert(result_buffer = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
            report "ID05: Test read reg_unit - expecting data_in = x0F"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --Address: 16
        we_buffer  <= '0';
        se_buffer  <= '0';
        tag_buffer <= (others => '0');
        adr_buffer <= std_logic_vector(to_unsigned(16,BUS_ADDRESS_WIDTH));
        dat_buffer <= (others => '0');

        p_spiTransaction(
            sclk_period,
            mosi_buffer,
            miso_buffer,
            p_spi_nce,
            p_spi_sclk,
            p_spi_mosi,
            p_spi_miso
        );

        wait for assert_hold;
        assert(tdata_out = std_logic_vector(to_unsigned(240,SYSTEM_DATA_WIDTH)))
            report "ID06: Test read reg_t_unit - expecting tdata_out = xF0"
            severity error;
        assert(result_buffer = std_logic_vector(to_unsigned(16,SYSTEM_DATA_WIDTH)))
            report "ID07: Test read reg_t_unit - expecting tdata_in = x10"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;


        --**Test write operations**
        data_in  <= std_logic_vector(to_unsigned(5,SYSTEM_DATA_WIDTH));
        tdata_in <= std_logic_vector(to_unsigned(6,SYSTEM_DATA_WIDTH));
        ttag_in  <= std_logic_vector(to_unsigned(1,BUS_TAG_BITS));
        

        --Address: 15
        we_buffer  <= '1';
        se_buffer  <= '0';
        tag_buffer <= (others => '0');
        adr_buffer <= std_logic_vector(to_unsigned(15,BUS_ADDRESS_WIDTH));
        dat_buffer <= std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH));

        p_spiTransaction(
            sclk_period,
            mosi_buffer,
            miso_buffer,
            p_spi_nce,
            p_spi_sclk,
            p_spi_mosi,
            p_spi_miso
        );

        wait for assert_hold;
        assert(data_out = std_logic_vector(to_unsigned(15,SYSTEM_DATA_WIDTH)))
            report "ID08: Test write reg_unit - expecting data_out = x0F"
            severity error;
        assert(result_buffer = std_logic_vector(to_unsigned(5,SYSTEM_DATA_WIDTH)))
            report "ID09: Test write reg_unit - expecting data_in = x05"
            severity error;
        wait for post_hold;


        wait for 5*clk_period;

        
        --Address: 16
        we_buffer  <= '1';
        se_buffer  <= '0';
        tag_buffer <= std_logic_vector(to_unsigned(1,BUS_TAG_BITS));
        adr_buffer <= std_logic_vector(to_unsigned(16,BUS_ADDRESS_WIDTH));
        dat_buffer <= std_logic_vector(to_unsigned(16,SYSTEM_DATA_WIDTH));

        p_spiTransaction(
            sclk_period,
            mosi_buffer,
            miso_buffer,
            p_spi_nce,
            p_spi_sclk,
            p_spi_mosi,
            p_spi_miso
        );

        wait for assert_hold;
        assert(tdata_out = std_logic_vector(to_unsigned(16,SYSTEM_DATA_WIDTH)))
            report "ID10: Test write reg_t_unit - expecting tdata_out = x10"
            severity error;
        assert(ttag_out = std_logic_vector(to_unsigned(1,BUS_TAG_BITS)))
            report "ID11: Test write reg_t_unit - expecting ttag_out = x1"
            severity error;
        assert(result_buffer = std_logic_vector(to_unsigned(6,SYSTEM_DATA_WIDTH)))
            report "ID12: Test write reg_t_unit - expecting tdata_in = x06"
            severity error;
        wait for post_hold;
    
    
        --**End simulation**
		wait for 50 ns;
        report "COMMS_TB - testbench completed";
        --Simulation end usign vhdl2008 env library (Pipeline use)
        std.env.finish;
        --Simulation end for local use in lattice diamond software (VHDL2008 libraries supported)
        --run_sim <= '0';
        --wait;
    
    end process;
    -------------------------------------------------------------------------------------------------------------------


end architecture;