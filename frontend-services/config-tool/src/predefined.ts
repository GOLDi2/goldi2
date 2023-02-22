import { ExperimentServiceTypes } from "@cross-lab-project/api-client";

export const three_axes_portal: ExperimentServiceTypes.Experiment = {
  status: 'running',
  roles: [
    {
      name: '3-Axis-Portal V1',
      template_device: 'https://api.goldi-labs.de/devices/5bce3eb7-f094-4be4-8469-8768b921d620',
      'x-esc-position': {
        x: 800,
        y: 300,
      },
    },
    {
      name: 'ECP',
      template_device: 'https://api.goldi-labs.de/devices/91c48ca7-d666-4f9b-9d3a-628f09daa058',
      'x-esc-position': {
        x: 200,
        y: 400,
      },
    },
  ],
  serviceConfigurations: [
    {
      serviceType: 'http://api.goldi-labs.de/serviceTypes/webcam',
      configuration: {},
      participants: [
        {
          serviceId: 'webcam',
          role: 'ECP',
          config: {},
        },
        {
          serviceId: 'webcam',
          role: '3-Axis-Portal V1',
          config: {},
        },
      ],
      id: 'ce2ca59d-2c25-4e52-bd03-829f9ab6fa10',
    },
    {
      serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
      configuration: {},
      participants: [
        {
          serviceId: 'electrical',
          role: 'ECP',
          config: {
            interfaces: [
              {
                interfaceId: '1',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitXLeft',
                },
                busId: 'LimitXLeft',
              },
              {
                interfaceId: '2',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitXRight',
                },
                busId: 'LimitXRight',
              },
              {
                interfaceId: '3',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitYBack',
                },
                busId: 'LimitYBack',
              },
              {
                interfaceId: '4',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitYFront',
                },
                busId: 'LimitYFront',
              },
              {
                interfaceId: '5',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitZBottom',
                },
                busId: 'LimitZBottom',
              },
              {
                interfaceId: '6',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitZTop',
                },
                busId: 'LimitZTop',
              },
              {
                interfaceId: '7',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'Proximity',
                },
                busId: 'Proximity',
              },
              {
                interfaceId: '8',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'XMotorLeft',
                },
                busId: 'XMotorLeft',
              },
              {
                interfaceId: '9',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'XMotorRight',
                },
                busId: 'XMotorRight',
              },
              {
                interfaceId: '10',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'YMotorBack',
                },
                busId: 'YMotorBack',
              },
              {
                interfaceId: '11',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'YMotorFront',
                },
                busId: 'YMotorFront',
              },
              {
                interfaceId: '12',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'ZMotorBottom',
                },
                busId: 'ZMotorBottom',
              },
              {
                interfaceId: '13',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'ZMotorTop',
                },
                busId: 'ZMotorTop',
              },
            ],
          },
        },
        {
          serviceId: 'sensors',
          role: '3-Axis-Portal V1',
          config: {
            interfaces: [
              {
                interfaceId: '1',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitXLeft',
                },
                busId: 'LimitXLeft',
              },
              {
                interfaceId: '2',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitXRight',
                },
                busId: 'LimitXRight',
              },
              {
                interfaceId: '3',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitYBack',
                },
                busId: 'LimitYBack',
              },
              {
                interfaceId: '4',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitYFront',
                },
                busId: 'LimitYFront',
              },
              {
                interfaceId: '5',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitZBottom',
                },
                busId: 'LimitZBottom',
              },
              {
                interfaceId: '6',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitZTop',
                },
                busId: 'LimitZTop',
              },
              {
                interfaceId: '7',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'Proximity',
                },
                busId: 'Proximity',
              },
            ],
          },
        },
        {
          serviceId: 'actuators',
          role: '3-Axis-Portal V1',
          config: {
            interfaces: [
              {
                interfaceId: '8',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'XMotorLeft',
                },
                busId: 'XMotorLeft',
              },
              {
                interfaceId: '9',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'XMotorRight',
                },
                busId: 'XMotorRight',
              },
              {
                interfaceId: '10',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'YMotorBack',
                },
                busId: 'YMotorBack',
              },
              {
                interfaceId: '11',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'YMotorFront',
                },
                busId: 'YMotorFront',
              },
              {
                interfaceId: '12',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'ZMotorBottom',
                },
                busId: 'ZMotorBottom',
              },
              {
                interfaceId: '13',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'ZMotorTop',
                },
                busId: 'ZMotorTop',
              },
            ],
          },
        },
      ],
      id: 'd1b922d7-40d8-4718-a90c-dca2ad9fc3b6',
    },
  ],
};

