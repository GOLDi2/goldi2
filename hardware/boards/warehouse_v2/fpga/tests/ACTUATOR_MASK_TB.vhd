-- -------------------------------------------------------------------------------
-- -- Company:			Technische Universitaet Ilmenau
-- -- Engineer:		JP_CC <josepablo.chew@gmail.com>
-- --
-- -- Create Date:		30/04/2023
-- -- Design Name:		Actuator mask for damage prevention testbench 
-- -- Module Name:		ACTUATOR_MASK_TB
-- -- Project Name:	GOLDi_FPGA_SRC
-- -- Target Devices:	LCMXO2-7000HC-4TG144C
-- -- Tool versions:	Lattice Diamond 3.12, Modelsim Lattice Edition,  
-- --
-- -- Dependencies:	-> GOLDI_IO_STANDARD.vhd
-- --                  -> GOLDI_DATA_TYPES.vhd
-- --                  -> GOLDI_MODULE_CONFIG.vhd
-- --                  -> VIRTUAL_SENSOR_ARRAY.vhd
-- --                  -> EDGE_DETECTOR.vhd
-- --
-- -- Revisions:
-- -- Revision V1.00.00 - File Created
-- -- Additional Comments: First commitment
-- --
-- -- Revision V2.00.00 - First release
-- -- Additional Comments:
-- -------------------------------------------------------------------------------
-- --! Use standard library
-- library IEEE;
-- use IEEE.std_logic_1164.all;
-- use IEEE.numeric_std.all;
-- --! Use custom packages
-- library work;
-- use work.GOLDI_IO_STANDARD.all;
-- use work.GOLDI_DATA_TYPES.all;
-- use work.GOLDI_MODULE_CONFIG.all;



-- entity ACTUATOR_MASK_TB is
-- end entity ACTUATOR_MASK_TB;




-- architecture TB of ACTUATOR_MASK_TB is

--     --****DUT****
--     component ACTUATOR_MASK
--         generic(
--             ENC_X_INVERT    :   boolean := false;
--             ENC_Z_INVERT    :   boolean := false;
--             X_BORDER_MARGIN :   integer := 10;
--             Z_BORDER_MARGIN :   integer := 10;
--             LIMIT_X_SENSORS :   sensor_limit_array(9 downto 0);
--             LIMIT_Z_SENSORS :   sensor_limit_array(4 downto 0)
--         );
--         port(
--             clk             : in    std_logic;
--             rst             : in    std_logic;
--             rst_virtual_x   : in    std_logic;
--             rst_virtual_z   : in    std_logic;
--             hold_x_motor    : in    std_logic;
--             hold_y_motor    : in    std_logic;
--             hold_z_motor    : in    std_logic;
--             sys_io_i        : in    io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
--             sys_io_o        : in    io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
--             safe_io_o       : out   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0)
--         );
--     end component;


--     --****INTERNAL SIGNALS****
--     --Simulation timing
--     constant clk_period		:	time := 10 ns;
-- 	signal reset			:	std_logic := '0';
-- 	signal clock			:	std_logic := '0';
-- 	signal run_sim			:	std_logic := '1';
--     --DUT IOs
--     constant X_LIMITS       :   sensor_limit_array(9 downto 0) := (
--         0 => (  0,10),
--         1 => (100,10),
--         2 => (200,10),
--         3 => (300,10),
--         4 => (400,10),
--         5 => (500,10),
--         6 => (600,10),
--         7 => (700,10),
--         8 => (800,10),
--         9 => (900,10)
--     );
--     constant Z_LIMITS       :   sensor_limit_array(4 downto 0) := (
--         0 => (  0,10),
--         1 => (100,10),
--         2 => (200,10),
--         3 => (300,10),
--         4 => (400,10)
--     );

