FROM node:19-alpine

ENV APP_DIR=/app

COPY . ${APP_DIR}/

WORKDIR ${APP_DIR}

RUN npm install

CMD [ "app.js" ]
