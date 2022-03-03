#include <time.h>
#include <errno.h>
#include "execute.h"
#include "parser.h"
#include "bcmGPIO.c"

static List* instruction_list = NULL;
static int ENDDR = SVF_STATE_IDLE;
static int ENDIR = SVF_STATE_IDLE;
static SVF_Shift_Data HDR = {0, NULL, NULL, NULL, NULL};
static SVF_Shift_Data HIR = {0, NULL, NULL, NULL, NULL};
static SVF_Shift_Data SDR = {0, NULL, NULL, NULL, NULL};
static SVF_Shift_Data SIR = {0, NULL, NULL, NULL, NULL};
static SVF_Shift_Data TDR = {0, NULL, NULL, NULL, NULL};
static SVF_Shift_Data TIR = {0, NULL, NULL, NULL, NULL};
static int CURRENT_STATE = SVF_STATE_RESET;
static struct timespec SLEEP_TIME = {0,0};

void print_hexstring(char* hexstring, unsigned int length) {
    for (int i = 0; i < length; i++)
    {
        char first = (hexstring[i] & 0xF0) >> 4;
        char second = hexstring[i] & 0x0F;
        if (first >= 10) printf("%c", first + 'A' - 10);
        else printf("%c", first + '0');
        if (second >= 10) printf("%c", second + 'A' - 10);
        else printf("%c", second + '0');
    }
}

SVF_Instruction* create_empty_instruction()
{
    SVF_Instruction* instruction = (SVF_Instruction*) malloc (sizeof(SVF_Instruction));
    instruction->type = -1;
    instruction->shift_data.length = -1;
    instruction->shift_data.tdi = NULL;
    instruction->shift_data.tdo = NULL;
    instruction->shift_data.mask = NULL;
    instruction->shift_data.smask = NULL;
    instruction->stable_state = -1;
    instruction->path_states = NULL;
    instruction->trst_mode = -1;
    instruction->cycles = 0;
    instruction->run_count = 0;
    instruction->run_clk = -1;
    instruction->min_time = 0;
    instruction->max_time = 0;
    instruction->end_state = -1;
    instruction->run_state = -1;
    return instruction;
}

void add_instruction(SVF_Instruction* instruction)
{
    if (!instruction_list) instruction_list = create_list();
    list_append(instruction_list, instruction);
}

static int set_shift_data(SVF_Shift_Data* shift_data, SVF_Shift_Data* instr, int type)
{
    if (instr->length == 0 && (type == SVF_INSTRUCTION_SDR ||type == SVF_INSTRUCTION_SIR)) 
    {
        printf("Length must be >0 for SDR and SIR\n");
        return 1;
    }

    if (instr->length == 0)
    {
        shift_data->tdi = NULL;
        shift_data->tdo = NULL;
        shift_data->mask = NULL;
        shift_data->smask = NULL;
    }
    else
    {
        int length_changed = shift_data->length != instr->length;
        shift_data->length = instr->length;
        if (instr->tdi) shift_data->tdi = instr->tdi;
        if (instr->tdo) shift_data->tdo = instr->tdo;
        else shift_data->tdo = NULL;
        if (instr->mask) shift_data->mask = instr->mask;
        if (instr->smask) shift_data->smask = instr->smask;

        if (length_changed && !instr->tdo) shift_data->tdo = NULL;

        if (length_changed && !instr->mask) shift_data->mask = NULL;

        if (length_changed && !instr->smask) shift_data->smask = NULL;
        
        if (length_changed && !instr->tdi) 
        {
            printf("Length changed but no value for tdi provided!\n");
            return 1;
        }
    }

    return 0;
}

