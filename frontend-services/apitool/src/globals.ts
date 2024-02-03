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

window.configuration ??= {};
