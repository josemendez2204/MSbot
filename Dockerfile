FROM node:17-alpine3.12

ENV USER=1000:1000
WORKDIR /home/node

USER $USER

COPY --chown=$USER . code/

RUN cd code/ && \
    yarn --production && \
    yarn cache clean && \
    rm -rf /tmp/* || true

CMD node code/bot.js
