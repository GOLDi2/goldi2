#include "lexer.h"
#include "parser.h"
#include "execute.h"

int main(int argc, char** argv)
{
    if (argc > 1)
        yyin = fopen(argv[1], "r");
    else
        yyin = stdin;
    
    int ret_parse = yyparse();
    if (yyin != stdin) fclose(yyin);
    if (ret_parse) return 1;

    return execute_instructions();
}