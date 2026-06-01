#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Build all CodeForge sandbox Docker images
# Run this once before starting the backend
# ─────────────────────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SANDBOX_DIR="$SCRIPT_DIR/../docker/sandbox"

echo "🐳 Building CodeForge sandbox images..."

docker build -f "$SANDBOX_DIR/Dockerfile.node"   -t codeforge-sandbox-node:latest   "$SANDBOX_DIR"
docker build -f "$SANDBOX_DIR/Dockerfile.python" -t codeforge-sandbox-python:latest "$SANDBOX_DIR"
docker build -f "$SANDBOX_DIR/Dockerfile.java"   -t codeforge-sandbox-java:latest   "$SANDBOX_DIR"
docker build -f "$SANDBOX_DIR/Dockerfile.cpp"    -t codeforge-sandbox-cpp:latest    "$SANDBOX_DIR"
docker build -f "$SANDBOX_DIR/Dockerfile.go"     -t codeforge-sandbox-go:latest     "$SANDBOX_DIR"
docker build -f "$SANDBOX_DIR/Dockerfile.rust"   -t codeforge-sandbox-rust:latest   "$SANDBOX_DIR"
docker build -f "$SANDBOX_DIR/Dockerfile.php"    -t codeforge-sandbox-php:latest    "$SANDBOX_DIR"
docker build -f "$SANDBOX_DIR/Dockerfile.ruby"   -t codeforge-sandbox-ruby:latest   "$SANDBOX_DIR"

echo "✅ All sandbox images built successfully!"
echo ""
echo "Available images:"
docker images | grep codeforge-sandbox
