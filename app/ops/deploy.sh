#!/usr/bin/env bash
set -e

echo "Building..."
pnpm run build

echo "Deploying..."
rsync -av --delete \
  dist \
  package.json \
  node_modules \
  morchess:/var/www/morchess-api/

ssh morchess "mkdir -p /var/www/morchess-api/data"

echo "Restarting service..."
ssh morchess "sudo systemctl restart morchess"

echo "Done."
