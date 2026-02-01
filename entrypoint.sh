#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
while ! python -c "import MySQLdb; MySQLdb.connect(host='${DB_HOST:-db}', user='${DB_USER:-semelrater}', passwd='${DB_PASSWORD:-semelrater}', db='${DB_NAME:-semelrater}')" 2>/dev/null; do
    sleep 1
done
echo "Database is ready!"

# Run migrations
python manage.py migrate --noinput

# Create superuser if env vars are set
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
    python manage.py shell -c "
from django.contrib.auth import get_user_model
import os
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
if username and password and not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f'Superuser {username} created')
"
fi

exec "$@"
