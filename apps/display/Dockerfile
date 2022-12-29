FROM node:19-alpine

ENV APP_DIR=/app

COPY . ${APP_DIR}/

WORKDIR ${APP_DIR}

RUN npm install && \
    mkdir -p ${APP_DIR}/public/js && \
    cp ${APP_DIR}/node_modules/socket.io/client-dist/socket.io.js /app/public/js/socket.io.js && \
    cp ${APP_DIR}/node_modules/lightweight-charts/dist/lightweight-charts.standalone.development.js /app/public/js/lightweight-charts.standalone.development.js

CMD [ "app.js" ]
