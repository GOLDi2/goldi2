FROM nginx

ENV SCHEME=http
ENV AUTHORITY=localhost:80
ENV PATH_PREFIX=""

COPY --from=gitlab-registry.rz.tu-ilmenau.de/fakia/fachgebiet-iks/goldi/goldi2/goldi2/cwide-vscode /tmp/build/vscode /tmp/vscode
COPY public /usr/share/nginx/html
COPY --from=gitlab-registry.rz.tu-ilmenau.de/fakia/fachgebiet-iks/goldi/goldi2/goldi2/cwide-vscode /tmp/build/vscode-web /usr/share/nginx/html/vscode-web
COPY default.conf.template /etc/nginx/templates/
ENTRYPOINT [ "/bin/bash", "-c" ]
CMD [ "echo \"$(envsubst '$PATH_PREFIX $SCHEME $AUTHORITY' < /usr/share/nginx/html/index.html)\" > /usr/share/nginx/html/index.html && bash /docker-entrypoint.sh nginx -g 'daemon off;'" ]