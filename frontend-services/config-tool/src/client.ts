import {APIClient as originalClient} from '@cross-lab-project/api-client';

export class APIClient extends originalClient {
  private async _login() {
    if (localStorage.getItem('token')) {
      this.accessToken = localStorage.getItem('token');
    } else {
      throw new Error('Not logged in');
    }
  }

  constructor() {
    super('https://api.goldi-labs.de');

    const self = this as any;
    for (const k of Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(this)))) {
      if (self[k].constructor.name === 'AsyncFunction' && k !== '_login' && k !== 'login') {
        const original_function = self[k].bind(self);
        self[k] = async function (...args: any[]) {
          await self._login();
          const ret = await original_function(...args);
          if (k === 'getDevice') {
            if (ret.name === 'Test') {
              ret.services = [
                {serviceType: 'http://api.goldi-labs.de/serviceTypes/webcam', serviceId: 'webcam', serviceDirection: 'out'},
                {
                  serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
                  serviceId: 'sensors',
                  serviceDirection: 'inout',
                  interfaces: [
                    {
                      interfaceType: 'gpio',
                      availableSignals: {
                        gpio: ['LimitXLeft', 'LimitXRight', 'LimitYBack', 'LimitYFront', 'LimitZBottom', 'LimitZTop', 'Proximity'],
                      },
                    },
                  ],
                },
                {
                  serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
                  serviceId: 'actuators',
                  serviceDirection: 'inout',
                  interfaces: [
                    {
                      interfaceType: 'gpio',
                      availableSignals: {
                        gpio: ['XMotorLeft', 'XMotorRight', 'YMotorBack', 'YMotorFront', 'ZMotorBottom', 'ZMotorTop'],
                      },
                    },
                  ],
                },
              ];
            }
            if (ret.name === 'ECP') {
              ret.services = [
                {serviceType: 'http://api.goldi-labs.de/serviceTypes/webcam', serviceId: 'webcam', serviceDirection: 'in'},
                {serviceType: 'http://api.goldi-labs.de/serviceTypes/file', serviceId: 'file', serviceDirection: 'out'},
                {
                  serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
                  serviceId: 'electrical',
                  serviceDirection: 'inout',
                  interfaces: [
                    {
                      interfaceType: 'gpio',
                      availableSignals: {
                        gpio: 'ANY',
                      },
                    },
                  ],
                }
              ];
            }
          }
          if (ret.name === 'Microcontroller') {
            ret.services = [
              {serviceType: 'http://api.goldi-labs.de/serviceTypes/file', serviceId: 'file', serviceDirection: 'in'},
              {
                serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
                serviceId: 'pins',
                serviceDirection: 'inout',
                interfaces: [
                  {
                    interfaceType: 'gpio',
                    availableSignals: {
                      gpio: [
                        'PE0',
                        'PE1',
                        'PE2',
                        'PE3',
                        'PE4',
                        'PE5',
                        'PE6',
                        'PE7',
                        'PH0',
                        'PH1',
                        'PH2',
                        'PH3',
                        'PH4',
                        'PH5',
                        'PH6',
                        'PH7',
                        'PB0',
                        'PB1',
                        'PB2',
                        'PB3',
                        'PB4',
                        'PB5',
                        'PB6',
                        'PB7',
                        'PL0',
                        'PL1',
                        'PL2',
                        'PL3',
                        'PL4',
                        'PL5',
                        'PL6',
                        'PL7',
                        'PD0',
                        'PD1',
                        'PD2',
                        'PD3',
                        'PD4',
                        'PD5',
                        'PD6',
                        'PD7',
                        'PG0',
                        'PG1',
                        'PG2',
                        'PG3',
                        'PG4',
                        'PG5',
                        'PF0',
                        'PF1',
                        'PF2',
                        'PF3',
                        'PF4',
                        'PF5',
                        'PF6',
                        'PF7',
                        'PK0',
                        'PK1',
                        'PK2',
                        'PK3',
                        'PK4',
                        'PK5',
                        'PK6',
                        'PK7',
                        'PA0',
                        'PA1',
                        'PA2',
                        'PA3',
                        'PA4',
                        'PA5',
                        'PA6',
                        'PA7',
                        'PJ0',
                        'PJ1',
                        'PJ2',
                        'PJ3',
                        'PJ4',
                        'PJ5',
                        'PJ6',
                        'PJ7',
                        'PC0',
                        'PC1',
                        'PC2',
                        'PC3',
                        'PC4',
                        'PC5',
                        'PC6',
                        'PC7',
                      ],
                    },
                  },
                ],
              },
            ];
          }
          if (ret.name === 'IO-Board') {
            ret.services = [
              {
                serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
                serviceId: 'pins',
                serviceDirection: 'inout',
                interfaces: [
                  {
                    interfaceType: 'gpio',
                    availableSignals: {
                      gpio: [
                      ],
                    },
                  },
                ],
              },
            ];
          }
          return ret;
        };
      }
    }
  }
}
