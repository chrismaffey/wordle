#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

git pull

docker compose up -d --build
#UID=$(id -u) GID=$(id -g)
#php artisan migrate --force