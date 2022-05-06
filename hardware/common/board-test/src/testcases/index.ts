import { testCase as ethernet_test } from "./ethernet_test"
import { testCase as false_test } from "./false_test"
import { testCase as fpga_clock_test } from "./fpga_clock_test"
import { testCase as rpi_gpio_test } from "./rpi_gpio_test"
import { testCase as i2c_test } from "./i2c_test"
import { testCase as led_test } from "./led_test"
import { testCase as programming_test_fpga } from "./programming_test_fpga"
import { testCase as programming_test_microcontroller } from "./programming_test_microcontroller"
import { testCase as spi_test } from "./spi_test"
import { testCase as true_test } from "./true_test"
import { testCase as uart_test } from "./uart_test"
import { testCase as usb_slave_test } from "./usb_slave_test"
import { testCase as mc_gpio_test } from "./mc_gpio_test"

export const testCases = [
    ethernet_test,
    false_test,
    fpga_clock_test,
    rpi_gpio_test,
    i2c_test,
    led_test,
    programming_test_fpga,
    programming_test_microcontroller,
    spi_test,
    true_test,
    uart_test,
    usb_slave_test,
    mc_gpio_test
]