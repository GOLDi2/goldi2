import { AuthenticationServiceTypes } from '@cross-lab-project/api-client';
import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { apiClient } from '../../../globals';
import { Editor } from '../common';

@customElement('apitool-user-creator')
export class UserCreator extends LitElement {
    @state()
    user: AuthenticationServiceTypes.User<'request'> = {
        username: '',
        password: '',
    };

    @query('#input-username')
    inputUsername!: HTMLInputElement;

    @query('#input-password')
    inputPassword!: HTMLInputElement;

    @query('apitool-editor')
    editor!: Editor;

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html`<apitool-editor
            .type=${'creator'}
            @create-resource=${this.createUser}
            @cancel=${this.cancel}
        >
            <div class="flex flex-col">
                <p>Username:</p>
                <input
                    id="input-username"
                    class="w-full p-2 resize-none border rounded-lg"
                    type="text"
                    autocomplete="new-password"
                    @input=${() => {
                        this.user.username = this.inputUsername.value;
                        this.editor.messageField.removeAllSuccessMessages();
                    }}
                />
            </div>
            <div class="flex flex-col">
                <p>Password:</p>
                <input
                    id="input-password"
                    type="password"
                    autocomplete="new-password"
                    class="w-full p-2 resize-none border rounded-lg"
                    @input=${() => {
                        this.user.password = this.inputPassword.value;
                        this.editor.messageField.removeAllSuccessMessages();
                    }}
                />
            </div>
        </apitool-editor>`;
    }

    private async createUser() {
        console.log('trying to create user:', this.user);
        try {
            const createdUser = await apiClient.createUser(this.user);

            const newUrl = '/users/' + createdUser.url.split('/').at(-1);

            const event = new CustomEvent<string>('update-view', {
                detail: newUrl,
                bubbles: true,
            });

            this.dispatchEvent(event);

            this.editor.messageField.addMessage(
                'success',
                'User created successfully!'
            );
            console.log('user created successfully:', createdUser);
        } catch (error) {
            this.editor.messageField.addMessage(
                'error',
                JSON.stringify(error, null, 4)
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
