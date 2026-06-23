#!/bin/bash
set -e
cd "$(dirname "$0")/.." || exit 1
source .env

OVERRIDE_FILE="docker-compose.db-expose.yml"

sed 's/image: postgres:16/image: postgres:16\n    ports:\n      - "5432:5432"/' docker/docker-compose.yml > $OVERRIDE_FILE

docker compose -f $OVERRIDE_FILE down
docker volume rm ${PROJECT_NAME}_db_data || true
docker compose -f $OVERRIDE_FILE up -d --build db

DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB

# Wait for db to be ready
until docker compose -f $OVERRIDE_FILE exec db pg_isready -U $POSTGRES_USER -d $POSTGRES_DB; do
  sleep 1
done

DATABASE_URL=$DATABASE_URL uv run alembic upgrade head
DATABASE_URL=$DATABASE_URL uv run alembic revision --autogenerate -m "$1"

echo "Migration file generated. Edit it, then press Enter to run upgrade head..."
read -r
DATABASE_URL=$DATABASE_URL uv run alembic upgrade head

docker compose -f $OVERRIDE_FILE down
rm $OVERRIDE_FILE