# Build Image
FROM node:latest AS build
WORKDIR /app
COPY . /app/
RUN npm ci
RUN npm run build:pro
RUN rm /app/build/es6-unbundled/.htaccess

# Production image
FROM nginx
COPY --from=build /app/build/es6-unbundled /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/

ENV BASE_PATH=/SANE/