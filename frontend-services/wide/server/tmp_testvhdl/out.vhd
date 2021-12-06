LIBRARY	ieee;
USE	ieee.std_logic_1164.ALL;
USE	ieee.std_logic_arith.ALL;
use ieee.numeric_std.all; 

ENTITY Output IS
	PORT
	(
		CLK_CPLD : in std_logic;
		RESET_CPLD : in std_logic;
		BUTTON1 : in std_logic;
		Hex_0_c : out std_logic;
		Hex_0_b : out std_logic;
		Hex_0_a : out std_logic;
		Hex_0_g : out std_logic;
		Hex_0_f : out std_logic;
		Hex_0_e : out std_logic;
		Hex_0_d : out std_logic
	);

END Output;

ARCHITECTURE rtl OF Output IS

	signal btn_0 : std_logic := '0';
	signal clk_automaton_0 : std_logic := '0';
	signal reset_automaton_0 : std_logic := '0';
	signal segment_output_0 : std_logic := '0';
	signal segment_output_1 : std_logic := '0';
	signal segment_output_2 : std_logic := '0';
	signal segment_output_3 : std_logic := '0';
	signal segment_output_4 : std_logic := '0';
	signal segment_output_5 : std_logic := '0';
	signal segment_output_6 : std_logic := '0';
	signal a : std_logic := '0';
	signal z0 : std_logic := '0';
	signal z1 : std_logic := '0';
	signal z2 : std_logic := '0';
	signal z3 : std_logic := '0';
	signal z4 : std_logic := '0';
	signal digit_0 : std_logic := '0';
	signal digit_1 : std_logic := '0';
	signal digit_2 : std_logic := '0';
	signal digit_3 : std_logic := '0';
	signal x0 : std_logic := '0';
	signal x1 : std_logic := '0';
	signal x2 : std_logic := '0';
	signal x3 : std_logic := '0';
	signal segment_0 : std_logic := '0';
	signal segment_6 : std_logic := '0';
	signal segment_1 : std_logic := '0';
	signal segment_5 : std_logic := '0';
	signal segment_2 : std_logic := '0';
	signal segment_4 : std_logic := '0';
	signal segment_3 : std_logic := '0';


