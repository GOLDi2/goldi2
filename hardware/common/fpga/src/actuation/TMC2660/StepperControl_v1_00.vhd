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
--
----------------------------------------------------------------------------------
--
-- ToDos
--     
----------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

--! @brief Vietzke Engineering
entity StepperControl_v1_00 is                
    Port        (   pClock                  : in    STD_LOGIC;                                          --! 
                    pReset                  : in    STD_LOGIC;                                          --! 
                                        
                    pStep                   : out   STD_LOGIC;                                          --! 
                                        
                    pDoStartMovement        : in    STD_LOGIC;                                          --! 
                    pDoStopMovement         : in    STD_LOGIC;                                          --!
                    pStartFrequency         : in    STD_LOGIC_VECTOR(15 downto  0);                     --! 
                    pMovementFrequency      : in    STD_LOGIC_VECTOR(15 downto  0);                     --! 
                    pAcceleration           : in    STD_LOGIC_VECTOR(15 downto  0);                     --! 
                                        
                    pBusyMoving             : out   STD_LOGIC                                           --! 
                );
end;

architecture Behavioral of StepperControl_v1_00 is

    -- ###############################################################################################
    -- ###############################################################################################
    -- ##                                                                                           ##
    -- ## Komponentendeklarationen                                                                  ##
    -- ##                                                                                           ##
    -- ###############################################################################################
    -- ###############################################################################################
    
    component Divider1MioByX_v1_00 is
        Port        (   pClock                  : in    STD_LOGIC;                     
                        pReset                  : in    STD_LOGIC;                     
                       
                        pDostart                : in    STD_LOGIC;                     
                        pX                      : in    STD_LOGIC_VECTOR (19 downto 0);
                        pQuotient               : out   STD_LOGIC_VECTOR (19 downto 0);
                        pBusy                   : out   STD_LOGIC                      
                    );
    end component;

    -- ###############################################################################################
    -- ###############################################################################################
    -- ##                                                                                           ##
    -- ## Signaldeklarationen                                                                       ##
    -- ##                                                                                           ##
    -- ###############################################################################################
    -- ###############################################################################################
    type tState is  (   z_Standby,  
                        z_StartDivider,
                        z_WaitFor1us,
                        z_ResetStep,
                        z_WaitForPeriodeTime,
                        z_Ready
                    );                    
    signal          sCurrentState                       : tState;

    type tStateM is (   z_Accelerate,  
                        z_Hold,
                        z_Deceleration
                    );                    
    signal          sMovementState                      : tStateM;

    signal          sDividerDoStart                     : STD_LOGIC;
    signal          sDividerFreqency                    : STD_LOGIC_VECTOR(19 downto 0);
    signal          sDividerPeriode                     : STD_LOGIC_VECTOR(19 downto 0);
    signal          sDividerBusy                        : STD_LOGIC;

    signal          sCounterPeriode                     : UNSIGNED(19 downto 0);
    signal          sCounter1us                         : UNSIGNED( 5 downto 0);
    signal          sCurrentFrequency                   : UNSIGNED(15 downto 0);
    signal          sAccelerateSteps                    : UNSIGNED(31 downto 0);