export const three_axes_portal_mc: ExperimentServiceTypes.Experiment = {
  status: 'running',
  roles: [
    {
      name: '3-Axis-Portal V1',
      template_device: 'https://api.goldi-labs.de/devices/5bce3eb7-f094-4be4-8469-8768b921d620',
      'x-esc-position': {
        x: 800,
        y: 300,
      },
    },
    {
      name: 'Microcontroller',
      template_device: 'https://api.goldi-labs.de/devices/b634ca99-518a-40ad-8db9-62e8d2ed7efc',
      'x-esc-position': {
        x: 800,
        y: 600,
      },
    },
    {
      name: 'ECP',
      template_device: 'https://api.goldi-labs.de/devices/91c48ca7-d666-4f9b-9d3a-628f09daa058',
      'x-esc-position': {
        x: 200,
        y: 400,
      },
    },
  ],
  serviceConfigurations: [
    {
      serviceType: 'http://api.goldi-labs.de/serviceTypes/webcam',
      configuration: {},
      participants: [
        {
          serviceId: 'webcam',
          role: 'ECP',
          config: {},
        },
        {
          serviceId: 'webcam',
          role: '3-Axis-Portal V1',
          config: {},
        },
      ],
      id: 'ce2ca59d-2c25-4e52-bd03-829f9ab6fa10',
    },
    {
      serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
      configuration: {},
      participants: [
        {
          serviceId: 'electrical',
          role: 'ECP',
          config: {
            interfaces: [
              {
                interfaceId: '1',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitXLeft',
                },
                busId: 'LimitXLeft',
              },
              {
                interfaceId: '2',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitXRight',
                },
                busId: 'LimitXRight',
              },
              {
                interfaceId: '3',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitYBack',
                },
                busId: 'LimitYBack',
              },
              {
                interfaceId: '4',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitYFront',
                },
                busId: 'LimitYFront',
              },
              {
                interfaceId: '5',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitZBottom',
                },
                busId: 'LimitZBottom',
              },
              {
                interfaceId: '6',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitZTop',
                },
                busId: 'LimitZTop',
              },
              {
                interfaceId: '7',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'Proximity',
                },
                busId: 'Proximity',
              },
              {
                interfaceId: '8',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'XMotorLeft',
                },
                busId: 'XMotorLeft',
              },
              {
                interfaceId: '9',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'XMotorRight',
                },
                busId: 'XMotorRight',
              },
              {
                interfaceId: '10',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'YMotorBack',
                },
                busId: 'YMotorBack',
              },
              {
                interfaceId: '11',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'YMotorFront',
                },
                busId: 'YMotorFront',
              },
              {
                interfaceId: '12',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'ZMotorBottom',
                },
                busId: 'ZMotorBottom',
              },
              {
                interfaceId: '13',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'ZMotorTop',
                },
                busId: 'ZMotorTop',
              },
            ],
          },
        },
        {
          serviceId: 'sensors',
          role: '3-Axis-Portal V1',
          config: {
            interfaces: [
              {
                interfaceId: '1',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitXLeft',
                },
                busId: 'LimitXLeft',
              },
              {
                interfaceId: '2',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitXRight',
                },
                busId: 'LimitXRight',
              },
              {
                interfaceId: '3',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitYBack',
                },
                busId: 'LimitYBack',
              },
              {
                interfaceId: '4',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitYFront',
                },
                busId: 'LimitYFront',
              },
              {
                interfaceId: '5',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitZBottom',
                },
                busId: 'LimitZBottom',
              },
              {
                interfaceId: '6',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'LimitZTop',
                },
                busId: 'LimitZTop',
              },
              {
                interfaceId: '7',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'Proximity',
                },
                busId: 'Proximity',
              },
            ],
          },
        },
        {
          serviceId: 'actuators',
          role: '3-Axis-Portal V1',
          config: {
            interfaces: [
              {
                interfaceId: '8',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'XMotorLeft',
                },
                busId: 'XMotorLeft',
              },
              {
                interfaceId: '9',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'XMotorRight',
                },
                busId: 'XMotorRight',
              },
              {
                interfaceId: '10',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'YMotorBack',
                },
                busId: 'YMotorBack',
              },
              {
                interfaceId: '11',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'YMotorFront',
                },
                busId: 'YMotorFront',
              },
              {
                interfaceId: '12',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'ZMotorBottom',
                },
                busId: 'ZMotorBottom',
              },
              {
                interfaceId: '13',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'ZMotorTop',
                },
                busId: 'ZMotorTop',
              },
            ],
          },
        },
        {
          serviceId: 'pins',
          role: 'Microcontroller',
          config: {
            interfaces: [
              {
                interfaceId: '1',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PH0',
                },
                busId: 'LimitXLeft',
              },
              {
                interfaceId: '2',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PH1',
                },
                busId: 'LimitXRight',
              },
              {
                interfaceId: '3',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PH3',
                },
                busId: 'LimitYBack',
              },
              {
                interfaceId: '4',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PH4',
                },
                busId: 'LimitYFront',
              },
              {
                interfaceId: '5',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PH5',
                },
                busId: 'LimitZBottom',
              },
              {
                interfaceId: '6',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PH6',
                },
                busId: 'LimitZTop',
              },
              {
                interfaceId: '7',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PE7',
                },
                busId: 'Proximity',
              },
              {
                interfaceId: '8',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PA0',
                },
                busId: 'XMotorLeft',
              },
              {
                interfaceId: '9',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PA1',
                },
                busId: 'XMotorRight',
              },
              {
                interfaceId: '10',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PA2',
                },
                busId: 'YMotorBack',
              },
              {
                interfaceId: '11',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PA3',
                },
                busId: 'YMotorFront',
              },
              {
                interfaceId: '12',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PA4',
                },
                busId: 'ZMotorBottom',
              },
              {
                interfaceId: '13',
                interfaceType: 'gpio',
                signals: {
                  gpio: 'PA5',
                },
                busId: 'ZMotorTop',
              },
            ],
          },
        },
      ],
      id: 'd1b922d7-40d8-4718-a90c-dca2ad9fc3b6',
    },
  ],
};

