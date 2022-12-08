#include <bcm2835.h>
#include <stdio.h>

#define TCK 21
#define TMS 18
#define TDO 19
#define TDI 20

// MC TEST PINS
// #define TCK 11
// #define TMS 8
// #define TDO 10
// #define TDI 9

int initGPIO()
{
    if (!bcm2835_init())
      return 1;

    bcm2835_gpio_fsel(TCK, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(TMS, BCM2835_GPIO_FSEL_OUTP);
    bcm2835_gpio_fsel(TDO, BCM2835_GPIO_FSEL_INPT);
    bcm2835_gpio_fsel(TDI, BCM2835_GPIO_FSEL_OUTP);

    return 0;
}

void writeGPIO(int pin, unsigned data)
{
    bcm2835_gpio_write(pin, data);
}

unsigned int readGPIO(int pin)
{
    return bcm2835_gpio_lev(pin);
}

void stopGPIO()
{
    bcm2835_close();
}