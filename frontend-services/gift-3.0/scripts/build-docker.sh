# build docker image
docker build -t goldi2/gift3:latest .

# Save the container to a tar file
mkdir -p dist
docker save goldi2/gift3:latest > ./dist/docker-image.tar