--     signal sys_io_i             :   io_i_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
--     signal sys_io_o             :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
--     signal sys_io_o_safe        :   io_o_vector(PHYSICAL_PIN_NUMBER-1 downto 0);
--         alias motor_x_step_s    :   std_logic is sys_io_o_safe(18).dat;
--         alias motor_x_dir_s     :   std_logic is sys_io_o_safe(19).dat;
--         alias motor_y_enb_s     :   std_logic is sys_io_o_safe(24).dat; 
--         alias motor_y_out_1_s   :   std_logic is sys_io_o_safe(25).dat;
--         alias motor_y_out_2_s   :   std_logic is sys_io_o_safe(26).dat;
--         alias motor_z_step_s    :   std_logic is sys_io_o_safe(30).dat;
--         alias motor_z_dir_s     :   std_logic is sys_io_o_safe(31).dat;
--     signal inputs               :   std_logic_vector(12 downto 0);
--         alias limit_x_neg       :   std_logic is inputs(0);
--         alias limit_x_pos       :   std_logic is inputs(1);
--         alias limit_y_neg       :   std_logic is inputs(2);
--         alias limit_y_pos       :   std_logic is inputs(3);
--         alias limit_z_neg       :   std_logic is inputs(4);
--         alias limit_z_pos       :   std_logic is inputs(5);
--         alias motor_x_step      :   std_logic is inputs(6);
--         alias motor_x_dir       :   std_logic is inputs(7);
--         alias motor_y_enb       :   std_logic is inputs(8);
--         alias motor_y_out_1     :   std_logic is inputs(9);
--         alias motor_y_out_2     :   std_logic is inputs(10);
--         alias motor_z_step      :   std_logic is inputs(11);
--         alias motor_z_dir       :   std_logic is inputs(12);
--     signal encoders             :   std_logic_vector(1 downto 0);


-- begin

--     --****COMPONENT****
--     -----------------------------------------------------------------------------------------------
--     DUT : ACTUATOR_MASK
--     generic map(
--         ENC_X_INVERT    => false,
--         ENC_Z_INVERT    => false,
--         X_BORDER_MARGIN => 4,   
--         Z_BORDER_MARGIN => 4,
--         LIMIT_X_SENSORS => X_LIMITS,
--         LIMIT_Z_SENSORS => Z_LIMITS
--     )
--     port map(
--         clk             => clock,
--         rst             => reset,
--         sys_io_i        => sys_io_i,
--         sys_io_o        => sys_io_o,
--         safe_io_o       => sys_io_o_safe
--     );
--     -----------------------------------------------------------------------------------------------



--     --****SIMULATION TIMING****
-- 	-----------------------------------------------------------------------------------------------
-- 	clock <= run_sim and (not clock) after clk_period/2;
-- 	reset <= '1' after 5 ns, '0' after 15 ns;
-- 	-----------------------------------------------------------------------------------------------



