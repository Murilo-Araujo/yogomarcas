#!/bin/bash
set -e
# Remove PID
rm -f tmp/pids/server.pid

# Debug environment variables for Railway
echo "=== Environment Debug ==="
echo "PORT: ${PORT:-not set}"
echo "RAILWAY_TCP_PROXY_PORT: ${RAILWAY_TCP_PROXY_PORT:-not set}" 
echo "RAILWAY_TCP_APPLICATION_PORT: ${RAILWAY_TCP_APPLICATION_PORT:-not set}"
echo "=========================="

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