static int change_state(unsigned int tms)
{
    switch (CURRENT_STATE)
    {
        case SVF_STATE_RESET:
            if (tms) CURRENT_STATE = SVF_STATE_RESET;
            else CURRENT_STATE = SVF_STATE_IDLE;
            break;
        case SVF_STATE_IDLE:
            if (tms) CURRENT_STATE = SVF_STATE_DRSELECT;
            else CURRENT_STATE = SVF_STATE_IDLE;
            break;
        case SVF_STATE_DRSELECT:
            if (tms) CURRENT_STATE = SVF_STATE_IRSELECT;
            else CURRENT_STATE = SVF_STATE_DRCAPTURE;
            break;
        case SVF_STATE_IRSELECT:
            if (tms) CURRENT_STATE = SVF_STATE_RESET;
            else CURRENT_STATE = SVF_STATE_IRCAPTURE;
            break;
        case SVF_STATE_DRCAPTURE:
            if (tms) CURRENT_STATE = SVF_STATE_DREXIT1;
            else CURRENT_STATE = SVF_STATE_DRSHIFT;
            break;
        case SVF_STATE_IRCAPTURE:
            if (tms) CURRENT_STATE = SVF_STATE_IREXIT1;
            else CURRENT_STATE = SVF_STATE_IRSHIFT;
            break;
        case SVF_STATE_DRSHIFT:
            if (tms) CURRENT_STATE = SVF_STATE_DREXIT1;
            else CURRENT_STATE = SVF_STATE_DRSHIFT;
            break;
        case SVF_STATE_IRSHIFT:
            if (tms) CURRENT_STATE = SVF_STATE_IREXIT1;
            else CURRENT_STATE = SVF_STATE_IRSHIFT;
            break;
        case SVF_STATE_DREXIT1:
            if (tms) CURRENT_STATE = SVF_STATE_DRUPDATE;
            else CURRENT_STATE = SVF_STATE_DRPAUSE;
            break;
        case SVF_STATE_IREXIT1:
            if (tms) CURRENT_STATE = SVF_STATE_IRUPDATE;
            else CURRENT_STATE = SVF_STATE_IRPAUSE;
            break;
        case SVF_STATE_DRPAUSE:
            if (tms) CURRENT_STATE = SVF_STATE_DREXIT2;
            else CURRENT_STATE = SVF_STATE_DRPAUSE;
            break;
        case SVF_STATE_IRPAUSE:
            if (tms) CURRENT_STATE = SVF_STATE_IREXIT2;
            else CURRENT_STATE = SVF_STATE_IRPAUSE;
            break;
        case SVF_STATE_DREXIT2:
            if (tms) CURRENT_STATE = SVF_STATE_DRUPDATE;
            else CURRENT_STATE = SVF_STATE_DRSHIFT;
            break;
        case SVF_STATE_IREXIT2:
            if (tms) CURRENT_STATE = SVF_STATE_IRUPDATE;
            else CURRENT_STATE = SVF_STATE_IRSHIFT;
            break;
        case SVF_STATE_DRUPDATE:
            if (tms) CURRENT_STATE = SVF_STATE_DRSELECT;
            else CURRENT_STATE = SVF_STATE_IDLE;
            break;
        case SVF_STATE_IRUPDATE:
            if (tms) CURRENT_STATE = SVF_STATE_DRSELECT;
            else CURRENT_STATE = SVF_STATE_IDLE;
            break;
        default:
            printf("Current state is unknown!\n");
            return 1;
            break;
    }
    return 0;
}

static int clk(unsigned int tms, unsigned int tdi)
{
    writeGPIO(TMS, tms);
    writeGPIO(TDI, tdi);
    if (readGPIO(TMS) != tms) printf("TMS set incorrectly!\n");
    if (readGPIO(TDI) != tdi) printf("TDI set incorrectly!\n");

    writeGPIO(TCK, 0);

    if (SLEEP_TIME.tv_sec + SLEEP_TIME.tv_nsec)
    {
        struct timespec start;
        struct timespec current;
        clock_gettime(CLOCK_REALTIME, &start);
        clock_gettime(CLOCK_REALTIME, &current);
        long current_diff = ((current.tv_sec * 1000000000) + current.tv_nsec) - ((start.tv_sec * 1000000000) + start.tv_nsec);
        while (current_diff < ((SLEEP_TIME.tv_sec * 1000000000) + SLEEP_TIME.tv_nsec))
        {
            clock_gettime(CLOCK_REALTIME, &current);
            current_diff = ((current.tv_sec * 1000000000) + current.tv_nsec) - ((start.tv_sec * 1000000000) + start.tv_nsec);
        }
    }

    writeGPIO(TCK, 1);

    if (change_state(tms)) exit(1);

    return readGPIO(TDO);
}

static void reset()
{
    clk(1,0);
    clk(1,0);
    clk(1,0);
    clk(1,0);
    clk(1,0);
}

/**
 * @brief 
 * returns -1 if state is not a neighbour of CURRENT_STATE
 * returns 0 if state can be reached with tms = 0
 * returns 1 if state can be reached with tms = 1
 * 
 * @param state 
 * @return int 
 */
