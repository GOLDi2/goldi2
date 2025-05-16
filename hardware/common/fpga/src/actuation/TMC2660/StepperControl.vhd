library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

--! @brief StepperControl
--! @details This module controls the stepper motor by generating a PWM signal
--!          based on the desired velocity and acceleration. It uses a clock divider
--!          to manage the acceleration and velocity changes.
--! @param velocity_scaling     The scaling factor for the velocity.
--! @param acceleration_scaling The scaling factor for the acceleration.
--!
--! @param p_velocityTarget is the target velocity for the stepper motor.
--!        To calculate the velocity in steps per second, use the formula:
--!             velocity [steps/s] = p_velocityTarget * clk_frequency / velocity_scaling
--! @param p_acceleration is the acceleration value for the stepper motor.
--!        To calculate the acceleration in steps per second squared, use the formula:
--!             acceleration [steps/s^2] = 1/(p_acceleration+1) * (clk_frequency**2 / (acceleration_scaling*velocity_scaling))

entity StepperControl is
    generic(
        velocity_scaling     : natural;
        acceleration_scaling : natural
    );
    port(
        clk              : in  std_logic;
        rst              : in  std_logic;
        p_step           : out std_logic;
        p_velocityTarget : in  std_logic_vector(15 downto 0);
        p_velocity : out  std_logic_vector(15 downto 0);
        p_acceleration   : in  std_logic_vector(15 downto 0);
        p_busyMoving     : out std_logic
    );
end;

architecture Behavioral of StepperControl is
    constant c_pwm_counter_top    : integer := velocity_scaling/2;
    signal s_pwm_counter          : integer range 0 to c_pwm_counter_top - 1 + 2 ** 16 - 1;
    signal s_acceleration_counter : integer range 0 to 2 ** 16 - 1;
    signal s_velocity             : integer range 0 to 2 ** 16 - 1;
    signal s_step                 : std_logic := '1';
    signal s_clk_enb_acceleration : std_logic;
begin
    ClockDivider : entity work.Clock_Divider
        generic map(
            gDivideFactor => acceleration_scaling
        )
        port map(
            clk         => clk,
            reset       => rst,
            clk_enb_out => s_clk_enb_acceleration
        );

    VelocityCounter : process(clk, rst)
    begin
        if (rst = '1') then
            s_velocity             <= 0;
            s_acceleration_counter <= 0;
        elsif (rising_edge(clk)) then
            if (s_clk_enb_acceleration = '1') then
                if (s_acceleration_counter >= to_integer(unsigned(p_acceleration))) then
                    s_acceleration_counter <= 0;
                    if (s_velocity < to_integer(unsigned(p_velocityTarget))) then
                        s_velocity <= s_velocity + 1;
                    elsif (s_velocity > to_integer(unsigned(p_velocityTarget))) then
                        s_velocity <= s_velocity - 1;
                    end if;
                else
                    if (s_velocity < to_integer(unsigned(p_velocityTarget)) or s_velocity > to_integer(unsigned(p_velocityTarget))) then
                        s_acceleration_counter <= s_acceleration_counter + 1;
                    else
                        s_acceleration_counter <= 0;
                    end if;
                end if;
            end if;
        end if;
    end process;

    PWMCounter : process(clk, rst)
    begin
        if (rst = '1') then
            s_pwm_counter <= 0;
            s_step        <= '1';
        elsif (rising_edge(clk)) then
            if (s_velocity = 0) then
                s_pwm_counter <= 0;
                s_step        <= s_step;
            elsif (s_pwm_counter + s_velocity >= c_pwm_counter_top) then
                s_pwm_counter <= s_pwm_counter + s_velocity - c_pwm_counter_top;
                s_step        <= not s_step;
            else
                s_pwm_counter <= s_pwm_counter + s_velocity;
                s_step        <= s_step;
            end if;
        end if;
    end process;

    p_step <= s_step;

    p_busyMoving <= '0' when s_velocity = 0 else '1';
    p_velocity <= std_logic_vector(to_unsigned(s_velocity, 16));

end architecture;
