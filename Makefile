IMG := $(shell basename $$PWD)
TEST := $(IMG):test
BUILD := $(IMG):build

USER_NAME := $(shell whoami)
USER_ID := $(shell id -u $(USER_NAME))
GROUP_ID := $(shell id -g $(USER_NAME))

all: test build publish
	@true

publish:
	sudo docker run --rm \
		-v $$PWD/dist:/app \
		-e NPM_TOKEN=$(NPM_TOKEN) \
		$(BUILD) \
		npm publish

build:
	rm -rf dist
	mkdir dist
	sudo docker build \
		--build-arg USER_NAME=$(USER_NAME) \
		--build-arg USER_ID=$(USER_ID) \
		--build-arg GROUP_ID=$(GROUP_ID) \
		-f build.dockerfile \
		-t $(BUILD) \
		.
	sudo docker run --rm -v $$PWD/dist:/app/dist $(BUILD)

test:
	rm -rf coverage
	mkdir coverage
	sudo docker build \
		--build-arg USER_NAME=$(USER_NAME) \
		--build-arg USER_ID=$(USER_ID) \
		--build-arg GROUP_ID=$(GROUP_ID) \
		-f test.dockerfile \
		-t $(TEST) \
		.
	sudo docker run --rm -v $$PWD/coverage:/app/coverage $(TEST)

dockerignore:
	echo '*' > .dockerignore
	cat *.dockerfile | grep COPY | cut -d' ' -f 2 | sort | uniq | xargs -n 1 -I {} echo "!{}" >> .dockerignore

.PHONY:
	all test build publish dockerignore