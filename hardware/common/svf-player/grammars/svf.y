%code requires {
#define YYMAXDEPTH 200000
#include "../util.h"
#include "../execute.h"
}

%{
#include <stdio.h>
#include "lexer.h"
#include "parser.h"

extern FILE* yyin;
//int yydebug=1;

char* current_instruction_label = NULL;

int yyerror(char* s)
{
    fprintf(stderr, "%s\n",s);
    return 0;
}

static int parse_enddr(int stable_state)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_ENDDR;
    instruction->stable_state = stable_state;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_endir(int stable_state)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_ENDIR;
    instruction->stable_state = stable_state;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_frequency(double cycles)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_FREQUENCY;
    instruction->cycles = cycles;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_hdr(SVF_Shift_Data shift_data)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_HDR;
    instruction->shift_data = shift_data;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_hir(SVF_Shift_Data shift_data)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_HIR;
    instruction->shift_data = shift_data;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_pio()
{
    printf("PIO is currently not implemented!\n");
    return 1;
}

static int parse_piomap()
{
    printf("PIOMAP is currently not implemented!\n");
    return 1;
}

static int parse_runtest(int run_state, unsigned int run_count, int run_clk, double min_time, double max_time, int end_state)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_RUNTEST;
    instruction->run_state = run_state;
    instruction->run_count = run_count;
    instruction->run_clk = run_clk;
    instruction->min_time = min_time;
    instruction->max_time = max_time;
    instruction->end_state = end_state;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_sdr(SVF_Shift_Data shift_data)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_SDR;
    instruction->shift_data = shift_data;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_sir(SVF_Shift_Data shift_data)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_SIR;
    instruction->shift_data = shift_data;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_state(List* path_states, int stable_state)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_STATE;
    instruction->path_states = path_states;
    instruction->stable_state = stable_state;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_tdr(SVF_Shift_Data shift_data)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_TDR;
    instruction->shift_data = shift_data;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_tir(SVF_Shift_Data shift_data)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_TIR;
    instruction->shift_data = shift_data;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

static int parse_trst(int trst_mode)
{
    SVF_Instruction* instruction = create_empty_instruction();
    instruction->type = SVF_INSTRUCTION_TRST;
    instruction->trst_mode = trst_mode;
    add_instruction(instruction, current_instruction_label);
    current_instruction_label = NULL;
    return 0;
}

%}

%start program

%union 
{
    double d;
    List* list;
    char* string; 
    unsigned int u;
    SVF_Shift_Data shift_data;
}

%type <d> cycles min max; 
%type <list> statelist; 
%type <string> tdi tdo mask smask; 
%type <u> trst_mode run_clk stable_state state end_state; 
%type <shift_data> common; 

/* commands */
%token <u>  SVF_INSTRUCTION_ENDDR
            SVF_INSTRUCTION_ENDIR
            SVF_INSTRUCTION_FREQUENCY
            SVF_INSTRUCTION_HDR
            SVF_INSTRUCTION_HIR
            SVF_INSTRUCTION_PIO
            SVF_INSTRUCTION_PIOMAP
            SVF_INSTRUCTION_RUNTEST
            SVF_INSTRUCTION_SDR
            SVF_INSTRUCTION_SIR
            SVF_INSTRUCTION_STATE
            SVF_INSTRUCTION_TDR
            SVF_INSTRUCTION_TIR
            SVF_INSTRUCTION_TRST
            SVF_INSTRUCTION_LABEL

/* states */
%token  <u> SVF_STATE_RESET
            SVF_STATE_IDLE
            SVF_STATE_DRSELECT
            SVF_STATE_DRCAPTURE
            SVF_STATE_DRSHIFT
            SVF_STATE_DREXIT1
            SVF_STATE_DRPAUSE
            SVF_STATE_DREXIT2
            SVF_STATE_DRUPDATE
            SVF_STATE_IRSELECT
            SVF_STATE_IRCAPTURE
            SVF_STATE_IRSHIFT
            SVF_STATE_IREXIT1
            SVF_STATE_IRPAUSE
            SVF_STATE_IREXIT2
            SVF_STATE_IRUPDATE

/* basic data types */
%token  <d> SVF_REAL_NUMBER 
%token  <u> SVF_UNSIGNED_INT 
%token  <string>    SVF_HEXSTRING 

/* special data types */
%token  <u> SVF_RUN_CLK_TCK
            SVF_RUN_CLK_SCK
            SVF_TRST_MODE_ON
            SVF_TRST_MODE_OFF
            SVF_TRST_MODE_Z
            SVF_TRST_MODE_ABSENT

/* special keywords */
%token  <string>    SVF_HZ 
                    SVF_MAXIMUM 
                    SVF_SEC 
                    SVF_ENDSTATE
                    SVF_TDI
                    SVF_TDO
                    SVF_MASK
                    SVF_SMASK
                    SVF_INSTRUCTION_END

/* beginning of rules section */
%%

program:    command | command program;

