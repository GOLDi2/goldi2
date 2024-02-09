import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { apiClient } from '../globals.ts';
import { AuthenticationServiceTypes } from '@cross-lab-project/api-client';

@customElement('login-panel')
export class LoginPanel extends LitElement {
    @property({ type: String })
    url: string = '';

    @query('#input-instance-url')
    inputInstanceUrl!: HTMLInputElement;

    @query('#input-username')
    inputUsername!: HTMLInputElement;

    @query('#input-password')
    inputPassword!: HTMLInputElement;

    protected createRenderRoot() {
        return this;
    }

    protected render(): unknown {
        return html`<form
            class="flex flex-col bg-slate-950 p-4 rounded-xl"
            autocomplete="on"
        >
            <label for="input-instance-url" class="text-white"
                >CrossLab Instance URL</label
            >
            <input
                id="input-instance-url"
                type="text"
                class="border rounded-lg p-1 mb-2 bg-slate-200"
                value=${this.url}
            />
            <label for="input-username" class="text-white">Username</label>
            <input
                id="input-username"
                type="text"
                class="border rounded-lg p-1 mb-2 bg-slate-200"
            />
            <label for="input-password" class="text-white">Password</label>
            <input
                id="input-password"
                type="password"
                class="border rounded-lg p-1 mb-4 bg-slate-200"
            />
            <button
                type="submit"
                @click=${this.login}
                class="p-1 bg-slate-700 rounded-lg hover:bg-slate-600 active:bg-slate-500 text-white"
            >
                Login
            </button>
        </form>`;
    }

    private async login(submitEvent: SubmitEvent) {
        submitEvent.preventDefault();
        const instanceUrl = this.inputInstanceUrl.value;
        const username = this.inputUsername.value;
        const password = this.inputPassword.value;

        apiClient.url = instanceUrl;
        await apiClient.login(username, password);

        const event = new CustomEvent<{
            token: string;
            url: string;
            user: AuthenticationServiceTypes.User<'response'>;
        }>('login', {
            detail: {
                token: apiClient.accessToken,
                url: instanceUrl,
                user: await apiClient.getIdentity(),
            },
        });
        this.dispatchEvent(event);
    }
}
