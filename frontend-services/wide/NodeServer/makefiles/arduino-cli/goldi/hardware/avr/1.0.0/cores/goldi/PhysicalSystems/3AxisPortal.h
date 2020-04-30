// ######################################################################################
// #                                                                                    #
// #  This module defines sensors & actuators for physical system '3AxisPortal'         #
// #                                                                                    #
// ######################################################################################

#ifndef _3_AXIS_H
    #define _3_AXIS_H
    #include <stdint.h>

// ######################################################################################
// #  48bit width sensor vector                                                         #
// ######################################################################################
    typedef volatile struct                                                                   
    {
        unsigned XAxisAtPositionXPlus:1;                                                    // x0
        unsigned XAxisAtPositionXMinus:1;                                                   // x1
        unsigned XAxisAtReferencePosition:1;                                                // x2
        unsigned YAxisAtPositionYPlus:1;                                                    // x3
        unsigned YAxisAtPositionYMinus:1;                                                   // x4
        unsigned YAxisAtReferencePosition:1;                                                // x5
        unsigned ZAxisAtPositionZPlus:1;                                                    // x6
        unsigned ZAxisAtPositionZMinus:1;                                                   // x7
        unsigned ProximitySwitch:1;                                                         // x8
        unsigned UserSwitch:1;                                                              // x9
        unsigned Reserve0:6;                                                                // unused
        unsigned int PositionX;                                                             // x31 ... x16 (LSB)
        unsigned int PositionY;                                                             // x47 ... x32 (LSB)
    } Sensor_t;

// ######################################################################################
// #  48bit width actuator vector                                                       #
// ######################################################################################
    typedef volatile struct                                      
    {
        unsigned XAxisDriveToXPlus:1;                                                       // y0
        unsigned XAxisDriveToXMinus:1;                                                      // y1
        unsigned YAxisDriveToYPlus:1;                                                       // y2
        unsigned YAxisDriveToYMinus:1;                                                      // y3
        unsigned ZAxisDriveToZPlus:1;                                                       // y4
        unsigned ZAxisDriveToZMinus:1;                                                      // y5
        unsigned Magnet:1;                                                                  // y6
        unsigned Reserve0:1;                                                                // unused
        unsigned char Reserve1;                                                             // unused
        unsigned int Reserve2;                                                              // unused
        unsigned int Reserve3;                                                              // unused
    } Actuator_t;

    #define SensorPointer (uint8_t *)&Sensors
    #define ActuatorPointer (uint8_t *)&Actuators

    extern uint8_t ActuatorMapping[48];
    extern uint8_t SensorMapping[48];
    extern Sensor_t Sensors;
    extern Actuator_t Actuators;

#endif