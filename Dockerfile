FROM circleci/node:12-browsers

WORKDIR /hiretend-portal

USER root

COPY ./package.json ./

RUN yarn

COPY ./ ./

CMD [ "npm", "run", "build" ]