BEGIN

	Hex_0_c <= segment_output_2;
	Hex_0_b <= segment_output_1;
	Hex_0_a <= segment_output_0;
	Hex_0_g <= segment_output_6;
	Hex_0_f <= segment_output_5;
	Hex_0_e <= segment_output_4;
	Hex_0_d <= segment_output_3;
	clk_automaton_0 <= CLK_CPLD;
	reset_automaton_0 <= RESET_CPLD;
	btn_0 <= BUTTON1;

	process (clk_automaton_0, reset_automaton_0) begin
		if reset_automaton_0 = '1' then

			segment_0 <= '0';
			x0 <= '0';
			digit_0 <= '0';
			z0 <= '0';
			a <= '0';
			z2 <= '0';
			z1 <= '0';
			z3 <= '0';
			z4 <= '0';
			x1 <= '0';
			digit_1 <= '0';
			x2 <= '0';
			digit_2 <= '0';
			x3 <= '0';
			digit_3 <= '0';
			segment_1 <= '0';
			segment_2 <= '0';
			segment_3 <= '0';
			segment_4 <= '0';
			segment_5 <= '0';
			segment_6 <= '0';

		elsif reset_automaton_0 = '0' then

			if rising_edge(clk_automaton_0) then

				segment_0 <= ((((((((( NOT (x2) AND x3) AND  NOT (x1)) OR (( NOT (x3) AND  NOT (x2)) AND  NOT (x0))) OR (( NOT (x3) AND x2) AND x0)) OR ( NOT (x3) AND x1)) OR (( NOT (x2) AND x3) AND  NOT (x1))) OR (( NOT (x3) AND x2) AND x0)) OR (( NOT (x2) AND  NOT (x1)) AND  NOT (x0))) OR ( NOT (x3) AND x1));
				x0 <= digit_0;
				digit_0 <= (((((( NOT (z3) AND  NOT (z2)) AND  NOT (z1)) AND z0) OR ((( NOT (z3) AND  NOT (z2)) AND z1) AND  NOT (z0))) OR (( NOT (z4) AND  NOT (z1)) AND z0)) OR (( NOT (z4) AND z1) AND  NOT (z0)));
				z0 <= ((( NOT (z3) AND  NOT (z2)) AND a) OR ( NOT (z4) AND a));
				a <= btn_0;
				z2 <= ((((((( NOT (z4) AND  NOT (z2)) AND z1) AND z0) AND  NOT (a)) OR (( NOT (z4) AND z2) AND  NOT (z1))) OR (( NOT (z4) AND z2) AND  NOT (z0))) OR (( NOT (z4) AND z2) AND a));
				z1 <= ((((((((( NOT (z3) AND  NOT (z2)) AND  NOT (z1)) AND z0) AND  NOT (a)) OR ((( NOT (z4) AND  NOT (z1)) AND z0) AND  NOT (a))) OR ((( NOT (z3) AND  NOT (z2)) AND z1) AND  NOT (z0))) OR ((( NOT (z3) AND  NOT (z2)) AND z1) AND a)) OR (( NOT (z4) AND z1) AND  NOT (z0))) OR (( NOT (z4) AND z1) AND a));
				z3 <= ((((((((( NOT (z4) AND  NOT (z3)) AND z2) AND z1) AND z0) AND  NOT (a)) OR (( NOT (z4) AND z3) AND  NOT (z2))) OR (( NOT (z4) AND z3) AND  NOT (z1))) OR (( NOT (z4) AND z3) AND  NOT (z0))) OR (( NOT (z4) AND z3) AND a));
				z4 <= (((((((( NOT (z4) AND z3) AND z2) AND z1) AND z0) AND  NOT (a)) OR ((( NOT (z3) AND z4) AND  NOT (z2)) AND  NOT (z1))) OR ((( NOT (z3) AND z4) AND  NOT (z2)) AND  NOT (z0))) OR ((( NOT (z3) AND z4) AND  NOT (z2)) AND a));
				x1 <= digit_1;
				digit_1 <= ((((( NOT (z4) AND  NOT (z2)) AND z1) AND z0) OR (( NOT (z4) AND z2) AND  NOT (z1))) OR (( NOT (z4) AND z2) AND  NOT (z0)));
				x2 <= digit_2;
				digit_2 <= ((((((( NOT (z4) AND  NOT (z3)) AND z2) AND z1) AND z0) OR (( NOT (z4) AND z3) AND  NOT (z2))) OR (( NOT (z4) AND z3) AND  NOT (z1))) OR (( NOT (z4) AND z3) AND  NOT (z0)));
				x3 <= digit_3;
				digit_3 <= (((((( NOT (z4) AND z3) AND z2) AND z1) AND z0) OR ((( NOT (z3) AND z4) AND  NOT (z2)) AND  NOT (z1))) OR ((( NOT (z3) AND z4) AND  NOT (z2)) AND  NOT (z0)));
				segment_1 <= ((((( NOT (x3) AND  NOT (x1)) AND  NOT (x0)) OR (( NOT (x3) AND x1) AND x0)) OR ( NOT (x3) AND  NOT (x2))) OR ( NOT (x2) AND  NOT (x1)));
				segment_2 <= ((( NOT (x3) AND x2) OR ( NOT (x3) AND x0)) OR ( NOT (x2) AND  NOT (x1)));
				segment_3 <= (((((((((((( NOT (x3) AND x2) AND  NOT (x1)) AND x0) OR (( NOT (x3) AND  NOT (x2)) AND x1)) OR (( NOT (x2) AND x3) AND  NOT (x1))) OR (( NOT (x3) AND  NOT (x2)) AND  NOT (x0))) OR (( NOT (x3) AND x1) AND  NOT (x0))) OR ((( NOT (x3) AND x2) AND  NOT (x1)) AND x0)) OR (( NOT (x3) AND  NOT (x2)) AND x1)) OR (( NOT (x2) AND x3) AND  NOT (x1))) OR (( NOT (x3) AND x1) AND  NOT (x0))) OR (( NOT (x2) AND  NOT (x1)) AND  NOT (x0)));
				segment_4 <= ((( NOT (x3) AND x1) AND  NOT (x0)) OR (( NOT (x2) AND  NOT (x1)) AND  NOT (x0)));
				segment_5 <= ((((((((( NOT (x3) AND x2) AND  NOT (x1)) OR (( NOT (x2) AND x3) AND  NOT (x1))) OR (( NOT (x3) AND x2) AND  NOT (x0))) OR (( NOT (x3) AND  NOT (x1)) AND  NOT (x0))) OR (( NOT (x3) AND x2) AND  NOT (x1))) OR (( NOT (x2) AND x3) AND  NOT (x1))) OR (( NOT (x3) AND x2) AND  NOT (x0))) OR (( NOT (x2) AND  NOT (x1)) AND  NOT (x0)));
				segment_6 <= ((((((((( NOT (x3) AND  NOT (x2)) AND x1) OR (( NOT (x3) AND x2) AND  NOT (x1))) OR (( NOT (x2) AND x3) AND  NOT (x1))) OR (( NOT (x3) AND x2) AND  NOT (x0))) OR (( NOT (x3) AND  NOT (x2)) AND x1)) OR (( NOT (x3) AND x2) AND  NOT (x1))) OR (( NOT (x2) AND x3) AND  NOT (x1))) OR (( NOT (x3) AND x1) AND  NOT (x0)));

			end if;

		end if;
	end process;

	segment_output_0 <=  NOT (segment_0);
	segment_output_1 <=  NOT (segment_1);
	segment_output_2 <=  NOT (segment_2);
	segment_output_3 <=  NOT (segment_3);
	segment_output_4 <=  NOT (segment_4);
	segment_output_5 <=  NOT (segment_5);
	segment_output_6 <=  NOT (segment_6);



