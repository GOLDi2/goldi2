# Production image
FROM node:latest
RUN apt-get update
RUN apt-get install -y gcc-avr avr-libc
RUN apt-get install -y dumb-init
EXPOSE 8080/tcp
COPY --chown=node:node . /app/
RUN chown node:node /app/
RUN mkdir -p /app/makefiles/arduino-cli/ && mv /app/arduino/arduino-cli-template.yaml /app/makefiles/arduino-cli/arduino-cli-template.yaml
RUN mkdir -p /app/makefiles/arduino-cli/ && mv /app/arduino/goldi /app/makefiles/arduino-cli/
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/app/makefiles/arduino-cli/ sh
RUN chown -R node:node /app/
USER node
RUN mkdir -p /app/toolchains
RUN ln -s $(which make) /app/toolchains/make

WORKDIR /app
RUN npm ci --production
CMD ["dumb-init", "node", "/app/bin/www"]