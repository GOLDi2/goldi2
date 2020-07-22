// ######################################################################################
// #                                                                                    #
// #  This module is needed for the communication with the GOLDi infrastructure         #
// #                                                                                    #
// ######################################################################################
#include <stdint.h>
#include <util/delay.h>
#include <avr/io.h>   
#include <avr/interrupt.h>
#include "GOLDiInterface.h"

extern uint8_t* getActuators();
extern uint8_t* getSensors();

volatile uint8_t *GOLDiInterfaceOutputBuffer;
volatile uint8_t *GOLDiInterfaceInputBuffer;

uint8_t ReceiveIndex;
uint8_t TmpBuffer[6];

enum {
    START,
    CHECK_SIZE,
    SIZE_BIG,
    SIZE_SMALL,
    END
} CurrentState;
uint8_t SendIndex;

// ######################################################################################
// #  This functions receives bytes from the GOLDi bus                                  #
// ######################################################################################

ISR(USART0_RX_vect)
{
    uint8_t Data = UDR0;
    GOLDiInterfaceNewData(Data);
}

// ######################################################################################
// #  This functions sends bytes to the GOLDi bus                                       #
// ######################################################################################

ISR(USART0_UDRE_vect)
{
    GOLDiInterfaceSendData();
}

// ######################################################################################
// #  This functions initialize the serial port 'UART0'                                 #
// ######################################################################################
void UART0_init()
{
    UBRR0L = (F_CPU / (BAUD * 16L) - 1);
    UCSR0B = ((1<<RXEN0) | (1<<TXEN0) | (1<<RXCIE0) | (1<<UDRIE0));
    sei();
}

// ######################################################################################
// #  This functions sends one byte to the GOLDi bus                                    #
// ######################################################################################
inline void UART0_put_char(char data)
{
    UDR0=data;
}

// ######################################################################################
// #  This function initializes the bus interface                                       #
// ######################################################################################
void GOLDiInterfaceInit(void)
{
	CurrentState = START;
	SendIndex = 0;
    UART0_init();
    
    GOLDiInterfaceOutputBuffer = getActuators();
    GOLDiInterfaceInputBuffer = getSensors();
    ReceiveIndex = 0;
}
   
// ######################################################################################
// #  This function sends data (actuators) to the GOLDi bus                             #
// ######################################################################################
void GOLDiInterfaceSendData(void)
{
    if(SendIndex == 6)  
    {
        CurrentState = END;
    }

    switch (CurrentState)
    {
        case START:
            UART0_put_char(0xFF);
            CurrentState = CHECK_SIZE;
            break;
        case CHECK_SIZE:
            if(GOLDiInterfaceOutputBuffer[SendIndex] >= 0x80)
            {
                UART0_put_char(0x80);
                CurrentState = SIZE_BIG;
            }
            else
            {
                UART0_put_char(0);
                CurrentState = SIZE_SMALL;
            }
            break;
        case SIZE_BIG:
            UART0_put_char(GOLDiInterfaceOutputBuffer[SendIndex]-0x80);
            CurrentState = CHECK_SIZE;
            SendIndex++;
            break;
        case SIZE_SMALL:
            UART0_put_char(GOLDiInterfaceOutputBuffer[SendIndex]);
            CurrentState = CHECK_SIZE;
            SendIndex++;
            break;
        case END:
            UART0_put_char(0xFE);
            SendIndex = 0;
            CurrentState = START;
            break;
    }
}

// ######################################################################################
// #  This functions receives data (sensors) from the GOLDi bus                         #
// ######################################################################################
void GOLDiInterfaceNewData(uint8_t Data)
{
    switch(Data)
    {
        case 0xFF:
            //start data transfer
            ReceiveIndex=0;
            break;
        case 0xFE:
            //data transfer ended
            for (uint8_t i=0; i<6;i++)
                GOLDiInterfaceInputBuffer[i] = TmpBuffer[i];
            ReceiveIndex=0;
            break;
        default:
            if(ReceiveIndex%2 == 1)
                TmpBuffer[ReceiveIndex/2]+= Data;
            else
                TmpBuffer[ReceiveIndex/2] = Data;
            ReceiveIndex++;
            break;
    }
}