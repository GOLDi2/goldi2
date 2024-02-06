import {
    AuthenticationServiceTypes,
    Require,
    UnsuccessfulRequestError,
} from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { apiClient } from '../../../globals';
import { renderLoadingScreen } from '../helper';

@customElement('apitool-user-list-item')
export class UserListItem extends LitElement {
    @property({ type: Object })
    user!:
        | Require<AuthenticationServiceTypes.User<'response'>, 'url'>
        | { url: string };

    @property({ type: Object })
    parent!: LitElement;

    @property({ type: Boolean })
    shouldOpen: boolean = false;

    @property({ type: Boolean })
    removeable: boolean = true;

    @state()
    resolvedUser?:
        | AuthenticationServiceTypes.User<'response'>
        | { error: string };

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        if (!this.resolvedUser)
            return html`<apitool-collapsable-element
                .title=${this.user.url}
                .parent=${this.parent}
                .isOpen=${this.shouldOpen}
                class="rounded-lg flex flex-col bg-white border p-2"
            >
                <div class="rounded-lg overflow-hidden">
                    ${renderLoadingScreen(false)}
                </div>
                ${this.renderButtons()}
            </apitool-collapsable-element>`;
        else
            return html`<apitool-collapsable-element
                .title=${typeof this.resolvedUser.error === 'string'
                    ? this.resolvedUser.error
                    : AuthenticationServiceTypes.isUser(
                          this.resolvedUser,
                          'response'
                      )
                    ? this.resolvedUser.username ?? 'NO_USERNAME'
                    : this.resolvedUser.error}
                .parent=${this.parent}
                .isOpen=${this.shouldOpen}
                class="flex flex-col bg-white rounded-lg p-2 border"
            >
                <div class="w-full flex">
                    <p class="w-28 flex-shrink-0">URL:</p>
                    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                        ${this.user.url}
                    </p>
                </div>
                ${AuthenticationServiceTypes.isUser(
                    this.resolvedUser,
                    'response'
                ) && !this.resolvedUser.error
                    ? html`<div class="w-full flex">
                              <p class="w-28 flex-shrink-0">Username:</p>
                              <p>${this.resolvedUser.username}</p>
                          </div>
                          <div class="w-full flex">
                              <p class="w-28 flex-shrink-0">Id:</p>
                              <p
                                  class="whitespace-nowrap overflow-hidden text-ellipsis"
                              >
                                  ${this.resolvedUser.id}
                              </p>
                          </div>
                          <div class="w-full flex">
                              <p class="w-28 flex-shrink-0">Is Admin:</p>
                              <p>${this.resolvedUser.admin}</p>
                          </div>`
                    : ''}
                ${this.renderButtons()}
            </apitool-collapsable-element>`;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.resolveUser();
    }

    private async resolveUser() {
        try {
            this.resolvedUser = await apiClient.getUser(this.user.url);
        } catch (error) {
            if (error instanceof UnsuccessfulRequestError) {
                switch (error.response.status) {
                    case 404:
                        this.resolvedUser = { error: 'Not Found' };
                        break;
                    default:
                        this.resolvedUser = { error: 'Unresolvable' };
                }
            } else {
                this.resolvedUser = { error: 'Unresolvable' };
            }
        }
        this.requestUpdate();
    }

    private renderButtons() {
        return html` <div class="flex gap-2 mt-2">
            <a
                href=${(window.configuration.BASE_PATH ?? '') +
                '/users/' +
                this.user.url.split('/').at(-1)}
                target="_blank"
                class="text-center p-2 w-full rounded-lg bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-gray-50"
            >
                View
            </a>
            ${this.removeable
                ? html`<button
                      class="p-2 w-full rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-gray-50"
                      @click=${() => this.removeUser()}
                  >
                      Remove
                  </button>`
                : ''}
        </div>`;
    }

    private removeUser() {
        const removeDeviceEvent = new CustomEvent('remove-user');
        this.dispatchEvent(removeDeviceEvent);
    }
}
