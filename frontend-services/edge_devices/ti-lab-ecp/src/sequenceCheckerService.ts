import {
  PeerConnection,
  Service,
  ServiceConfiguration,
} from "@cross-lab-project/soa-client";
import {
  ElectricalConnectionService,
  GPIO,
  NewInterfaceEvent,
} from "@cross-lab-project/soa-service-electrical";
import { TypedEmitter } from "tiny-typed-emitter";

const output_signals = ["x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7"];
const input_signals = ["y0", "y1", "y2", "y3", "y4", "y5", "y6", "y7"];
const signals = [...output_signals, ...input_signals];

const HighState = [GPIO.GPIOState.StrongHigh, GPIO.GPIOState.WeakHigh];

interface SequenceCheckerServiceEvents {
  inputChanged: (event: { signal: string; value: boolean }) => void;
}
export class SequenceCheckerService
  extends TypedEmitter<SequenceCheckerServiceEvents>
  implements Service
{
  private _interfaces: Map<string, GPIO.GPIOInterface[]> = new Map();
  private _signalStates: Map<string, boolean> = new Map();
  private _electricalService = new ElectricalConnectionService(
    "signals",
    signals
  );

  public input_variables: number = 0;
  public output_variables: number = 0;

  private _outputs: Record<string, boolean> = {};

  // #region Service Implementation
  getMeta = () => this._electricalService.getMeta();
  serviceType = this._electricalService.serviceType;
  serviceId = this._electricalService.serviceId;
  serviceDirection = this._electricalService.serviceDirection;
  setupConnection = (
    connection: PeerConnection,
    serviceConfig: ServiceConfiguration
  ) => this._electricalService.setupConnection(connection, serviceConfig);
  // #endregion

  constructor() {
    super();
    const _interface = new GPIO.ConstructableGPIOInterface(signals);
    this._electricalService.addInterface(_interface);
    this._electricalService.on("newInterface", (event) =>
      this._onNewInterface(event)
    );
  }

  // #region Electrical Connection Support
  private _onNewInterface(event: NewInterfaceEvent) {
    if (event.connectionInterface instanceof GPIO.GPIOInterface) {
      const gpioInterface = event.connectionInterface as GPIO.GPIOInterface;
      const name = gpioInterface.configuration.signals.gpio;
      this._interfaces.set(name, this._interfaces.get(name) ?? []);
      this._interfaces.get(name)?.push(gpioInterface);
      gpioInterface.addListener("signalChange", (event) => {
        this._signalStates.set(name, HighState.includes(event.state));
        this.emit("inputChanged", {
          signal: name,
          value: this._signalStates.get(name) ?? false,
        });
      });
      // TODO: Add event listener for interface removal
    }
  }

  private _setSignalState(signal: string, value: boolean) {
    const state = value ? GPIO.GPIOState.StrongHigh : GPIO.GPIOState.StrongLow;
    for (const i of this._interfaces.get(signal) ?? []) {
      i.changeDriver(state);
    }
  }

  private _setInput(inputIndex: number) {
    for (let i = 0; i < this.input_variables; i++) {
      this._setSignalState(output_signals[i], (inputIndex & (1 << i)) !== 0);
    }
  }

  private _getOutput() {
    let output = 0;
    for (let i = 0; i < this.output_variables; i++) {
      output |= (this._signalStates.get(input_signals[i]) ? 1 : 0) << i;
    }
    return output;
  }
  // #endregion

  // #region Sequence Scanning
  private async _getSequenceOutput(input: number[]) {
    let output: number[] = [];
    for (const index of input) {
      this._setInput(index);
      await new Promise((resolve) => setTimeout(resolve, 500));
      output.push(this._getOutput());
    }
    return output;
  }

  private sequenceRunning: boolean = false;
  private sequenceQueue: {
    input: number[];
    resolve: (output: number[]) => void;
  }[] = [];
  public getSequenceOutput(input: number[]) {
    const promise = new Promise<number[]>((resolve) => {
      this.sequenceQueue.push({ input, resolve });
    });
    if (!this.sequenceRunning) {
      this._handleSequenceQueue();
    }
    return promise;
  }
  private async _handleSequenceQueue() {
    this.sequenceRunning = true;
    while (this.sequenceQueue.length > 0) {
      const { input, resolve } = this.sequenceQueue.shift();
      const output = await this._getSequenceOutput(input);
      resolve(output);
    }
    for (const signal of Object.keys(this._outputs)) {
      this._setSignalState(signal, this._outputs[signal]);
    }
    this.sequenceRunning = false;
  }
  // #endregion

  getInput(signal: string) {
    return this._signalStates.get(signal) ?? false;
  }

  setOutput(signal: string, value: boolean) {
    this._outputs[signal] = value;
    if (!this.sequenceRunning) this._setSignalState(signal, value);
  }
}
