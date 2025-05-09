library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;
use std.standard.all;
use std.env.all;
--! Use custom packages
use work.GOLDI_MODULE_CONFIG.all;
use work.GOLDI_IO_STANDARD.all;
use work.GOLDI_COMM_STANDARD.all;

--! Functionality simulation
entity ACTUATOR_MASK_TB is
end entity ACTUATOR_MASK_TB;

--! Simulation architecture
architecture TB of ACTUATOR_MASK_TB is
    signal p_sys_io_i  : io_i_vector(PHYSICAL_PIN_NUMBER - 1 downto 0) := (others => gnd_io_i);
    signal p_sys_io_o  : io_o_vector(PHYSICAL_PIN_NUMBER - 1 downto 0) := (others => gnd_io_o);
    signal p_safe_io_o : io_o_vector(PHYSICAL_PIN_NUMBER - 1 downto 0);
    alias x_enable_s   : std_logic is p_safe_io_o(17).dat;
    alias x_out_pos_s  : std_logic is p_safe_io_o(18).dat;
    alias x_out_neg_s  : std_logic is p_safe_io_o(19).dat;
    alias y_enable_s   : std_logic is p_safe_io_o(20).dat;
    alias y_out_neg_s  : std_logic is p_safe_io_o(21).dat;
    alias y_out_pos_s  : std_logic is p_safe_io_o(22).dat;
    alias z_enable_s   : std_logic is p_safe_io_o(23).dat;
    alias z_out_pos_s  : std_logic is p_safe_io_o(24).dat;
    alias z_out_neg_s  : std_logic is p_safe_io_o(25).dat;

    signal input_values : std_logic_vector(16 downto 0);
    alias limit_x_neg   : std_logic is input_values(0);
    alias limit_x_pos   : std_logic is input_values(1);
    alias limit_x_ref   : std_logic is input_values(2);
    alias limit_y_neg   : std_logic is input_values(3);
    alias limit_y_pos   : std_logic is input_values(4);
    alias limit_y_ref   : std_logic is input_values(5);
    alias limit_z_neg   : std_logic is input_values(6);
    alias limit_z_pos   : std_logic is input_values(7);
    alias x_enable      : std_logic is input_values(8);
    alias x_out_pos     : std_logic is input_values(9);
    alias x_out_neg     : std_logic is input_values(10);
    alias y_enable      : std_logic is input_values(11);
    alias y_out_pos     : std_logic is input_values(12);
    alias y_out_neg     : std_logic is input_values(13);
    alias z_enable      : std_logic is input_values(14);
    alias z_out_pos     : std_logic is input_values(15);
    alias z_out_neg     : std_logic is input_values(16);

begin
    DUT : entity work.ACTUATOR_MASK
        port map(
            p_sys_io_i  => p_sys_io_i,
            p_sys_io_o  => p_sys_io_o,
            p_safe_io_o => p_safe_io_o
        );

    --****SIGNAL ASSIGNMENT****
    --Sensors
    p_sys_io_i(2).dat  <= limit_x_neg;
    p_sys_io_i(3).dat  <= limit_x_pos;
    p_sys_io_i(4).dat  <= limit_x_ref;
    p_sys_io_i(5).dat  <= limit_y_neg;
    p_sys_io_i(6).dat  <= limit_y_pos;
    p_sys_io_i(7).dat  <= limit_y_ref;
    p_sys_io_i(8).dat  <= limit_z_neg;
    p_sys_io_i(9).dat  <= limit_z_pos;
    --Actuators
    p_sys_io_o(17).dat <= x_enable;
    p_sys_io_o(18).dat <= x_out_pos;
    p_sys_io_o(19).dat <= x_out_neg;
    p_sys_io_o(20).dat <= y_enable;
    p_sys_io_o(21).dat <= y_out_neg;
    p_sys_io_o(22).dat <= y_out_pos;
    p_sys_io_o(23).dat <= z_enable;
    p_sys_io_o(24).dat <= z_out_pos;
    p_sys_io_o(25).dat <= z_out_neg;

    --
    TEST : process
        constant assert_hold : time := 5 ns;
        constant post_hold   : time := 5 ns;
    begin
        for i in 0 to (2 ** 17) - 1 loop
            --Simulate possible gpio values
            input_values <= std_logic_vector(to_unsigned(i, 17));

            wait for assert_hold;
            --Mask tests
            --X_Enable channel
            if ((limit_x_neg = '1' and limit_x_pos = '1') or (limit_x_neg = '1' and limit_x_ref = '1') or (limit_x_pos = '1' and limit_x_ref = '1') or (x_out_pos = '1' and x_out_neg = '1') or (limit_z_pos = '0' and x_enable = '1')) then

                assert (x_enable_s = '0')
                report "ID01: Expecting x_enable_s disabled" severity error;
            end if;

            --X_Out_Pos Channel
            if ((limit_x_pos = '1') or (limit_x_neg = '1' and limit_x_ref = '1') or (x_out_pos = '1' and x_out_neg = '1') or (limit_z_pos = '0')) then

                assert (x_out_pos_s = '0')
                report "ID02: Expecting x_out_pos_s disabled" severity error;
            end if;

            --X_Out_Neg Channel
            if ((limit_x_neg = '1') or (limit_x_pos = '1' and limit_x_ref = '1') or (x_out_pos = '1' and x_out_neg = '1') or (limit_z_pos = '0')) then

                assert (x_out_neg_s = '0')
                report "ID03: Expecting x_out_neg_s disabled" severity error;
            end if;

            --Y_Enable Channel
            if ((limit_y_neg = '1' and limit_y_pos = '1') or (limit_y_neg = '1' and limit_y_ref = '1') or (limit_y_pos = '1' and limit_y_ref = '1') or (y_out_pos = '1' and y_out_neg = '1') or (limit_z_pos = '0')) then

                assert (y_enable_s = '0')
                report "ID04: Expecting y_enable_s disabled" severity error;
            end if;

            --Y_Out_Neg Channel
            if ((limit_y_neg = '1') or (limit_y_pos = '1' and limit_y_ref = '1') or (y_out_pos = '1' and y_out_neg = '1') or (limit_z_pos = '0')) then

                assert (y_out_neg_s = '0')
                report "ID05: Expecting y_out_neg_s disabled" severity error;
            end if;

            --Y_Out_Pos Channel
            if ((limit_y_pos = '1') or (limit_y_neg = '1' and limit_y_ref = '1') or (y_out_pos = '1' and y_out_neg = '1') or (limit_z_pos = '0')) then

                assert (y_out_pos_s = '0')
                report "ID06: Expecting y_out_pos_s disabled" severity error;
            end if;

            --Z_Enable Channel
            if ((limit_z_neg = '1' and limit_z_pos = '1') or (z_out_pos = '1' and z_out_neg = '1')) then

                assert (z_enable_s = '0')
                report "ID07: Expecting z_enable_s disabled" severity error;
            end if;

            --Z_Out_Pos Channel
            if ((limit_z_pos = '1') or (z_out_pos = '1' and z_out_neg = '1')) then

                assert (z_out_pos_s = '0')
                report "ID07: Expecting z_out_pos_s disabled" severity error;
            end if;

            --Z_Out_Neg Channel
            if ((limit_z_neg = '1') or (z_out_pos = '1' and z_out_neg = '1')) then

                assert (z_out_neg_s = '0')
                report "ID08: Expecting z_out_neg_s disabled" severity error;
            end if;

            wait for post_hold;
        end loop;

        std.env.finish;

    end process;

end architecture;
