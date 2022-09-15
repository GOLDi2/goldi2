## Build the docker image ##

```
docker build . -t goldi2/esp
```

## Publish the docker image ##

```
docker login -u goldi2
docker build . -t goldi2/esp:latest
docker push goldi2/esp:latest
```