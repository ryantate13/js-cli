IMG := $(shell basename $$PWD)
TEST := $(IMG):test
BUILD := $(IMG):build
BUILD_ARGS := --build-arg USER_NAME=$(USER) \
	--build-arg USER_ID=$(shell id -u $(USER)) \
	--build-arg GROUP_ID=$(shell id -g $(USER))

all: test build publish
	@true

publish: build
	[ ! -z $(NPM_TOKEN) ] || (echo NPM_TOKEN is undefined > /dev/stderr && exit 1)
	sudo docker run --rm \
		-v $$PWD/dist:/app \
		-e NPM_TOKEN=$(NPM_TOKEN) \
		$(BUILD) \
		npm publish

build:
	rm -rf dist
	mkdir dist
	sudo docker build \
		$(BUILD_ARGS) \
		-f build.dockerfile \
		-t $(BUILD) \
		.
	sudo docker run --rm -v $$PWD/dist:/app/dist $(BUILD)

test:
	rm -rf coverage
	mkdir coverage
	sudo docker build \
		$(BUILD_ARGS) \
		-f test.dockerfile \
		-t $(TEST) \
		.
	sudo docker run --rm -v $$PWD/coverage:/app/coverage $(TEST)

dockerignore:
	echo '*' > .dockerignore
	cat *.dockerfile | grep COPY | cut -d' ' -f 2 | sort | uniq | xargs -n 1 -I {} echo "!{}" >> .dockerignore

.PHONY:
	all test build publish dockerignore