begin
    
    -- ############################################################################################
    -- ############################################################################################
    -- ##                                                                                        ##
    -- ##  Komponenteninstanzen                                                                  ##
    -- ##                                                                                        ##
    -- ############################################################################################
    -- ############################################################################################   
    
    Divider1MioByX_inst : Divider1MioByX_v1_00
    Port Map    (   pClock                      => pClock,  
                    pReset                      => pReset,  
                    
                    pDostart                    => sDividerDoStart,  
                    pX                          => sDividerFreqency,  
                    pQuotient                   => sDividerPeriode,  
                    pBusy                       => sDividerBusy 
                );

    -- ############################################################################################
    -- ############################################################################################
    -- ##                                                                                        ##
    -- ##  Signal- und IO Zuweisungen                                                            ##
    -- ##                                                                                        ##
    -- ############################################################################################
    -- ############################################################################################
        
    sDividerFreqency    <=  X"0" & std_logic_vector(sCurrentFrequency);
    
    sDividerDoStart     <=  '1'                      when sCurrentState = z_StartDivider else
                            '0';    
    
    pBusyMoving         <=  '0'                      when sCurrentState = z_Standby else
                            '1'; 
    
    pStep               <=  '1'                      when sCurrentState = z_WaitFor1us else
                            '0';

    -- ############################################################################################
    -- ############################################################################################
    -- ##                                                                                        ##
    -- ##  Prozesse                                                                              ##
    -- ##                                                                                        ##
    -- ############################################################################################
    -- ############################################################################################
    
    FSMProcess: process (pClock, pReset)
    begin 
        if (pReset = '1') then 
            sCurrentState <= z_StandBy; 
        elsif (rising_edge(pClock)) then 
            if (pDoStopMovement = '1') then
                sCurrentState <= z_StandBy;
            else
                case sCurrentState is                    
                    when z_Standby                          =>  if (pDoStartMovement = '1') then sCurrentState <= z_StartDivider;
                                                                else sCurrentState <= z_Standby;
                                                                end if;

                    when z_StartDivider                     =>  sCurrentState <= z_WaitFor1us; 

                    when z_WaitFor1us                       =>  if (sCounter1us = 48) then sCurrentState <= z_ResetStep;
                                                                else sCurrentState <= z_WaitFor1us;    
                                                                end if;  

                    when z_ResetStep                        =>  sCurrentState <= z_WaitForPeriodeTime;     

                    when z_WaitForPeriodeTime               =>  if (sCounterPeriode = unsigned(sDividerPeriode)) then sCurrentState <= z_StartDivider;
                                                                else sCurrentState <= z_WaitForPeriodeTime;    
                                                                end if;  
                                                                
                    when others                             =>  sCurrentState <= z_StandBy;        
                end case;
            end if;
        end if;
    end process;
 
    CounterProcess: process (pClock, pReset)
    begin                                                                                  
        if (pReset = '1') then                                                           
            sCounter1us     <= to_unsigned(0,sCounter1us'length); 
            sCounterPeriode <= to_unsigned(0,sCounterPeriode'length);
        elsif (rising_edge(pClock)) then  
            if (sCurrentState = z_WaitFor1us or
                sCurrentState = z_WaitForPeriodeTime) then  
                if (sCounter1us = to_unsigned(48, sCounter1us'length)) then
                    sCounter1us <= to_unsigned(0,sCounter1us'length); 
                else
                    sCounter1us <= sCounter1us + 1;    
                end if;
            else    
                sCounter1us <= to_unsigned(0,sCounter1us'length);           
            end if;
            
            if (sCurrentState = z_WaitForPeriodeTime) then
                if (sCounter1us = to_unsigned(48, sCounter1us'length)) then
                    sCounterPeriode <= sCounterPeriode + 1;
                end if;
            else
                sCounterPeriode <= to_unsigned(0,sCounterPeriode'length);
            end if;
        end if;
    end process;

    FrequencyProcess: process (pClock, pReset)
    begin                                                                                  
        if (pReset = '1') then                                                      
            sAccelerateSteps    <= to_unsigned(0, sAccelerateSteps'length);
            sMovementState      <= z_Accelerate;
        elsif (rising_edge(pClock)) then  
            if (sCurrentState = z_StandBy) then 
                sMovementState      <= z_Accelerate;
                sAccelerateSteps    <= to_unsigned(0, sAccelerateSteps'length);
                if (pStartFrequency = std_logic_vector(to_unsigned(0, pStartFrequency'length))) then
                    sCurrentFrequency <= to_unsigned(1, sCurrentFrequency'length);
                else
                    sCurrentFrequency <= unsigned(pStartFrequency);   
                end if;
            elsif (sCurrentState = z_WaitForPeriodeTime) then
                if (sCounterPeriode = unsigned(sDividerPeriode)) then
                    if (sMovementState = z_Accelerate) then
                        if ((sCurrentFrequency + unsigned(pAcceleration)) > unsigned(pMovementFrequency)) then
                            sCurrentFrequency   <= unsigned(pMovementFrequency);
                            sMovementState      <= z_Hold;
                        else
                            sCurrentFrequency <= sCurrentFrequency + unsigned(pAcceleration);      
                            sAccelerateSteps <= sAccelerateSteps + 1;                      
                        end if;
                    end if;
                end if;
            end if;
        end if;
    end process;
                
end architecture;

