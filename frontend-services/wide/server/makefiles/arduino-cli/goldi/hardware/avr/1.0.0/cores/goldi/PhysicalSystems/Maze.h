// ######################################################################################
// #                                                                                    #
// #  This module defines sensors & actuators for physical system 'Maze'                #
// #                                                                                    #
// ######################################################################################

#ifndef _MAZE_H
    #define _MAZE_H

// ######################################################################################
// #  48bit width sensor vector                                                         #
// ######################################################################################
    typedef struct
    {
        unsigned int UndefinedAndToDo1;                                                     // unused (to be defined!)
        unsigned int UndefinedAndToDo2;                                                     // unused (to be defined!)
        unsigned int UndefinedAndToDo3;                                                     // unused (to be defined!)
    } Sensor_t;          

// ######################################################################################
// #  48bit width actuator vector                                                       #
// ######################################################################################
    typedef struct
    {
        unsigned int UndefinedAndToDo1;                                                     // unused (to be defined!)
        unsigned int UndefinedAndToDo2;                                                     // unused (to be defined!)
        unsigned int UndefinedAndToDo3;                                                     // unused (to be defined!)
    } Actuator_t;

    #define SensorPointer (uint8_t *)&Sensors
    #define ActuatorPointer (uint8_t *)&Actuators

    extern uint8_t ActuatorMapping[48];
    extern uint8_t SensorMapping[48];
    extern Sensor_t Sensors;
    extern Actuator_t Actuators;

#endif