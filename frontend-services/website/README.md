# This is the GOLDi 2 Web Frontend
## Getting started
The easiest way to get a running frontend is by using docker.
### Running the container
> **NOTE:** If you are on a Linux system, you might need to add `sudo` before the command or add your user to the `docker` group.
```
docker run \
    -d \
    -p 80:8080 \
    goldi2/web-frontend
```
#### Parameters explanation:
- `-d`: start the container in detached mode
- `-p 80:8080`: Expose the internal port 8080 (running the frontend) to port 80 on the host
## Development
### Prerequisites
You will need to have [nodejs](https://nodejs.org/) installed.
We also recommand to use yarn instead of npm: `npm install -g yarn`
### Dependencies
To install all dependencies simple run:
```
yarn
```
### Development
To Start development run the development task:
```
yarn run start:dev
```
### How to keep NPM and Yarn lock files in sync
Make sure that the package-lock.json is the single point of truth. Whenever the lock files needs to change, delete yarn.lock, change the package-lock.json and run `yarn import` to recreate the yarn.lock

## Publish the docker image ##

```
npm run build
docker push goldi2/web-frontend:latest
```