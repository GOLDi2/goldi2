import { AuthenticationServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { renderLoadingScreen } from '../helper';
import { apiClient } from '../../../globals';
import { UserFilterOptions } from './user-list-view-filter';

@customElement('apitool-user-list-view')
export class UserListView extends LitElement {
    @state()
    isReady: boolean = false;

    @state()
    users: AuthenticationServiceTypes.User<'response'>[] = [];

    @state()
    filteredUsers: AuthenticationServiceTypes.User<'response'>[] = [];

    constructor() {
        super();

        this.initialize()
            .catch((error) => console.error(error))
            .finally(() => {
                this.isReady = true;
            });
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    private async initialize() {
        this.users = await apiClient.listUsers();
        this.filteredUsers = this.users;
    }

    protected render(): unknown {
        return html`${renderLoadingScreen(this.isReady)}
            <div
                class="w-full flex flex-col items-center ${!this.isReady
                    ? 'hidden'
                    : ''}"
            >
                <div
                    class="p-4 w-[60rem] max-w-full relative flex flex-col gap-2 flex-grow"
                >
                    <apitool-user-list-view-filter
                        @filters-updated=${(
                            event: CustomEvent<UserFilterOptions>
                        ) => this.filter(event.detail)}
                    ></apitool-user-list-view-filter>
                    ${this.filteredUsers.map(
                        (user) =>
                            html`<apitool-user-list-view-item
                                .user=${user}
                            ></apitool-user-list-view-item>`
                    )}
                </div>
                <div
                    class="flex w-full justify-center p-2 sticky bottom-0 left-0 bg-white border-t border-black"
                >
                    <button
                        class="bg-green-300 p-2 rounded-full"
                        @click=${() => this.createUser()}
                    >
                        + Add User
                    </button>
                </div>
            </div>`;
    }

    private filter(filterOptions: UserFilterOptions) {
        this.filteredUsers = this.users.filter((user) => {
            if (
                user.url
                    .toLowerCase()
                    .includes(filterOptions.url.toLowerCase()) &&
                user.id
                    .toLowerCase()
                    .includes(filterOptions.id.toLowerCase()) &&
                user.username
                    .toLowerCase()
                    .includes(filterOptions.username.toLowerCase())
            )
                return true;
            else return false;
        });
    }

    private createUser() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/user_creation',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
