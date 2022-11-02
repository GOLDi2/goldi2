# SANE

## How to install

### Prerequisites
* npm
* tsc
* polymer

### Instructions
* npm run build-production


## Build the docker image ##

```
docker build . -t goldi2/sane
```

## Publish the docker image ##

```
docker login -u goldi2
docker build . -t goldi2/sane:latest
docker push goldi2/sane:latest
```