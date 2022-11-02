# This is the GIFT tool #

I do not know where the original source is, so this was just copied from the website.

## Build the docker image ##

```
docker build . -t goldi2/gift
```

## Publish the docker image ##

```
docker login -u goldi2
docker build . -t goldi2/gift:latest
docker push goldi2/gift:latest
```