--     --****IO ROUTING****
--     -----------------------------------------------------------------------------------------------
--     --Inputs
--     sys_io_i(1 downto 0)                <= (others => gnd_io_i);
--     sys_io_i(2).dat                     <= inputs(0);
--     sys_io_i(3).dat                     <= inputs(1);
--     sys_io_i(4).dat                     <= inputs(2);    
--     sys_io_i(5).dat                     <= inputs(3);    
--     sys_io_i(6).dat                     <= inputs(4);    
--     sys_io_i(7).dat                     <= inputs(5);    
--     sys_io_i(8)                         <= gnd_io_i;
--     sys_io_i(9).dat                     <= encoders(0);
--     sys_io_i(10).dat                    <= encoders(1);
--     sys_io_i(11)                        <= gnd_io_i;
--     sys_io_i(12).dat                    <= encoders(0);
--     sys_io_i(13).dat                    <= encoders(1);
--     sys_io_i(sys_io_i'left downto 14)   <= (others => gnd_io_i);

--     --Outputs
--     sys_io_o(17 downto 0)               <= (others => gnd_io_o);
--     sys_io_o(18).enb                    <= '1';
--     sys_io_o(18).dat                    <= inputs(6);
--     sys_io_o(19).enb                    <= '1';
--     sys_io_o(19).dat                    <= inputs(7);
--     sys_io_o(23 downto 20)              <= (others => gnd_io_o);
--     sys_io_o(24).enb                    <= '1';
--     sys_io_o(24).dat                    <= inputs(8);
--     sys_io_o(25).enb                    <= '1';
--     sys_io_o(25).dat                    <= inputs(9);
--     sys_io_o(26).enb                    <= '1';
--     sys_io_o(26).dat                    <= inputs(10);
--     sys_io_o(29 downto 27)              <= (others => gnd_io_o);
--     sys_io_o(30).enb                    <= '1';
--     sys_io_o(30).dat                    <= inputs(11);
--     sys_io_o(31).enb                    <= '1';
--     sys_io_o(31).dat                    <= inputs(12);
--     -----------------------------------------------------------------------------------------------



--     --****TEST****
--     -----------------------------------------------------------------------------------------------
--     TEST : process
--         --Timing 
--         variable init_hold      :   time := 5*clk_period/2;
--         variable assert_hold    :   time := 490 us;
--         variable post_hold      :   time := 10 us;
--     begin
--         --Preset signals
--         encoders <= (others => '0');
--         inputs   <= (others => '0');
--         wait for init_hold;


--         --**Test physical sensors**
--         -- for i in 0 to 2**13-1 loop
--         --     --Input data
--         --     inputs <= std_logic_vector(to_unsigned(i,inputs'length));

--         --     --X Motor
--         --     wait for assert_hold;
--         --     if(limit_x_neg = '1' and limit_x_pos = '1') then
--         --         assert(motor_x_step_s = '0')
--         --         report"line(204): Test physical sensors - limit_x_neg and limit_x_pos [" & integer'image(i) & "]"
--         --         severity error;
--         --     end if;

--         --     if(limit_x_neg = '1' and motor_x_dir = '0') then
--         --         assert(motor_x_step_s = '0')
--         --         report"line(210): Test physical sensors - limit_x_neg and dir_neg [" & integer'image(i) & "]"
--         --         severity error;
--         --     end if;

--         --     if(limit_x_pos = '1' and motor_x_dir = '1') then
--         --         assert(motor_x_step_s = '0')
--         --         report"line(216): Test physical sensors - limit_x_pos and dir_pos [" & integer'image(i) & "]"
--         --         severity error;
--         --     end if;


--         --     --Y Motor
--         --     if(limit_y_neg = '1' and limit_y_pos = '1') then
--         --         assert(motor_y_enb_s = '0')
--         --         report"line(222): Test physical sensors - limit_y_neg and limit_y_pos [" & integer'image(i) & "]"
--         --         severity error;
--         --     end if;

--         --     if(limit_y_neg = '1' and motor_y_out_2 = '1') then
--         --         assert(motor_y_enb_s = '0')
--         --         report"line(228): Test physical sensors - limit_y_neg and out_2 [" & integer'image(i) & "]"
--         --         severity error;
--         --     end if;

--         --     if(limit_y_pos = '1' and motor_y_out_1 = '1') then
--         --         assert(motor_y_enb_s = '0')
--         --         report"line(234): Test physical sensors - limit_y_pos and out_1 [" & integer'image(i) & "]"
--         --         severity error;
--         --     end if;


--         --     --Z Motor
--         --     wait for assert_hold;
--         --     if(limit_z_neg = '1' and limit_z_pos = '1') then
--         --         assert(motor_z_step_s = '0')
--         --         report"line(246): Test physical sensors - limit_z_neg and limit_z_pos [" & integer'image(i) & "]"
--         --         severity error;
--         --     end if;

--         --     if(limit_z_neg = '1' and motor_z_dir = '0') then
--         --         assert(motor_z_step_s = '0')
--         --         report"line(252): Test physical sensors - limit_z_neg and dir_neg [" & integer'image(i) & "]"
--         --         severity error;
--         --     end if;

--         --     if(limit_z_pos = '1' and motor_z_dir = '1') then
--         --         assert(motor_z_step_s = '0')
--         --         report"line(258): Test physical sensors - limit_z_pos and dir_pos [" & integer'image(i) & "]"
--         --         severity error;
--         --     end if;

--         --     wait for post_hold;
--         -- end loop;
--         -- inputs <= (others => '0');


--         wait for 5*clk_period;
        
        
--         --****Test virtual boxes****
--         --Test right & top flags
--         motor_x_step <= '1';
--         motor_x_dir  <= '1';
--         motor_z_step <= '1';
--         motor_z_dir  <= '1';
--         encoders(0)  <= '0';
--         encoders(1)  <= '1';
--         wait for 8*clk_period;
--         for i in 1 to 1000 loop
--             encoders(0) <= not encoders(0);

--             --Asset cases X virtual limits
--             wait for 5*clk_period/2;  
--             if(i <= 6) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(290): Test right flags - expecting x_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(90 <= i and i <= 106) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(294): Test right flags - expecting x_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(190 <= i and i <= 206) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(298): Test right flags - expecting x_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(290 <= i and i <= 306) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(302): Test right flags - expecting x_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(390 <= i and i <= 406) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(306): Test right flags - expecting x_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(490 <= i and i <= 506) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(310): Test right flags - expecting x_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(590 <= i and i <= 606) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(314): Test right flags - expecting x_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(690 <= i and i <= 706) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(318): Test right flags - expecting x_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(790 <= i and i <= 806) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(322): Test right flags - expecting x_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(890 <= i and i <= 906) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(226): Test right flags - expecting x_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             else
--                 assert(motor_x_step_s = '0')    
--                 report "line(330): Test right flags - expecting x_step = '0' [" & integer'image(i) & "]"
--                 severity error;
--             end if;

--             --Asset cases Z virtual limits
--             if(i <= 6) then
--                 assert(motor_z_step_s = '1')    
--                 report "line(338): Test top flags - expecting z_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(90 <= i and i <= 106) then
--                 assert(motor_z_step_s = '1')    
--                 report "line(342): Test top flags - expecting z_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(190 <= i and i <= 206) then
--                 assert(motor_z_step_s = '1')    
--                 report "line(346): Test top flags - expecting z_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(290 <= i and i <= 306) then
--                 assert(motor_z_step_s = '1')    
--                 report "line(350): Test top flags - expecting z_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             elsif(390 <= i and i <= 406) then
--                 assert(motor_z_step_s = '1')    
--                 report "line(354): Test top flags - expecting z_step = '1' [" & integer'image(i) & "]"
--                 severity error;
--             else
--                 assert(motor_z_step_s = '0')    
--                 report "line(358): Test top flags - expecting z_step = '0' [" & integer'image(i) & "]"
--                 severity error;
--             end if;
--             wait for 3*clk_period/2;

--             encoders(1) <= not encoders(1);
--             wait for 4*clk_period;
--         end loop;


--         wait for 5*clk_period;


--         --Test left & bottom flags
--         motor_x_step <= '1';
--         motor_x_dir  <= '0';
--         motor_z_step <= '1';
--         motor_z_dir  <= '0';
--         encoders(0)  <= '0';
--         encoders(1)  <= '0';
--         wait for 4*clk_period;
--         for i in 0 to 999 loop
--             encoders(0) <= not encoders(0);

--             --Asset cases X virtual limits
--             wait for 5*clk_period/2;
--             if(999-i <= 10) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(386): Test left flags - expecting z_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;  
--             elsif(94 <= 999-i and 999-i <= 110) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(390): Test left flags - expecting x_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(194 <= 999-i and 999-i <= 210) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(394): Test left flags - expecting x_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(294 <= 999-i and 999-i <= 310) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(398): Test left flags - expecting x_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(394 <= 999-i and 999-i <= 410) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(402): Test left flags - expecting x_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(494 <= 999-i and 999-i <= 510) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(406): Test left flags - expecting x_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(594 <= 999-i and 999-i <= 610) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(410): Test left flags - expecting x_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(694 <= 999-i and 999-i <= 710) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(414): Test left flags - expecting x_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(794 <= 999-i and 999-i <= 810) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(418): Test left flags - expecting x_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(894 <= 999-i and 999-i <= 910) then
--                 assert(motor_x_step_s = '1')    
--                 report "line(422): Test left flags - expecting x_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             else
--                 assert(motor_x_step_s = '0')    
--                 report "line(426): Test left flags - expecting x_step = '0' [" & integer'image(999-i) & "]"
--                 severity error;
--             end if;

--             --Asset cases Z virtual limits
--             if(999-i <= 10) then
--                 assert(motor_z_step_s = '1')    
--                 report "line(433): Test bottom flags - expecting z_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(94 <= 999-i and 999-i <= 110) then
--                 assert(motor_z_step_s = '1')    
--                 report "line(437): Test bottom flags - expecting z_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(194 <= 999-i and 999-i <= 210) then
--                 assert(motor_z_step_s = '1')    
--                 report "line(441): Test bottom flags - expecting z_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(294 <= 999-i and 999-i <= 310) then
--                 assert(motor_z_step_s = '1')    
--                 report "line(445): Test bottom flags - expecting z_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             elsif(394 <= 999-i and 999-i <= 410) then
--                 assert(motor_z_step_s = '1')    
--                 report "line(449): Test bottom flags - expecting z_step = '1' [" & integer'image(999-i) & "]"
--                 severity error;
--             else
--                 assert(motor_z_step_s = '0')    
--                 report "line(453): Test bottom flags - expecting z_step = '0' [" & integer'image(999-i) & "]"
--                 severity error;
--             end if;
--             wait for 3*clk_period/2;

--             encoders(1) <= not encoders(1);
--             wait for 4*clk_period;
--         end loop;



--         --End simulation
--         wait for 50 ns;
--         run_sim <= '0';
--         wait;

--     end process;
--     -----------------------------------------------------------------------------------------------


-- end TB;