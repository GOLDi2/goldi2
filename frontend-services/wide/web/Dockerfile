# Build Image
FROM node:latest AS build
WORKDIR /app
COPY . /app/
RUN yarn install --frozen-lockfile
# we need to sleep because copyfiles is async
RUN yarn run setup-all && sleep 5

# Production image
FROM nginx
COPY --from=build /app/dist/WIDE /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/