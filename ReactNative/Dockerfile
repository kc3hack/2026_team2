FROM node:24-slim

WORKDIR /ReactNative

COPY . .

RUN rm -rf node_modules

RUN apt update && apt install -y bash

RUN yarn global add expo

RUN yarn install

RUN chown -R node:node /ReactNative

USER node

RUN yarn install

# CMD ["npx", "expo", "start", "--non-interactive"]
