FROM ryantate13/node:build

ARG USER_NAME
ARG USER_ID
ARG GROUP_ID

RUN if (getent group $GROUP_ID); then delgroup $(getent group $GROUP_ID | cut -d: -f1); fi
RUN if (getent passwd $USER_ID); then deluser $(getent passwd $USER_ID | cut -d: -f1); fi
RUN addgroup -g ${GROUP_ID} ${USER_NAME} && adduser -u ${USER_ID} -G ${USER_NAME} -D ${USER_NAME}

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
WORKDIR /app
RUN npm install

COPY tsconfig.json /app/tsconfig.json
COPY *.ts /app/
COPY README.md /app/README.md
RUN rm *.test.ts

USER ${USER_NAME}
CMD node node_modules/.bin/tsc && \
    chmod +x dist/cli.js && \
    cp package.json README.md dist && \
    echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > dist/.npmrc && \
    true
