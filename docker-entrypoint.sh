#!/bin/bash
set -e
# Remove PID
rm -f tmp/pids/server.pid

# db:create
bundle exec rails db:create

# Migrations will be run on ALL instances
bundle exec rails db:migrate

# Call CMD
exec "$@"