# Production image
FROM node:latest
RUN apt-get update
RUN apt-get install -y gcc-avr
RUN apt-get install -y dumb-init
EXPOSE 8080/tcp
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/bin sh
COPY --chown=node:node . /app/
RUN chown node:node /app/
USER node
RUN mkdir /app/toolchains
RUN ln -s $(which make) /app/toolchains/make

WORKDIR /app
RUN npm ci --production
CMD ["dumb-init", "node", "/app/bin/www"]