import EventEmitter from "events";

export interface AxisPortalAnimationInterface {
  update(
    sensors: Record<string, boolean>,
    actuators: Record<string, boolean>,
    XPosition: number,
    YPosition: number,
    ZPosition: number
  ): void;
}

export class AxisPortalSimulation {
  private sensor_names = [
    "LimitXLeft",
    "LimitXRight",
    "LimitYBack",
    "LimitYFront",
    "LimitZBottom",
    "LimitZTop",
    "Proximity",
  ];

  private actuators_names = [
    "XMotorLeft",
    "XMotorRight",
    "YMotorBack",
    "YMotorFront",
    "ZMotorBottom",
    "ZMotorTop",
    "Magnet",
  ];

  actuators: Record<string, boolean>;
  sensors: Record<string, boolean>;

  actuators_emitter = new EventEmitter();
  sensors_emitter = new EventEmitter();

  constructor(private animation: AxisPortalAnimationInterface) {
    this.actuators = Object.fromEntries(
      this.actuators_names.map((name) => [name, false])
    );
    this.sensors = Object.fromEntries(
      this.sensor_names.map((name) => [name, false])
    );

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
    if (this.actuators["XMotorLeft"] && !this.actuators["XMotorRight"]) {
      this.xPosition -= (this.xSpeed * dt) / 1000;
    }
    if (!this.actuators["XMotorLeft"] && this.actuators["XMotorRight"]) {
      this.xPosition += (this.xSpeed * dt) / 1000;
    }

    if (this.actuators["YMotorBack"] && !this.actuators["YMotorFront"]) {
      this.yPosition += (this.ySpeed * dt) / 1000;
    }
    if (!this.actuators["YMotorBack"] && this.actuators["YMotorFront"]) {
      this.yPosition -= (this.ySpeed * dt) / 1000;
    }

    if (this.actuators["ZMotorBottom"] && !this.actuators["ZMotorTop"]) {
      this.zPosition += (this.zSpeed * dt) / 1000;
    }
    if (!this.actuators["ZMotorBottom"] && this.actuators["ZMotorTop"]) {
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
      this.zPosition
    );
  }

  setActuator(signal: string, value: boolean): void {
    this.actuators[signal] = value;
    this.actuators_emitter.emit(signal, this.actuators[signal]);
  }
}
