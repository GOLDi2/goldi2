# WIDE

## Build the docker image ##

```
docker build . -t goldi2/wide
```

## Publish the docker image ##

```
docker login -u goldi2
docker build . -t goldi2/wide:latest
docker push goldi2/wide:latest
```