// ######################################################################################
// #                                                                                    #
// #  This module defines sensors & actuators for physical system '3AxisPortal'         #
// #                                                                                    #
// ######################################################################################

#ifndef _MAPPING_H
    #define _MAPPING_H
    #include <stdint.h>

    #ifdef PSPU_3AxisPortal
        #include "PhysicalSystems/3AxisPortal.h"
    #endif

    #ifdef PSPU_ProductionCell
        #include "PhysicalSystems/ProductionCell.h"
    #endif

    #ifdef PSPU_Elevator3Floors
        #include "PhysicalSystems/Elevator3Floors.h"
    #endif

    #ifdef PSPU_Elevator4Floors
        #include "PhysicalSystems/Elevator4Floors.h"
    #endif

    #ifdef PSPU_Elevator4FloorsClassic
        #include "PhysicalSystems/Elevator4Floors.h"
    #endif

    #ifdef PSPU_Pump
        #include "PhysicalSystems/Pump.h"
    #endif

    #ifdef PSPU_Warehouse
        #include "PhysicalSystems/Warehouse.h"
    #endif

    #ifdef PSPU_Maze
        #include "PhysicalSystems/Maze.h"
    #endif

    #ifdef PSPU_DigitalDemoBoardPSPU
        #include "PhysicalSystems/DigitalDemoBoardPSPU.h"
    #endif

    //dorthin verschieben wo es benötigt wird
    extern uint8_t getActuatorMapping(uint8_t pin);
    extern uint8_t getSensorMapping(uint8_t pin);
    extern uint8_t* getActuators();
    extern uint8_t* getSensors();

#endif