command:    SVF_INSTRUCTION_LABEL 
            {
                current_instruction_label = $<string>1;
            } |
            SVF_INSTRUCTION_ENDDR stable_state end 
            {
                parse_enddr($<u>2);
            } |
            SVF_INSTRUCTION_ENDIR stable_state end 
            {
                parse_endir($<u>2);
            } |
            SVF_INSTRUCTION_FREQUENCY end 
            {
                parse_frequency(0);
            } |
            SVF_INSTRUCTION_FREQUENCY cycles end 
            {
                parse_frequency($<d>2);
            } |
            SVF_INSTRUCTION_HDR common end 
            {
                parse_hdr($<shift_data>2);
            } |
            SVF_INSTRUCTION_HIR common end 
            {
                parse_hir($<shift_data>2);
            } |
            SVF_INSTRUCTION_PIO
            {
                parse_pio();
            } |
            SVF_INSTRUCTION_PIOMAP
            {
                parse_piomap();
            } |
            SVF_INSTRUCTION_RUNTEST SVF_UNSIGNED_INT run_clk end 
            {
                parse_runtest(0,$<u>2,$<u>3,0,0,0);
            } |
            SVF_INSTRUCTION_RUNTEST SVF_UNSIGNED_INT run_clk min end 
            {
                parse_runtest(0,$<u>2,$<u>3,$<d>4,0,0);
            } |
            SVF_INSTRUCTION_RUNTEST SVF_UNSIGNED_INT run_clk min max end 
            {
                parse_runtest(0,$<u>2,$<u>3,$<d>4,$<d>5,0);
            } |
            SVF_INSTRUCTION_RUNTEST SVF_UNSIGNED_INT run_clk end_state end 
            {
                parse_runtest(0,$<u>2,$<u>3,0,0,$<u>4);
            } |
            SVF_INSTRUCTION_RUNTEST SVF_UNSIGNED_INT run_clk min end_state end 
            {
                parse_runtest(0,$<u>2,$<u>3,$<d>4,0,$<u>5);
            } |
            SVF_INSTRUCTION_RUNTEST SVF_UNSIGNED_INT run_clk min max end_state end 
            {
                parse_runtest(0,$<u>2,$<u>3,$<d>4,$<d>5,$<u>6);
            } |
            SVF_INSTRUCTION_RUNTEST stable_state SVF_UNSIGNED_INT run_clk end 
            {
                parse_runtest($<u>2,$<u>3,$<u>4,0,0,0);
            } |
            SVF_INSTRUCTION_RUNTEST stable_state SVF_UNSIGNED_INT run_clk min end 
            {
                parse_runtest($<u>2,$<u>3,$<u>4,$<d>5,0,0);
            } |
            SVF_INSTRUCTION_RUNTEST stable_state SVF_UNSIGNED_INT run_clk min max end 
            {
                parse_runtest($<u>2,$<u>3,$<u>4,$<d>5,$<d>6,0);
            } |
            SVF_INSTRUCTION_RUNTEST stable_state SVF_UNSIGNED_INT run_clk end_state end 
            {
                parse_runtest($<u>2,$<u>3,$<u>4,0,0,$<u>5);
            } |
            SVF_INSTRUCTION_RUNTEST stable_state SVF_UNSIGNED_INT run_clk min end_state end 
            {
                parse_runtest($<u>2,$<u>3,$<u>4,$<d>5,0,$<u>6);
            } |
            SVF_INSTRUCTION_RUNTEST stable_state SVF_UNSIGNED_INT run_clk min max end_state end 
            {
                parse_runtest($<u>2,$<u>3,$<u>4,$<d>5,$<d>6,$<u>7);
            } |
            SVF_INSTRUCTION_RUNTEST min end 
            {
                parse_runtest(0,0,0,$<d>2,0,0);
            } |
            SVF_INSTRUCTION_RUNTEST min max end 
            {
                parse_runtest(0,0,0,$<d>2,$<d>3,0);
            } |
            SVF_INSTRUCTION_RUNTEST min end_state end 
            {
                parse_runtest(0,0,0,$<d>2,0,$<u>3);
            } |
            SVF_INSTRUCTION_RUNTEST min max end_state end 
            {
                parse_runtest(0,0,0,$<d>2,$<d>3,$<u>4);
            } |
            SVF_INSTRUCTION_RUNTEST stable_state min end 
            {
                parse_runtest($<u>2,0,0,$<d>3,0,0);
            } |
            SVF_INSTRUCTION_RUNTEST stable_state min max end 
            {
                parse_runtest($<u>2,0,0,$<d>3,$<d>4,0);
            } |
            SVF_INSTRUCTION_RUNTEST stable_state min end_state end 
            {
                parse_runtest($<u>2,0,0,$<d>3,0,$<u>4);
            } |
            SVF_INSTRUCTION_RUNTEST stable_state min max end_state end 
            {
                parse_runtest($<u>2,0,0,$<d>3,$<d>4,$<u>5);
            } |
            SVF_INSTRUCTION_SDR SVF_UNSIGNED_INT end 
            {
                SVF_Shift_Data shift_data = {$<u>2, NULL, NULL, NULL, NULL};
                parse_sdr(shift_data);
            } |
            SVF_INSTRUCTION_SDR common end 
            {
                parse_sdr($<shift_data>2);
            } |
            SVF_INSTRUCTION_SIR common end 
            {
                parse_sir($<shift_data>2);
            } |
            SVF_INSTRUCTION_STATE stable_state end 
            {
                parse_state(NULL, $<u>2);
            } |
            SVF_INSTRUCTION_STATE statelist end 
            {
                parse_state($<list>2, $<u>3);
            } |
            SVF_INSTRUCTION_TDR common end 
            {
                parse_tdr($<shift_data>2);
            } |
            SVF_INSTRUCTION_TIR common end 
            {
                parse_tir($<shift_data>2);
            } |
            SVF_INSTRUCTION_TRST trst_mode end
            {
                parse_trst($<u>2);
            };

