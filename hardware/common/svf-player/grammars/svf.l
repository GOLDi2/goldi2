/* scanner for a toy Pascal-like language */

%{
/* need this for the call to atof() below */
#include <limits.h>
#include "parser.h"
%}

STRING          .*
REAL            [0-9]+(("."|",")[0-9]+)?(("E"|"e")("+"|"-")[0-9]+)?
UNSIGNED        [0-9]+
HEXSTRING       "("[0-9A-Fa-f\ \t\n]+")"

%%

"!"{STRING}\n   
"//"{STRING}\n  

{HEXSTRING}     {
                    unsigned int special_characters = 0;
                    for (unsigned int i = 0; i < strlen(yytext); i++)
                    {
                        if (yytext[i] == ' ' || yytext[i] == '\t' || yytext[i] == '\n' || yytext[i] == '(' || yytext[i] == ')')
                        {
                            special_characters++;
                        }
                    }
                    char* text = (char*) malloc(strlen(yytext) - special_characters + 1);
                    int offset = 0;
                    for (int i = 0; i < strlen(yytext) + 1; i++)
                    {
                        if (yytext[i] == ' ' || yytext[i] == '\t' || yytext[i] == '\n' || yytext[i] == '(' || yytext[i] == ')')
                        {
                            offset--;
                            continue;
                        }
                        text[i+offset] = yytext[i];
                    }

                    unsigned int size = (strlen(text))/2 + (strlen(text) % 2);
                    char* hexstring = (char*) malloc(size);
                    for (unsigned int i = 0; i < size; i++) hexstring[i] = 0;
                    for (unsigned int i = 0; i < size; i++)
                    {
                        unsigned char first, second;
                        unsigned int first_pos = (i*2);
                        unsigned int second_pos = (i*2)+1;

                        if (text[first_pos] > 'F') first = (text[first_pos] - 'a' + 10);
                        else if (text[first_pos] > '9') first = (text[first_pos] - 'A' + 10);
                        else first = (text[first_pos] - '0');

                        
                        if (text[second_pos] > 'F') second = (text[second_pos] - 'a' + 10);
                        else if (text[second_pos] > '9') second = (text[second_pos] - 'A' + 10);
                        else second = (text[second_pos] - '0');
                        if (first > 15 || second > 15) 
                        {
                            printf("first: (%c -> %u), second: (%c -> %u)", text[first_pos], first, text[second_pos], second);
                            exit(1);
                        }
                        hexstring[i] = (first << 4) + second;
                    }
                    yylval.string = hexstring;
                    return(SVF_HEXSTRING);
                }
{UNSIGNED}      {
                    unsigned int number = 0;
                    for (unsigned int i = 0; i < strlen(yytext); i++)
                    {
                        number *= 10;
                        number += yytext[i] - '0';
                    }
                    yylval.u = number;
                    return(SVF_UNSIGNED_INT);
                }
{REAL}          {  
                    char* errstr;
                    yylval.d = strtod(yytext, &errstr);
                    return(SVF_REAL_NUMBER);
                }

"RESET"         {
                    yylval.u = SVF_STATE_RESET;
                    return(SVF_STATE_RESET);
                }
"IDLE"          {    
                    yylval.u = SVF_STATE_IDLE;
                    return(SVF_STATE_IDLE);
                }
"DRSELECT"      {    
                    yylval.u = SVF_STATE_DRSELECT;
                    return(SVF_STATE_DRSELECT);
                }
"DRCAPTURE"     {    
                    yylval.u = SVF_STATE_DRCAPTURE;
                    return(SVF_STATE_DRCAPTURE);
                }
"DRSHIFT"       {    
                    yylval.u = SVF_STATE_DRSHIFT;
                    return(SVF_STATE_DRSHIFT);
                }
"DREXIT1"       {    
                    yylval.u = SVF_STATE_DREXIT1;
                    return(SVF_STATE_DREXIT1);
                }
"DRPAUSE"       {    
                    yylval.u = SVF_STATE_DRPAUSE;
                    return(SVF_STATE_DRPAUSE);
                }
"DREXIT2"       {    
                    yylval.u = SVF_STATE_DREXIT2;
                    return(SVF_STATE_DREXIT2);
                }
"DRUPDATE"      {    
                    yylval.u = SVF_STATE_DRUPDATE;
                    return(SVF_STATE_DRUPDATE);
                }
"IRSELECT"      {    
                    yylval.u = SVF_STATE_IRSELECT;
                    return(SVF_STATE_IRSELECT);
                }
