FROM php:8.3-cli-alpine

RUN addgroup -S sandbox && adduser -S sandbox -G sandbox
WORKDIR /sandbox
RUN chown sandbox:sandbox /sandbox
USER sandbox
