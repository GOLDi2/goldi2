# Build Image
FROM node:lts-alpine AS build

RUN apk add dumb-init curl libc6-compat
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
RUN arduino-cli core install arduino:avr

WORKDIR /tmp
COPY .packages /tmp/packages
RUN npm install --global /tmp/packages/*
RUN rm -rf /tmp/packages

WORKDIR /app
RUN mkdir db
RUN chown node:node /app/*
USER node

ENV NODE_ENV=production
ENV PORT=3021
EXPOSE 3021/tcp
CMD ["dumb-init", "arduino-cli-compilation-service"]