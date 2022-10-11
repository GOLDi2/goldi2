#ifndef EXECUTE_H
#define EXECUTE_H

#include "util.h"
#include "json/cJSON.h"

extern int verbose;
extern int interrupt;
extern cJSON* faultsJSON;
extern int execution_failed;

typedef struct 
{
    unsigned int length;
    char* tdi;
    char* tdo;
    char* mask;
    char* smask;
} SVF_Shift_Data;

typedef struct 
{
    int type;
    char* label;
    SVF_Shift_Data shift_data;
    int stable_state;
    List* path_states;
    int trst_mode;
    double cycles;
    unsigned int run_count;
    int run_clk;
    double min_time;
    double max_time;
    int end_state;
    int run_state;
} SVF_Instruction;

SVF_Instruction* create_empty_instruction();
void add_instruction(SVF_Instruction* instruction, char* instruction_label);
int execute_instructions();

#endif