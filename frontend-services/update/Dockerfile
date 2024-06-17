# Build Image
FROM node:20.14.0-bookworm

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential meson libtool libdbus-1-dev libglib2.0-dev libcurl3-dev libssl-dev libnl-genl-3-dev libjson-glib-dev
RUN git clone https://github.com/rauc/rauc
RUN cd rauc && meson setup build && meson compile -C build && cd build && meson install

WORKDIR /tmp
COPY .packages /tmp/packages
RUN npm install --global /tmp/packages/*
RUN rm -rf /tmp/packages

RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y dumb-init
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y rauc
WORKDIR /app
RUN mkdir db
RUN chown node:node /app/*
USER node

ENV NODE_ENV production
ENV PORT 8080
ENV DB_TYPE sqlite
ENV DB_DATABASE db/update.db
EXPOSE 8080/tcp
USER node
CMD ["dumb-init", "update-server"]