IMG := $(shell basename $$PWD)
TEST := $(IMG):test
BUILD := $(IMG):build

all: test build publish
	@true

publish:
	sudo docker run --rm \
		-v $$PWD/dist:/app \
		-e NPM_TOKEN \
		$(BUILD) \
		npm publish \
		|| (echo publish failed >> /dev/stderr && exit 0)

build:
	rm -rf dist
	mkdir dist
	sudo docker build \
		--build-arg USER_NAME=$$(whoami) \
		--build-arg USER_ID=$$(id -u $$(whoami)) \
		--build-arg GROUP_ID=$$(id -g $$(whoami)) \
		-f build.dockerfile \
		-t $(BUILD) \
		.
	sudo docker run --rm -v $$PWD/dist:/app/dist $(BUILD)

test:
	rm -rf coverage
	mkdir coverage
	sudo docker build \
		--build-arg USER_NAME=$$(whoami) \
		--build-arg USER_ID=$$(id -u $$(whoami)) \
		--build-arg GROUP_ID=$$(id -g $$(whoami)) \
		-f test.dockerfile \
		-t $(TEST) \
		.
	sudo docker run --rm -v $$PWD/coverage:/app/coverage $(TEST)

dockerignore:
	echo '*' > .dockerignore
	cat *.dockerfile | grep COPY | cut -d' ' -f 2 | sort | uniq | xargs -n 1 -I {} echo "!{}" >> .dockerignore

.PHONY:
	all test build publish dockerignore