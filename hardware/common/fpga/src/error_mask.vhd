library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity error_mask is
    port(
        sensors        : in  std_logic_vector(47 downto 0);
        actuators      : in  std_logic_vector(47 downto 0);
        error_bit_mask : out std_logic_vector(19 downto 0);
        error_bit      : out std_logic
    );
end entity error_mask;

architecture RTL of error_mask is
begin
    -- InputInputCheck
    error_bit_mask(0) <= '1' when sensors(0) = '1' and sensors(1) = '1' else '0';
    error_bit_mask(1) <= '1' when sensors(0) = '1' and sensors(2) = '1' else '0';
    error_bit_mask(2) <= '1' when sensors(1) = '1' and sensors(2) = '1' else '0';
    error_bit_mask(3) <= '1' when sensors(3) = '1' and sensors(4) = '1' else '0';
    error_bit_mask(4) <= '1' when sensors(3) = '1' and sensors(5) = '1' else '0';
    error_bit_mask(5) <= '1' when sensors(4) = '1' and sensors(5) = '1' else '0';
    error_bit_mask(6) <= '1' when sensors(6) = '1' and sensors(7) = '1' else '0';
    
    -- OutputOutputCheck      
    error_bit_mask(7) <= '1' when actuators(0) = '1' and actuators(1) = '1' else '0';
    error_bit_mask(8) <= '1' when actuators(2) = '1' and actuators(3) = '1' else '0';
    error_bit_mask(9) <= '1' when actuators(4) = '1' and actuators(5) = '1' else '0';
    
    -- InputOutputCheck       
    error_bit_mask(10) <= '1' when actuators(0) = '1' and (sensors(6) = '0') else '0';
    error_bit_mask(11) <= '1' when actuators(1) = '1' and (sensors(6) = '0') else '0';
    error_bit_mask(12) <= '1' when actuators(2) = '1' and (sensors(6) = '0') else '0';
    error_bit_mask(13) <= '1' when actuators(3) = '1' and (sensors(6) = '0') else '0';
    error_bit_mask(14) <= '1' when actuators(0) = '1' and (sensors(0) = '1') else '0';
    error_bit_mask(15) <= '1' when actuators(1) = '1' and (sensors(1) = '1') else '0';
    error_bit_mask(16) <= '1' when actuators(2) = '1' and (sensors(3) = '1') else '0';
    error_bit_mask(17) <= '1' when actuators(3) = '1' and (sensors(4) = '1') else '0';
    error_bit_mask(18) <= '1' when actuators(4) = '1' and (sensors(6) = '1') else '0';
    error_bit_mask(19) <= '1' when actuators(5) = '1' and (sensors(7) = '1') else '0';
            
    error_bit <= '0' when error_bit_mask = "0" else '1';
end architecture RTL;
