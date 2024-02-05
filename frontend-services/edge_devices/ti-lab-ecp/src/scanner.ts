const inp_signals = ["x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7"];
const out_signals = ["y0", "y1", "y2", "y3", "y4", "y5", "y6", "y7"];
const signals = [...inp_signals, ...out_signals];

export class Scanner {
  public onStateChanged?: () => void;
  public scanningRowNumber: number = -1;
  public output_matrix: number[];

  constructor(
    public readonly input_variables: number,
    public readonly output_variables: number,
    private readonly setOutput: (output: number, value: boolean) => void,
    private readonly getInput: (input: number) => Promise<boolean> | boolean
  ) {
    this.output_matrix = Array(2 ** input_variables).fill(0);
  }

  private async _scan(input: number) {
    this.scanningRowNumber = input;
    this.onStateChanged?.();
    for (let i = 0; i < this.input_variables; i++) {
      this.setOutput(i, (input & (1 << i)) !== 0);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    let output = 0;
    for (let i = 0; i < this.output_variables; i++) {
      output |= ((await this.getInput(i)) ? 1 : 0) << i;
    }
    this.output_matrix[input] = output;
    this.scanningRowNumber = -1;
    this.onStateChanged?.();
  }

  private scanRunning: boolean = false;
  private requestFullScan: () => void | null = null;
  async scan(input?: number) {
    if (this.scanRunning) return;
    this.scanRunning = true;
    if (input !== undefined) {
      await this._scan(input);
    } else {
      for (let i = 0; i < 2 ** this.input_variables; i++) {
        const row = (i >> 1) ^ i; // Gray coding
        await this._scan(row);
      }
    }
    if (this.requestFullScan) {
      for (let i = 0; i < 2 ** this.input_variables; i++) {
        const row = (i >> 1) ^ i; // Gray coding
        await this._scan(row);
      }
      this.requestFullScan();
      this.requestFullScan = null;
    }
    this.scanRunning = false;
  }

  async fullScan() {
    const fullScanPromise = new Promise<void>((resolve) => {
      this.requestFullScan = resolve;
    });
    this.scan();
    await fullScanPromise;
    return this.output_matrix;
  }
}
