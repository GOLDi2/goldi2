// ######################################################################################
// #                                                                                    #
// #  This module is needed for the communication with the GOLDi infrastructure         #
// #                                                                                    #
// ######################################################################################

#ifndef _GOLDIINTERFACE_H
    #define _GOLDIINTERFACE_H

    #define BAUD    250000

    #include <stdint.h>

    extern void GOLDiInterfaceInit(void);
    extern void GOLDiInterfaceSendData(void);
    extern void GOLDiInterfaceNewData(uint8_t Data);

    extern uint8_t *GOLDiInterfaceOutputBuffer;
    extern uint8_t *GOLDiInterfaceInputBuffer;

#endif