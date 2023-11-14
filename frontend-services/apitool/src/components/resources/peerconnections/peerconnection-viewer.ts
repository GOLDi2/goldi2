import { DeviceServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { apiClient } from '../../../globals';
import { Editor } from '../common';

@customElement('apitool-peerconnection-viewer')
export class PeerconnectionViewer extends LitElement {
    @property({ type: Object })
    peerconnection!: DeviceServiceTypes.Peerconnection<'response'>;

    @query('apitool-editor')
    editor!: Editor;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-editor
            .type=${'viewer'}
            @delete-resource=${this.deletePeerconnection}
            @cancel=${this.cancel}
        >
            <div class="flex">
                <p class="w-16 flex-shrink-0">URL:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.peerconnection.url}
                </p>
            </div>
            <div class="flex">
                <p class="w-16 flex-shrink-0">Type:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.peerconnection.type}
                </p>
            </div>
            <div class="flex">
                <p class="w-16 flex-shrink-0">Status:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.peerconnection.status}
                </p>
            </div>
            ${map(this.peerconnection.devices, this.renderDevice.bind(this))}
        </apitool-editor>`;
    }

    private renderDevice(
        device: DeviceServiceTypes.ConfiguredDeviceReference,
        index: number
    ) {
        return html` <apitool-device-list-item
            .device=${device}
            .config=${device.config}
            .removeable=${false}
            .titlePrefix=${'Device ' + (index === 0 ? 'A' : 'B') + ' : '}
            class="mt-2"
        ></apitool-device-list-item>`;
    }

    private async deletePeerconnection() {
        console.log(
            'trying to delete peerconnection:',
            this.peerconnection.url
        );
        try {
            await apiClient.deletePeerconnection(this.peerconnection.url);

            history.pushState({}, '', '/peerconnections');

            const event = new CustomEvent<string>('update-view', {
                detail: '/peerconnections',
                bubbles: true,
            });

            this.dispatchEvent(event);

            this.editor.messageField.addMessage(
                'success',
                'Peerconnection deleted successfully!'
            );
            console.log('template deleted successfully');
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4)
            );
        }
    }

    private cancel() {
        history.pushState({}, '', '/peerconnections');

        const event = new CustomEvent<string>('update-view', {
            detail: '/peerconnections',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
