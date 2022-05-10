/* A Bison parser, made by GNU Bison 3.5.1.  */

/* Bison interface for Yacc-like parsers in C

   Copyright (C) 1984, 1989-1990, 2000-2015, 2018-2020 Free Software Foundation,
   Inc.

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <http://www.gnu.org/licenses/>.  */

/* As a special exception, you may create a larger work that contains
   part or all of the Bison parser skeleton and distribute that work
   under terms of your choice, so long as that work isn't itself a
   parser generator using the skeleton or a modified version thereof
   as a parser skeleton.  Alternatively, if you modify or redistribute
   the parser skeleton itself, you may (at your option) remove this
   special exception, which will cause the skeleton and the resulting
   Bison output files to be licensed under the GNU General Public
   License without this special exception.

   This special exception was added by the Free Software Foundation in
   version 2.2 of Bison.  */

/* Undocumented macros, especially those whose name start with YY_,
   are private implementation details.  Do not rely on them.  */

#ifndef YY_YY_SRC_PARSER_H_INCLUDED
# define YY_YY_SRC_PARSER_H_INCLUDED
/* Debug traces.  */
#ifndef YYDEBUG
# define YYDEBUG 0
#endif
#if YYDEBUG
extern int yydebug;
#endif
/* "%code requires" blocks.  */
#line 1 "grammars/svf.y"

#define YYMAXDEPTH 200000
#include "util.h"
#include "execute.h"

#line 54 "src/parser.h"

/* Token type.  */
#ifndef YYTOKENTYPE
# define YYTOKENTYPE
  enum yytokentype
  {
    SVF_INSTRUCTION_ENDDR = 258,
    SVF_INSTRUCTION_ENDIR = 259,
    SVF_INSTRUCTION_FREQUENCY = 260,
    SVF_INSTRUCTION_HDR = 261,
    SVF_INSTRUCTION_HIR = 262,
    SVF_INSTRUCTION_PIO = 263,
    SVF_INSTRUCTION_PIOMAP = 264,
    SVF_INSTRUCTION_RUNTEST = 265,
    SVF_INSTRUCTION_SDR = 266,
    SVF_INSTRUCTION_SIR = 267,
    SVF_INSTRUCTION_STATE = 268,
    SVF_INSTRUCTION_TDR = 269,
    SVF_INSTRUCTION_TIR = 270,
    SVF_INSTRUCTION_TRST = 271,
    SVF_INSTRUCTION_LABEL = 272,
    SVF_STATE_RESET = 273,
    SVF_STATE_IDLE = 274,
    SVF_STATE_DRSELECT = 275,
    SVF_STATE_DRCAPTURE = 276,
    SVF_STATE_DRSHIFT = 277,
    SVF_STATE_DREXIT1 = 278,
    SVF_STATE_DRPAUSE = 279,
    SVF_STATE_DREXIT2 = 280,
    SVF_STATE_DRUPDATE = 281,
    SVF_STATE_IRSELECT = 282,
    SVF_STATE_IRCAPTURE = 283,
    SVF_STATE_IRSHIFT = 284,
    SVF_STATE_IREXIT1 = 285,
    SVF_STATE_IRPAUSE = 286,
    SVF_STATE_IREXIT2 = 287,
    SVF_STATE_IRUPDATE = 288,
    SVF_REAL_NUMBER = 289,
    SVF_UNSIGNED_INT = 290,
    SVF_HEXSTRING = 291,
    SVF_RUN_CLK_TCK = 292,
    SVF_RUN_CLK_SCK = 293,
    SVF_TRST_MODE_ON = 294,
    SVF_TRST_MODE_OFF = 295,
    SVF_TRST_MODE_Z = 296,
    SVF_TRST_MODE_ABSENT = 297,
    SVF_HZ = 298,
    SVF_MAXIMUM = 299,
    SVF_SEC = 300,
    SVF_ENDSTATE = 301,
    SVF_TDI = 302,
    SVF_TDO = 303,
    SVF_MASK = 304,
    SVF_SMASK = 305,
    SVF_INSTRUCTION_END = 306
  };
#endif
/* Tokens.  */
#define SVF_INSTRUCTION_ENDDR 258
#define SVF_INSTRUCTION_ENDIR 259
#define SVF_INSTRUCTION_FREQUENCY 260
#define SVF_INSTRUCTION_HDR 261
#define SVF_INSTRUCTION_HIR 262
#define SVF_INSTRUCTION_PIO 263
#define SVF_INSTRUCTION_PIOMAP 264
#define SVF_INSTRUCTION_RUNTEST 265
#define SVF_INSTRUCTION_SDR 266
#define SVF_INSTRUCTION_SIR 267
#define SVF_INSTRUCTION_STATE 268
#define SVF_INSTRUCTION_TDR 269
#define SVF_INSTRUCTION_TIR 270
#define SVF_INSTRUCTION_TRST 271
#define SVF_INSTRUCTION_LABEL 272
#define SVF_STATE_RESET 273
#define SVF_STATE_IDLE 274
#define SVF_STATE_DRSELECT 275
#define SVF_STATE_DRCAPTURE 276
#define SVF_STATE_DRSHIFT 277
#define SVF_STATE_DREXIT1 278
#define SVF_STATE_DRPAUSE 279
#define SVF_STATE_DREXIT2 280
#define SVF_STATE_DRUPDATE 281
#define SVF_STATE_IRSELECT 282
#define SVF_STATE_IRCAPTURE 283
#define SVF_STATE_IRSHIFT 284
#define SVF_STATE_IREXIT1 285
#define SVF_STATE_IRPAUSE 286
#define SVF_STATE_IREXIT2 287
#define SVF_STATE_IRUPDATE 288
#define SVF_REAL_NUMBER 289
#define SVF_UNSIGNED_INT 290
#define SVF_HEXSTRING 291
#define SVF_RUN_CLK_TCK 292
#define SVF_RUN_CLK_SCK 293
#define SVF_TRST_MODE_ON 294
#define SVF_TRST_MODE_OFF 295
#define SVF_TRST_MODE_Z 296
#define SVF_TRST_MODE_ABSENT 297
#define SVF_HZ 298
#define SVF_MAXIMUM 299
#define SVF_SEC 300
#define SVF_ENDSTATE 301
#define SVF_TDI 302
#define SVF_TDO 303
#define SVF_MASK 304
#define SVF_SMASK 305
#define SVF_INSTRUCTION_END 306

/* Value type.  */
#if ! defined YYSTYPE && ! defined YYSTYPE_IS_DECLARED
union YYSTYPE
{
#line 166 "grammars/svf.y"

    double d;
    List* list;
    char* string; 
    unsigned int u;
    SVF_Shift_Data shift_data;

#line 175 "src/parser.h"

};
typedef union YYSTYPE YYSTYPE;
# define YYSTYPE_IS_TRIVIAL 1
# define YYSTYPE_IS_DECLARED 1
#endif


extern YYSTYPE yylval;

int yyparse (void);

#endif /* !YY_YY_SRC_PARSER_H_INCLUDED  */
