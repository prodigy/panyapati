FROM nginx:stable
COPY ./webserver.conf /etc/nginx/conf.d/webserver.conf
COPY startup.sh /startup.sh
RUN mkdir -p /etc/nginx/ssl/
ENTRYPOINT ["/startup.sh"]
CMD ["nginx", "-g", "daemon off;"]
