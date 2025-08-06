FROM node:lts-alpine

RUN apk add dumb-init curl libc6-compat
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

WORKDIR /tmp
COPY .packages /tmp/packages
RUN npm install --global /tmp/packages/*
RUN rm -rf /tmp/packages

WORKDIR /app
RUN mkdir db
RUN chown node:node /app/*

USER node
RUN arduino-cli core install arduino:avr

ENV NODE_ENV=production
CMD ["dumb-init", "arduino-cli-compilation-service"]