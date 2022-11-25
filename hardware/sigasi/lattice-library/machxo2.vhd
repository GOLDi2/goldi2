-- --------------------------------------------------------------------
-- >>>>>>>>>>>>>>>>>>>>>>>>> COPYRIGHT NOTICE <<<<<<<<<<<<<<<<<<<<<<<<<
-- --------------------------------------------------------------------
-- Copyright (c) 2002-2010 by Lattice Semiconductor Corporation
-- --------------------------------------------------------------------
--
--
--                     Lattice Semiconductor Corporation
--                     5555 NE Moore Court
--                     Hillsboro, OR 97214
--                     U.S.A
--
--                     TEL: 1-800-Lattice (USA and Canada)
--                          408-826-6000 (other locations)
--
--                     web: http://www.latticesemi.com/
--                     email: techsupport@latticesemi.com
--
-- --------------------------------------------------------------------
--
-- Header files for MACHXO2 family.
--
-- --------------------------------------------------------------------

LIBRARY ieee; 
USE ieee.std_logic_1164.all; 
PACKAGE components IS 
   attribute syn_black_box: boolean ;
   attribute syn_black_box of Components : package is true;
   attribute black_box_pad_pin: string;
    attribute syn_unconnected_inputs: string;
   attribute syn_noprune : boolean;
