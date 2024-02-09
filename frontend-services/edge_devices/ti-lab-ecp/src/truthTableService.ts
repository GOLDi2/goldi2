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

export interface ScanStateChangedEvent {
  scanningInputIndex: number;
}

export interface TruthTableChangedEvent {}
export interface FullScanCompleteEvent {}

interface TruthTableServiceEvents {
  scanStateChanged: (event: ScanStateChangedEvent) => void;
  truthTableChanged: (event: TruthTableChangedEvent) => void;
  fullScanComplete: (event: FullScanCompleteEvent) => void;
}

export class TruthTableService
  extends TypedEmitter<TruthTableServiceEvents>
  implements Service
{
  private _interfaces: Map<string, GPIO.GPIOInterface[]> = new Map();
  private _signalStates: Map<string, boolean> = new Map();
  private _electricalService = new ElectricalConnectionService(
    "signals",
    signals
  );
  private _output: number[] = Array<number>(2 ** 8).fill(0);
  private _output_from_fullScan: number[] = Array<number>(2 ** 8).fill(0);

  public input_variables: number = 0;
  public output_variables: number = 0;

  public mode: "scanTable" | "scanIndex" = "scanTable";
  public scanningInputIndex: number = -1;

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
    setTimeout(() => this._scan(), 0);
  }

  // #region Electrical Connection Support
  private _onNewInterface(event: NewInterfaceEvent) {
    if (event.connectionInterface instanceof GPIO.GPIOInterface) {
      const gpioInterface = event.connectionInterface as GPIO.GPIOInterface;
      const name = gpioInterface.configuration.signals.gpio;
      this._interfaces.set(name, this._interfaces.get(name) ?? []);
      this._interfaces.get(name)?.push(gpioInterface);
      gpioInterface.addListener("signalChange", (event) =>
        this._signalStates.set(name, HighState.includes(event.state))
      );
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

  // #region Scanning
  private async _scanIndex(inputIndex: number) {
    this.emit("scanStateChanged", {
      scanningInputIndex: inputIndex,
    });
    this._setInput(inputIndex);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const _oldOutput = this._output[inputIndex];
    const _newOutput = this._getOutput();
    this._output[inputIndex] = _newOutput;
    if (_oldOutput !== _newOutput) {
      this.emit("truthTableChanged", {});
    }
  }

  private _fullScanIndex: number = 0;
  private async _scan() {
    if (this.mode === "scanIndex") {
      this._fullScanIndex = 0;
      await this._scanIndex(this.scanningInputIndex);
    } else {
      const grayCoding = (this._fullScanIndex >> 1) ^ this._fullScanIndex;
      await this._scanIndex(grayCoding);
      this._fullScanIndex++;
      if (this._fullScanIndex >= 2 ** this.input_variables) {
        this._fullScanIndex = 0;
        this.emit("fullScanComplete", {});
      }
    }
    setTimeout(() => this._scan(), 0);
  }
  // #endregion

  // #region Public API
  public getOutput(inputIndex: number, outputVariable: number) {
    return ((this._output[inputIndex] >> outputVariable) & 1) === 1;
  }

  public getFunctionIndex(outputVariable: number) {
    let index = 0;
    for (let i = 0; i < this.input_variables ** 2; i++) {
      index |= (this.getOutput(i, outputVariable) ? 1 : 0) << i;
    }
    return index;
  }

  public getFunctionIndices() {
    const function_indices: number[] = [];
    for (let i = 0; i < this.output_variables; i++) {
      function_indices.push(this.getFunctionIndex(i));
    }
    return function_indices;
  }
  // #endregion
}
