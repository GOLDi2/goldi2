library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity protection is
    port(
        --
        InProximity         : in  std_logic; -- @suppress "Unused port: InProximity is not used in work.protection(RTL)"
        InIncrY_I           : in  std_logic; -- @suppress "Unused port: InIncrY_I is not used in work.protection(RTL)"
        InIncrY_B           : in  std_logic; -- @suppress "Unused port: InIncrY_B is not used in work.protection(RTL)"
        InIncrY_A           : in  std_logic; -- @suppress "Unused port: InIncrY_A is not used in work.protection(RTL)"
        InIncrX_I           : in  std_logic; -- @suppress "Unused port: InIncrX_I is not used in work.protection(RTL)"
        InIncrX_B           : in  std_logic; -- @suppress "Unused port: InIncrX_B is not used in work.protection(RTL)"
        InIncrX_A           : in  std_logic; -- @suppress "Unused port: InIncrX_A is not used in work.protection(RTL)"
        InZBottom           : in  std_logic;
        InZTop              : in  std_logic;
        InYRef              : in  std_logic; -- @suppress "Unused port: InYRef is not used in work.protection(RTL)"
        InYBack             : in  std_logic;
        InYFront            : in  std_logic;
        InXRef              : in  std_logic; -- @suppress "Unused port: InXRef is not used in work.protection(RTL)"
        InXRight            : in  std_logic;
        InXLeft             : in  std_logic;
        --
        EnableDCX           : out std_logic;
        OutDCX_A            : out std_logic;
        OutDCX_B            : out std_logic;
        EnableDCY           : out std_logic;
        OutDCY_A            : out std_logic;
        OutDCY_B            : out std_logic;
        EnableDCZ           : out std_logic;
        OutDCZ_A            : out std_logic;
        OutDCZ_B            : out std_logic;
        OutMagnet           : out std_logic;
        EnableMagnet        : out std_logic;
        --
        EnableDCX_unsafe    : in  std_logic;
        OutDCX_A_unsafe     : in  std_logic;
        OutDCX_B_unsafe     : in  std_logic;
        EnableDCY_unsafe    : in  std_logic;
        OutDCY_A_unsafe     : in  std_logic;
        OutDCY_B_unsafe     : in  std_logic;
        EnableDCZ_unsafe    : in  std_logic;
        OutDCZ_A_unsafe     : in  std_logic;
        OutDCZ_B_unsafe     : in  std_logic;
        OutMagnet_unsafe    : in  std_logic;
        EnableMagnet_unsafe : in  std_logic
    );
end entity protection;

architecture RTL of protection is
begin
    EnableDCX    <= EnableDCX_unsafe;
    OutDCX_A     <= OutDCX_A_unsafe and (not OutDCX_B_unsafe) and not InXRight and InZTop;
    OutDCX_B     <= OutDCX_B_unsafe and (not OutDCX_A_unsafe) and not InXLeft and InZTop;
    EnableDCY    <= EnableDCY_unsafe;
    OutDCY_A     <= OutDCY_A_unsafe and (not OutDCY_B_unsafe) and not InYBack and InZTop;
    OutDCY_B     <= OutDCY_B_unsafe and (not OutDCY_A_unsafe) and not InYFront and InZTop;
    EnableDCZ    <= EnableDCZ_unsafe;
    OutDCZ_A     <= OutDCZ_A_unsafe and (not OutDCZ_B_unsafe) and not InZTop;
    OutDCZ_B     <= OutDCZ_B_unsafe and (not OutDCZ_A_unsafe) and not InZBottom;
    OutMagnet    <= OutMagnet_unsafe;
    EnableMagnet <= EnableMagnet_unsafe;

end architecture RTL;
