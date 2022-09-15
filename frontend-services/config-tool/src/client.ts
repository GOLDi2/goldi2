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
            if (ret.url === 'https://api.goldi-labs.de/devices/40f25599-b62c-4580-82dc-3889c641bf77') {
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
            if (ret.url === 'https://api.goldi-labs.de/devices/9d9fcf04-c291-426f-8b06-fa237918564e') {
              ret.services = [
                {serviceType: 'http://api.goldi-labs.de/serviceTypes/webcam', serviceId: 'webcam', serviceDirection: 'in'},
                {
                  serviceType: 'http://api.goldi-labs.de/serviceTypes/electrical',
                  serviceId: 'sensors',
                  serviceDirection: 'inout',
                  interfaces: [
                    {
                      interfaceType: 'gpio',
                      availableSignals: {
                        gpio: 'ANY',
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
                        gpio: 'ANY',
                      },
                    },
                  ],
                },
              ];
            }
          }
          return ret;
        };
      }
    }
  }
}
