FROM node:lts

ARG TARGETARCH

RUN apt update && apt install -y curl clangd-14 dumb-init

RUN wget https://go.dev/dl/go1.23.2.linux-${TARGETARCH}.tar.gz
RUN rm -rf /usr/local/go && tar -C /usr/local -xzf go1.23.2.linux-${TARGETARCH}.tar.gz
ENV PATH="$PATH:/usr/local/go/bin"
RUN update-alternatives --install /usr/local/bin/clangd clangd /usr/bin/clangd-14 100
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/local/bin sh
RUN arduino-cli core install arduino:avr
RUN go install github.com/arduino/arduino-language-server@latest
RUN cp  ~/go/bin/arduino-language-server /usr/local/bin/arduino-language-server
RUN arduino-cli config init

WORKDIR /tmp
COPY .packages /tmp/packages
RUN npm install --global /tmp/packages/*
RUN rm -rf /tmp/packages

WORKDIR /app
RUN mkdir db
RUN chown node:node /app/*

ENV NODE_ENV=production
CMD ["dumb-init", "arduino-language-server-service"]