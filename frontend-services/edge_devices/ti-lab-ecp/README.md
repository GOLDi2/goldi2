## Build the docker image

```
docker build . -t goldi2/ecp
```

## Publish the docker image

```
docker login -u goldi2
docker build . -t goldi2/ecp:latest
docker push goldi2/ecp:latest
```
