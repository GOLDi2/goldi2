import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("binary-input")
export class AxisPortal extends LitElement {
  @property()
  public name: string;

  @property({ type: Boolean })
  public checked: boolean;

  @property({ type: Boolean })
  public disabled: boolean;

  static styles = css``;

  render() {
    console.log(this.checked);
    console.log(this.disabled);
    const split_name = this.name.split("_");
    const label_name = split_name[0];
    const label_sub = split_name[1];
    return html`<label class="label">
      <input
        class="checkbox"
        type="checkbox"
        ?checked=${this.checked}
        ?disabled=${this.disabled}
        @change=${(event: InputEvent) =>
          this.dispatchEvent(
            new CustomEvent("binary-input", {
              detail: {
                value: (event.target as HTMLInputElement).checked,
              },
            })
          )}
      />
      ${label_name}${label_sub && html`<sub>${label_sub}</sub>`}
    </label>`;
  }
}
