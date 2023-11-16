import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { apiClient } from './globals.ts';
import { AuthenticationServiceTypes } from '@cross-lab-project/api-client';
import { Workspace } from './components/workspace.ts';
export * from './components/index.ts';

@customElement('crosslab-api-application')
export class Application extends LitElement {
    user?: AuthenticationServiceTypes.User<'response'>;

    @query('apitool-workspace')
    workspace!: Workspace;

    @state()
    isReady: boolean = false;

    @state()
    authenticated: boolean = false;

    constructor() {
        super();
        const url = localStorage.getItem('url');
        const token = localStorage.getItem('token');
        if (url && token) {
            apiClient.url = url;
            apiClient.accessToken = token;
            apiClient
                .getIdentity()
                .then((userData) => {
                    this.user = userData;
                    this.isReady = true;
                    this.authenticated = true;
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    this.isReady = true;
                });
        } else {
            this.isReady = true;
        }
    }

    protected createRenderRoot() {
        return this;
    }

    protected render(): unknown {
        return html`
            ${this.authenticated
                ? html`<div
                      class="w-full h-full flex flex-col relative pb-[env(safe-area-inset-bottom,_0px)]"
                  >
                      <apitool-header
                          @toggle-sidebar=${() =>
                              this.workspace.toggleSidebar()}
                          @logout=${this.handleLogout}
                          .user=${this.user}
                      ></apitool-header>
                      <apitool-workspace
                          class="flex-grow overflow-auto"
                      ></apitool-workspace>
                      <apitool-footer
                          class="lg:sticky lg:block hidden"
                      ></apitool-footer>
                  </div>`
                : html`<login-panel
                      .url=${localStorage.getItem('url') ?? ''}
                      @login=${this.handleLogin}
                      class="pt-[env(safe-area-inset-top,_0px)] pb-[env(safe-area-inset-bottom,_0px)] flex h-full w-full justify-center items-center bg-slate-600 ${!this
                          .isReady
                          ? 'hidden'
                          : ''}"
                  ></login-panel>`}
        `;
    }

    private handleLogin(
        event: CustomEvent<{
            token: string;
            url: string;
            user: AuthenticationServiceTypes.User<'response'>;
        }>
    ) {
        this.user = event.detail.user;
        localStorage.setItem('url', event.detail.url);
        localStorage.setItem('token', event.detail.token);
        this.authenticated = true;
    }

    private handleLogout() {
        localStorage.removeItem('url');
        localStorage.removeItem('token');
        this.authenticated = false;
    }
}
