-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Test design for Breakout-board
-- Module Name:		TOP_LEVEL Simulation
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	-> GOLDI_COMM_STANDARD.vhd
--                  -> GOLDI_IO_STANDARD.vhd
--                  -> GOLDI_DATA_TYPES.vhd
--                  -> GOLDI_MODULE_CONFIG.vhd
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
-------------------------------------------------------------------------------
--! Use standard library
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
--! Use custom packages
library work;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;
use work.GOLDI_MODULE_CONFIG.all;




entity TOP_LEVEL_TB is
end entity TOP_LEVEL_TB;




architecture TB of TOP_LEVEL_TB is

    --****DUT****
    component TOP_LEVEL
        port(
            FPGA_nReset : in    std_logic;   
            SPI0_SCLK   : in    std_logic;
            SPI0_MOSI   : in    std_logic;
            SPI0_MISO   : out   std_logic;
            SPI0_nCE0   : in    std_logic;

            IO_DATA     : inout std_logic_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
        );
    end component;

    
    --****INTERNAL SIGNALS****
    --DUT
    signal FPGA_nReset  :   std_logic;
    signal SPI0_SCLK    :   std_logic;
    signal SPI0_MOSI    :   std_logic;
    signal SPI0_MISO    :   std_logic;
    signal SPI0_nCE0    :   std_logic;
    --IO
    signal data_in_buff :   std_logic_vector(15 downto 0) := x"0200";


begin

    --****COMPONENT****
    -----------------------------------------------------------------------------------------------
    DUT : TOP_LEVEL
    port map(
        FPGA_nReset => FPGA_nReset,
        SPI0_SCLK   => SPI0_SCLK,
        SPI0_MOSI   => SPI0_MOSI,
        SPI0_MISO   => SPI0_MISO,
        SPI0_nCE0   => SPI0_nCE0,
        IO_DATA     => open
    );
    -----------------------------------------------------------------------------------------------




    --****TEST****
    -----------------------------------------------------------------------------------------------
    SPI_MASTER : process
        variable init_hold      :   time := 2 us;
        variable sclk_period    :   time := 4 us;

    begin
        FPGA_nReset <= '0';
        wait for 500 ns;
        FPGA_nReset <= '1';
        SPI0_SCLK   <= '1';
        SPI0_nCE0   <= '1';
        SPI0_MOSI   <= '0';
        wait for init_hold;

        data_in_buff <= x"0200";
        SPI0_nCE0    <= '0';
        wait for sclk_period;

        for i in 0 to 15 loop
            SPI0_MOSI <= data_in_buff(15-i);
            SPI0_SCLK <= not SPI0_SCLK;
            wait for sclk_period/2;
            SPI0_SCLK <= not SPI0_SCLK;
            wait for sclk_period/2;
        end loop;
        wait for sclk_period;
        SPI0_nCE0     <= '1';


        wait for 2*sclk_period;


        data_in_buff <= x"0300";
        SPI0_nCE0    <= '0';
        wait for sclk_period;

        for i in 0 to 15 loop
            SPI0_MOSI <= data_in_buff(15-i);
            SPI0_SCLK <= not SPI0_SCLK;
            wait for sclk_period/2;
            SPI0_SCLK <= not SPI0_SCLK;
            wait for sclk_period/2;
        end loop;
        wait for sclk_period;
        SPI0_nCE0     <= '1';


        wait for sclk_period;
        wait;
        
    end process;
    -----------------------------------------------------------------------------------------------


end TB;