library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;
use work.GOLDI_COMM_STANDARD.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_DATA_TYPES.all;

--! Functionality simulation
entity StepperControl_TB is
end entity StepperControl_TB;

--! Simulation architecture
architecture TB of StepperControl_TB is

    --****INTERNAL SIGNALS****
    --Simulation timing
    constant clk_period     : time      := 25 ns;
    signal rst              : std_logic := '0';
    signal clk              : std_logic := '0';
    signal p_step           : STD_LOGIC;
    signal p_velocityTarget : STD_LOGIC_VECTOR(15 downto 0);
    signal p_acceleration   : STD_LOGIC_VECTOR(15 downto 0);
    --DUT IOs
    signal position         : natural   := 0;
    signal p_velocity : std_logic_vector(15 downto 0);
begin
    DUT : entity work.StepperControl
        generic map(
            velocity_scaling     => 2**25,
            acceleration_scaling => 1
        )
        port map(
            clk              => clk,
            rst              => rst,
            p_step           => p_step,
            p_velocityTarget => p_velocityTarget,
            p_velocity => p_velocity,
            p_acceleration   => p_acceleration,
            p_busyMoving     => open
        );

    clk <= not clk after clk_period / 2;
    rst <= '1' after clk_period / 4, '0' after clk_period / 4 * 3;

    TEST : process
        variable cycles : integer := 0;
        variable expected_velocity : integer := 0;
        variable expected_position : integer := 0;
        variable expected_max_velocity : integer := 0;
        variable expected_end_position : integer := 0;
        constant acceleration_scaling : integer := 1;
        constant velocity_scaling     : integer := 2**25;
    begin
        wait for clk_period;
        p_velocityTarget <= std_logic_vector(to_unsigned(9362, 16));
        p_acceleration   <= std_logic_vector(to_unsigned(6, 16)); -- 1/(3+1)/acceleration_scaling/velocity_scaling = 1/4

        for i in 1 to 2**16-1 loop
            wait for clk_period;
            cycles := cycles +1;
            expected_position := expected_position + expected_velocity;
            expected_velocity := cycles / ((to_integer(unsigned(p_acceleration))+1) * acceleration_scaling);
            
            assert p_velocity = std_logic_vector(to_unsigned(expected_velocity, 16))
            report integer'image(cycles) & " cycles: expected velocity to be " & integer'image(expected_velocity) & " but was " & integer'image(to_integer(unsigned(p_velocity))) severity error;
            assert position = expected_position / velocity_scaling
            report integer'image(cycles) & " cycles: expected position to be " & integer'image(expected_position / velocity_scaling) & " but was " & integer'image(position) severity error;
        end loop;

        p_velocityTarget <= std_logic_vector(to_unsigned(0, 16));
        expected_end_position := expected_position*2;
        expected_max_velocity := expected_velocity;
        cycles := 0;
        for i in 1 to 2**16-2 loop
            wait for clk_period;
            cycles := cycles +1;
            expected_position := expected_position + expected_velocity;
            expected_velocity := expected_max_velocity - cycles / ((to_integer(unsigned(p_acceleration))+1) * acceleration_scaling);
            
            assert p_velocity = std_logic_vector(to_unsigned(expected_velocity, 16))
            report integer'image(cycles) & " cycles: expected velocity to be " & integer'image(expected_velocity) & " but was " & integer'image(to_integer(unsigned(p_velocity))) severity error;
            assert position = expected_position / velocity_scaling
            report integer'image(cycles) & " cycles: expected position to be " & integer'image(expected_position / velocity_scaling) & " but was " & integer'image(position) severity error;
        end loop;

        assert position = expected_end_position / velocity_scaling
        report "expected end position to be " & integer'image(expected_position / velocity_scaling) & " but was " & integer'image(position) severity error;
        
        std.env.finish;
    end process;

    position_observer : process(p_step)
    begin
        if (rising_edge(p_step)) then
            position <= position + 1;            
        end if;
    end process position_observer;

end architecture;
