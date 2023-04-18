-------------------------------------------------------------------------------
-- Company:			Technische Universität Ilmenau
-- Engineer:		JP_CC <josepablo.chew@gmail.com>
--
-- Create Date:		30/04/2023
-- Design Name:		Virtual sensor for position detection
-- Module Name:		VIRTUAL_SENSOR
-- Project Name:	GOLDi_FPGA_SRC
-- Target Devices:	LCMXO2-7000HC-4TG144C
-- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
--
-- Dependencies:	none
--
-- Revisions:
-- Revision V1.00.00 - File Created
-- Additional Comments: First commitment
-- 
-- Revision V2.00.00 - First release
-- Additional Comments:
-------------------------------------------------------------------------------
--! Use standard libary
library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;




--! @brief
--! @details
--!
entity VIRTUAL_SENSOR is
    generic(
        NEG_LIMIT   :   integer := 1;
        POS_LIMIT   :   integer := 10
    );
    port(
        --General
        clk         : in    std_logic;
        rst         : in    std_logic;
        --Data interface
        data_in     : in    std_logic_vector(15 downto 0);
        data_out    : out   std_logic
    );
end entity VIRTUAL_SENSOR;




--! General architecture
architecture RTL of VIRTUAL_SENSOR is
begin

    SENSOR : process(clk)
        variable data_buff  :   integer;
    begin
        if(rising_edge(clk)) then
            --Typecast data
            data_buff := to_integer(unsigned(data_in));

            if(rst = '1') then
                data_out <= '0';
            elsif(NEG_LIMIT <= data_buff and data_buff <= POS_LIMIT) then
                data_out <= '1';
            else 
                data_out <= '0';
            end if;
            
        end if;
    end process;


end RTL;