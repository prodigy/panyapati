#!/bin/bash
if [[ "${PANYAPATI_WEB_HOST}" == "localhost" ]]
then
  openssl req -newkey rsa:2048 -nodes -keyout /etc/nginx/ssl/key.pem -x509 -days 365 -out /etc/nginx/ssl/cert.pem -subj "/CN=localhost/C=/ST=/L=/O=/OU="
fi

/docker-entrypoint.sh "$@"