export const mc: ExperimentServiceTypes.Experiment = {
    status: 'running',
    roles: [
      {
        name: 'ECP',
        template_device: 'https://api.goldi-labs.de/devices/91c48ca7-d666-4f9b-9d3a-628f09daa058',
        'x-esc-position': {
          x: 200,
          y: 400,
        },
      },
      {
        name: 'Microcontroller',
        template_device: 'https://api.goldi-labs.de/devices/b634ca99-518a-40ad-8db9-62e8d2ed7efc',
        'x-esc-position': {
          x: 800,
          y: 600,
        },
      },
    ],
    serviceConfigurations: [
      /*{
        serviceType: 'http://api.goldi-labs.de/serviceTypes/file',
        configuration: {},
        participants: [
          {
            serviceId: 'file',
            role: 'ECP',
            config: {},
          },
          {
            serviceId: 'file',
            role: 'Microcontroller',
            config: {},
          },
        ],
        id: '3182f339-4968-4413-a0f0-cbf559deca74',
      },*/
      {
        serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
        configuration: {},
        participants: [
          {
            serviceId: 'electrical',
            role: 'ECP',
            config: {
              interfaces: [
                {
                  interfaceId: '1',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitXLeft',
                  },
                  busId: 'LimitXLeft',
                },
                {
                  interfaceId: '2',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitXRight',
                  },
                  busId: 'LimitXRight',
                },
                {
                  interfaceId: '3',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitYBack',
                  },
                  busId: 'LimitYBack',
                },
                {
                  interfaceId: '4',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitYFront',
                  },
                  busId: 'LimitYFront',
                },
                {
                  interfaceId: '5',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitZBottom',
                  },
                  busId: 'LimitZBottom',
                },
                {
                  interfaceId: '6',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitZTop',
                  },
                  busId: 'LimitZTop',
                },
                {
                  interfaceId: '7',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'Proximity',
                  },
                  busId: 'Proximity',
                },
                {
                  interfaceId: '8',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'XMotorLeft',
                  },
                  busId: 'XMotorLeft',
                },
                {
                  interfaceId: '9',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'XMotorRight',
                  },
                  busId: 'XMotorRight',
                },
                {
                  interfaceId: '10',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'YMotorBack',
                  },
                  busId: 'YMotorBack',
                },
                {
                  interfaceId: '11',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'YMotorFront',
                  },
                  busId: 'YMotorFront',
                },
                {
                  interfaceId: '12',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'ZMotorBottom',
                  },
                  busId: 'ZMotorBottom',
                },
                {
                  interfaceId: '13',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'ZMotorTop',
                  },
                  busId: 'ZMotorTop',
                },
              ],
            },
          },
          {
            serviceId: 'pins',
            role: 'Microcontroller',
            config: {
              interfaces: [
                {
                  interfaceId: '1',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PH0',
                  },
                  busId: 'LimitXLeft',
                  direction: 'out',
                },
                {
                  interfaceId: '2',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PH1',
                  },
                  busId: 'LimitXRight',
                  direction: 'out',
                },
                {
                  interfaceId: '3',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PH3',
                  },
                  busId: 'LimitYBack',
                  direction: 'out',
                },
                {
                  interfaceId: '4',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PH4',
                  },
                  busId: 'LimitYFront',
                  direction: 'out',
                },
                {
                  interfaceId: '5',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PH5',
                  },
                  busId: 'LimitZBottom',
                  direction: 'out',
                },
                {
                  interfaceId: '6',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PH6',
                  },
                  busId: 'LimitZTop',
                  direction: 'out',
                },
                {
                  interfaceId: '7',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PE7',
                  },
                  busId: 'Proximity',
                  direction: 'out',
                },
                {
                  interfaceId: '8',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PA0',
                  },
                  busId: 'XMotorLeft',
                  direction: 'in',
                },
                {
                  interfaceId: '9',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PA1',
                  },
                  busId: 'XMotorRight',
                  direction: 'in',
                },
                {
                  interfaceId: '10',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PA2',
                  },
                  busId: 'YMotorBack',
                  direction: 'in',
                },
                {
                  interfaceId: '11',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PA3',
                  },
                  busId: 'YMotorFront',
                  direction: 'in',
                },
                {
                  interfaceId: '12',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PA4',
                  },
                  busId: 'ZMotorBottom',
                  direction: 'in',
                },
                {
                  interfaceId: '13',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'PA5',
                  },
                  busId: 'ZMotorTop',
                  direction: 'in',
                },
              ],
            },
          },
        ],
        id: 'd1b922d7-40d8-4718-a90c-dca2ad9fc3b6',
      },
    ],
  };
  

  export const three_axes_portal_io: ExperimentServiceTypes.Experiment = {
    status: 'running',
    roles: [
      {
        name: '3-Axis-Portal V1',
        template_device: 'https://api.goldi-labs.de/devices/5bce3eb7-f094-4be4-8469-8768b921d620',
        'x-esc-position': {
          x: 800,
          y: 300,
        },
      },
      {
        name: 'IO-Board',
        template_device: 'https://api.goldi-labs.de/devices/b634ca99-518a-40ad-8db9-62e8d2ed7efc',
        'x-esc-position': {
          x: 800,
          y: 600,
        },
      },
      {
        name: 'ECP',
        template_device: 'https://api.goldi-labs.de/devices/91c48ca7-d666-4f9b-9d3a-628f09daa058',
        'x-esc-position': {
          x: 200,
          y: 400,
        },
      },
    ],
    serviceConfigurations: [
      /*{
        serviceType: 'http://api.goldi-labs.de/serviceTypes/file',
        configuration: {},
        participants: [
          {
            serviceId: 'file',
            role: 'ECP',
            config: {},
          }
        ],
        id: '3182f339-4968-4413-a0f0-cbf559deca74',
      },*/
      /*{
        serviceType: 'http://api.goldi-labs.de/serviceTypes/webcam',
        configuration: {},
        participants: [
          {
            serviceId: 'webcam',
            role: 'ECP',
            config: {},
          },
          {
            serviceId: 'webcam',
            role: '3-Axis-Portal V1',
            config: {},
          },
        ],
        id: 'ce2ca59d-2c25-4e52-bd03-829f9ab6fa10',
      },*/
      {
        serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
        configuration: {},
        participants: [
          {
            serviceId: 'electrical',
            role: 'ECP',
            config: {
              interfaces: [
                {
                  interfaceId: '1',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitXLeft',
                  },
                  busId: 'LimitXLeft',
                  direction: 'in',
                },
                {
                  interfaceId: '2',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitXRight',
                  },
                  busId: 'LimitXRight',
                  direction: 'in',
                },
                {
                  interfaceId: '3',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitYBack',
                  },
                  busId: 'LimitYBack',
                  direction: 'in',
                },
                {
                  interfaceId: '4',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitYFront',
                  },
                  busId: 'LimitYFront',
                  direction: 'in',
                },
                {
                  interfaceId: '5',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitZBottom',
                  },
                  busId: 'LimitZBottom',
                  direction: 'in',
                },
                {
                  interfaceId: '6',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitZTop',
                  },
                  busId: 'LimitZTop',
                  direction: 'in',
                },
                {
                  interfaceId: '7',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'Proximity',
                  },
                  busId: 'Proximity',
                  direction: 'in',
                },
                {
                  interfaceId: '8',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'XMotorLeft',
                  },
                  busId: 'XMotorLeft',
                  direction: 'in',
                },
                {
                  interfaceId: '9',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'XMotorRight',
                  },
                  busId: 'XMotorRight',
                  direction: 'in',
                },
                {
                  interfaceId: '10',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'YMotorBack',
                  },
                  busId: 'YMotorBack',
                  direction: 'in',
                },
                {
                  interfaceId: '11',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'YMotorFront',
                  },
                  busId: 'YMotorFront',
                  direction: 'in',
                },
                {
                  interfaceId: '12',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'ZMotorBottom',
                  },
                  busId: 'ZMotorBottom',
                  direction: 'in',
                },
                {
                  interfaceId: '13',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'ZMotorTop',
                  },
                  busId: 'ZMotorTop',
                  direction: 'in',
                },
              ],
            },
          },
          {
            serviceId: 'sensors',
            role: '3-Axis-Portal V1',
            config: {
              interfaces: [
                {
                  interfaceId: '1',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitXLeft',
                  },
                  busId: 'LimitXLeft',
                  direction: 'out',
                },
                {
                  interfaceId: '2',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitXRight',
                  },
                  busId: 'LimitXRight',
                  direction: 'out',
                },
                {
                  interfaceId: '3',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitYBack',
                  },
                  busId: 'LimitYBack',
                  direction: 'out',
                },
                {
                  interfaceId: '4',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitYFront',
                  },
                  busId: 'LimitYFront',
                  direction: 'out',
                },
                {
                  interfaceId: '5',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitZBottom',
                  },
                  busId: 'LimitZBottom',
                  direction: 'out',
                },
                {
                  interfaceId: '6',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'LimitZTop',
                  },
                  busId: 'LimitZTop',
                  direction: 'out',
                },
                {
                  interfaceId: '7',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'Proximity',
                  },
                  busId: 'Proximity',
                  direction: 'out',
                },
              ],
            },
          },
          {
            serviceId: 'actuators',
            role: '3-Axis-Portal V1',
            config: {
              interfaces: [
                {
                  interfaceId: '8',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'XMotorLeft',
                  },
                  busId: 'XMotorLeft',
                  direction: 'in',
                },
                {
                  interfaceId: '9',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'XMotorRight',
                  },
                  busId: 'XMotorRight',
                  direction: 'in',
                },
                {
                  interfaceId: '10',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'YMotorBack',
                  },
                  busId: 'YMotorBack',
                  direction: 'in',
                },
                {
                  interfaceId: '11',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'YMotorFront',
                  },
                  busId: 'YMotorFront',
                  direction: 'in',
                },
                {
                  interfaceId: '12',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'ZMotorBottom',
                  },
                  busId: 'ZMotorBottom',
                  direction: 'in',
                },
                {
                  interfaceId: '13',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'ZMotorTop',
                  },
                  busId: 'ZMotorTop',
                  direction: 'in',
                },
              ],
            },
          },
          {
            serviceId: 'pins',
            role: 'IO-Board',
            config: {
              interfaces: [
                {
                  interfaceId: '1',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A1',
                  },
                  busId: 'LimitXLeft',
                  direction: 'in',
                },
                {
                  interfaceId: '2',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A2',
                  },
                  busId: 'LimitXRight',
                  direction: 'in',
                },
                {
                  interfaceId: '3',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A3',
                  },
                  busId: 'LimitYBack',
                  direction: 'in',
                },
                {
                  interfaceId: '4',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A4',
                  },
                  busId: 'LimitYFront',
                  direction: 'in',
                },
                {
                  interfaceId: '5',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A5',
                  },
                  busId: 'LimitZBottom',
                  direction: 'in',
                },
                {
                  interfaceId: '6',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A6',
                  },
                  busId: 'LimitZTop',
                  direction: 'in',
                },
                {
                  interfaceId: '7',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A7',
                  },
                  busId: 'Proximity',
                  direction: 'in',
                },
                {
                  interfaceId: '8',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B1',
                  },
                  busId: 'XMotorLeft',
                  direction: 'out',
                },
                {
                  interfaceId: '9',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B2',
                  },
                  busId: 'XMotorRight',
                  direction: 'out',
                },
                {
                  interfaceId: '10',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B3',
                  },
                  busId: 'YMotorBack',
                  direction: 'out',
                },
                {
                  interfaceId: '11',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B4',
                  },
                  busId: 'YMotorFront',
                  direction: 'out',
                },
                {
                  interfaceId: '12',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B5',
                  },
                  busId: 'ZMotorBottom',
                  direction: 'out',
                },
                {
                  interfaceId: '13',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B6',
                  },
                  busId: 'ZMotorTop',
                  direction: 'out',
                },
              ],
            },
          },
        ],
        id: 'd1b922d7-40d8-4718-a90c-dca2ad9fc3b6',
      },
    ],
  };

  export const nak: ExperimentServiceTypes.Experiment = {
    status: 'running',
    roles: [
      {
        name: 'NAK Robot',
        template_device: 'https://api.goldi-labs.de/devices/3eacc285-43d2-402e-bc5b-7a0ee7d6e693',
      },
      {
        name: 'ECP',
        template_device: 'https://api.goldi-labs.de/devices/91c48ca7-d666-4f9b-9d3a-628f09daa058',
      },
    ],
    serviceConfigurations: [
      {
        serviceType: 'https://api.goldi-labs.de/serviceTypes/file',
        configuration: {},
        participants: [
          {
            serviceId: 'file',
            role: 'ECP',
            config: {},
          },
          {
            serviceId: 'file',
            role: 'NAK Robot',
            config: {},
          },
        ],
        id: '3182f339-4968-4413-a0f0-cbf559deca74',
      },
      {
        serviceType: 'https://api.goldi-labs.de/serviceTypes/webcam',
        configuration: {},
        participants: [
          {
            serviceId: 'webcam',
            role: 'ECP',
            config: {},
          },
          {
            serviceId: 'webcam',
            role: 'NAK Robot',
            config: {},
          },
        ],
        id: 'ce2ca59d-2c25-4e52-bd03-829f9ab6fa10',
      },
      {
        serviceType: 'https://api.goldi-labs.de/serviceTypes/message',
        configuration: {},
        participants: [
          {
            serviceId: 'message',
            role: 'ECP',
            config: {},
          },
          {
            serviceId: 'message',
            role: 'NAK Robot',
            config: {},
          },
        ],
        id: 'ce2ca59d-2c25-4e52-bd03-829f9ab6fa91',
      },
    ],
  };