stable_state:   SVF_STATE_RESET | SVF_STATE_IDLE | SVF_STATE_DRPAUSE | SVF_STATE_IRPAUSE;
state:  SVF_STATE_RESET | SVF_STATE_IDLE | SVF_STATE_DRSELECT | SVF_STATE_DRCAPTURE | SVF_STATE_DRSHIFT |
        SVF_STATE_DREXIT1 | SVF_STATE_DRPAUSE | SVF_STATE_DREXIT2 | SVF_STATE_DRUPDATE | SVF_STATE_IRSELECT |
        SVF_STATE_IRCAPTURE | SVF_STATE_IRSHIFT | SVF_STATE_IREXIT1 | SVF_STATE_IRPAUSE | SVF_STATE_IREXIT2 |
        SVF_STATE_IRUPDATE;

end:    SVF_INSTRUCTION_END;

tdi:    SVF_TDI SVF_HEXSTRING
        {
            $$ = $2;
        };
tdo:    SVF_TDO SVF_HEXSTRING
        {
            $$ = $2;
        };
mask:   SVF_MASK SVF_HEXSTRING
        {
            $$ = $2;
        };
smask:  SVF_SMASK SVF_HEXSTRING
        {
            $$ = $2;
        };

common: SVF_UNSIGNED_INT 
        {
            SVF_Shift_Data shift_data = {$1, NULL, NULL, NULL, NULL};
            $$ = shift_data;
        } |
        SVF_UNSIGNED_INT tdi 
        {
            SVF_Shift_Data shift_data = {$1, $2, NULL, NULL, NULL};
            $$ = shift_data;
        } |
        SVF_UNSIGNED_INT tdi tdo 
        {
            SVF_Shift_Data shift_data = {$1, $2, $3, NULL, NULL};
            $$ = shift_data;
        } |
        SVF_UNSIGNED_INT tdi mask 
        {
            SVF_Shift_Data shift_data = {$1, $2, NULL, $3, NULL};
            $$ = shift_data;
        } |
        SVF_UNSIGNED_INT tdi smask 
        {
            SVF_Shift_Data shift_data = {$1, $2, NULL, NULL, $3};
            $$ = shift_data;
        } |
        SVF_UNSIGNED_INT tdi tdo mask 
        {
            SVF_Shift_Data shift_data = {$1, $2, $3, $4, NULL};
            $$ = shift_data;
        } |
        SVF_UNSIGNED_INT tdi tdo smask 
        {
            SVF_Shift_Data shift_data = {$1, $2, $3, NULL, $4};
            $$ = shift_data;
        } |
        SVF_UNSIGNED_INT tdi mask smask 
        {
            SVF_Shift_Data shift_data = {$1, $2, NULL, $3, $4};
            $$ = shift_data;
        } |
        SVF_UNSIGNED_INT tdi tdo mask smask
        {
            SVF_Shift_Data shift_data = {$1, $2, $3, $4, $5};
            $$ = shift_data;
        };

statelist:  stable_state 
            {
                $$ = create_list();
                unsigned long val = $1;
                list_append($$, (void*) val);
            } | 
            state statelist
            {
                unsigned long val = $1;
                list_append($2, (void*) val);
                $$ = $2;
            };

cycles: SVF_REAL_NUMBER SVF_HZ
        {
            $$ = $1;
        };

run_clk:    SVF_RUN_CLK_TCK | SVF_RUN_CLK_SCK;
min:    SVF_REAL_NUMBER SVF_SEC
        {
            $$ = $1;
        };
max:    SVF_MAXIMUM SVF_REAL_NUMBER SVF_SEC
        {
            $$ = $2;
        };

end_state:  SVF_ENDSTATE stable_state
            {
                $$ = $2;
            };

trst_mode:  SVF_TRST_MODE_ON | SVF_TRST_MODE_OFF | SVF_TRST_MODE_Z | SVF_TRST_MODE_ABSENT;
%%

int yywrap()
{
    return(1);
}