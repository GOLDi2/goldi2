import {Experiment} from '@cross-lab-project/api-client/dist/generated/experiment/types';

export const three_axes_portal: Experiment = {
  status: 'running',
  roles: [
    {
      name: '3-Axis-Portal V1',
      template_device: 'https://api.goldi-labs.de/devices/40f25599-b62c-4580-82dc-3889c641bf77',
      'x-esc-position': {
        x: 800,
        y: 300,
      },
    },
    {
      name: 'ECP',
      template_device: 'https://api.goldi-labs.de/devices/9d9fcf04-c291-426f-8b06-fa237918564e',
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

export const three_axes_portal_mc: Experiment = {
  status: 'running',
  roles: [
    {
      name: '3-Axis-Portal V1',
      template_device: 'https://api.goldi-labs.de/devices/40f25599-b62c-4580-82dc-3889c641bf77',
      'x-esc-position': {
        x: 800,
        y: 300,
      },
    },
    {
      name: 'Microcontroller',
      template_device: 'https://api.goldi-labs.de/devices/c1359733-ccbd-46e2-9e99-6d9b1e12fe7b',
      'x-esc-position': {
        x: 800,
        y: 600,
      },
    },
    {
      name: 'ECP',
      template_device: 'https://api.goldi-labs.de/devices/9d9fcf04-c291-426f-8b06-fa237918564e',
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

export const mc: Experiment = {
    status: 'running',
    roles: [
      {
        name: 'ECP',
        template_device: 'https://api.goldi-labs.de/devices/9d9fcf04-c291-426f-8b06-fa237918564e',
        'x-esc-position': {
          x: 200,
          y: 400,
        },
      },
      {
        name: 'Microcontroller',
        template_device: 'https://api.goldi-labs.de/devices/c1359733-ccbd-46e2-9e99-6d9b1e12fe7b',
        'x-esc-position': {
          x: 800,
          y: 600,
        },
      },
    ],
    serviceConfigurations: [
      {
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
  

  export const three_axes_portal_io: Experiment = {
    status: 'running',
    roles: [
      {
        name: '3-Axis-Portal V1',
        template_device: 'https://api.goldi-labs.de/devices/40f25599-b62c-4580-82dc-3889c641bf77',
        'x-esc-position': {
          x: 800,
          y: 300,
        },
      },
      {
        name: 'IO-Board',
        template_device: 'https://api.goldi-labs.de/devices/c1359733-ccbd-46e2-9e99-6d9b1e12fe7b',
        'x-esc-position': {
          x: 800,
          y: 600,
        },
      },
      {
        name: 'ECP',
        template_device: 'https://api.goldi-labs.de/devices/9d9fcf04-c291-426f-8b06-fa237918564e',
        'x-esc-position': {
          x: 200,
          y: 400,
        },
      },
    ],
    serviceConfigurations: [
      {
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
      },
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
                },
                {
                  interfaceId: '2',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A2',
                  },
                  busId: 'LimitXRight',
                },
                {
                  interfaceId: '3',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A3',
                  },
                  busId: 'LimitYBack',
                },
                {
                  interfaceId: '4',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A4',
                  },
                  busId: 'LimitYFront',
                },
                {
                  interfaceId: '5',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A5',
                  },
                  busId: 'LimitZBottom',
                },
                {
                  interfaceId: '6',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A6',
                  },
                  busId: 'LimitZTop',
                },
                {
                  interfaceId: '7',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'A7',
                  },
                  busId: 'Proximity',
                },
                {
                  interfaceId: '8',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B1',
                  },
                  busId: 'XMotorLeft',
                },
                {
                  interfaceId: '9',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B2',
                  },
                  busId: 'XMotorRight',
                },
                {
                  interfaceId: '10',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B3',
                  },
                  busId: 'YMotorBack',
                },
                {
                  interfaceId: '11',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B4',
                  },
                  busId: 'YMotorFront',
                },
                {
                  interfaceId: '12',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B5',
                  },
                  busId: 'ZMotorBottom',
                },
                {
                  interfaceId: '13',
                  interfaceType: 'gpio',
                  signals: {
                    gpio: 'B6',
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