"IRCAPTURE"     {    
                    yylval.u = SVF_STATE_IRCAPTURE;
                    return(SVF_STATE_IRCAPTURE);
                }
"IRSHIFT"       {    
                    yylval.u = SVF_STATE_IRSHIFT;
                    return(SVF_STATE_IRSHIFT);
                }
"IREXIT1"       {    
                    yylval.u = SVF_STATE_IREXIT1;
                    return(SVF_STATE_IREXIT1);
                }
"IRPAUSE"       {    
                    yylval.u = SVF_STATE_IRPAUSE;
                    return(SVF_STATE_IRPAUSE);
                }
"IREXIT2"       {    
                    yylval.u = SVF_STATE_IREXIT2;
                    return(SVF_STATE_IREXIT2);
                }
"IRUPDATE"      {    
                    yylval.u = SVF_STATE_IRUPDATE;
                    return(SVF_STATE_IRUPDATE);
                }

"ENDDR"         {    
                    yylval.u = SVF_INSTRUCTION_ENDDR;
                    return(SVF_INSTRUCTION_ENDDR);
                }
"ENDIR"         {    
                    yylval.u = SVF_INSTRUCTION_ENDIR;
                    return(SVF_INSTRUCTION_ENDIR);
                }
"FREQUENCY"     {    
                    yylval.u = SVF_INSTRUCTION_FREQUENCY;
                    return(SVF_INSTRUCTION_FREQUENCY);
                }
"HDR"           {    
                    yylval.u = SVF_INSTRUCTION_HDR;
                    return(SVF_INSTRUCTION_HDR);
                }
"HIR"           {    
                    yylval.u = SVF_INSTRUCTION_HIR;
                    return(SVF_INSTRUCTION_HIR);
                }
"PIO"           {    
                    yylval.u = SVF_INSTRUCTION_PIO;
                    return(SVF_INSTRUCTION_PIO);
                }
"PIOMAP"        {    
                    yylval.u = SVF_INSTRUCTION_PIOMAP;
                    return(SVF_INSTRUCTION_PIOMAP);
                }
"RUNTEST"       {    
                    yylval.u = SVF_INSTRUCTION_RUNTEST;
                    return(SVF_INSTRUCTION_RUNTEST);
                }
"SDR"           {    
                    yylval.u = SVF_INSTRUCTION_SDR;
                    return(SVF_INSTRUCTION_SDR);
                }
"SIR"           {    
                    yylval.u = SVF_INSTRUCTION_SIR;
                    return(SVF_INSTRUCTION_SIR);
                }
"STATE"         {    
                    yylval.u = SVF_INSTRUCTION_STATE;
                    return(SVF_INSTRUCTION_STATE);
                }
"TDR"           {    
                    yylval.u = SVF_INSTRUCTION_TDR;
                    return(SVF_INSTRUCTION_TDR);
                }
"TIR"           {    
                    yylval.u = SVF_INSTRUCTION_TIR;
                    return(SVF_INSTRUCTION_TIR);
                }
"TRST"          {    
                    yylval.u = SVF_INSTRUCTION_TRST;
                    return(SVF_INSTRUCTION_TRST);
                }

"TDI"           return(SVF_TDI);
"TDO"           return(SVF_TDO);
"MASK"          return(SVF_MASK);
"SMASK"         return(SVF_SMASK);

"HZ"            return(SVF_HZ);

"ON"            {    
                    yylval.u = SVF_TRST_MODE_ON;
                    return(SVF_TRST_MODE_ON);
                }
"OFF"           {    
                    yylval.u = SVF_TRST_MODE_OFF;
                    return(SVF_TRST_MODE_OFF);
                }
"Z"             {    
                    yylval.u = SVF_TRST_MODE_Z;
                    return(SVF_TRST_MODE_Z);
                }
"ABSENT"        {    
                    yylval.u = SVF_TRST_MODE_ABSENT;
                    return(SVF_TRST_MODE_ABSENT);
                }

"TCK"           {    
                    yylval.u = SVF_RUN_CLK_TCK;
                    return(SVF_RUN_CLK_TCK);
                }
"SCK"           {    
                    yylval.u = SVF_RUN_CLK_SCK;
                    return(SVF_RUN_CLK_SCK);
                }
"SEC"           return(SVF_SEC);
"MAXIMUM"       return(SVF_MAXIMUM);
"ENDSTATE"      return(SVF_ENDSTATE);

[ \t\n]+            /* eat up whitespace */

";"             return(SVF_INSTRUCTION_END);

%%