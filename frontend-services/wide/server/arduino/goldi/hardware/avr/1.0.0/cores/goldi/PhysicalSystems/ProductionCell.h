// ######################################################################################
// #                                                                                    #
// #  This module defines sensors & actuators for physical system 'ProductionCell'      #
// #                                                                                    #
// ######################################################################################

#ifndef _PRODUCTIONCELL_H
    #define _PRODUCTIONCELL_H

// ######################################################################################
// #  48bit width sensor vector                                                         #
// ######################################################################################
    typedef struct                                                                    
    {
        unsigned TransportTableInLineWithConveyorBelt3:1;                                   // x0
        unsigned TransportTableInLineWithWonveyorBelt1:1;                                   // x1
        unsigned TransportTableWorkpieceAvailable:1;                                        // x2
        unsigned ConveyorBelt1WorkpieceAvailable:1;                                         // x3
        unsigned Turntable1InLineWithConveyorBelt1:1;                                       // x4
        unsigned Turntable1InLineWithConveyorBelt2:1;                                       // x5
        unsigned Turntable1WorkpieceAvailable:1;                                            // x6
        unsigned ConveyorBelt2WorkpieceAvailable:1;                                         // x7
        unsigned Turntable2InLineWithConveyorBelt2:1;                                       // x8
        unsigned Turntable2InLineWithConveyorBelt3:1;                                       // x9
        unsigned Turntable2WorkpieceAvailable:1;                                            // x10
        unsigned ConveyorBelt3WorkpieceAvailable:1;                                         // x11
        unsigned MillingMachineAwayFromConveyorBelt2:1;                                     // x12
        unsigned MillingMachineAtConveyorBelt2:1;                                           // x13
        unsigned MillingHeadIsUp:1;                                                         // x14
        unsigned MillingHeadIsDown:1;                                                       // x15
        unsigned EmergencyStop:1;                                                           // x16
        unsigned Reserve0:1;                                                                // unused
        unsigned Reserve1:1;                                                                // unused
        unsigned Reserve2:1;                                                                // unused
        unsigned Reserve3:1;                                                                // unused
        unsigned Reserve4:1;                                                                // unused
        unsigned Reserve5:1;                                                                // unused
        unsigned Reserve6:1;                                                                // unused
        unsigned char Reserve7;                                                             // unused
        unsigned int Reserve8;                                                              // unused
    } Sensor_t;
    
// ######################################################################################
// #  48bit width actuator vector                                                       #
// ######################################################################################
    typedef struct                                                                         
    {
        unsigned TransportTableMoveToConveyorBelt3:1;                                       // y0
        unsigned TransportTableMoveToConveyorBelt1:1;                                       // y1
        unsigned TransportTableDriveConveyorBeltSimilarToConveyorBelt1:1;                   // y2
        unsigned TransportTableDriveConveyorBeltSimilarToConveyorBelt3:1;                   // y3
        unsigned ConveyorBelt1DriveBelt:1;                                                  // y4
        unsigned Turntable1RotateToConveyorBelt1:1;                                         // y5
        unsigned Turntable1RotateToConveyorBelt2:1;                                         // y6
        unsigned Turntable1DriveBelt:1;                                                     // y7
        unsigned ConveyorBelt2DriveBelt:1;                                                  // y8
        unsigned Turntable2RotateToConveyorBelt2:1;                                         // y9
        unsigned Turntable2RotateToConveyorBelt_3:1;                                        // y10
        unsigned Turntable2DriveBelt:1;                                                     // y11
        unsigned ConveyorBelt3DriveBelt:1;                                                  // y12
        unsigned MillingMachineApproachConveyorBelt_2:1;                                    // y13
        unsigned MillingMachineRetreatFromConveyorBelt2:1;                                  // y14
        unsigned MillingHeadRise:1;                                                         // y15
        unsigned MillingHeadLower:1;                                                        // y16
        unsigned MillingHeadDriveHead:1;                                                    // y17
        unsigned Reserve0:1;                                                                // unused
        unsigned Reserve1:1;                                                                // unused
        unsigned Reserve2:1;                                                                // unused
        unsigned Reserve3:1;                                                                // unused
        unsigned Reserve4:1;                                                                // unused
        unsigned Reserve5:1;                                                                // unused
        unsigned char Reserve6;                                                             // unused
        unsigned int Reserve7;                                                              // unused
    } Actuator_t;


    #define SensorPointer (uint8_t *)&Sensors
    #define ActuatorPointer (uint8_t *)&Actuators

    extern uint8_t ActuatorMapping[48];
    extern uint8_t SensorMapping[48];
    extern Sensor_t Sensors;
    extern Actuator_t Actuators;

#endif