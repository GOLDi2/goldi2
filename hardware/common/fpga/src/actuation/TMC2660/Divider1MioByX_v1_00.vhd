----------------------------------------------------------------------------------
-- Firma            :   Vietzke Engineering
-- Ersteller        :   Tobias Vietzke
-- 
-- Modulname        :   Divider1MioByX
-- Projektname      :   -
-- Version          :   v1_00
-- Erstellung       :   25.05.2019
--
-- Beschreibung     :   Teilt 1.000.000 durch X.
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
entity Divider1MioByX_v1_00 is
    Port        (   pClock                  : in    STD_LOGIC;                                          --! 
                    pReset                  : in    STD_LOGIC;                                          --! 
                   
                    pDostart                : in    STD_LOGIC;                                          --!
                    pX                      : in    STD_LOGIC_VECTOR (19 downto 0);                     --! 
                    pQuotient               : out   STD_LOGIC_VECTOR (19 downto 0);                     --! 
                    pBusy                   : out   STD_LOGIC                                           --! 
                );
end entity;

architecture Behavioral of Divider1MioByX_v1_00 is

    -- ###############################################################################################
    -- ###############################################################################################
    -- ##                                                                                           ##
    -- ## Signaldeklarationen                                                                       ##
    -- ##                                                                                           ##
    -- ###############################################################################################
    -- ###############################################################################################

    signal          sDividend                           : UNSIGNED(19 downto 0);
    signal          sDivisor                            : UNSIGNED(19 downto 0);
    signal          sQuotient                           : UNSIGNED(19 downto 0); 
    signal          sRemainder                          : UNSIGNED(19 downto 0);
    signal          sBits                               : INTEGER range 20 downto 0;

    type tState is  (   z_Idle, 
                        z_Prepare, 
                        z_Shift, 
                        z_Subtract, 
                        z_Done
                    );
    signal          sCurrentState                       : tState;

begin
    
    pQuotient <= std_logic_vector(sQuotient);

    FSMProcess : process(pClock, pReset)   
    variable vDifference : unsigned(19 downto 0);
    begin
        if (pReset = '1') then
            sCurrentState   <= z_Idle;
            pBusy           <= '0';
            sQuotient       <= (others=>'0');
            sRemainder      <= (others=>'0');
            sBits           <= 20;
            sDividend       <= X"F4240"; -- 1.000.000   
        elsif rising_edge(pClock) then
            case sCurrentState is 
                when z_Idle             =>  if (pDoStart = '1') then 
                                                sCurrentState<= z_Prepare; 
                                                pBusy <= '1';
                                            end if;
                                            sDivisor    <= unsigned(pX);
                                            sDividend   <= to_unsigned(1000000, 20);
                                            
                when z_Prepare          =>  sQuotient       <= (others=>'0');
                                            sRemainder      <= (others=>'0');
                                            sCurrentState   <= z_Shift;            
                                            sBits           <= 20;
                                            
                                            -- Sonderfall: Division durch Null
                                            if (sDivisor=0) then  
                                                sQuotient <= (others=>'1');
                                                sRemainder <= (others=>'1');
                                                sCurrentState<= z_Done;
                                            -- Sonderfall: Divisor größer als Dividend
                                            elsif (sDivisor>sDividend) then 
                                                sRemainder <= sDividend;
                                                sCurrentState<= z_Done;
                                            -- Sonderfall: Divisor gleich Dividend
                                            elsif (sDivisor=sDividend) then
                                                sQuotient <= to_unsigned(1,20);
                                                sCurrentState<= z_Done;
                                            end if;

                when z_Shift            =>  if ((sRemainder(18 downto 0)& sDividend(19)) < sDivisor ) then
                                               sBits        <= sBits-1;
                                               sRemainder   <= sRemainder(18 downto 0)& sDividend(19);
                                               sDividend    <= sDividend(18 downto 0)& '0';
                                            else
                                               sCurrentState   <= z_Subtract;
                                            end if;

                when z_Subtract         =>  if (sBits > 0) then
                                                sRemainder   <= sRemainder(18 downto 0) & sDividend(19);
                                                sDividend    <= sDividend(18 downto 0) & '0';
                                                
                                                -- Rest minus Divisor
                                                vDifference := (sRemainder(18 downto 0)&sDividend(19)) - sDivisor;  
                                                if (vDifference(19)='0') then                 
                                                    -- wenn kein Unterlauf 
                                                    --> Divisor passt noch rein 
                                                    --> MSB=0 --> 1 in Ergebnis einschieben
                                                    sQuotient <= sQuotient(18 downto 0) & '1';
                                                    sRemainder <= vDifference;
                                                else
                                                    -- wenn Unterlauf 
                                                    --> 0 einschieben, mit altem Wert weiterrechnen
                                                    sQuotient <= sQuotient(18 downto 0) & '0';
                                                end if;
                                                sBits <= sBits-1;
                                            else
                                               sCurrentState   <= z_Done;
                                            end if;
            
                when z_Done             =>  pBusy <= '0';
                                            if (pDoStart='0') then 
                                               sCurrentState<= z_Idle; 
                                            end if;
            end case;    
        end if;
    end process;  
    
end architecture;