#!/bin/bash
set -e
# Remove PID
rm -f tmp/pids/server.pid

# db:create
bundle exec rails db:prepare
bundle exec rails db:migrate

# Call CMD
exec "$@"