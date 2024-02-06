import { LitElement, adoptStyles, html, unsafeCSS } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';
import {
    renderSmallLoadingScreen,
    updateWithScrollCompensation,
} from '../helper';
import {
    AuthenticationServiceTypes,
    Require,
} from '@cross-lab-project/api-client';
import { apiClient } from '../../../globals';
import style from '../../../stylesheet.css';
const stylesheet = unsafeCSS(style);

@customElement('apitool-user-list')
export class UserList extends LitElement {
    @property({ type: Array })
    users: (
        | Require<AuthenticationServiceTypes.User<'response'>, 'url'>
        | { url: string }
    )[] = [];

    @property({ type: String })
    title: string = 'Users';

    @property({ type: Object })
    parent!: LitElement;

    @property({ type: Boolean })
    editable: boolean = true;

    @query('#input-new-user-url')
    inputNewUserUrl!: HTMLInputElement;

    @state()
    addingUser: boolean = false;

    @state()
    userItems: {
        url: string;
        key: string;
        resolved?: Require<AuthenticationServiceTypes.User<'response'>, 'url'>;
        shouldOpen: boolean;
    }[] = [];

    protected render(): unknown {
        return html`<apitool-collapsable-element
            .title=${this.title}
            class="w-full flex flex-col bg-white p-2 rounded-lg border"
        >
            <div class="flex flex-col gap-2 rounded-lg">
                ${when(
                    this.editable,
                    () => html`<div
                        class="flex flex-col bg-white border gap-2 rounded-lg p-2"
                    >
                        <input
                            id="input-new-user-url"
                            type="text"
                            class="w-full border p-2 rounded-lg"
                            placeholder="User URL"
                            @input=${() => this.handleInput()}
                        />

                        <div class="flex gap-2 rounded-lg relative">
                            <button
                                class="w-full bg-green-600 text-gray-50 p-2 rounded-lg hover:bg-green-700 active:bg-green-800"
                                @click=${() => this.addUser()}
                            >
                                Add User
                            </button>
                            <div
                                class="w-full h-full absolute opacity-50 ${this
                                    .addingUser
                                    ? 'z-10'
                                    : '-z-10'}"
                            >
                                ${this.addingUser
                                    ? renderSmallLoadingScreen(false)
                                    : ''}
                            </div>
                        </div>
                    </div>`
                )}
                ${repeat(
                    this.userItems,
                    (item) => item.key,
                    (item, index) => html`<apitool-user-list-item
                        .user=${item.resolved
                            ? { ...item.resolved, url: item.url }
                            : item}
                        .shouldOpen=${item.shouldOpen}
                        .removeable=${this.editable}
                        @remove-user=${() => this.deleteUser(index)}
                    ></apitool-user-list-item>`
                )}
            </div>
        </apitool-collapsable-element>`;
    }

    connectedCallback(): void {
        super.connectedCallback();
        if (this.shadowRoot) adoptStyles(this.shadowRoot, [stylesheet]);
        this.userItems = this.users.map((user) => {
            return {
                url: user.url!,
                key: crypto.randomUUID(),
                shouldOpen: false,
            };
        });
        this.userItems.forEach(async (userItem) => {
            const resolvedUser = await apiClient.getDevice(
                userItem.url.replace('users', 'devices')
            );
            userItem.resolved = resolvedUser;
            this.requestUpdate();
        });
    }

    private async handleInput() {
        this.inputNewUserUrl.style.borderColor = '';
        this.inputNewUserUrl.value = this.inputNewUserUrl.value.replace(
            / /g,
            ''
        );
    }

    private async addUser() {
        this.addingUser = true;

        const user: (typeof this.userItems)[number] = {
            url: this.inputNewUserUrl.value,
            key: crypto.randomUUID(),
            shouldOpen: true,
        };
        this.userItems = [user, ...this.userItems];

        try {
            const resolvedUser = await apiClient.getUser(user.url);
            this.users = [{ url: user.url }, ...this.users];
            user.resolved = resolvedUser;
            this.inputNewUserUrl.value = '';
            this.updateUser();
            this.requestUpdate();
        } catch (error) {
            this.inputNewUserUrl.style.borderColor = 'red';
            this.userItems = this.userItems.slice(1);
        } finally {
            this.addingUser = false;
        }
    }

    private async deleteUser(index: number) {
        this.users.splice(index, 1);
        this.userItems.splice(index, 1);
        this.updateUser();
        await updateWithScrollCompensation(this, this.parent);
    }

    private updateUser() {
        const updateDevicesEvent = new CustomEvent<
            (
                | Require<AuthenticationServiceTypes.User<'response'>, 'url'>
                | { url: string }
            )[]
        >('update-users', {
            detail: this.users,
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(updateDevicesEvent);
    }
}
