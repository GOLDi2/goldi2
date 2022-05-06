#include <string.h>
#include <stdio.h>
#include <bcm2835.h>
#include <time.h>
#include <assert.h>
#include <stdlib.h>
#include <unistd.h>
#include <pthread.h>
#include "util.c"

#define GPIO0 16 // CPOL
#define GPIO1 12 // CPHA

void close()
{
    bcm2835_gpio_fsel(GPIO0, BCM2835_GPIO_FSEL_INPT);
    bcm2835_gpio_fsel(GPIO1, BCM2835_GPIO_FSEL_INPT);
    bcm2835_gpio_fsel(27, BCM2835_GPIO_FSEL_INPT);
    bcm2835_gpio_fsel(26, BCM2835_GPIO_FSEL_INPT);
    bcm2835_gpio_fsel(13, BCM2835_GPIO_FSEL_INPT);
    bcm2835_gpio_fsel(5, BCM2835_GPIO_FSEL_INPT);
    bcm2835_gpio_fsel(6, BCM2835_GPIO_FSEL_INPT);
    bcm2835_close();
}

int main(int argc, char** argv)
{
    if (argc != 2)
    {
        printf("This Program needs exactly one argument!\n");
        return 1;
    }

    if (!strcmp(argv[1], "spi"))
    {
        if (!bcm2835_init()) return 1;
        atexit(close);
        if (!bcm2835_spi_begin()) return 1;

        bcm2835_gpio_fsel(GPIO0, BCM2835_GPIO_FSEL_OUTP);
        bcm2835_gpio_fsel(GPIO1, BCM2835_GPIO_FSEL_OUTP);

        char command = 0x01;
        char* data = calloc(6, sizeof(char));

        bcm2835_gpio_write(GPIO0, 0);
        bcm2835_gpio_write(GPIO1, 0);
        bcm2835_spi_setDataMode(BCM2835_SPI_MODE0);
        
        char ret = bcm2835_spi_transfer(command);
        bcm2835_spi_transfern(data, 6);
        printf("SPI return: %s \n", data);
        printf("SPI return (HEX): %02x%02x%02x%02x%02x%02x %02x \n", data[0], data[1], data[2], data[3], data[4], data[5], ret);
        //if (strcmp(data,"GOLDi")) return 1;

        bcm2835_gpio_write(GPIO0, 0);
        bcm2835_gpio_write(GPIO1, 1);
        bcm2835_spi_setDataMode(BCM2835_SPI_MODE1);
        
        ret = bcm2835_spi_transfer(command);
        bcm2835_spi_transfern(data, 6);
        printf("SPI return: %s \n", data);
        printf("SPI return (HEX): %02x%02x%02x%02x%02x%02x %02x \n", data[0], data[1], data[2], data[3], data[4], data[5], ret);
        //if (strcmp(data,"GOLDi")) return 1;

        bcm2835_gpio_write(GPIO0, 1);
        bcm2835_gpio_write(GPIO1, 0);
        bcm2835_spi_setDataMode(BCM2835_SPI_MODE2);
        
        ret = bcm2835_spi_transfer(command);
        bcm2835_spi_transfern(data, 6);
        printf("SPI return: %s \n", data);
        printf("SPI return (HEX): %02x%02x%02x%02x%02x%02x %02x \n", data[0], data[1], data[2], data[3], data[4], data[5], ret);
        //if (strcmp(data,"GOLDi")) return 1;

        bcm2835_gpio_write(GPIO0, 1);
        bcm2835_gpio_write(GPIO1, 1);
        bcm2835_spi_setDataMode(BCM2835_SPI_MODE3);
        
        ret = bcm2835_spi_transfer(command);
        bcm2835_spi_transfern(data, 6);
        printf("SPI return: %s \n", data);
        printf("SPI return (HEX): %02x%02x%02x%02x%02x%02x %02x \n", data[0], data[1], data[2], data[3], data[4], data[5], ret);
        //if (strcmp(data,"GOLDi")) return 1;

        free(data);
        bcm2835_spi_end();

        return 0;
    }
    else if (!strcmp(argv[1], "i2c"))
    {
        if (!bcm2835_init()) return 1;
        atexit(close);
        if (!bcm2835_i2c_begin()) return 1;

        // TODO: write and read eeprom
        bcm2835_i2c_setSlaveAddress(0x50);
        char start_addr[2] = {0x00, 0x00};

        char* read_data = calloc(128, sizeof(char));
        char* write_data = calloc(130, sizeof(char));
        write_data[0] = start_addr[0];
        write_data[1] = start_addr[1];

        printf("Erasing Page at %02x:%02x\n", start_addr[0], start_addr[1]);
        while (bcm2835_i2c_write(write_data, 130) == BCM2835_I2C_REASON_ERROR_NACK);
        while (bcm2835_i2c_write_read_rs(start_addr, 2, read_data, 128) == BCM2835_I2C_REASON_ERROR_NACK);

        for (int i = 0; i < 128; i++)
        {
            if (read_data[i] != 0) return 1;
        }
        
        char* test_data = "GOLDi Testing";
        strcpy(write_data+2, test_data);
        if (strcmp(write_data+2, test_data)) return 1;

        printf("Writing \"%s\" to %02x:%02x\n", test_data, start_addr[0], start_addr[1]);
        while (bcm2835_i2c_write(write_data, 130) == BCM2835_I2C_REASON_ERROR_NACK);
        while (bcm2835_i2c_write_read_rs(start_addr, 2, read_data, 128) == BCM2835_I2C_REASON_ERROR_NACK);
        
        if (strcmp(read_data, test_data)) return 1;
        printf("Read \"%s\" from %02x:%02x\n", read_data, start_addr[0], start_addr[1]);

        // RTC Testing
        bcm2835_i2c_setSlaveAddress(0x68);
        char reg_addr = 0x00;

        // get the current time and date
        time_t c_time = time(NULL);
        struct tm* c_timeinfo = localtime(&c_time);
        char* c_wday = number_to_weekday(c_timeinfo->tm_wday);
        if (!c_wday) return 1;

        printf("Setting Date and Time: %s %d.%d.%d and %d:%d:%d\n", c_wday,
            c_timeinfo->tm_mday, c_timeinfo->tm_mon + 1, c_timeinfo->tm_year + 1900, 
            c_timeinfo->tm_hour, c_timeinfo->tm_min, c_timeinfo->tm_sec); 

        char* settings = calloc(8, sizeof(char));

        settings[0] = reg_addr;

        // seconds
        settings[1] = (c_timeinfo->tm_sec / 10) << 4;
        settings[1] += c_timeinfo->tm_sec % 10;

        // minutes
        settings[2] = (c_timeinfo->tm_min / 10) << 4;
        settings[2] += c_timeinfo->tm_min % 10;

        // hours
        if (c_timeinfo->tm_hour >= 20)
        {
            settings[3] = (c_timeinfo->tm_hour / 20) << 5;
            settings[3] += c_timeinfo->tm_hour % 20;
        }
        else if (c_timeinfo->tm_hour >= 10)
        {
            settings[3] = (c_timeinfo->tm_hour / 10) << 4;
            settings[3] += c_timeinfo->tm_hour % 10;
        }
        else
        {
            settings[3] = c_timeinfo->tm_hour;
        }

        // week day
        settings[4] = c_timeinfo->tm_wday;

        // date
        settings[5] = (c_timeinfo->tm_mday / 10) << 4;
        settings[5] += c_timeinfo->tm_mday % 10;

        // month
        settings[6] = ((c_timeinfo->tm_mon + 1) / 10) << 4;
        settings[6] += (c_timeinfo->tm_mon + 1) % 10;

        // year
        settings[7] = ((c_timeinfo->tm_year - 100) / 10) << 4;
        settings[7] += (c_timeinfo->tm_year - 100) % 10; 

        if (bcm2835_i2c_write(settings, 8) != BCM2835_I2C_REASON_OK) return 1;

        // flipping OSF bit
        char data[2] = {0x0F, 0x00};
        if (bcm2835_i2c_read_register_rs(&data[0], &data[1], 1) != BCM2835_I2C_REASON_OK) return 1;
        data[1] &= ~0x80;
        if (bcm2835_i2c_write(data, 2) != BCM2835_I2C_REASON_OK) return 1;

        // reading time from RTC
        char* result = calloc(7, sizeof(char));
        if (bcm2835_i2c_read_register_rs(&reg_addr, result, 7) != BCM2835_I2C_REASON_OK) return 1;
        
        char* n_wday = number_to_weekday(result[3]);
        if (!n_wday) return 1;

        printf("RTC Date and Time: %s %02x.%02x.%02x and %02x:%02x:%02x\n", n_wday,
            result[4], result[5], result[6], 
            result[2], result[1], result[0]);

        for (int i = 0; i < 7; i++)
        {
            assert(result[i] == settings[i+1]);
        }

        bcm2835_i2c_end();
        return 0;
    }
    else if (!strcmp(argv[1], "clk")) 
    {
        if (!bcm2835_init()) return 1;
        atexit(close);
        if (!bcm2835_spi_begin()) return 1;

        bcm2835_gpio_fsel(GPIO0, BCM2835_GPIO_FSEL_OUTP);
        bcm2835_gpio_fsel(GPIO1, BCM2835_GPIO_FSEL_OUTP);

        char command = 0x02;
        char* data = calloc(4, sizeof(char));

        bcm2835_gpio_write(GPIO0, 0);
        bcm2835_gpio_write(GPIO1, 0);
        bcm2835_spi_setDataMode(BCM2835_SPI_MODE0);
        
        bcm2835_spi_transfer(command);
        sleep(5);
        bcm2835_spi_transfer(command);
        bcm2835_spi_transfern(data, 4);

        unsigned int clocks = 0;
        for (int i = 0; i < 4; i++)
        {
            clocks = clocks << 8;
            clocks += data[i];
        }

        unsigned int clock_frequency = clocks/5000000;
        printf("Clocks in 5 seconds: %u\n", clocks);
        printf("Clocks in 5 seconds (HEX): %02x%02x%02x%02x\n", data[0], data[1], data[2], data[3]);
        printf("Resulting Clock Frequency: %uMHz\n", clock_frequency);

        free(data);
        if (clock_frequency != 48) return 1;

        bcm2835_spi_end();

        return 0;
    }
    else if (!strcmp(argv[1], "uart"))
    {
        int speeds[29] = {B50, B75, B110, B134, B150, B200, B300, B600, B1200, B1800, B2400, B4800, B9600, B19200, B38400, B57600, B115200, B230400, B460800, B500000, B921600, B1000000, B1152000, B1500000, B2000000, B2500000, B3000000, B3500000, B4000000};

        char *tx = "GOLDi Testing";
        char *rx;

        unsigned int max_retry_count = 5;
        unsigned int c_retry = 0;
            
        for (int i = 0; i < 29; i++)
        {
            if (c_retry == 0) 
            {
                printf("Testing UART with speed profile #%d: ...", i);
                fflush(stdout);
            }

            // open uart
            int uart = uart_open(speeds[i]);
            if (uart < 0) return 1;

            // send data
            if (uart_send(uart, tx) < 0) 
            {
                close(uart);
                printf("\b\b\bFail\n");
                return 1;
            }

            // wait for completion of sending
            if (i == 0) sleep(4);
            else if (i == 1) sleep(3);
            else if (i < 5) sleep(2);
            else sleep(1);

            // read data
            rx = uart_receive(uart, 50);
            if (!rx)
            {
                close(uart);
                printf("\b\b\bFail\n");
                return 1;
            }
            else if (strcmp(tx, rx))
            {
                if (c_retry == max_retry_count) 
                {
                    free(rx);
                    close(uart);
                    printf("\b\b\bFail\n");
                    return 1;
                }
                c_retry++;
                i--;
            }
            else
            {
                printf("\b\b\bSuccess (%u retries)\n", c_retry);
                c_retry = 0;
            }

            // cleanup
            free(rx);
            close(uart);
        }
            
        return 0;
    }
    else if (!strcmp(argv[1], "gpio"))
    {
        if (!bcm2835_init()) return 1;
        atexit(close);
        if (argc != 5) return 1;

        int pin = strtol(argv[3], NULL, 10);
        int value = strtol(argv[4], NULL, 10);

        if (value < 0 || value > 1) return 1;

        if (!strcmp(argv[2], "read"))
        {
            bcm2835_gpio_fsel(pin, BCM2835_GPIO_FSEL_INPT);
            if (bcm2835_gpio_lev(pin) != value) return 1;
        }
        else if (!strcmp(argv[2], "write"))
        {
            bcm2835_gpio_fsel(pin, BCM2835_GPIO_FSEL_OUTP);
            bcm2835_gpio_write(pin, value);
        }

        return 0;
    }
    else if (!strcmp(argv[1], "led"))
    {
        if (!bcm2835_init()) return 1;
        atexit(close);
        char answer;
        pthread_t thread;
        blink_args args;
        int stop = 0;

        // LEDActive (right)
        bcm2835_gpio_fsel(13, BCM2835_GPIO_FSEL_OUTP);
        bcm2835_gpio_fsel(26, BCM2835_GPIO_FSEL_OUTP);

        // LEDCloud (center)
        bcm2835_gpio_fsel(5, BCM2835_GPIO_FSEL_OUTP);
        bcm2835_gpio_fsel(6, BCM2835_GPIO_FSEL_OUTP);

        // LEDPower (left) 
        bcm2835_gpio_fsel(12, BCM2835_GPIO_FSEL_OUTP);
        bcm2835_gpio_fsel(16, BCM2835_GPIO_FSEL_OUTP);

        // LEDActive
        args.ledg = 13;
        args.ledr = 26;
        args.mode = 0;
        args.stop = &stop;
        int ret = pthread_create(&thread, NULL, blink, &args);
        printf("Is the right LED blinking green? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }
        stop = 1;
        pthread_join(thread, NULL);

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        args.mode = 1;
        stop = 0;
        ret = pthread_create(&thread, NULL, blink, &args);
        printf("Is the right LED blinking red? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }
        stop = 1;
        pthread_join(thread, NULL);

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        args.mode = 2;
        stop = 0;
        ret = pthread_create(&thread, NULL, blink, &args);
        printf("Is the right LED blinking green and red? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }
        stop = 1;
        pthread_join(thread, NULL);

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        // LEDCloud
        args.ledg = 5;
        args.ledr = 6;
        args.mode = 0;
        stop = 0;
        ret = pthread_create(&thread, NULL, blink, &args);
        printf("Is the center LED blinking green? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }
        stop = 1;
        pthread_join(thread, NULL);

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        args.mode = 1;
        stop = 0;
        ret = pthread_create(&thread, NULL, blink, &args);
        printf("Is the center LED blinking red? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }
        stop = 1;
        pthread_join(thread, NULL);

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        args.mode = 2;
        stop = 0;
        ret = pthread_create(&thread, NULL, blink, &args);
        printf("Is the center LED blinking green and red? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }
        stop = 1;
        pthread_join(thread, NULL);

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        // LEDPower
        args.ledg = 12;
        args.ledr = 16;
        args.mode = 0;
        stop = 0;
        ret = pthread_create(&thread, NULL, blink, &args);
        printf("Is the left LED blinking green? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }
        stop = 1;
        pthread_join(thread, NULL);

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        args.mode = 1;
        stop = 0;
        ret = pthread_create(&thread, NULL, blink, &args);
        printf("Is the left LED blinking red? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }
        stop = 1;
        pthread_join(thread, NULL);

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        args.mode = 2;
        stop = 0;
        ret = pthread_create(&thread, NULL, blink, &args);
        printf("Is the left LED blinking green and red? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }
        stop = 1;
        pthread_join(thread, NULL);

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        // Ethernet
        printf("Is the yellow ethernet LED on? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        printf("Is the green ethernet LED blinking? (y/n): ");
        while (answer != 'n' && answer != 'y')
        {
            scanf("%c", &answer);
            if (answer != 'n' && answer != 'y') {
                while (answer != '\n') scanf("%c", &answer);
                printf("Please enter 'y' or 'n': ");
            }
        }

        if (answer == 'n')
        {
            return 1;
        }

        while (answer != '\n') scanf("%c", &answer);

        return 0;
    }

    return 1;
}