import { DeviceHandler } from '@cross-lab-project/soa-client';
import {
  ElectricalConnectionService,
  GPIO,
  NewInterfaceEvent,
} from '@cross-lab-project/soa-service-electrical';
import EventEmitter from 'events';

function isHigh(value: GPIO.GPIOState) {
  switch (value) {
    case GPIO.GPIOState.StrongHigh:
    case GPIO.GPIOState.WeakHigh:
      return true;
    default:
      return false;
  }
}

export interface AxisPortalAnimationInterface {
  update(
    sensors: Record<string, boolean>,
    actuators: Record<string, boolean>,
    XPosition: number,
    YPosition: number,
    ZPosition: number,
  ): void;
}

export class AxisPortal {
  private sensor_names = [
    'LimitXLeft',
    'LimitXRight',
    'LimitYBack',
    'LimitYFront',
    'LimitZBottom',
    'LimitZTop',
    'Proximity',
  ];

  private actuators_names = [
    'XMotorLeft',
    'XMotorRight',
    'YMotorBack',
    'YMotorFront',
    'ZMotorBottom',
    'ZMotorTop',
    'Magnet',
  ];

  actuators: Record<string, boolean>;
  sensors: Record<string, boolean>;

  actuators_emitter = new EventEmitter();
  sensors_emitter = new EventEmitter();

  constructor(private animation: AxisPortalAnimationInterface) {
    this.actuators = Object.fromEntries(this.actuators_names.map(name => [name, false]));
    this.sensors = Object.fromEntries(this.sensor_names.map(name => [name, false]));

    this.lastTimestamp = Date.now();
    requestAnimationFrame(() => this._update());
  }

  lastTimestamp: number;
  _update(): void {
    const now = Date.now();
    const dt = now - this.lastTimestamp;
    this.lastTimestamp = now;

    const oldSensors = { ...this.sensors };
    this.update(dt);
    for (const sensor in this.sensors) {
      if (oldSensors[sensor] !== this.sensors[sensor]) {
        this.sensors_emitter.emit(sensor, this.sensors[sensor]);
      }
    }
    requestAnimationFrame(() => this._update());
  }

  xPosition: number = 0;
  yPosition: number = 0;
  zPosition: number = 0;

  readonly xSpeed: number = 0.1;
  readonly ySpeed: number = 0.3;
  readonly zSpeed: number = 0.3;
  update(dt: number) {
    if (this.actuators['XMotorLeft'] && !this.actuators['XMotorRight']) {
      this.xPosition -= (this.xSpeed * dt) / 1000;
    }
    if (!this.actuators['XMotorLeft'] && this.actuators['XMotorRight']) {
      this.xPosition += (this.xSpeed * dt) / 1000;
    }

    if (this.actuators['YMotorBack'] && !this.actuators['YMotorFront']) {
      this.yPosition += (this.ySpeed * dt) / 1000;
    }
    if (!this.actuators['YMotorBack'] && this.actuators['YMotorFront']) {
      this.yPosition -= (this.ySpeed * dt) / 1000;
    }

    if (this.actuators['ZMotorBottom'] && !this.actuators['ZMotorTop']) {
      this.zPosition += (this.zSpeed * dt) / 1000;
    }
    if (!this.actuators['ZMotorBottom'] && this.actuators['ZMotorTop']) {
      this.zPosition -= (this.zSpeed * dt) / 1000;
    }

    this.xPosition = Math.max(0, Math.min(1, this.xPosition));
    this.yPosition = Math.max(0, Math.min(1, this.yPosition));
    this.zPosition = Math.max(0, Math.min(1, this.zPosition));

    this.sensors.LimitXLeft = this.xPosition === 0;
    this.sensors.LimitXRight = this.xPosition === 1;
    this.sensors.LimitYBack = this.yPosition === 1;
    this.sensors.LimitYFront = this.yPosition === 0;
    this.sensors.LimitZBottom = this.zPosition === 1;
    this.sensors.LimitZTop = this.zPosition === 0;

    this.animation.update(
      this.sensors,
      this.actuators,
      this.xPosition,
      this.yPosition,
      this.zPosition,
    );
  }

  register(deviceHandler: DeviceHandler) {
    const sensor_service = new ElectricalConnectionService('sensors', this.sensor_names);
    const sensor_interface = new GPIO.ConstructableGPIOInterface(this.sensor_names);
    sensor_service.addInterface(sensor_interface);
    sensor_service.on('newInterface', e => this.newSensorInterface(e));
    deviceHandler.addService(sensor_service);

    const actuators_service = new ElectricalConnectionService(
      'actuators',
      this.actuators_names,
    );
    const actuators_interface = new GPIO.ConstructableGPIOInterface(this.actuators_names);
    actuators_service.addInterface(actuators_interface);
    actuators_service.on('newInterface', e => this.newActuatorInterface(e));
    deviceHandler.addService(actuators_service);
  }

  newActuatorInterface(e: NewInterfaceEvent): void {
    if (e.connectionInterface instanceof GPIO.GPIOInterface) {
      const signal = e.connectionInterface.signal;
      const onSignalChange: GPIO.GPIOInterfaceEvents['signalChange'] = c => {
        this.actuators[signal] = isHigh(c.state);
        this.actuators_emitter.emit(signal, this.actuators[signal]);
      };
      e.connectionInterface.on('signalChange', onSignalChange);

      this.actuators[signal] = isHigh(e.connectionInterface.signalState);
      this.actuators_emitter.emit(signal, this.actuators[signal]);
    }
  }

  newSensorInterface(e: NewInterfaceEvent): void {
    if (e.connectionInterface instanceof GPIO.GPIOInterface) {
      const GPIOInterface = e.connectionInterface as GPIO.GPIOInterface;
      const onSignalChange = (value: boolean) => {
        GPIOInterface.changeDriver(
          value ? GPIO.GPIOState.StrongHigh : GPIO.GPIOState.StrongLow,
        );
      };
      this.sensors_emitter.on(GPIOInterface.signal, onSignalChange);

      GPIOInterface.changeDriver(
        this.sensors[GPIOInterface.signal]
          ? GPIO.GPIOState.StrongHigh
          : GPIO.GPIOState.StrongLow,
      );
    }
  }
}
