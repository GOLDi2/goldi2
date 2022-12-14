#include <time.h>
#include <errno.h>
#include "execute.h"
#include "generated/parser.h"
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
    for (unsigned int i = 0; i < length; i++)
    {
        unsigned char first = (hexstring[i] & 0xF0) >> 4;
        unsigned char second = hexstring[i] & 0x0F;
        if (first >= 10) printf("%c", first + 'A' - 10);
        else printf("%c", first + '0');
        if (second >= 10) printf("%c", second + 'A' - 10);
        else printf("%c", second + '0');
    }
}

char* to_printable_hexstring(char* hexstring, unsigned int length) {
    char* str = (char*) malloc(length*2+1);
    if (!str) return NULL;

    if (hexstring == NULL)
    {
        for (unsigned int i = 0; i < length*2; i++) 
        {
            str[i] = '0';
        }
        str[length*2] = '\0';
        return str;
    }

    for (unsigned int i = 0; i < length; i++)
    {
        unsigned char first = (hexstring[i] & 0xF0) >> 4;
        unsigned char second = hexstring[i] & 0x0F;
        if (first >= 10) str[i*2] = first + 'A' - 10;
        else str[i*2] = first + '0';
        if (second >= 10) str[i*2+1] = second + 'A' - 10;
        else str[i*2+1] = second + '0';
    }
    str[length*2] = '\0';
    return str;
}

void print_shift_data(SVF_Shift_Data* shift_data) {
    unsigned int length = (shift_data->length / 8) + ((shift_data->length % 8) > 0);
    printf("(");
    printf("%u", shift_data->length);
    printf(",");
    if (shift_data->tdi) print_hexstring(shift_data->tdi, length);
    else printf("NULL");
    printf(",");
    if (shift_data->tdo) print_hexstring(shift_data->tdo, length);
    else printf("NULL");
    printf(",");
    if (shift_data->mask) print_hexstring(shift_data->mask, length);
    else printf("NULL");
    printf(",");
    if (shift_data->smask) print_hexstring(shift_data->smask, length);
    else printf("NULL");
    printf(")\n");
}

