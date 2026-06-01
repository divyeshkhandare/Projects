FROM gcc:13-bookworm

RUN groupadd -r sandbox && useradd -r -g sandbox sandbox
WORKDIR /sandbox
RUN chown sandbox:sandbox /sandbox
USER sandbox
