#!/bin/bash
set -e
# Remove PID
rm -f tmp/pids/server.pid

# Check database connection first
echo "Checking database connection..."
if bundle exec rails runner "ActiveRecord::Base.connection.execute('SELECT 1')" 2>/dev/null; then
  echo "Database connection successful"
  bundle exec rails db:migrate
else
  echo "Database connection failed - check your DATABASE_URL or database credentials"
  echo "Continuing without migrations for debugging..."
fi

# Call CMD
exec "$@"