PROJECT_NAME ?= scene-feed
COMPOSE := docker compose -f ./docker/docker-compose.yml --project-directory . -p "$(PROJECT_NAME)"

.PHONY: build run

build:
	COMPOSE_BAKE=true $(COMPOSE) build
run:
	$(COMPOSE) up -d
revision:
	PROJECT_NAME=$(PROJECT_NAME) ./scripts/revision.sh "$(MSG)"