import { ExperimentServiceTypes } from "@cross-lab-project/api-client";

const ecp_config = {
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
};

const axis_sensor_config = {
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
};

const axis_actuator_config = {
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
};

const io_board_config = {
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
};

export const three_axes_portal ={
  status: 'running',
  roles: [
    {
      name: '3-Axis-Portal V1',
      template_device: 'https://api.goldi-labs.de/devices/5bce3eb7-f094-4be4-8469-8768b921d620',
    },
    {
      name: 'ECP',
      template_device: 'https://api.goldi-labs.de/devices/9b283217-e90c-42c2-9d44-18293bc7b1da',
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
    },
    {
      serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
      configuration: {},
      participants: [
        ecp_config,
        axis_sensor_config,
        axis_actuator_config,
      ],
    },
  ],
}

const three_axes_portal_io_fun: (io: string) => ExperimentServiceTypes.Experiment = (io)=>({
  status: 'running',
  roles: [
    {
      name: '3-Axis-Portal V1',
      template_device: 'https://api.goldi-labs.de/devices/5bce3eb7-f094-4be4-8469-8768b921d620',
    },
    {
      name: 'IO-Board',
      template_device: io,
    },
    {
      name: 'ECP',
      template_device: 'https://api.goldi-labs.de/devices/9b283217-e90c-42c2-9d44-18293bc7b1da',
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
    },
    {
      serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
      configuration: {},
      participants: [
        ecp_config,
        axis_sensor_config,
        axis_actuator_config,
        io_board_config,
      ],
    },
  ],
});

export const three_axes_portal_io_old = three_axes_portal_io_fun('https://api.goldi-labs.de/devices/b634ca99-518a-40ad-8db9-62e8d2ed7efc');
export const three_axes_portal_io_lte = three_axes_portal_io_fun('https://api.goldi-labs.de/devices/2261651d-5831-4be8-8b9b-ac75fc794f4a');

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