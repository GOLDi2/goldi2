# Build Image
FROM node:lts-alpine
WORKDIR /tmp
COPY .packages /tmp/packages
RUN npm install --global /tmp/packages/*
RUN rm -rf /tmp/packages
 
RUN apk add dumb-init
ENV NODE_ENV production
ENV GOLDI_FRONTEND_PORT 8080
ENV PORT 8080
EXPOSE 8080/tcp
USER node
CMD ["dumb-init", "frontend"]