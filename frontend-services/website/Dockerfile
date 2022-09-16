# Build Image
FROM node:latest AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc /app/
#RUN --mount=type=secret,mode=0644,id=npmrc,target=/usr/src/app/.npmrc npm ci --only=production
RUN npm ci --only=production
 
# Production Image
FROM node:lts-alpine
RUN apk add dumb-init
ENV NODE_ENV production
ENV GOLDI_FRONTEND_PORT 8080
EXPOSE 8080/tcp
USER node
WORKDIR /app
COPY --chown=node:node --from=build /app/node_modules /app/node_modules
COPY --chown=node:node ./dist /app/dist
CMD ["dumb-init", "node", "dist/index.js"]