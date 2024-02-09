import {
    AuthenticationServiceTypes,
    Require,
} from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { apiClient } from '../../../globals';
import { Editor } from '../common';

@customElement('apitool-user-editor')
export class UserEditor extends LitElement {
    @property({ type: Object })
    user!: Require<AuthenticationServiceTypes.User<'response'>, 'url'>;

    @query('apitool-editor')
    editor!: Editor;

    changes: AuthenticationServiceTypes.User<'request'> = {};

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-editor
            .type=${'editor'}
            @update-resource=${this.updateUser}
            @delete-resource=${this.deleteUser}
            @cancel=${this.cancel}
        >
            <div class="flex">
                <p class="w-24 flex-shrink-0">URL:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.user.url}
                </p>
            </div>
            <div class="flex">
                <p class="w-24 flex-shrink-0">Id:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.user.id}
                </p>
            </div>
            <div class="flex">
                <p class="w-24 flex-shrink-0">Username:</p>
                <p class="whitespace-nowrap overflow-hidden text-ellipsis">
                    ${this.user.username}
                </p>
            </div>
            <div class="flex flex-col">
                <p>Password:</p>
                <input
                    id="input-password"
                    type="password"
                    autocomplete="new-password"
                    class="w-full p-2 resize-none border rounded-lg"
                    @input=${(e: any) => {
                        this.user.password = this.changes.password =
                            e.target.value;
                        this.editor.messageField.removeAllSuccessMessages();
                    }}
                />
            </div>
            <div class="flex items-center">
                <p class="w-28">Is Admin:</p>
                <input
                    id="input-is-admin"
                    type="checkbox"
                    ?checked=${this.user.admin}
                    @change=${(e: any) => {
                        this.user.admin = this.changes.admin = e.target.checked;
                    }}
                />
            </div>
        </div>
        </apitool-editor>`;
    }

    private async updateUser() {
        console.log('trying to update user:', this.user);
        try {
            const updatedUser = await apiClient.updateUser(
                this.user.url,
                this.changes
            );

            this.editor.messageField.addMessage(
                'success',
                'User updated successfully!'
            );

            this.user = updatedUser;
            console.log('user updated successfully:', updatedUser);
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4),
                'update-error'
            );
        }
    }

    private async deleteUser() {
        console.log('trying to delete user:', this.user.url);
        try {
            await apiClient.deleteUser(this.user.url);

            const event = new CustomEvent<string>('update-view', {
                detail: '/users',
                bubbles: true,
            });

            this.dispatchEvent(event);

            this.editor.messageField.addMessage(
                'success',
                'User deleted successfully!'
            );
            console.log('user deleted successfully');
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4),
                'delete-error'
            );
        }
    }

    private cancel() {
        const event = new CustomEvent<string>('update-view', {
            detail: '/users',
            bubbles: true,
        });

        this.dispatchEvent(event);
    }
}
