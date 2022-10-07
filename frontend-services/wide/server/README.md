# WIDE SERVER

To run:

```
docker run -e BACKEND_PATH=http://localhost:8080 -p 8080:8080 goldi2/wide-server
```

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