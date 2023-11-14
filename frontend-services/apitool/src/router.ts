import Route from 'route-parser';

export class Router {
    private routes: {
        pattern: Route;
        handler: (data: { [k: string]: string }) => void | Promise<void>;
    }[];

    constructor(routes: {
        [k: string]: (data: { [k: string]: string }) => void | Promise<void>;
    }) {
        this.routes = [];
        for (const key in routes) {
            this.routes.push({
                pattern: new Route(key),
                handler: routes[key],
            });
        }
    }

    public async resolve(path: string) {
        for (const route of this.routes) {
            const data = route.pattern.match(path);

            if (!data) continue;

            return route.handler(data);
        }

        console.error('unknown route:', path);
    }
}
