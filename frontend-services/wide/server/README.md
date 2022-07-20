# WIDE SERVER

## Build the docker image ##

```
docker build . -t goldi2/wide-server
```

## Publish the docker image ##

```
docker login -u goldi2
docker build . -t goldi2/wide-server:latest
docker push goldi2/wide-server:latest
```