SVF_Instruction* create_empty_instruction()
{
    SVF_Instruction* instruction = (SVF_Instruction*) malloc (sizeof(SVF_Instruction));
    instruction->type = -1;
    instruction->label = NULL;
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

void add_instruction(SVF_Instruction* instruction, char* instruction_label)
{
    if (!instruction_list) instruction_list = create_list();
    if (instruction_label) instruction->label = instruction_label;
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

static int _shift(SVF_Shift_Data* instr, char* data, int exit, char* instruction_label)
{
    int j = (instr->length/8) + ((instr->length % 8) > 0);

    if (instr->length % 8 > 0)
    {
        j--;
        int shift = 0;
        int pos = 1;
        for (unsigned int i = 0; i < 8 - instr->length; i++)
        {
            shift++;
            pos *= 2;
        }
        for (unsigned int i = 0; i < instr->length; i++)
        {
            //printf("tms: %d, tdi: %d, pos: %02x, shift: %d\n", (exit && (i == instr->length-1) && (j == 0)), ((instr->tdi[j] & pos) >> shift), pos, shift);
            data[j] |= clk((exit && (i == instr->length-1) && (j == 0)), (instr->tdi[j] & pos) >> shift) << shift;
            shift++;
            pos *= 2;
        }
    }

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
        if (instr->mask)
        {
            for (unsigned int i = 0; i < (instr->length/8) + ((instr->length % 8) > 0); i++)
            {
                if ((data[i] & instr->mask[i]) != (instr->tdo[i] & instr->mask[i])) 
                {
                    cJSON* faultJSON = cJSON_CreateObject();
                    char* tdi_string = to_printable_hexstring(instr->tdi, (instr->length/8) + ((instr->length % 8) > 0));
                    char* tdo_string = to_printable_hexstring(instr->tdo, (instr->length/8) + ((instr->length % 8) > 0));
                    char* mask_string = to_printable_hexstring(instr->mask, (instr->length/8) + ((instr->length % 8) > 0));
                    char* data_string = to_printable_hexstring(data, (instr->length/8) + ((instr->length % 8) > 0));
                    if (instruction_label) cJSON_AddStringToObject(faultJSON, "label", instruction_label);
                    else cJSON_AddStringToObject(faultJSON, "label", "unlabeled");
                    cJSON_AddStringToObject(faultJSON, "tdi", tdi_string);
                    cJSON_AddStringToObject(faultJSON, "tdo", tdo_string);
                    cJSON_AddStringToObject(faultJSON, "mask", mask_string);
                    cJSON_AddStringToObject(faultJSON, "data", data_string);
                    cJSON_AddItemToArray(faultsJSON, faultJSON);
                    execution_failed = 1;
                    return 1 && interrupt;
                }
            }
        }
        else
        {
            for (unsigned int i = 0; i < (instr->length/8) + ((instr->length % 8) > 0); i++)
            {
                if (data[i] != instr->tdo[i])
                {
                    cJSON* faultJSON = cJSON_CreateObject();
                    char* tdi_string = to_printable_hexstring(instr->tdi, (instr->length/8) + ((instr->length % 8) > 0));
                    char* tdo_string = to_printable_hexstring(instr->tdo, (instr->length/8) + ((instr->length % 8) > 0));
                    char* mask_string = to_printable_hexstring(instr->mask, (instr->length/8) + ((instr->length % 8) > 0));
                    char* data_string = to_printable_hexstring(data, (instr->length/8) + ((instr->length % 8) > 0));
                    if (instruction_label) cJSON_AddStringToObject(faultJSON, "label", instruction_label);
                    else cJSON_AddStringToObject(faultJSON, "label", "unlabeled");
                    cJSON_AddStringToObject(faultJSON, "tdi", tdi_string);
                    cJSON_AddStringToObject(faultJSON, "tdo", tdo_string);
                    cJSON_AddStringToObject(faultJSON, "mask", mask_string);
                    cJSON_AddStringToObject(faultJSON, "data", data_string);
                    cJSON_AddItemToArray(faultsJSON, faultJSON);
                    execution_failed = 1;
                    return 1 && interrupt;
                }
            }
        }
    }
    return 0;
}

static int shift(SVF_Shift_Data* instr, SVF_Shift_Data* header, SVF_Shift_Data* trailer, char* instruction_label)
{
    int res = 0;
    int length = (header->length/8) + (instr->length/8) + (trailer->length/8);
    length += ((header->length % 8) > 0) + ((instr->length % 8) > 0) + ((trailer->length % 8) > 0);
    char data[length];
    for (int i = 0; i < length; i++) data[i] = 0;
    if (header->length > 0) res |= _shift(header, data, 0, instruction_label);
    if (res) return res;
    if (instr->length > 0) res |= _shift(instr, data + header->length, trailer->length == 0, instruction_label);
    if (res) return res;
    if (trailer->length > 0) res |= _shift(trailer, data + header->length + instr->length, 1, instruction_label);
    return res;
}

static int shift_data(SVF_Shift_Data* instr, char* instruction_label)
{
    if (move_to_stable_state(SVF_STATE_DRSHIFT)) return 1;
    int res = shift(instr, &HDR, &TDR, instruction_label);
    if (res) printf("Something went wrong while shifting data!\n");
    clk(0,0);
    if (move_to_stable_state(ENDDR)) return 1;
    return res;
}

static int shift_instruction(SVF_Shift_Data* instr, char* instruction_label)
{
    if (move_to_stable_state(SVF_STATE_IRSHIFT)) return 1;
    int res = shift(instr, &HIR, &TIR, instruction_label);
    if (res) printf("Something went wrong while shifting an instruction!\n");
    clk(0,0);
    if (move_to_stable_state(ENDIR)) return 1;
    return res;
}

int execute_instructions()
{
    struct timespec start, end;
    if (clock_gettime(CLOCK_REALTIME, &start)) return 1;
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
                if (verbose) printf("Executing ENDDR\n");
                ENDDR = instruction->stable_state;
                break;
            case SVF_INSTRUCTION_ENDIR:
                if (verbose) printf("Executing ENDIR\n");
                ENDIR = instruction->stable_state;
                break;
            case SVF_INSTRUCTION_FREQUENCY:
                if (verbose) printf("Executing FREQUENCY\n");
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
                if (verbose) printf("Executing HDR ");
                if (set_shift_data(&HDR, &instruction->shift_data, instruction->type)) return 1;
                if (verbose) print_shift_data(&HDR);
                break;
            case SVF_INSTRUCTION_HIR:
                if (verbose) printf("Executing HIR ");
                if (set_shift_data(&HIR, &instruction->shift_data, instruction->type)) return 1;
                if (verbose) print_shift_data(&HIR);
                break;
            case SVF_INSTRUCTION_PIO:
                if (verbose) printf("PIO is currently not implemented!\n");
                return 1;
                break;
            case SVF_INSTRUCTION_PIOMAP:
                if (verbose) printf("PIOMAP is currently not implemented!\n");
                return 1;
                break;
            case SVF_INSTRUCTION_RUNTEST:
            {
                if (verbose) printf("Executing RUNTEST\n");
                struct timespec start_time;
                struct timespec current_time;
                // long max_time_nsec = (long) (instruction->max_time * 1000000000);
                long min_time_nsec = (long) (instruction->min_time * 1000000000);
                if (clock_gettime(CLOCK_REALTIME, &start_time)) return 1;
                if (instruction->run_state && instruction->run_state != CURRENT_STATE) {
                    if (move_to_stable_state(instruction->run_state)) return 1;
                }
                for (unsigned int i = 0; i < instruction->run_count; i++)
                {
                    // if (clock_gettime(CLOCK_REALTIME, &current_time)) return 1;

                    // if (max_time_nsec &&
                    //     ((current_time.tv_sec * 1000000000 + current_time.tv_nsec) - 
                    //     (start_time.tv_sec * 1000000000 + start_time.tv_nsec) > max_time_nsec)) break;

                    clk(0,0);
                }
                if (clock_gettime(CLOCK_REALTIME, &start_time)) return 1;
                if (clock_gettime(CLOCK_REALTIME, &current_time)) return 1;
                while ((current_time.tv_sec * 1000000000 + current_time.tv_nsec) - (start_time.tv_sec * 1000000000 + start_time.tv_nsec) < min_time_nsec)
                {
                    //clk(0,0);
                    if (clock_gettime(CLOCK_REALTIME, &current_time)) return 1;
                }
                break;
            }
            case SVF_INSTRUCTION_SDR:
                if (verbose) printf("Executing SDR ");
                if (set_shift_data(&SDR, &instruction->shift_data, instruction->type)) return 1;
                if (verbose) print_shift_data(&SDR);
                if (shift_data(&SDR, instruction->label)) return 1;
                break;
            case SVF_INSTRUCTION_SIR:
                if (verbose) printf("Executing SIR ");
                if (set_shift_data(&SIR, &instruction->shift_data, instruction->type)) return 1;
                if (verbose) print_shift_data(&SIR);
                if (shift_instruction(&SIR, instruction->label)) return 1;
                break;
            case SVF_INSTRUCTION_STATE:
                if (verbose) printf("Executing STATE\n");
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
                if (verbose) printf("Executing TDR ");
                if (set_shift_data(&TDR, &instruction->shift_data, instruction->type)) return 1;
                if (verbose) print_shift_data(&TDR);
                break;
            case SVF_INSTRUCTION_TIR:
                if (verbose) printf("Executing TIR ");
                if (set_shift_data(&TIR, &instruction->shift_data, instruction->type)) return 1;
                if (verbose) print_shift_data(&TIR);
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

    if (clock_gettime(CLOCK_REALTIME, &end)) return 1;

    long seconds = ((end.tv_sec * 1000000000 + end.tv_nsec) - (start.tv_sec * 1000000000 + start.tv_nsec))/1000000000;
    long nanoseconds = ((end.tv_sec * 1000000000 + end.tv_nsec) - (start.tv_sec * 1000000000 + start.tv_nsec)) % 1000000000;
    printf("Execution took %ld.%ld seconds\n", seconds, nanoseconds);

    return 0;
}
