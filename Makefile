.PHONY: dev build deploy test clean

dev:
	docker-compose up --build

build:
	docker-compose -f docker-compose.prod.yml build

deploy:
	bash setup-k3d.sh

test:
	docker-compose run --rm backend pytest

clean:
	docker-compose down -v
	k3d cluster delete secureai-gateway || true
