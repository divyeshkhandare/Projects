FROM ruby:3.3-slim

RUN groupadd -r sandbox && useradd -r -g sandbox sandbox
WORKDIR /sandbox
RUN chown sandbox:sandbox /sandbox
USER sandbox
