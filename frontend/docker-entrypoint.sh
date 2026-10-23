#!/bin/sh
# Expose every VITE_* variable of the container environment to the built app as /env.js.
set -e
{
  echo "window.__ENV__ = {"
  env | grep '^VITE_' | while IFS='=' read -r key value; do
    escaped=$(printf '%s' "$value" | sed 's/\\/\\\\/g; s/"/\\"/g')
    echo "  \"$key\": \"$escaped\","
  done
  echo "};"
} > dist/env.js
exec "$@"
