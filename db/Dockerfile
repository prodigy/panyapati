## UNUSED

FROM rethinkdb:2
RUN mkdir -p /etc/rethinkdb/ssl/ && \
    openssl req -newkey rsa:2048 -nodes -keyout /etc/rethinkdb/ssl/key.pem -x509 -days 730 -out /etc/rethinkdb/ssl/cert.pem -subj "/CN=localhost/C=/ST=/L=/O=/OU="
CMD ["rethinkdb", "--bind", "all", "--http-tls-key", "/etc/rethinkdb/ssl/key.pem", "--http-tls-cert", "/etc/rethinkdb/ssl/cert.pem", "--driver-tls-key", "/etc/rethinkdb/ssl/key.pem", "--driver-tls-cert", "/etc/rethinkdb/ssl/cert.pem"]