static int is_neighbour_state(int state)
{
    int save = CURRENT_STATE;
    change_state(0);
    if (CURRENT_STATE == state)
    {
        CURRENT_STATE = save;
        return 0;
    }
    change_state(1);
    if (CURRENT_STATE == state)
    {
        CURRENT_STATE = save;
        return 1;
    }
    printf("Given state is not a neighbour of current state!\n");
    return -1;
}

// NOTE: also contains non stable states DRSHIFT and IRSHIFT for convenience
static int move_to_stable_state(int state)
{
    switch (CURRENT_STATE)
    {
        case SVF_STATE_RESET:
            if (state == SVF_STATE_RESET) { break; }
            if (state == SVF_STATE_IDLE) { clk(0,0); break; }
            if (state == SVF_STATE_DRPAUSE) { clk(0,0); clk(1,0); clk(0,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_IRPAUSE) { clk(0,0); clk(1,0); clk(1,0); clk(0,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_DRSHIFT) { clk(0,0); clk(1,0); clk(0,0); clk(0,0); break; }
            if (state == SVF_STATE_IRSHIFT) { clk(0,0); clk(1,0); clk(1,0); clk(0,0); clk(0,0); break; }
            break;
        case SVF_STATE_IDLE:
            if (state == SVF_STATE_RESET) { clk(1,0); clk(1,0); clk(1,0); break; }
            if (state == SVF_STATE_IDLE) { break; }
            if (state == SVF_STATE_DRPAUSE) { clk(1,0); clk(0,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_IRPAUSE) { clk(1,0); clk(1,0); clk(0,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_DRSHIFT) { clk(1,0); clk(0,0); clk(0,0); break; }
            if (state == SVF_STATE_IRSHIFT) { clk(1,0); clk(1,0); clk(0,0); clk(0,0); break; }
            break;
        case SVF_STATE_DRPAUSE:
            if (state == SVF_STATE_RESET) { clk(1,0); clk(1,0); clk(1,0); clk(1,0); clk(1,0); break; }
            if (state == SVF_STATE_IDLE) { clk(1,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_DRPAUSE) { break; }
            if (state == SVF_STATE_IRPAUSE) { clk(1,0); clk(1,0); clk(1,0); clk(1,0); clk(0,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_DRSHIFT) { clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_IRSHIFT) { clk(1,0); clk(1,0); clk(1,0); clk(1,0); clk(0,0); clk(0,0); break; }
            break;
        case SVF_STATE_IRPAUSE:
            if (state == SVF_STATE_RESET) { clk(1,0); clk(1,0); clk(1,0); clk(1,0); clk(1,0); break; }
            if (state == SVF_STATE_IDLE) { clk(1,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_DRPAUSE) { clk(1,0); clk(1,0); clk(1,0); clk(0,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_IRPAUSE) { break; }
            if (state == SVF_STATE_DRSHIFT) { clk(1,0); clk(1,0); clk(1,0); clk(0,0); clk(0,0); break; }
            if (state == SVF_STATE_IRSHIFT) { clk(1,0); clk(0,0); break; }
            break;
        case SVF_STATE_DRSHIFT:
            if (state == SVF_STATE_RESET) { clk(1,0); clk(1,0); clk(1,0); clk(1,0); clk(1,0); break; }
            if (state == SVF_STATE_IDLE) { clk(1,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_DRPAUSE) { clk(1,0); clk(1,0); clk(1,0); clk(0,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_IRPAUSE) { clk(1,0); clk(1,0); clk(1,0); clk(1,0); clk(0,0); clk(1,0); clk(0,0); break; }
            break;
        case SVF_STATE_IRSHIFT:
            if (state == SVF_STATE_RESET) { clk(1,0); clk(1,0); clk(1,0); clk(1,0); clk(1,0); break; }
            if (state == SVF_STATE_IDLE) { clk(1,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_DRPAUSE) { clk(1,0); clk(1,0); clk(1,0); clk(0,0); clk(1,0); clk(0,0); break; }
            if (state == SVF_STATE_IRPAUSE) { clk(1,0); clk(1,0); clk(1,0); clk(1,0); clk(0,0); clk(1,0); clk(0,0); break; }
            break;
        default:
            printf("Current state is not a stable state!\n");
            return 1;
    }
    if (CURRENT_STATE != state) return 1;
    return 0;
}

static int _shift(SVF_Shift_Data* instr, char* data, int exit)
{
    int size = (instr->length/8) + ((instr->length % 8) > 0);
    int j = (instr->length/8) + ((instr->length % 8) > 0);
    while (j > 0)
    {
        j--;
        data[j] |= clk(0, (instr->tdi[j] & 0x01));
        data[j] |= clk(0, (instr->tdi[j] & 0x02) >> 1) << 1;
        data[j] |= clk(0, (instr->tdi[j] & 0x04) >> 2) << 2;
        data[j] |= clk(0, (instr->tdi[j] & 0x08) >> 3) << 3;
        data[j] |= clk(0, (instr->tdi[j] & 0x10) >> 4) << 4;
        data[j] |= clk(0, (instr->tdi[j] & 0x20) >> 5) << 5;
        data[j] |= clk(0, (instr->tdi[j] & 0x40) >> 6) << 6;
        data[j] |= clk((exit && (j == 0)), (instr->tdi[j] & 0x80) >> 7) << 7;
    }

    if (instr->tdo)
    {
        print_hexstring(data, size);
        printf("\n");
        print_hexstring(instr->tdo, size);
        printf("\n");
        if (instr->mask)
        {
            for (unsigned int i = 0; i < (instr->length/8) + ((instr->length % 8) > 0); i++)
            {
                if ((data[i] & instr->mask[i]) != (instr->tdo[i] & instr->mask[i])) return 1;
            }
        }
        else
        {
            for (unsigned int i = 0; i < (instr->length/8) + ((instr->length % 8) > 0); i++)
            {
                if (data[i] != instr->tdo[i]) return 1;
            }
        }
    }
    return 0;
}

static int shift(SVF_Shift_Data* instr, SVF_Shift_Data* header, SVF_Shift_Data* trailer)
{
    int res = 0;
    int length = (header->length/8) + (instr->length/8) + (trailer->length/8);
    length += ((header->length % 8) > 0) + ((instr->length % 8) > 0) + ((trailer->length % 8) > 0);
    char data[length];
    for (int i = 0; i < length; i++) data[i] = 0;
    if (header->length > 0) res |= _shift(header, data, 0);
    if (res) return res;
    if (instr->length > 0) res |= _shift(instr, data + header->length, trailer->length == 0);
    if (res) return res;
    if (trailer->length > 0) res |= _shift(trailer, data + header->length + instr->length, 1);
    return res;
}

static int shift_data(SVF_Shift_Data* instr)
{
    if (move_to_stable_state(SVF_STATE_DRSHIFT)) return 1;
    int res = shift(instr, &HDR, &TDR);
    if (res) printf("Something went wrong while shifting data!\n");
    clk(0,0);
    if (move_to_stable_state(ENDDR)) return 1;
    return res;
}

static int shift_instruction(SVF_Shift_Data* instr)
{
    if (move_to_stable_state(SVF_STATE_IRSHIFT)) return 1;
    int res = shift(instr, &HIR, &TIR);
    if (res) printf("Something went wrong while shifting an instruction!\n");
    clk(0,0);
    if (move_to_stable_state(ENDIR)) return 1;
    return res;
}

int execute_instructions()
{
    if (!instruction_list) return 0;

    if (initGPIO()) 
    {
        printf("Could not initialize GPIOs!\n");
        return 1;
    }
    reset();
    
    for (unsigned long i = 0; i < instruction_list->size; i++)
    {
        SVF_Instruction* instruction = list_get(instruction_list, i);
        if (!instruction) return 1;

        switch (instruction->type)
        {
            case SVF_INSTRUCTION_ENDDR:
                printf("Executing ENDDR\n");
                ENDDR = instruction->stable_state;
                break;
            case SVF_INSTRUCTION_ENDIR:
                printf("Executing ENDIR\n");
                ENDIR = instruction->stable_state;
                break;
            case SVF_INSTRUCTION_FREQUENCY:
                printf("Executing FREQUENCY\n");
                if (instruction->cycles) 
                {
                    SLEEP_TIME.tv_nsec = (long) (1000000000 / instruction->cycles);
                    SLEEP_TIME.tv_sec = SLEEP_TIME.tv_nsec / 1000000000;
                    SLEEP_TIME.tv_nsec = SLEEP_TIME.tv_nsec % 1000000000;
                }
                else 
                {
                    SLEEP_TIME.tv_sec = 0;
                    SLEEP_TIME.tv_nsec = 0;
                }
                break;
            case SVF_INSTRUCTION_HDR:
                printf("Executing HDR\n");
                if (set_shift_data(&HDR, &instruction->shift_data, instruction->type)) return 1;
                break;
            case SVF_INSTRUCTION_HIR:
                printf("Executing HIR\n");
                if (set_shift_data(&HIR, &instruction->shift_data, instruction->type)) return 1;
                break;
            case SVF_INSTRUCTION_PIO:
                printf("PIO is currently not implemented!\n");
                return 1;
                break;
            case SVF_INSTRUCTION_PIOMAP:
                printf("PIOMAP is currently not implemented!\n");
                return 1;
                break;
            case SVF_INSTRUCTION_RUNTEST:
            {
                printf("Executing RUNTEST\n");
                struct timespec start_time;
                struct timespec current_time;
                long max_time_nsec = (long) (instruction->max_time * 1000000000);
                long min_time_nsec = (long) (instruction->min_time * 1000000000);
                if (clock_gettime(CLOCK_REALTIME, &start_time)) return 1;
                if (instruction->run_state && instruction->run_state != CURRENT_STATE) {
                    if (move_to_stable_state(instruction->run_state)) return 1;
                }
                for (unsigned int i = 0; i < instruction->run_count; i++)
                {
                    if (clock_gettime(CLOCK_REALTIME, &current_time)) return 1;

                    if (max_time_nsec &&
                        ((current_time.tv_sec * 1000000000 + current_time.tv_nsec) - 
                        (start_time.tv_sec * 1000000000 + start_time.tv_nsec) > max_time_nsec)) break;

                    clk(0,0);
                }
                if (clock_gettime(CLOCK_REALTIME, &current_time)) return 1;
                while ((current_time.tv_sec * 1000000000 + current_time.tv_nsec) - (start_time.tv_sec * 1000000000 + start_time.tv_nsec) < min_time_nsec)
                {
                    clk(0,0);
                    if (clock_gettime(CLOCK_REALTIME, &current_time)) return 1;
                }
                break;
            }
            case SVF_INSTRUCTION_SDR:
                printf("Executing SDR\n");
                if (set_shift_data(&SDR, &instruction->shift_data, instruction->type)) return 1;
                if (shift_data(&SDR)) return 1;
                break;
            case SVF_INSTRUCTION_SIR:
                printf("Executing SIR\n");
                if (set_shift_data(&SIR, &instruction->shift_data, instruction->type)) return 1;
                if (shift_instruction(&SIR)) return 1;
                break;
            case SVF_INSTRUCTION_STATE:
                printf("Executing STATE\n");
                if (instruction->path_states == NULL) 
                {
                    if (move_to_stable_state(instruction->stable_state)) return 1;
                }
                else
                {
                    for (unsigned int i = 0; i < instruction->path_states->size; i++)
                    {
                        long state = (long) list_get(instruction->path_states, i);
                        int tms = is_neighbour_state(state);
                        if (tms < 0) return 1;
                        else clk(tms, 0);
                    }
                    int tms = is_neighbour_state(instruction->stable_state);
                    if (tms < 0) return 1;
                    else clk(tms, 0);
                    delete_list(instruction->path_states);
                }
                break;
            case SVF_INSTRUCTION_TDR:
                printf("Executing TDR\n");
                if (set_shift_data(&TDR, &instruction->shift_data, instruction->type)) return 1;
                break;
            case SVF_INSTRUCTION_TIR:
                printf("Executing TIR\n");
                if (set_shift_data(&TIR, &instruction->shift_data, instruction->type)) return 1;
                break;
            case SVF_INSTRUCTION_TRST:
                printf("TRST is currently not implemented!\n");
                return 1;
                break;
            default:
                return 1;
                break;
        }
    }

    stopGPIO();

    for (unsigned long i = 0; i < instruction_list->size; i++)
    {
        SVF_Instruction* instruction = (SVF_Instruction*) list_get(instruction_list, i);
        if(instruction->shift_data.tdi) free(instruction->shift_data.tdi);
        if(instruction->shift_data.tdo) free(instruction->shift_data.tdo);
        if(instruction->shift_data.mask) free(instruction->shift_data.mask);
        if(instruction->shift_data.smask) free(instruction->shift_data.smask);
        free(instruction);
    }

    delete_list(instruction_list);

    return 0;
}