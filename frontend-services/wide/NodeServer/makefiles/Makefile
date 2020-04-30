# basic settings
MCU=atmega328p
F_CPU = 12000000UL
TARGET = main

# reference toolchain dir
TOOLCHAIN=$(TOOLCHAINS)/avr-gcc/bin/

# define recursive wildcard
rwildcard=$(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))

# find all c files
SOURCES=$(call rwildcard, , *.c)
OBJECTS=$(SOURCES:.c=.o)

# compile and link:
all: $(TARGET).hex

%.hex: %.elf
	$(TOOLCHAIN)avr-objcopy -j .text -j .data -O ihex $< $@

$(TARGET).elf: $(OBJECTS)
	$(TOOLCHAIN)avr-gcc -g -mmcu=$(MCU) $^ -o $@

%.o: %.c
	$(TOOLCHAIN)avr-gcc -DF_CPU=$(F_CPU) -g -Os -Wall -c -mmcu=$(MCU) -o $@ $<