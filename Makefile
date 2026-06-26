PROJECT_NAME ?= scene-feed
COMPOSE := docker compose -f ./docker/docker-compose.yml --project-directory . -p "$(PROJECT_NAME)"
COMPOSE_INIT := docker compose -f ./init/docker-compose.yml --project-directory . -p "$(PROJECT_NAME)"

.PHONY: build run stop revision

build:
	COMPOSE_BAKE=true $(COMPOSE) build
run:
	$(COMPOSE) down
	$(COMPOSE_INIT) up --exit-code-from certbot
	$(COMPOSE_INIT) down
	$(COMPOSE) up -d
stop:
	$(COMPOSE) down
revision:
	PROJECT_NAME=$(PROJECT_NAME) ./scripts/revision.sh "$(MSG)"