import { LitElement, PropertyValueMap, html, render } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { Router } from '../router';
import { apiClient } from '../globals';
import { Sidebar } from './sidebar';

@customElement('apitool-workspace')
export class Workspace extends LitElement {
    @query('#workspace-container')
    container!: HTMLDivElement;

    @query('apitool-sidebar')
    sidebar!: Sidebar;

    @state()
    isSidebarOpen: boolean = false;

    router: Router;

    constructor() {
        super();

        this.router = new Router({
            '/': () => undefined,
            '/devices': () => {
                render(
                    html`<apitool-device-list-view
                        class="w-full h-full flex justify-center"
                        @update-view=${this.viewUpdatedHandler}
                    ></apitool-device-list-view>`,
                    this.container
                );
            },
            '/devices/': () => {
                window.history.replaceState({}, '', '/devices');
                this.router.resolve(window.location.pathname);
            },
            '/devices/:device_id': async (data) => {
                const device = await apiClient.getDevice(
                    apiClient.url + '/devices/' + data.device_id
                );

                // render(html``, this.container);

                render(
                    html`<apitool-device-editor
                        class="flex justify-center overflow-auto h-full w-full"
                        @update-view=${this.viewUpdatedHandler}
                        .device=${device}
                    ></apitool-device-editor>`,
                    this.container
                );
            },
            '/peerconnections': () => {
                render(
                    html`<apitool-peerconnection-list-view
                        class="w-full h-full flex justify-center overflow-auto"
                        @update-view=${this.viewUpdatedHandler}
                    ></apitool-peerconnection-list-view>`,
                    this.container
                );
            },
            '/peerconnections/': () => {
                window.history.replaceState({}, '', '/peerconnections');
                this.router.resolve(window.location.pathname);
            },
            '/peerconnections/:peerconnection_id': async (data) => {
                const peerconnection = await apiClient.getPeerconnection(
                    apiClient.url + '/peerconnections/' + data.peerconnection_id
                );

                render(
                    html`<apitool-peerconnection-viewer
                        class="flex justify-center overflow-auto h-full w-full"
                        @update-view=${this.viewUpdatedHandler}
                        .peerconnection=${peerconnection}
                    ></apitool-peerconnection-viewer>`,
                    this.container
                );
            },
            '/experiments': () => {
                render(
                    html`<apitool-experiment-list-view
                        @update-view=${this.viewUpdatedHandler}
                        class="flex w-full h-full justify-center overflow-auto"
                    ></apitool-experiment-list-view>`,
                    this.container
                );
            },
            '/experiments/': () => {
                window.history.replaceState({}, '', '/experiments');
                this.router.resolve(window.location.pathname);
            },
            '/experiments/:experiment_id': async (data) => {
                const experiment = await apiClient.getExperiment(
                    apiClient.url + '/experiments/' + data.experiment_id
                );

                render(
                    html`<apitool-experiment-editor
                        @update-view=${this.viewUpdatedHandler}
                        class="w-full h-full flex justify-center overflow-auto"
                        .experiment=${experiment}
                    ></apitool-experiment-editor>`,
                    this.container
                );
            },
            '/templates': () => {
                render(
                    html`<apitool-template-list-view
                        @update-view=${this.viewUpdatedHandler}
                        class="flex w-full h-full justify-center overflow-auto"
                    ></apitool-template-list-view>`,
                    this.container
                );
            },
            '/templates/': () => {
                window.history.replaceState({}, '', '/templates');
                this.router.resolve(window.location.pathname);
            },
            '/templates/:template_id': async (data) => {
                const template = await apiClient.getTemplate(
                    apiClient.url + '/templates/' + data.template_id
                );

                render(
                    html`<apitool-template-editor
                        @update-view=${this.viewUpdatedHandler}
                        class="flex justify-center overflow-auto h-full w-full"
                        .template=${template}
                    ></apitool-template-editor>`,
                    this.container
                );
            },
            '/users': () => {
                render(
                    html`<apitool-user-list-view
                        @update-view=${this.viewUpdatedHandler}
                        class="flex w-full h-full justify-center overflow-auto"
                    ></apitool-user-list-view>`,
                    this.container
                );
            },
            '/users/': () => {
                window.history.replaceState({}, '', '/users');
                this.router.resolve(window.location.pathname);
            },
            '/users/:user_id': async (data) => {
                const user = await apiClient.getUser(
                    apiClient.url + '/users/' + data.user_id
                );

                render(
                    html`<apitool-user-editor
                        @update-view=${this.viewUpdatedHandler}
                        class="flex justify-center overflow-auto h-full w-full"
                        .user=${user}
                    ></apitool-user-editor>`,
                    this.container
                );
            },
            '/user_creation': () => {
                render(
                    html`<apitool-user-creator
                        @update-view=${this.viewUpdatedHandler}
                        class="flex justify-center overflow-auto h-full w-full"
                    ></apitool-user-creator>`,
                    this.container
                );
            },
            '/template_creation': () => {
                render(
                    html`<apitool-template-creator
                        @update-view=${this.viewUpdatedHandler}
                        class="flex justify-center overflow-auto h-full w-full"
                    ></apitool-template-creator>`,
                    this.container
                );
            },
            '/experiment_creation': () => {
                render(
                    html`<apitool-experiment-creator
                        @update-view=${this.viewUpdatedHandler}
                        class="flex justify-center overflow-auto h-full w-full"
                    ></apitool-experiment-creator>`,
                    this.container
                );
            },
            '/device_creation': () => {
                render(
                    html`<apitool-device-creator
                        @update-view=${this.viewUpdatedHandler}
                        class="flex justify-center overflow-auto h-full w-full"
                    ></apitool-device-creator>`,
                    this.container
                );
            },
        });
    }

    connectedCallback(): void {
        super.connectedCallback();
        window.addEventListener('popstate', this.popStateListener);
    }

    disconnectedCallback(): void {
        window.removeEventListener('popstate', this.popStateListener);
        super.disconnectedCallback();
    }

    private popStateListener = () => {
        this.router.resolve(window.location.pathname);
    };

    private viewUpdatedHandler = (event: CustomEvent<string>) => {
        const fullPath = (window.configuration.BASE_PATH ?? '') + event.detail;
        history.pushState({}, '', fullPath);
        this.router.resolve(fullPath);
        this.isSidebarOpen = false;
    };

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected render(): unknown {
        return html` <div class="flex lg:flex-row flex-col w-full h-full">
            <apitool-sidebar
                .isOpen=${this.isSidebarOpen}
                @update-view=${this.viewUpdatedHandler}
                class="lg:overflow-auto w-full lg:w-64 lg:opacity-100 lg:h-full h-[calc(100%_-_4rem)] lg:block lg:relative lg:flex-shrink-0 lg:z-0 ${this
                    .isSidebarOpen
                    ? 'z-10'
                    : '-z-10'} absolute"
                @toggle-open=${this.toggleSidebar}
            ></apitool-sidebar>
            <div
                id="workspace-container"
                class="w-full h-full overflow-x-hidden"
            ></div>
        </div>`;
    }

    protected firstUpdated(
        _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
    ): void {
        this.router.resolve(window.location.pathname);
    }

    public toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }
}
