----------------------------------------------------------------------------------
-- Firma            :   Vietzke Engineering
-- Ersteller        :   Tobias Vietzke
-- 
-- Modulname        :   StepperControl
-- Projektname      :   -
-- Version          :   v1_00
-- Erstellung       :   25.05.2019
--
-- Beschreibung     :   Steuert eine Schirttmotorbewegung mit Beschleunigung.
--               
----------------------------------------------------------------------------------
--
-- Dateihistorie
--     
--      v1_00 - Erstellung der Datei
--      v2_00 - Erstellung der Datei
----------------------------------------------------------------------------------
--
-- ToDos
--     
----------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

--! @brief Vietzke Engineering
entity StepperControl is
    generic(
        g_accelerationDivideFactor    : natural := 1                  --! Module's base address
    );                
    port(   
        clk                 : in    STD_LOGIC;                      --!
        clk_enb             : in    STD_LOGIC; 
        rst                 : in    STD_LOGIC;                      --! 
        p_step              : out   STD_LOGIC;                      --! 
        p_velocityTarget    : in    STD_LOGIC_VECTOR(15 downto  0); --! 
        p_acceleration      : in    STD_LOGIC_VECTOR(15 downto  0); --! 
        p_busyMoving        : out   STD_LOGIC                       --! 
        );
end;

architecture Behavioral of StepperControl is
    -- ###############################################################################################
    -- ###############################################################################################
    -- ##                                                                                           ##
    -- ## Signaldeklarationen                                                                       ##
    -- ##                                                                                           ##
    -- ###############################################################################################
    -- ###############################################################################################   
    signal          s_pwmCounter                        : UNSIGNED(16 downto 0);
    signal          s_velocityCurrent                   : UNSIGNED(15 downto 0);
    signal          s_stepBuffer                        : STD_LOGIC;
    signal          s_clk_enb_acceleration              : STD_LOGIC;

begin
    -- ############################################################################################
    -- ############################################################################################
    -- ##                                                                                        ##
    -- ##  Komponenteninstanzen                                                                  ##
    -- ##                                                                                        ##
    -- ############################################################################################
    -- ############################################################################################
    ClockDivider : entity work.Clock_Divider
        generic map(
            gDivideFactor => g_accelerationDivideFactor
        )
        port map(
            clk             => clk,
            reset           => rst,
            clk_enb_out     => s_clk_enb_acceleration
        );
    
    -- ############################################################################################
    -- ############################################################################################
    -- ##                                                                                        ##
    -- ##  Signal- und IO Zuweisungen                                                            ##
    -- ##                                                                                        ##
    -- ############################################################################################
    -- ############################################################################################
    
    p_step <= s_stepBuffer;

    p_busyMoving <= '0' when s_velocityCurrent = to_unsigned(0, s_velocityCurrent'length) else '1';

    -- ############################################################################################
    -- ############################################################################################
    -- ##                                                                                        ##
    -- ##  Prozesse                                                                              ##
    -- ##                                                                                        ##
    -- ############################################################################################
    -- ############################################################################################
    VelocityProcess: process (clk, rst)
        variable added: UNSIGNED(16 downto 0);
    begin                                           
        if (rst = '1') then
            s_velocityCurrent <= (others => '0');
        elsif (rising_edge(clk)) then
            if (s_clk_enb_acceleration = '1') then
                added := unsigned('0' & s_velocityCurrent) + unsigned('0' & p_acceleration);                                       
                if (unsigned(s_velocityCurrent) < unsigned(p_velocityTarget) and added(16)='0') then
                    s_velocityCurrent <= s_velocityCurrent + unsigned(p_acceleration);
                elsif (unsigned(s_velocityCurrent) > unsigned(p_velocityTarget)) then
                    s_velocityCurrent <= s_velocityCurrent - unsigned(p_acceleration);
                end if;
            end if;
        end if;
    end process;

    Counter : process (clk, rst)
    begin 
        if (rst = '1') then
            s_pwmCounter <= to_unsigned(0, s_pwmCounter'length);
            s_stepBuffer <= '0';
        elsif (rising_edge(clk)) then
            if (clk_enb = '1') then
                if (s_velocityCurrent = to_unsigned(0, s_velocityCurrent'length)) then
                    s_stepBuffer <= '0';
                --elsif (s_pwmCounter >= unsigned(not s_velocityCurrent)) then
                elsif (s_pwmCounter >= X"FFFF") then
                    --s_stepBuffer <= not s_stepBuffer;
                    s_stepBuffer <= '1';
                    s_pwmCounter <= (others => '0');
                else
                    --s_stepBuffer <= s_stepBuffer;
                    s_stepBuffer <= '0';
                    s_pwmCounter <= s_pwmCounter + s_velocityCurrent;
                end if;
            end if;
        end if;
    end process counter;
    
end architecture;

