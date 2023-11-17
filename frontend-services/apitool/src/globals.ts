import { APIClient } from '@cross-lab-project/api-client';

export const apiClient = new APIClient('');

type Configuration = {
    BASE_PATH?: string;
};

declare global {
    interface Window {
        configuration: Configuration;
    }
}

window.configuration ??= {
    BASE_PATH: '/',
};

const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register(
                window.configuration.BASE_PATH + '/service-worker.js',
                {
                    scope: window.configuration.BASE_PATH ?? '/',
                }
            );
            if (registration.installing) {
                console.log('Service worker installing');
            } else if (registration.waiting) {
                console.log('Service worker installed');
            } else if (registration.active) {
                console.log('Service worker active');
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};

registerServiceWorker();