-- 
COMPONENT AGEB2
PORT(
        A1, A0: IN std_logic := 'X';
        B1, B0: IN std_logic := 'X';
        CI: IN std_logic := 'X';
        GE: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of AGEB2 : Component is true;
-- 
COMPONENT ALEB2
PORT( 
	A1, A0: IN std_logic := 'X';
	B1, B0: IN std_logic := 'X';
	CI: IN std_logic := 'X';
	LE: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ALEB2 : Component is true;
--
COMPONENT ANEB2
PORT(
        A1, A0: IN std_logic := 'X';
        B1, B0: IN std_logic := 'X';
        CI: IN std_logic := 'X';
        NE: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ANEB2  : Component is true;
--
COMPONENT AND2
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of AND2  : Component is true;
-- 
COMPONENT AND3
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of AND3  : Component is true;
-- 
COMPONENT AND4
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of AND4 : Component is true;
-- 
COMPONENT AND5
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	E: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of AND5 : Component is true;
-- 
COMPONENT BB
PORT(
        B:  INOUT std_logic := 'X';
        I:  IN std_logic := 'X';
        T:  IN std_logic := 'X';
        O:  OUT std_logic);
END COMPONENT;
   attribute syn_black_box of BB : Component is true;
   attribute black_box_pad_pin of bb : component is "b";
--
COMPONENT BBPD
PORT(
        B:  INOUT std_logic := 'X';
        I:  IN std_logic := 'X';
        T:  IN std_logic := 'X';
        O:  OUT std_logic);
END COMPONENT;
   attribute syn_black_box of BBPD : Component is true;
   attribute black_box_pad_pin of bbpd : component is "b";
--
COMPONENT BBPU
PORT(
        B:  INOUT std_logic := 'X';
        I:  IN std_logic := 'X';
        T:  IN std_logic := 'X';
        O:  OUT std_logic);
END COMPONENT;
   attribute syn_black_box of BBPU : Component is true;
   attribute black_box_pad_pin of bbpu : component is "b";
--
COMPONENT BBW
PORT(
        B:  INOUT std_logic := 'X';
        I:  IN std_logic := 'X';
        T:  IN std_logic := 'X';
        O:  OUT std_logic);
END COMPONENT;
   attribute syn_black_box of BBW : Component is true;
   attribute black_box_pad_pin of bbw : component is "b";
--
COMPONENT CB2
PORT(
        CI : IN std_logic := 'X';
        PC1, PC0 : IN std_logic := 'X';
        CON: IN std_logic := 'X';
        CO : OUT std_logic := 'X';
        NC1, NC0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of CB2  : Component is true;
--
COMPONENT CD2
PORT(
        CI : IN std_logic := 'X';
        PC1, PC0 : IN std_logic := 'X';
        CO : OUT std_logic := 'X';
        NC1, NC0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of CD2  : Component is true;
--
COMPONENT CU2
PORT(
        CI : IN std_logic := 'X';
        PC1, PC0 : IN std_logic := 'X';
        CO : OUT std_logic := 'X';
        NC1, NC0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of CU2 : Component is true;
--
COMPONENT FADD2B
PORT(
        A1, A0 : IN std_logic := 'X';
        B1, B0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        COUT : OUT std_logic := 'X';
        S1, S0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FADD2B  : Component is true;
--
COMPONENT FADSU2
PORT(
        A1, A0 : IN std_logic := 'X';
        B1, B0 : IN std_logic := 'X';
        BCI: IN std_logic := 'X';
        CON: IN std_logic := 'X';
        BCO: OUT std_logic := 'X';
        S1, S0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FADSU2  : Component is true;
--
COMPONENT FD1P3AX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1P3AX : Component is true;
-- 
COMPONENT FD1P3AY
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1P3AY : Component is true;
-- 
COMPONENT FD1P3BX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	PD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1P3BX : Component is true;
-- 
COMPONENT FD1P3DX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	CD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1P3DX : Component is true;
-- 
COMPONENT FD1P3IX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	CD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1P3IX : Component is true;
-- 
COMPONENT FD1P3JX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	PD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1P3JX : Component is true;
-- 
COMPONENT FD1S1A
    GENERIC (GSR : string := "ENABLED");
    PORT(
          D		:  IN	STD_ULOGIC;
          CK		:  IN	STD_ULOGIC;
          Q		:  OUT	STD_ULOGIC
        );
END COMPONENT;
   attribute syn_black_box of FD1S1A : component is true;

COMPONENT FD1S1AY
    GENERIC (GSR : string := "ENABLED");
    PORT(
          D		:  IN	STD_ULOGIC;
          CK		:  IN	STD_ULOGIC;
          Q		:  OUT	STD_ULOGIC
        );
END COMPONENT;
   attribute syn_black_box of FD1S1AY : component is true;

COMPONENT FD1S1B
    GENERIC (GSR : string := "ENABLED");
    PORT(
          D		:  IN	STD_ULOGIC;
          CK		:  IN	STD_ULOGIC;
          PD		:  IN	STD_ULOGIC;
          Q		:  OUT	STD_ULOGIC
        );
END COMPONENT;
   attribute syn_black_box of FD1S1B : component is true;

COMPONENT FD1S1D
    GENERIC (GSR : string := "ENABLED");
    PORT(
          D		:  IN	STD_ULOGIC;
          CK		:  IN	STD_ULOGIC;
          CD		:  IN	STD_ULOGIC;
          Q		:  OUT	STD_ULOGIC
        );
END COMPONENT;
   attribute syn_black_box of FD1S1D : component is true;

COMPONENT FD1S1I
    GENERIC (GSR : string := "ENABLED");
    PORT(
          D		:  IN	STD_ULOGIC;
          CK		:  IN	STD_ULOGIC;
          CD		:  IN	STD_ULOGIC;
          Q		:  OUT	STD_ULOGIC
        );
END COMPONENT;
   attribute syn_black_box of FD1S1I : component is true;

COMPONENT FD1S1J
    GENERIC (GSR : string := "ENABLED");
    PORT(
          D		:  IN	STD_ULOGIC;
          CK		:  IN	STD_ULOGIC;
          PD		:  IN	STD_ULOGIC;
          Q		:  OUT	STD_ULOGIC
        );
END COMPONENT;
   attribute syn_black_box of FD1S1J : component is true;
--
COMPONENT FD1S3AX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	CK: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1S3AX : Component is true;
-- 
COMPONENT FD1S3AY
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	CK: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1S3AY : Component is true;
-- 
COMPONENT FD1S3BX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	CK: IN std_logic := 'X';
	PD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1S3BX : Component is true;
-- 
COMPONENT FD1S3DX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	CD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1S3DX : Component is true;
-- 
COMPONENT FD1S3IX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	CK: IN std_logic := 'X';
	CD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1S3IX : Component is true;
-- 
COMPONENT FD1S3JX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D : IN std_logic := 'X';
	CK: IN std_logic := 'X';
	PD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FD1S3JX : Component is true;
-- 
COMPONENT FL1P3AY
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	SD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1P3AY : Component is true;
-- 
COMPONENT FL1P3AZ
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	SD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1P3AZ : Component is true;
-- 
COMPONENT FL1P3BX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	SD: IN std_logic := 'X';
	PD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1P3BX : Component is true;
-- 
COMPONENT FL1P3DX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	SD: IN std_logic := 'X';
	CD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1P3DX : Component is true;
-- 
COMPONENT FL1P3IY
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	SD: IN std_logic := 'X';
	CD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1P3IY : Component is true;
-- 
COMPONENT FL1P3JY
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	SP: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	SD: IN std_logic := 'X';
	PD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1P3JY : Component is true;
-- 
COMPONENT FL1S1A
    GENERIC (GSR : string := "ENABLED");
PORT( 
	D0: IN STD_LOGIC := 'X';
	D1: IN STD_LOGIC := 'X';
	CK: IN STD_LOGIC := 'X';
	SD: IN STD_LOGIC := 'X';
	Q: OUT STD_LOGIC := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1S1A : component is true;
-- 
COMPONENT FL1S1AY
    GENERIC (GSR : string := "ENABLED");
PORT( 
	D0: IN STD_LOGIC := 'X';
	D1: IN STD_LOGIC := 'X';
	CK: IN STD_LOGIC := 'X';
	SD: IN STD_LOGIC := 'X';
	Q: OUT STD_LOGIC := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1S1AY : component is true;
-- 
COMPONENT FL1S1B
    GENERIC (GSR : string := "ENABLED");
PORT( 
	D0: IN STD_LOGIC := 'X';
	D1: IN STD_LOGIC := 'X';
	CK: IN STD_LOGIC := 'X';
	SD: IN STD_LOGIC := 'X';
	PD: IN STD_LOGIC := 'X';
	Q: OUT STD_LOGIC := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1S1B : component is true;
-- 
COMPONENT FL1S1D
    GENERIC (GSR : string := "ENABLED");
PORT( 
	D0: IN STD_LOGIC := 'X';
	D1: IN STD_LOGIC := 'X';
	CK: IN STD_LOGIC := 'X';
	SD: IN STD_LOGIC := 'X';
	CD: IN STD_LOGIC := 'X';
	Q: OUT STD_LOGIC := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1S1D : component is true;
-- 
COMPONENT FL1S1I
    GENERIC (GSR : string := "ENABLED");
PORT( 
	D0: IN STD_LOGIC := 'X';
	D1: IN STD_LOGIC := 'X';
	CK: IN STD_LOGIC := 'X';
	SD: IN STD_LOGIC := 'X';
	CD: IN STD_LOGIC := 'X';
	Q: OUT STD_LOGIC := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1S1I : component is true;
-- 
COMPONENT FL1S1J
    GENERIC (GSR : string := "ENABLED");
PORT( 
	D0: IN STD_LOGIC := 'X';
	D1: IN STD_LOGIC := 'X';
	CK: IN STD_LOGIC := 'X';
	SD: IN STD_LOGIC := 'X';
	PD: IN STD_LOGIC := 'X';
	Q: OUT STD_LOGIC := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1S1J : component is true;
--
COMPONENT FL1S3AX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	SD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of  FL1S3AX : Component is true;
-- 
COMPONENT FL1S3AY
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	CK: IN std_logic := 'X';
	SD: IN std_logic := 'X';
	Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FL1S3AY : Component is true;
-- 
COMPONENT FSUB2B
PORT(
        A1, A0 : IN std_logic := 'X';
        B1, B0 : IN std_logic := 'X';
        BI: IN std_logic := 'X';
        BOUT : OUT std_logic := 'X';
        S1, S0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of FSUB2B : Component is true;
--
COMPONENT GSR
PORT( 
      GSR: IN std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of GSR  : Component is true;
   attribute syn_noprune of gsr : component is true;
--
COMPONENT IB
PORT(
        I:  IN std_logic := 'X';
        O:  OUT std_logic);
END COMPONENT;
   attribute syn_black_box of IB  : Component is true;
   attribute black_box_pad_pin of ib : component is "i";
--
COMPONENT IBPD
PORT(
        I:  IN std_logic := 'X';
        O:  OUT std_logic);
END COMPONENT;
   attribute syn_black_box of IBPD  : Component is true;
   attribute black_box_pad_pin of ibpd : component is "i";
--
COMPONENT IBPU
PORT(
        I:  IN std_logic := 'X';
        O:  OUT std_logic);
END COMPONENT;
   attribute syn_black_box of IBPU  : Component is true;
   attribute black_box_pad_pin of ibpu : component is "i";
--
COMPONENT IFS1P3BX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D   : IN std_logic := 'X';
	SP  : IN std_logic := 'X';
	SCLK: IN std_logic := 'X';
	PD  : IN std_logic := 'X';
	Q   : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IFS1P3BX  : Component is true;
-- 
COMPONENT IFS1P3DX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D   : IN std_logic := 'X';
	SP  : IN std_logic := 'X';
	SCLK: IN std_logic := 'X';
	CD  : IN std_logic := 'X';
	Q   : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IFS1P3DX : Component is true;
-- 
COMPONENT IFS1P3IX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D   : IN std_logic := 'X';
	SP  : IN std_logic := 'X';
	SCLK: IN std_logic := 'X';
	CD  : IN std_logic := 'X';
	Q   : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IFS1P3IX  : Component is true;
-- 
COMPONENT IFS1P3JX
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D   : IN std_logic := 'X';
	SP  : IN std_logic := 'X';
	SCLK: IN std_logic := 'X';
	PD  : IN std_logic := 'X';
	Q   : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IFS1P3JX  : Component is true;
-- 
COMPONENT ILVDS
PORT(
        A : IN std_logic := 'X';
        AN: IN std_logic := 'X';
        Z : OUT std_logic
 );
END COMPONENT;
   attribute syn_black_box of ILVDS  : Component is true;
   attribute black_box_pad_pin of ilvds : component is "a,an";
--
COMPONENT INV
PORT( 
	A: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of INV  : Component is true;
-- 
COMPONENT L6MUX21
PORT(
        D1: IN std_logic := 'X';
        D0: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        Z : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of L6MUX21 : Component is true;
-- 
COMPONENT LB2P3AX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CON: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LB2P3AX : Component is true;
--
COMPONENT LB2P3AY
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI : IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CON: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LB2P3AY : Component is true;
--
COMPONENT LB2P3BX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        PD: IN std_logic := 'X';
        CON: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LB2P3BX : Component is true;
--
COMPONENT LB2P3DX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CD: IN std_logic := 'X';
        CON: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LB2P3DX  : Component is true;
--
COMPONENT LB2P3IX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CD: IN std_logic := 'X';
        CON: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LB2P3IX : Component is true;
--
COMPONENT LB2P3JX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        PD: IN std_logic := 'X';
        CON: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LB2P3JX  : Component is true;
--
COMPONENT LD2P3AX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LD2P3AX : Component is true;
--
COMPONENT LD2P3AY
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LD2P3AY  : Component is true;
--
COMPONENT LD2P3BX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        PD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LD2P3BX  : Component is true;
--
COMPONENT LD2P3DX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LD2P3DX : Component is true;
--
COMPONENT LD2P3IX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
  attribute syn_black_box of LD2P3IX : Component is true;
--
COMPONENT LD2P3JX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        PD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LD2P3JX  : Component is true;
--
COMPONENT LU2P3AX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LU2P3AX : Component is true;
--
COMPONENT LU2P3AY
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LU2P3AY  : Component is true;
--
COMPONENT LU2P3BX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        PD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LU2P3BX : Component is true;
--
COMPONENT LU2P3DX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LU2P3DX  : Component is true;
--
COMPONENT LU2P3IX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        CD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LU2P3IX : Component is true;
--
COMPONENT LU2P3JX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D1, D0 : IN std_logic := 'X';
        CI: IN std_logic := 'X';
        SP: IN std_logic := 'X';
        CK: IN std_logic := 'X';
        SD: IN std_logic := 'X';
        PD: IN std_logic := 'X';
        CO: OUT std_logic := 'X';
        Q1, Q0 : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LU2P3JX  : Component is true;
--
component MULT2
   port(
      A3                             :  in    STD_ULOGIC;
      A2                             :  in    STD_ULOGIC;
      A1                             :  in    STD_ULOGIC;
      A0                             :  in    STD_ULOGIC;
      B3                             :  in    STD_ULOGIC;
      B2                             :  in    STD_ULOGIC;
      B1                             :  in    STD_ULOGIC;
      B0                             :  in    STD_ULOGIC;
      CI                             :  in    STD_ULOGIC;
      P1                             :  out   STD_ULOGIC;
      P0                             :  out   STD_ULOGIC;
      CO                             :  out   STD_ULOGIC);
end component;
   attribute syn_black_box of MULT2 : Component is true;
--
COMPONENT MUX161
PORT(
        D15: IN std_logic := 'X';
        D14: IN std_logic := 'X';
        D13: IN std_logic := 'X';
        D12: IN std_logic := 'X';
        D11: IN std_logic := 'X';
        D10: IN std_logic := 'X';
        D9:  IN std_logic := 'X';
        D8:  IN std_logic := 'X';
        D7:  IN std_logic := 'X';
        D6:  IN std_logic := 'X';
        D5:  IN std_logic := 'X';
        D4:  IN std_logic := 'X';
        D3:  IN std_logic := 'X';
        D2:  IN std_logic := 'X';
        D1:  IN std_logic := 'X';
        D0:  IN std_logic := 'X';
        SD4: IN std_logic := 'X';
        SD3: IN std_logic := 'X';
        SD2: IN std_logic := 'X';
        SD1: IN std_logic := 'X';
        Z : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of MUX161 : Component is true;
--
COMPONENT MUX21
PORT( 
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	SD: IN std_logic := 'X';
	Z : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of MUX21  : Component is true;
--
COMPONENT MUX321
PORT(
        D31: IN std_logic := 'X';
        D30: IN std_logic := 'X';
        D29: IN std_logic := 'X';
        D28: IN std_logic := 'X';
        D27: IN std_logic := 'X';
        D26: IN std_logic := 'X';
        D25: IN std_logic := 'X';
        D24: IN std_logic := 'X';
        D23: IN std_logic := 'X';
        D22: IN std_logic := 'X';
        D21: IN std_logic := 'X';
        D20: IN std_logic := 'X';
        D19: IN std_logic := 'X';
        D18: IN std_logic := 'X';
        D17: IN std_logic := 'X';
        D16: IN std_logic := 'X';
        D15: IN std_logic := 'X';
        D14: IN std_logic := 'X';
        D13: IN std_logic := 'X';
        D12: IN std_logic := 'X';
        D11: IN std_logic := 'X';
        D10: IN std_logic := 'X';
        D9: IN std_logic := 'X';
        D8: IN std_logic := 'X';
        D7: IN std_logic := 'X';
        D6: IN std_logic := 'X';
        D5: IN std_logic := 'X';
        D4: IN std_logic := 'X';
        D3: IN std_logic := 'X';
        D2: IN std_logic := 'X';
        D1: IN std_logic := 'X';
        D0: IN std_logic := 'X';
        SD5: IN std_logic := 'X';
        SD4: IN std_logic := 'X';
        SD3: IN std_logic := 'X';
        SD2: IN std_logic := 'X';
        SD1: IN std_logic := 'X';
        Z : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of MUX321 : Component is true;
--
COMPONENT MUX41
PORT( 
	D3: IN std_logic := 'X';
	D2: IN std_logic := 'X';
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	SD2: IN std_logic := 'X';
	SD1: IN std_logic := 'X';
	Z : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of MUX41  : Component is true;
-- 
COMPONENT MUX81
PORT( 
	D7: IN std_logic := 'X';
	D6: IN std_logic := 'X';
	D5: IN std_logic := 'X';
	D4: IN std_logic := 'X';
	D3: IN std_logic := 'X';
	D2: IN std_logic := 'X';
	D1: IN std_logic := 'X';
	D0: IN std_logic := 'X';
	SD3: IN std_logic := 'X';
	SD2: IN std_logic := 'X';
	SD1: IN std_logic := 'X';
	Z : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of MUX81  : Component is true;
-- 
COMPONENT ND2
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ND2  : Component is true;
-- 
COMPONENT ND3
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ND3  : Component is true;
-- 
COMPONENT ND4
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ND4  : Component is true;
-- 
COMPONENT ND5
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	E: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ND5  : Component is true;
-- 
COMPONENT NR2
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of NR2  : Component is true;
-- 
COMPONENT NR3
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of NR3  : Component is true;
-- 
COMPONENT NR4
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of NR4  : Component is true;
-- 
COMPONENT NR5
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	E: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of NR5  : Component is true;
-- 
COMPONENT OB
PORT(
        I:  IN std_logic := 'X';
        O:  OUT std_logic);
END COMPONENT;
   attribute syn_black_box of OB : Component is true;
   attribute black_box_pad_pin of ob : component is "o";
--
component OBCO
    port(
          I             :       in      STD_LOGIC;
          OT            :       out     STD_LOGIC;
          OC            :       out     STD_LOGIC
        );
end component;
   attribute syn_black_box of OBCO  : Component is true;
   attribute black_box_pad_pin of OBCO : component is "OT,OC";
--
COMPONENT OBZ
PORT(
        I:  IN std_logic := 'X';
        T:  IN std_logic := 'X';
        O:  OUT std_logic);
END COMPONENT;
   attribute syn_black_box of OBZ  : Component is true;
   attribute black_box_pad_pin of obz : component is "o";
--
COMPONENT OBZPU
PORT(
        I:  IN std_logic := 'X';
        T:  IN std_logic := 'X';
        O:  OUT std_logic);
END COMPONENT;
   attribute syn_black_box of OBZPU : Component is true;
   attribute black_box_pad_pin of obzpu : component is "o";
-- 
COMPONENT OFS1P3BX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D : IN std_logic := 'X';
        SP: IN std_logic := 'X';
        SCLK: IN std_logic := 'X';
        PD: IN std_logic := 'X';
        Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of OFS1P3BX  : Component is true;
--
COMPONENT OFS1P3DX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D : IN std_logic := 'X';
        SP: IN std_logic := 'X';
        SCLK: IN std_logic := 'X';
        CD: IN std_logic := 'X';
        Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of OFS1P3DX  : Component is true;
--
COMPONENT OFS1P3IX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D : IN std_logic := 'X';
        SP: IN std_logic := 'X';
        SCLK: IN std_logic := 'X';
        CD: IN std_logic := 'X';
        Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of OFS1P3IX : Component is true;
--
COMPONENT OFS1P3JX
    GENERIC (GSR : String := "ENABLED");
PORT(
        D : IN std_logic := 'X';
        SP: IN std_logic := 'X';
        SCLK: IN std_logic := 'X';
        PD: IN std_logic := 'X';
        Q : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of OFS1P3JX : Component is true;
--
COMPONENT OLVDS
PORT(
        A  : IN std_logic := 'X';
        Z  : OUT std_logic ;
        ZN : OUT std_logic
 );
END COMPONENT;
   attribute syn_black_box of OLVDS : Component is true;
   attribute black_box_pad_pin of olvds : component is "z,zn";
--
COMPONENT OR2
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of OR2  : Component is true;
-- 
COMPONENT OR3
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of OR3  : Component is true;
-- 
COMPONENT OR4
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of OR4 : Component is true;
-- 
COMPONENT OR5
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	E: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of OR5  : Component is true;
-- 
------Component LUT4------
COMPONENT LUT4
    GENERIC(  init  : std_logic_vector );
    port(
          A             :       in      STD_ULOGIC;
          B             :       in      STD_ULOGIC;
          C             :       in      STD_ULOGIC;
          D             :       in      STD_ULOGIC;
          Z             :       out     STD_ULOGIC
        );
END COMPONENT;

------Component LUT5------
COMPONENT LUT5
    GENERIC(  init  : std_logic_vector );
    port(
          A             :       in      STD_ULOGIC;
          B             :       in      STD_ULOGIC;
          C             :       in      STD_ULOGIC;
          D             :       in      STD_ULOGIC;
          E             :       in      STD_ULOGIC;
          Z             :       out     STD_ULOGIC
        );
END COMPONENT;

------Component LUT6------
COMPONENT LUT6
    GENERIC(  init  : std_logic_vector );
    port(
          A             :       in      STD_ULOGIC;
          B             :       in      STD_ULOGIC;
          C             :       in      STD_ULOGIC;
          D             :       in      STD_ULOGIC;
          E             :       in      STD_ULOGIC;
          F             :       in      STD_ULOGIC;
          Z             :       out     STD_ULOGIC
        );
END COMPONENT;

------Component LUT7------
COMPONENT LUT7
    GENERIC(  init  : std_logic_vector );
    port(
          A             :       in      STD_ULOGIC;
          B             :       in      STD_ULOGIC;
          C             :       in      STD_ULOGIC;
          D             :       in      STD_ULOGIC;
          E             :       in      STD_ULOGIC;
          F             :       in      STD_ULOGIC;
          G             :       in      STD_ULOGIC;
          Z             :       out     STD_ULOGIC
        );
END COMPONENT;

------Component LUT8------
COMPONENT LUT8
    GENERIC(  init  : std_logic_vector );
    port(
          A             :       in      STD_ULOGIC;
          B             :       in      STD_ULOGIC;
          C             :       in      STD_ULOGIC;
          D             :       in      STD_ULOGIC;
          E             :       in      STD_ULOGIC;
          F             :       in      STD_ULOGIC;
          G             :       in      STD_ULOGIC;
          H             :       in      STD_ULOGIC;
          Z             :       out     STD_ULOGIC
        );
END COMPONENT;
--
COMPONENT PFUMX
PORT( 
	ALUT: IN std_logic := 'X';
	BLUT: IN std_logic := 'X';
	C0  : IN std_logic := 'X';
	Z   : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of PFUMX  : Component is true;
-- 
COMPONENT PUR
      GENERIC (RST_PULSE  : integer   := 1);
PORT(
      PUR: IN std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of PUR  : Component is true;
   attribute syn_noprune of pur : component is true;
--
COMPONENT ROM16X1A
GENERIC(
        initval : std_logic_vector(15 downto 0) := "0000000000000000"
  );
PORT( 
	AD3, AD2, AD1, AD0: IN std_logic := 'X';
	DO0: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ROM16X1A : Component is true;
-- 
COMPONENT ROM32X1A
GENERIC(
        initval : std_logic_vector(31 downto 0) := "00000000000000000000000000000000"
  );
PORT( 
	AD4, AD3, AD2, AD1, AD0: IN std_logic := 'X';
	DO0: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ROM32X1A : Component is true;
-- 

COMPONENT ROM64X1A
GENERIC(
        initval : std_logic_vector(63 downto 0) := X"0000000000000000"
  );
PORT(
        AD5, AD4, AD3, AD2, AD1, AD0 : IN std_logic := 'X';
        DO0: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ROM64X1A  : Component is true;
--
COMPONENT ROM128X1A
GENERIC(
        initval : std_logic_vector(127 downto 0) := X"00000000000000000000000000000000"
  );
PORT(
        AD6, AD5, AD4, AD3, AD2, AD1, AD0 : IN std_logic := 'X';
        DO0: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ROM128X1A : Component is true;
--
COMPONENT ROM256X1A
GENERIC(
        initval : std_logic_vector(255 downto 0) := X"0000000000000000000000000000000000000000000000000000000000000000"
  );
PORT(
        AD7, AD6, AD5, AD4, AD3, AD2, AD1, AD0 : IN std_logic := 'X';
        DO0: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ROM256X1A  : Component is true;
--
COMPONENT CCU2D
   GENERIC (
      INJECT1_0 : string := "YES";
      INJECT1_1 : string := "YES";
      INIT0: std_logic_vector(15 downto 0) := "0000000000000000" ;
      INIT1: std_logic_vector(15 downto 0) := "0000000000000000"
   );
   PORT (
      A0,A1 : IN STD_ULOGIC;
      B0,B1 : IN STD_ULOGIC;
      C0,C1 : IN STD_ULOGIC;
      D0,D1 : IN STD_ULOGIC;
      CIN : IN STD_ULOGIC;
      S0,S1 : OUT STD_ULOGIC;
      COUT : OUT STD_ULOGIC
   );
END COMPONENT;
   attribute syn_black_box of CCU2D : Component is true;
    attribute syn_unconnected_inputs of CCU2D : component is "CIN";
--
COMPONENT VHI
PORT( 
	 Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of VHI  : Component is true;
-- 
COMPONENT VLO
PORT( 
	 Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of VLO  : Component is true;
-- 
COMPONENT XOR2
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of XOR2  : Component is true;
-- 
COMPONENT XOR3
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of XOR3 : Component is true;
-- 
COMPONENT XOR4
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of XOR4  : Component is true;
-- 
COMPONENT XOR5
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	E: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of XOR5 : Component is true;
-- 
COMPONENT XOR11
PORT( 
        A, B, C, D, E, F, G, H, I, J, K: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of XOR11  : Component is true;
-- 
COMPONENT XOR21
PORT( 
	A, B, C, D, E, F, G, H, I, J, K: IN std_logic := 'X';
	L, M, N, O, P, Q, R, S, T, U: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of XOR21 : Component is true;
-- 
COMPONENT XNOR2
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of XNOR2 : Component is true;
-- 
COMPONENT XNOR3
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of XNOR3  : Component is true;
-- 
COMPONENT XNOR4
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of XNOR4 : Component is true;
-- 
COMPONENT XNOR5
PORT( 
	A: IN std_logic := 'X';
	B: IN std_logic := 'X';
	C: IN std_logic := 'X';
	D: IN std_logic := 'X';
	E: IN std_logic := 'X';
	Z: OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of XNOR5 : Component is true;
--
COMPONENT IFS1S1B
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D   : IN std_logic := 'X';
	SCLK: IN std_logic := 'X';
	PD  : IN std_logic := 'X';
	Q   : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IFS1S1B  : Component is true;
-- 
COMPONENT IFS1S1D
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D   : IN std_logic := 'X';
	SCLK: IN std_logic := 'X';
	CD  : IN std_logic := 'X';
	Q   : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IFS1S1D : Component is true;
-- 
COMPONENT IFS1S1I
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D   : IN std_logic := 'X';
	SCLK: IN std_logic := 'X';
	CD  : IN std_logic := 'X';
	Q   : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IFS1S1I  : Component is true;
-- 
COMPONENT IFS1S1J
    GENERIC (GSR : String := "ENABLED");
PORT( 
	D   : IN std_logic := 'X';
	SCLK: IN std_logic := 'X';
	PD  : IN std_logic := 'X';
	Q   : OUT std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IFS1S1J : Component is true;
-- 
COMPONENT SPR16X4C
GENERIC(
        initval : string := "0x0000000000000000"
  );
PORT(
        DI3  : IN std_logic;
        DI2  : IN std_logic;
        DI1  : IN std_logic;
        DI0  : IN std_logic;
        CK  : IN std_logic;
        WRE  : IN std_logic;
        AD3 : IN std_logic;
        AD2 : IN std_logic;
        AD1 : IN std_logic;
        AD0 : IN std_logic;
        DO3 : OUT std_logic;
        DO2 : OUT std_logic;
        DO1 : OUT std_logic;
        DO0 : OUT std_logic);
END COMPONENT;
   attribute syn_black_box of SPR16X4C : Component is true;
--
COMPONENT DPR16X4C
GENERIC(
        initval : string := "0x0000000000000000"
  );
PORT(
        DI3  : IN std_logic;
        DI2  : IN std_logic;
        DI1  : IN std_logic;
        DI0  : IN std_logic;
        WCK  : IN std_logic;
        WRE  : IN std_logic;
        RAD3 : IN std_logic;
        RAD2 : IN std_logic;
        RAD1 : IN std_logic;
        RAD0 : IN std_logic;
        WAD3 : IN std_logic;
        WAD2 : IN std_logic;
        WAD1 : IN std_logic;
        WAD0 : IN std_logic;
        DO3 : OUT std_logic;
        DO2 : OUT std_logic;
        DO1 : OUT std_logic;
        DO0 : OUT std_logic);
END COMPONENT;
   attribute syn_black_box of DPR16X4C : Component is true;
--
COMPONENT SGSR
PORT(
      GSR: IN std_logic := 'X';
      CLK : IN std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of SGSR : Component is true;
   attribute syn_noprune of sgsr : component is true;
--
COMPONENT DP8KC
GENERIC(
        DATA_WIDTH_A : in Integer := 9;
        DATA_WIDTH_B : in Integer := 9;
        REGMODE_A    : String  := "NOREG";
        REGMODE_B    : String  := "NOREG";
        CSDECODE_A   : String  := "0b000";
        CSDECODE_B   : String  := "0b000";
        WRITEMODE_A  : String  := "NORMAL";
        WRITEMODE_B  : String  := "NORMAL";
        GSR : String  := "ENABLED";
        RESETMODE : String := "SYNC";
        ASYNC_RESET_RELEASE    : String  := "SYNC";
        INIT_DATA : String := "STATIC";
        INITVAL_00 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_01 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_02 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_03 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_04 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_05 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_06 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_07 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_08 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_09 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0A : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0B : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0C : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0D : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0E : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0F : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_10 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_11 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_12 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_13 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_14 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_15 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_16 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_17 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_18 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_19 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1A : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1B : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1C : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1D : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1E : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1F : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000"
  );
PORT(
        DIA8, DIA7, DIA6, DIA5, DIA4, DIA3, DIA2, DIA1, DIA0     : in std_logic := 'X';
        ADA12, ADA11, ADA10, ADA9, ADA8, ADA7, ADA6, ADA5        : in std_logic := 'X';
        ADA4, ADA3, ADA2, ADA1, ADA0                             : in std_logic := 'X';
        CEA, OCEA, CLKA, WEA, CSA2, CSA1, CSA0, RSTA             : in std_logic := 'X';
        DIB8, DIB7, DIB6, DIB5, DIB4, DIB3, DIB2, DIB1, DIB0     : in std_logic := 'X';
        ADB12, ADB11, ADB10, ADB9, ADB8, ADB7, ADB6, ADB5        : in std_logic := 'X';
        ADB4, ADB3, ADB2, ADB1, ADB0                             : in std_logic := 'X';
        CEB, OCEB, CLKB, WEB, CSB2, CSB1, CSB0, RSTB             : in std_logic := 'X';

        DOA8, DOA7, DOA6, DOA5, DOA4, DOA3, DOA2, DOA1, DOA0     : out std_logic := 'X';
        DOB8, DOB7, DOB6, DOB5, DOB4, DOB3, DOB2, DOB1, DOB0     : out std_logic := 'X' );
END COMPONENT;
   attribute syn_black_box of DP8KC : Component is true;
--
COMPONENT PDPW8KC
GENERIC(
        DATA_WIDTH_W : in Integer := 18;
        DATA_WIDTH_R : in Integer := 9;
        REGMODE      : String  := "NOREG";
        CSDECODE_W   : String  := "0b000";
        CSDECODE_R   : String  := "0b000";
        GSR : String  := "ENABLED";
        RESETMODE : String := "SYNC";
        ASYNC_RESET_RELEASE    : String  := "SYNC";
        INIT_DATA : String := "STATIC";
        INITVAL_00 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_01 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_02 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_03 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_04 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_05 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_06 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_07 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_08 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_09 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0A : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0B : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0C : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0D : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0E : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0F : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_10 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_11 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_12 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_13 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_14 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_15 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_16 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_17 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_18 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_19 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1A : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1B : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1C : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1D : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1E : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1F : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000"
  );
PORT(
        DI17, DI16, DI15, DI14, DI13, DI12, DI11, DI10, DI9    : in std_logic := 'X';
        DI8, DI7, DI6, DI5, DI4, DI3, DI2, DI1, DI0            : in std_logic := 'X';
        ADW8, ADW7, ADW6, ADW5, ADW4, ADW3, ADW2, ADW1, ADW0   : in std_logic := 'X';
        BE1, BE0                                               : in std_logic := 'X';
        CEW, CLKW, CSW2, CSW1, CSW0                            : in std_logic := 'X';
        ADR12, ADR11, ADR10, ADR9, ADR8, ADR7, ADR6, ADR5      : in std_logic := 'X';
        ADR4, ADR3, ADR2, ADR1, ADR0                           : in std_logic := 'X';
        CER, OCER, CLKR, CSR2, CSR1, CSR0, RST                 : in std_logic := 'X';
        DO17, DO16, DO15, DO14, DO13, DO12, DO11, DO10, DO9    : out std_logic := 'X';
        DO8, DO7, DO6, DO5, DO4, DO3, DO2, DO1, DO0            : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of PDPW8KC : Component is true;
--
COMPONENT SP8KC
GENERIC(
        DATA_WIDTH   : in Integer := 9;
        REGMODE      : String  := "NOREG";
        CSDECODE     : String  := "0b000";
        WRITEMODE    : String  := "NORMAL";
        GSR : String  := "ENABLED";
        RESETMODE : String := "SYNC";
        ASYNC_RESET_RELEASE    : String  := "SYNC";
        INIT_DATA : String := "STATIC";
        INITVAL_00 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_01 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_02 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_03 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_04 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_05 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_06 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_07 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_08 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_09 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0A : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0B : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0C : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0D : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0E : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_0F : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_10 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_11 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_12 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_13 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_14 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_15 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_16 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_17 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_18 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_19 : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1A : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1B : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1C : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1D : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1E : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000";
        INITVAL_1F : string := "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000"
  );
PORT(
        DI0, DI1, DI2, DI3, DI4, DI5, DI6, DI7, DI8            : in std_logic := 'X';
        AD0, AD1, AD2, AD3, AD4, AD5, AD6, AD7, AD8            : in std_logic := 'X';
        AD9, AD10, AD11, AD12                                  : in std_logic := 'X';
        CE, OCE, CLK, WE, CS0, CS1, CS2, RST                   : in std_logic := 'X';

        DO0, DO1, DO2, DO3, DO4, DO5, DO6, DO7, DO8            : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of SP8KC : Component is true;
--
COMPONENT fifo8kb
GENERIC(
        DATA_WIDTH_W : Integer := 18;
        DATA_WIDTH_R : Integer := 18;
        REGMODE      : String  := "NOREG";
        CSDECODE_W   : string  := "0b00";
        CSDECODE_R   : string  := "0b00";
        GSR          : String  := "DISABLED";
        RESETMODE    : String  := "ASYNC";
        ASYNC_RESET_RELEASE    : String  := "SYNC";
        AEPOINTER    : String  := "0b00000000000000";
        AEPOINTER1   : String  := "0b00000000000000";
        AFPOINTER    : String  := "0b00000000000000";
        AFPOINTER1   : String  := "0b00000000000000";
        FULLPOINTER  : String  := "0b00000000000000";
        FULLPOINTER1 : String  := "0b00000000000000"
  );
PORT(
        di0, di1, di2, di3, di4, di5, di6, di7, di8            : in std_logic := 'X';
        di9, di10, di11, di12, di13, di14, di15, di16, di17    : in std_logic := 'X';
        csw0, csw1, csr0, csr1, fulli, emptyi                  : in std_logic := 'X';
        we, re, ore, clkw, clkr, rst, rprst                    : in std_logic := 'X';

        do0, do1, do2, do3, do4, do5, do6, do7, do8            : out std_logic := 'X';
        do9, do10, do11, do12, do13, do14, do15, do16, do17    : out std_logic := 'X';
        ef, aef, aff, ff                                       : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of fifo8kb : Component is true;
--
COMPONENT CLKDIVC
GENERIC (
   GSR : String := "DISABLED";
   DIV : String := "2.0"
  );
PORT (
   RST, CLKI, ALIGNWD : in std_logic := 'X';
   CDIV1, CDIVX  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of CLKDIVC : Component is true;
--
COMPONENT DCMA
PORT (
   CLK0, CLK1, SEL : in std_logic := 'X';
   DCMOUT  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of DCMA : Component is true;
--
COMPONENT ECLKSYNCA
PORT (
   ECLKI, STOP : in std_logic := 'X';
   ECLKO  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ECLKSYNCA : Component is true;
--
COMPONENT ECLKBRIDGECS
PORT (
   CLK0, CLK1, SEL : in std_logic := 'X';
   ECSOUT  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ECLKBRIDGECS : Component is true;
--
COMPONENT DCCA
PORT (
   CLKI, CE : in std_logic := 'X';
   CLKO  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of DCCA : Component is true;
--
COMPONENT JTAGF
GENERIC (
   ER1 : String := "ENABLED";
   ER2 : String := "ENABLED"
  );
PORT (
   TCK, TMS, TDI, JTDO1, JTDO2 : in std_logic := 'X';
   TDO, JTCK, JTDI, JSHIFT, JUPDATE, JRSTN,
   JCE1, JCE2, JRTI1, JRTI2 : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of JTAGF : Component is true;
--
COMPONENT START
PORT (
   STARTCLK  : in std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of START : Component is true;
   attribute syn_noprune of START : component is true;
--
COMPONENT SEDFA
GENERIC (
   SED_CLK_FREQ : String := "3.5";
   CHECKALWAYS : String := "DISABLED";
   DEV_DENSITY : String := "1200L"
  );
PORT (
   SEDSTDBY, SEDENABLE, SEDSTART, SEDFRCERR : in std_logic := 'X';
   SEDERR, SEDDONE, SEDINPROG, SEDCLKOUT  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of SEDFA : Component is true;
--
COMPONENT SEDFB
PORT (
   SEDERR, SEDDONE, SEDINPROG, SEDCLKOUT  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of SEDFB : Component is true;
--
COMPONENT IDDRXE
    GENERIC (GSR : String := "ENABLED");
PORT (
   D, SCLK, RST : in std_logic := 'X';
   Q0, Q1  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IDDRXE : Component is true;
--
COMPONENT IDDRX2E
    GENERIC (GSR : String := "ENABLED");
PORT (
   D, ECLK, SCLK, RST, ALIGNWD : in std_logic := 'X';
   Q0, Q1, Q2, Q3  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IDDRX2E : Component is true;
--
COMPONENT IDDRX4B
    GENERIC (GSR : String := "ENABLED");
PORT (
   D, ECLK, SCLK, RST, ALIGNWD : in std_logic := 'X';
   Q0, Q1, Q2, Q3, Q4, Q5, Q6, Q7  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IDDRX4B : Component is true;
--
COMPONENT IDDRDQSX1A
    GENERIC (GSR : String := "ENABLED");
PORT (
   D, DQSR90, DDRCLKPOL, SCLK, RST : in std_logic := 'X';
   Q0, Q1  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IDDRDQSX1A : Component is true;
--
COMPONENT IDDRX71A
    GENERIC (GSR : String := "ENABLED");
PORT (
   D, ECLK, SCLK, RST, ALIGNWD : in std_logic := 'X';
   Q0, Q1, Q2, Q3, Q4, Q5, Q6  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of IDDRX71A : Component is true;
--
COMPONENT ODDRXE
    GENERIC (GSR : String := "ENABLED");
PORT (
   D0, D1, SCLK, RST : in std_logic := 'X';
   Q  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ODDRXE : Component is true;
--
COMPONENT ODDRX2E
    GENERIC (GSR : String := "ENABLED");
PORT (
   D0, D1, D2, D3, ECLK, SCLK, RST : in std_logic := 'X';
   Q  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ODDRX2E : Component is true;
--
COMPONENT ODDRX4B
    GENERIC (GSR : String := "ENABLED");
PORT (
   D0, D1, D2, D3, D4, D5, D6, D7, ECLK, SCLK, RST : in std_logic := 'X';
   Q  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ODDRX4B : Component is true;
--
COMPONENT ODDRDQSX1A
    GENERIC (GSR : String := "ENABLED");
PORT (
   DQSW90, SCLK, D0, D1, RST : in std_logic := 'X';
   Q  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ODDRDQSX1A : Component is true;
--
COMPONENT ODDRX71A
    GENERIC (GSR : String := "ENABLED");
PORT (
   ECLK, SCLK, D0, D1, D2, D3, D4, D5, D6, RST : in std_logic := 'X';
   Q  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of ODDRX71A : Component is true;
--
COMPONENT TDDRA
GENERIC (
   GSR : String := "ENABLED";
   DQSW90_INVERT : String := "DISABLED"
  );
PORT (
   DQSW90, SCLK, TD, RST : in std_logic := 'X';
   TQ  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of TDDRA : Component is true;
--
COMPONENT DQSBUFH
GENERIC (
   GSR : String := "ENABLED";
   DQS_LI_DEL_ADJ : String := "PLUS";
   DQS_LI_DEL_VAL : Integer := 0;
   DQS_LO_DEL_ADJ : String := "PLUS";
   DQS_LO_DEL_VAL : Integer := 0;
   LPDDR : String := "DISABLED"
  );
PORT (
   SCLK, DQSI, READ, READCLKSEL1, READCLKSEL0, RST, DQSDEL : in std_logic := 'X';
   DDRCLKPOL, DQSR90, DQSW90, DATAVALID, BURSTDET  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of DQSBUFH : Component is true;
--
COMPONENT DQSDLLC
GENERIC (
   GSR : String := "ENABLED";
   DEL_ADJ : String := "PLUS";
   DEL_VAL : Integer := 0;
   LOCK_SENSITIVITY : String := "LOW";
   FIN : String := "100.0";
   FORCE_MAX_DELAY : String := "NO"
  );
PORT (
   CLK, RST, UDDCNTLN, FREEZE : in std_logic := 'X';
   LOCK, DQSDEL  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of DQSDLLC : Component is true;
--
COMPONENT DELAYE
GENERIC (
   DEL_MODE : String := "USER_DEFINED";
   DEL_VALUE : String := "DELAY0"
  );
PORT (
   A : in std_logic := 'X';
   Z : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of DELAYE : Component is true;
--
COMPONENT DELAYD
PORT (
   A, DEL4, DEL3, DEL2, DEL1, DEL0 : in std_logic := 'X';
   Z  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of DELAYD : Component is true;
--
COMPONENT DLLDELC
GENERIC (
   DEL_ADJ : String := "PLUS";
   DEL_VAL : Integer := 0
  );
PORT (
   CLKI, DQSDEL : in std_logic := 'X';
   CLKO  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of DLLDELC : Component is true;
--
COMPONENT CLKFBBUFA
PORT (
   A : in std_logic := 'X';
   Z : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of CLKFBBUFA : Component is true;
--
COMPONENT PCNTR
GENERIC (
   STDBYOPT : String := "USER_CFG";
   TIMEOUT : String := "BYPASS";
   WAKEUP : String := "USER";
   POROFF : String := "FALSE";
   BGOFF : String := "FALSE"
  );
PORT (
   CLK, USERTIMEOUT, USERSTDBY, CLRFLAG, CFGWAKE, CFGSTDBY : in std_logic := 'X';
   STDBY, STOP, SFLAG  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of PCNTR : Component is true;
--
COMPONENT BCINRD
GENERIC (
   BANKID : Integer := 0
  );
PORT (
   INRDENI  : in std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of BCINRD : Component is true;
   attribute syn_noprune of BCINRD : component is true;
--
COMPONENT BCLVDSO
PORT (
   LVDSENI  : in std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of BCLVDSO : Component is true;
   attribute syn_noprune of BCLVDSO : component is true;
--
COMPONENT INRDB
PORT (
   D, E : in std_logic := 'X';
   Q  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of INRDB : Component is true;
--
COMPONENT LVDSOB
PORT (
   D, E : in std_logic := 'X';
   Q  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of LVDSOB : Component is true;
--
COMPONENT PG
PORT (
   D, E : in std_logic := 'X';
   Q  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of PG : Component is true;
--
COMPONENT EHXPLLJ
GENERIC (
   CLKI_DIV : Integer := 1;
   CLKFB_DIV : Integer := 1;
   CLKOP_DIV : Integer := 8;
   CLKOS_DIV : Integer := 8;
   CLKOS2_DIV : Integer := 8;
   CLKOS3_DIV : Integer := 8;
   CLKOP_ENABLE : String := "ENABLED";
   CLKOS_ENABLE : String := "ENABLED";
   CLKOS2_ENABLE : String := "ENABLED";
   CLKOS3_ENABLE : String := "ENABLED";
   VCO_BYPASS_A0 : String := "DISABLED";
   VCO_BYPASS_B0 : String := "DISABLED";
   VCO_BYPASS_C0 : String := "DISABLED";
   VCO_BYPASS_D0 : String := "DISABLED";
   CLKOP_CPHASE : Integer := 0;
   CLKOS_CPHASE : Integer := 0;
   CLKOS2_CPHASE : Integer := 0;
   CLKOS3_CPHASE : Integer := 0;
   CLKOP_FPHASE : Integer := 0;
   CLKOS_FPHASE : Integer := 0;
   CLKOS2_FPHASE : Integer := 0;
   CLKOS3_FPHASE : Integer := 0;
   FEEDBK_PATH : String := "CLKOP";
   FRACN_ENABLE : String := "DISABLED";
   FRACN_DIV : Integer := 0;
   CLKOP_TRIM_POL : String := "RISING";
   CLKOP_TRIM_DELAY : Integer := 0;
   CLKOS_TRIM_POL : String := "RISING";
   CLKOS_TRIM_DELAY : Integer := 0;
   PLL_USE_WB : String := "DISABLED";
   PREDIVIDER_MUXA1 : Integer := 0;
   PREDIVIDER_MUXB1 : Integer := 0;
   PREDIVIDER_MUXC1 : Integer := 0;
   PREDIVIDER_MUXD1 : Integer := 0;
   OUTDIVIDER_MUXA2 : String := "DIVA";
   OUTDIVIDER_MUXB2 : String := "DIVB";
   OUTDIVIDER_MUXC2 : String := "DIVC";
   OUTDIVIDER_MUXD2 : String := "DIVD";
   PLL_LOCK_MODE : Integer := 0;
   STDBY_ENABLE : String := "DISABLED";
   DPHASE_SOURCE : String := "DISABLED";
   PLLRST_ENA : String := "DISABLED";
   MRST_ENA : String := "DISABLED";
   DCRST_ENA : String := "DISABLED";
   DDRST_ENA : String := "DISABLED";
   INTFB_WAKE : String := "DISABLED"
  );
PORT (
   CLKI, CLKFB, PHASESEL1, PHASESEL0, PHASEDIR, PHASESTEP,
   LOADREG, STDBY, PLLWAKESYNC, RST, RESETM, RESETC, RESETD,
   ENCLKOP, ENCLKOS, ENCLKOS2, ENCLKOS3, PLLCLK, PLLRST, PLLSTB, PLLWE,
   PLLDATI7, PLLDATI6, PLLDATI5, PLLDATI4, PLLDATI3, PLLDATI2, PLLDATI1, PLLDATI0,
   PLLADDR4, PLLADDR3, PLLADDR2, PLLADDR1, PLLADDR0 : in std_logic := 'X';
   CLKOP, CLKOS, CLKOS2, CLKOS3, LOCK, INTLOCK, REFCLK,
   PLLDATO7, PLLDATO6, PLLDATO5, PLLDATO4, PLLDATO3, PLLDATO2, PLLDATO1, PLLDATO0, PLLACK,
   DPHSRC, CLKINTFB : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of EHXPLLJ : Component is true;
--
COMPONENT PLLREFCS
PORT (
   CLK0, CLK1, SEL : in std_logic := 'X';
   PLLCSOUT  : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of PLLREFCS : Component is true;
--
COMPONENT OSCH
GENERIC (
   NOM_FREQ : String := "2.08"
  );
PORT (
   STDBY : in std_logic := 'X';
   OSC, SEDSTDBY : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of OSCH : Component is true;
--
COMPONENT EFB
GENERIC (
   EFB_I2C1 : String := "DISABLED";
   EFB_I2C2 : String := "DISABLED";
   EFB_SPI : String := "DISABLED";
   EFB_TC : String := "DISABLED";
   EFB_TC_PORTMODE : String := "NO_WB";
   EFB_UFM : String := "DISABLED";
   EFB_WB_CLK_FREQ : String := "50.0";

   DEV_DENSITY : String := "1200L";
   UFM_INIT_PAGES : Integer := 0;
   UFM_INIT_START_PAGE : Integer := 0;
   UFM_INIT_ALL_ZEROS : String := "ENABLED";
   UFM_INIT_FILE_NAME : String := "NONE";
   UFM_INIT_FILE_FORMAT : String := "HEX";

   I2C1_ADDRESSING : String := "7BIT";
   I2C2_ADDRESSING : String := "7BIT";
   I2C1_SLAVE_ADDR : String := "0b1000001";
   I2C2_SLAVE_ADDR : String := "0b1000010";
   I2C1_BUS_PERF : String := "100kHz";
   I2C2_BUS_PERF : String := "100kHz";
   I2C1_CLK_DIVIDER : Integer := 1;
   I2C2_CLK_DIVIDER : Integer := 1;
   I2C1_GEN_CALL : String := "DISABLED";
   I2C2_GEN_CALL : String := "DISABLED";
   I2C1_WAKEUP : String := "DISABLED";
   I2C2_WAKEUP : String := "DISABLED";

   SPI_MODE : String := "SLAVE";
   SPI_CLK_DIVIDER : Integer := 1;
   SPI_LSB_FIRST : String := "DISABLED";
   SPI_CLK_INV : String := "DISABLED";
   SPI_PHASE_ADJ : String := "DISABLED";
   SPI_SLAVE_HANDSHAKE : String := "DISABLED";
   SPI_INTR_TXRDY : String := "DISABLED";
   SPI_INTR_RXRDY : String := "DISABLED";
   SPI_INTR_TXOVR : String := "DISABLED";
   SPI_INTR_RXOVR : String := "DISABLED";
   SPI_WAKEUP : String := "DISABLED";

   TC_MODE : String := "CTCM";
   TC_SCLK_SEL : String := "PCLOCK";
   TC_CCLK_SEL : Integer := 1;
   GSR : String := "ENABLED";
   TC_TOP_SET : Integer := 65535;
   TC_OCR_SET : Integer := 32767;
   TC_OC_MODE : String := "TOGGLE";
   TC_RESETN : String := "ENABLED";
   TC_TOP_SEL : String := "ON";
   TC_OV_INT : String := "OFF";
   TC_OCR_INT : String := "OFF";
   TC_ICR_INT : String := "OFF";
   TC_OVERFLOW : String := "ENABLED";
   TC_ICAPTURE : String := "DISABLED"
  );
PORT (
   WBCLKI, WBRSTI, WBCYCI, WBSTBI, WBWEI,
   WBADRI7, WBADRI6, WBADRI5, WBADRI4, WBADRI3, WBADRI2, WBADRI1, WBADRI0,
   WBDATI7, WBDATI6, WBDATI5, WBDATI4, WBDATI3, WBDATI2, WBDATI1, WBDATI0,
   PLL0DATI7, PLL0DATI6, PLL0DATI5, PLL0DATI4, PLL0DATI3, PLL0DATI2, PLL0DATI1, PLL0DATI0, PLL0ACKI,
   PLL1DATI7, PLL1DATI6, PLL1DATI5, PLL1DATI4, PLL1DATI3, PLL1DATI2, PLL1DATI1, PLL1DATI0, PLL1ACKI,
   I2C1SCLI, I2C1SDAI, I2C2SCLI, I2C2SDAI,
   SPISCKI, SPIMISOI, SPIMOSII, SPISCSN,
   TCCLKI, TCRSTN, TCIC, UFMSN : in std_logic := 'X';
   WBDATO7, WBDATO6, WBDATO5, WBDATO4, WBDATO3, WBDATO2, WBDATO1, WBDATO0, WBACKO,
   PLLCLKO, PLLRSTO, PLL0STBO, PLL1STBO, PLLWEO,
   PLLADRO4, PLLADRO3, PLLADRO2, PLLADRO1, PLLADRO0,
   PLLDATO7, PLLDATO6, PLLDATO5, PLLDATO4, PLLDATO3, PLLDATO2, PLLDATO1, PLLDATO0,
   I2C1SCLO, I2C1SCLOEN, I2C1SDAO, I2C1SDAOEN, I2C2SCLO, I2C2SCLOEN, I2C2SDAO, I2C2SDAOEN, I2C1IRQO, I2C2IRQO,
   SPISCKO, SPISCKEN, SPIMISOO, SPIMISOEN, SPIMOSIO, SPIMOSIEN,
   SPIMCSN0, SPIMCSN1, SPIMCSN2, SPIMCSN3, SPIMCSN4, SPIMCSN5, SPIMCSN6, SPIMCSN7, SPICSNEN, SPIIRQO,
   TCINT, TCOC, WBCUFMIRQ, CFGWAKE, CFGSTDBY : out std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of EFB : Component is true;
--
COMPONENT TSALL
PORT (
   TSALL  : in std_logic := 'X'
  );
END COMPONENT;
   attribute syn_black_box of TSALL : Component is true;
   attribute syn_noprune of TSALL : component is true;
--
end Components;

