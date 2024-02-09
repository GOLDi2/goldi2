import { ExperimentServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

@customElement('apitool-participant-list')
export class ParticipantList extends LitElement {
    @property({ type: Array })
    participants: ExperimentServiceTypes.Participant[] = [];

    @property({ type: Object })
    parent!: LitElement;

    @state()
    participantItems: {
        value: ExperimentServiceTypes.Participant;
        key: string;
        shouldOpen: boolean;
    }[] = [];

    @property({ type: Array })
    possibleRoles!: ExperimentServiceTypes.Role[];

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.participantItems = this.participants.map((participant) => {
            return {
                value: participant,
                key: crypto.randomUUID(),
                shouldOpen: false,
            };
        });
    }

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${'Participants'}
            .parent=${this.parent}
            class="flex p-2 bg-white border rounded-lg"
            ><div class="flex flex-col gap-2 items-center">
                ${repeat(
                    this.participantItems,
                    (item) => item.key,
                    (item, index) =>
                        html`<apitool-participant-list-item
                            .participant=${item.value}
                            .parent=${this.parent}
                            .shouldOpen=${item.shouldOpen}
                            .possibleRoles=${this.possibleRoles}
                            class="w-full"
                            @delete-participant=${() =>
                                this.deleteParticipant(index)}
                            @update-participant=${this.updateParticipant(index)}
                        ></apitool-participant-list-item>`
                )}
                <button
                    @click=${this.addParticipant}
                    class="text-2xl bg-slate-600 text-gray-50 p-2 rounded-full hover:bg-slate-700 active:bg-slate-800 h-12 w-12"
                >
                    +
                </button>
            </div></apitool-collapsable-element
        >`;
    }

    private addParticipant() {
        this.participants.push({
            serviceId: '',
            role: '',
            config: {},
        });
        this.participantItems.push({
            value: {
                serviceId: '',
                role: '',
                config: {},
            },
            key: crypto.randomUUID(),
            shouldOpen: true,
        });
        const updateParticipantsEvent = new CustomEvent<
            ExperimentServiceTypes.Participant[]
        >('update-participants', {
            detail: this.participants,
        });
        this.dispatchEvent(updateParticipantsEvent);
    }

    private updateParticipant(index: number) {
        return (event: CustomEvent<ExperimentServiceTypes.Participant>) => {
            this.participants[index] = event.detail;
            this.participantItems[index].value = event.detail;
            const updateParticipantsEvent = new CustomEvent<
                ExperimentServiceTypes.Participant[]
            >('update-participants', {
                detail: this.participants,
            });
            this.dispatchEvent(updateParticipantsEvent);
        };
    }

    private deleteParticipant(index: number) {
        this.participants.splice(index, 1);
        this.participantItems.splice(index, 1);
        const updateParticipantsEvent = new CustomEvent<
            ExperimentServiceTypes.Participant[]
        >('update-participants', {
            detail: this.participants,
        });
        this.dispatchEvent(updateParticipantsEvent);
    }
}
