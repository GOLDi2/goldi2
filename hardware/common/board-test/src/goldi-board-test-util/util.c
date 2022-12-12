#include <stdlib.h>
#include <termios.h>
#include <fcntl.h>

typedef struct
{
    int ledg;
    int ledr;
    int mode;
    int* stop;
} blink_args;


char* number_to_weekday(int number)
{
    switch (number)
    {
        case 0:
            return "Sunday";

        case 1:
            return "Monday";
            
        case 2:
            return "Tuesday";
            
        case 3:
            return "Wednesday";
            
        case 4:
            return "Thursday";
            
        case 5:
            return "Friday";
            
        case 6:
            return "Saturday";
        
        default:
            return NULL;
    }
}

int uart_open(int speed) 
{
    int uart = -1;
    uart = open("/dev/ttyAMA0", O_RDWR | O_NOCTTY | O_NDELAY);
    if (uart == -1) 
    {
        printf("[ERROR] UART open()\n");
        return uart;
    }

    struct termios options;
    tcgetattr(uart, &options);
    options.c_cflag = speed | CS8 | CLOCAL | CREAD; 
    options.c_iflag = IGNPAR;
    options.c_oflag = 0;
    options.c_lflag = 0;
    tcflush(uart, TCIFLUSH);
    tcsetattr(uart, TCSANOW, &options);

    return uart;
}

int uart_send(int uart, char* str)
{
    if (uart != -1)	
    {
        int out = write(uart, str, strlen(str)); 
        if (out < 0) 
        {
            return -1;
        } 
        else 
        {
            return out;
        }
    } 
    else
    {
        return -1;
    }
}

char* uart_receive(int uart, int length)
{
    if (uart != -1) 
    {
        char* buf = calloc(50, sizeof(char));
        int rx_length = read(uart, buf, 50);

        if (rx_length <= 0) 
        {
            return NULL;
        } 
        else 
        {
            if (rx_length < length) buf[rx_length] = '\0';
            else buf[length-1] = '\0';
        }
        return buf;
    } 
    else
    {
        return NULL;
    }
}

void blink(blink_args args)
{
    switch(args.mode) 
    {
        case 0:
        {
            while(!(*args.stop))
            {
                bcm2835_gpio_write(args.ledg, 1);
                usleep(125000);
                bcm2835_gpio_write(args.ledg, 0);
                usleep(125000);
            }
        }

        case 1:
        {
            while(!(*args.stop))
            {
                bcm2835_gpio_write(args.ledr, 1);
                usleep(125000);
                bcm2835_gpio_write(args.ledr, 0);
                usleep(125000);
            }
        }

        case 2:
        {
            while(!(*args.stop))
            {
                bcm2835_gpio_write(args.ledg, 1);
                bcm2835_gpio_write(args.ledr, 1);
                usleep(125000);
                bcm2835_gpio_write(args.ledg, 0);
                bcm2835_gpio_write(args.ledr, 0);
                usleep(125000);
            }
        }

        default:
            return;
    }
}