# WIDE

To run:

```
docker run -e BACKEND_PATH=http://localhost:8080 -p 8081:80 goldi2/wide
```

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