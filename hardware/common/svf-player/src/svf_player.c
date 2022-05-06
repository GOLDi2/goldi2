#include "lexer.h"
#include "parser.h"
#include "execute.h"
#include "cJSON.h"

int verbose = 0;
int interrupt = 1;
cJSON* faultsJSON;

int main(int argc, char** argv)
{

    if (argc > 1)
        yyin = fopen(argv[1], "r");
    else
        yyin = stdin;

    for (int i = 1; i < argc; i++) 
    {
        if (!strncmp(argv[i],"-v",2)) 
        {
            verbose = 1;
        } 
        else if (!strncmp(argv[i],"-ni",3)) 
        {
            interrupt = 0;
        }
    }

    cJSON* returnJSON = cJSON_CreateObject();
    if (!returnJSON) return 1;
    faultsJSON = cJSON_AddArrayToObject(returnJSON, "faults");
    
    int ret_parse = yyparse();
    if (yyin != stdin) fclose(yyin);
    if (ret_parse) return 1;

    int ret = execute_instructions();

    char* output = cJSON_Print(returnJSON);
    FILE* fp = fopen("/tmp/svf_output.json", "w+");
    fputs(output, fp);
    fclose(fp);

    return ret;
}