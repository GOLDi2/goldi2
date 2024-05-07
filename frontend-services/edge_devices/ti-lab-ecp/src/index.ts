import { adoptStyles, html, LitElement, unsafeCSS } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./axis_portal";
import { DeviceHandler } from "./components/deviceHandler";
import "./components/dialog";
import "./components/progress";
import "./manual";

const deviceHandler = new DeviceHandler();

import { SequenceCheckerService } from "./sequenceCheckerService";
import style from "./styles.css";
const stylesheet = unsafeCSS(style);

@customElement("ecp-app")
export class App extends LitElement {
  @state()
  private interaction: "axis_portal" | "manual" | "table" = "manual";
  @state()
  private solved: boolean = false;
  @state()
  private notSolved: boolean = false;
  @state()
  private checking: boolean = false;
  @state()
  private error: boolean = false;

  @state()
  private inputs: string[] = [];
  @state()
  private outputs: string[] = [];

  private inputSequence: number[];
  private outputSequence: number[];
  private dontCareSequence: number[];
  private experiment_url: string = "";

  private sequenceCheckerService = new SequenceCheckerService();

  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
    adoptStyles(this.shadowRoot, [stylesheet]);

    deviceHandler.addService(this.sequenceCheckerService);
    deviceHandler.on("configuration", (configuration) => {
      this.configure(configuration);
    });
    deviceHandler.connect();
    deviceHandler.onStateChange = () => {
      this.requestUpdate();
    };
  }

  async configure(configuration: Record<string, unknown>) {
    const {
      inputs,
      outputs,
      inputSequence,
      outputSequence,
      dontCareSequence,
      interaction,
      experimentUrl,
    } = configuration as {
      inputs?: string[];
      outputs?: string[];
      inputSequence: number[];
      outputSequence: number[];
      dontCareSequence: number[];
      interaction: string;
      experimentUrl: string;
    };
    this.inputSequence = inputSequence;
    this.outputSequence = outputSequence;
    this.dontCareSequence = dontCareSequence;
    this.sequenceCheckerService.input_variables = inputs?.length ?? 8;
    this.sequenceCheckerService.output_variables = outputs?.length ?? 8;
    this.inputs = inputs ?? ["x0", "x1", "x2", "x3", "x4", "x5", "x6", "x7"];
    this.outputs = outputs ?? ["y0", "y1", "y2", "y3", "y4", "y5", "y6", "y7"];
    this.interaction = interaction as any;
    this.experiment_url = experimentUrl;
  }

  async submit() {
    this.checking = true;
    const output = await this.sequenceCheckerService.getSequenceOutput(
      this.inputSequence
    );
    const solved = output.every(
      (v, i) =>
        (v | this.dontCareSequence[i]) ===
        (this.outputSequence[i] | this.dontCareSequence[i])
    );
    if (solved) {
      try {
        await deviceHandler.client.updateExperiment(this.experiment_url, {
          lti_grade: 100,
        });
      } catch (e) {
        console.error(e);
        this.error = true;
        this.checking = false;
        setTimeout(() => (this.error = false), 3000);
      }
      this.solved = true;
    } else {
      this.notSolved = true;
    }
    this.checking = false;
  }

  render() {
    //return html`
    return deviceHandler.dialogWrap(html`
      <div class="h-full flex flex-col items-center justify-center gap-3 p-10">
        ${this.renderInteractions()}
        <button
          @click=${this.submit}
          class="bg-primary text-white rounded-lg p-3"
        >
          Schaltung überprüfen
        </button>
      </div>
      ${this.renderDialogs()}
    `);
  }

  renderInteractions() {
    if (this.interaction === "axis_portal") {
      return html`<axis-portal-animation
        class="w-full flex-grow h-0"
        .serviceInterface=${this.sequenceCheckerService}
      ></axis-portal-animation>`;
    }
    if (this.interaction === "manual") {
      return html`<manual-interaction
        .inputs=${this.inputs}
        .outputs=${this.outputs}
        class="w-full flex-grow h-0"
        .serviceInterface=${this.sequenceCheckerService}
      ></manual-interaction>`;
    }
  }

  renderDialogs() {
    if (this.checking) {
      return html`<div
        class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
      >
        <span class="p-4 rounded bg-white">Überprüfe Schaltung...</span>
      </div>`;
    }
    if (this.solved) {
      return html`<div
        class="absolute top-0 left-0 w-full h-full bg-[#189618] bg-opacity-50 flex items-center justify-center"
      >
        <span class="p-4 rounded bg-white"
          >Aufgabe erfolgreich gelöst. Sie können dieses Fenster nun
          schließen.</span
        >
      </div>`;
    }
    if (this.notSolved) {
      return html`<div
        class="absolute top-0 left-0 w-full h-full bg-[#961818] bg-opacity-50 flex items-center justify-center"
      >
        <span class="p-4 rounded bg-white"
          >Schaltung inkorrekt. Bitte überprüfen Sie Ihrer Lösung und versurchen
          Sie es erneut.</span
        >
        <button
          @click=${() => {
            this.notSolved = false;
          }}
          class="bg-primary text-white rounded-lg p-3"
        >
          Ok
        </button>
      </div>`;
    }
    if (this.error) {
      html`<div
        class="absolute top-0 left-0 w-full h-full bg-[#961818] bg-opacity-50 flex items-center justify-center"
      >
        <span class="p-4 rounded bg-white"
          >Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.</span
        >
      </div>`;
    }
  }
}
