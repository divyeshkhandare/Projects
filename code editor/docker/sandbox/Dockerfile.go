FROM golang:1.22-alpine

RUN addgroup -S sandbox && adduser -S sandbox -G sandbox
WORKDIR /sandbox
RUN chown sandbox:sandbox /sandbox
USER sandbox

ENV GOPATH=/tmp/go
ENV GOCACHE=/tmp/go-cache