END rtl;

LIBRARY	ieee;
USE	ieee.std_logic_1164.ALL;
USE	ieee.std_logic_arith.ALL;
use ieee.numeric_std.all; 
ENTITY Output_top_module IS
	PORT
	(
		CLK_CPLD : in std_logic;
		RESET_CPLD : in std_logic;
		BUTTON1 : in std_logic;
		Hex_0_c : out std_logic;
		Hex_0_b : out std_logic;
		Hex_0_a : out std_logic;
		Hex_0_g : out std_logic;
		Hex_0_f : out std_logic;
		Hex_0_e : out std_logic;
		Hex_0_d : out std_logic
	);
END Output_top_module;

ARCHITECTURE rtl OF Output_top_module IS
COMPONENT Output
	PORT
	(
		CLK_CPLD : in std_logic;
		RESET_CPLD : in std_logic;
		BUTTON1 : in std_logic;
		Hex_0_c : out std_logic;
		Hex_0_b : out std_logic;
		Hex_0_a : out std_logic;
		Hex_0_g : out std_logic;
		Hex_0_f : out std_logic;
		Hex_0_e : out std_logic;
		Hex_0_d : out std_logic
	);
END COMPONENT;

	signal CLK_CPLD_sig : std_logic;
	signal RESET_CPLD_sig : std_logic;
	signal BUTTON1_sig : std_logic;

BEGIN
	CLK_CPLD_sig <= CLK_CPLD;

	RESET_CPLD_sig <= RESET_CPLD;

	BUTTON1_sig <= BUTTON1;



	Output_inst : Output
	port map
	(
			CLK_CPLD => CLK_CPLD_sig,
			RESET_CPLD => RESET_CPLD_sig,
			BUTTON1 => BUTTON1_sig,
			Hex_0_c => Hex_0_c,
			Hex_0_b => Hex_0_b,
			Hex_0_a => Hex_0_a,
			Hex_0_g => Hex_0_g,
			Hex_0_f => Hex_0_f,
			Hex_0_e => Hex_0_e,
			Hex_0_d => Hex_0_d
	);
END rtl;