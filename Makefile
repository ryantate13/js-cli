IMG := $(shell basename $(PWD))
TEST := $(IMG):test
BUILD := $(IMG):build
BUILD_ARGS := --build-arg USER_NAME=$(USER) \
	--build-arg USER_ID=$(shell id -u $(USER)) \
	--build-arg GROUP_ID=$(shell id -g $(USER))

VERSION_CHECK := \
	const p = require('./package.json'), \
		  r = JSON.parse(require('child_process').execSync('npm show ' + p.name +' versions --json')); \
	process.exit(Number(p.version === r.pop()));

all: test build publish

publish: build
	@[ ! -z "$(NPM_TOKEN)" ] || (echo NPM_TOKEN is undefined > /dev/stderr && exit 1)
	@if (docker run --rm $(BUILD) node -e "$(VERSION_CHECK)"); \
	then \
	docker run --rm \
		-v $(PWD)/dist:/app \
		-e NPM_TOKEN=$(NPM_TOKEN) \
		$(BUILD) \
		npm publish; \
	fi

build: .dockerignore
	rm -rf dist
	mkdir dist
	docker build $(BUILD_ARGS) -f build.dockerfile -t $(BUILD) .
	docker run --rm -v $(PWD)/dist:/app/dist $(BUILD)

test: .dockerignore
	rm -rf coverage
	mkdir coverage
	docker build $(BUILD_ARGS) -f test.dockerfile -t $(TEST) .
	docker run --rm -v $(PWD)/coverage:/app/coverage $(TEST)

.dockerignore: $(shell find . -type f -name '*.dockerfile')
	echo '*' > .dockerignore
	cat *.dockerfile | grep COPY | cut -d' ' -f 2 | sort | uniq | xargs -n 1 -I {} echo "!{}" >> .dockerignore

.PHONY:
	all test build publish dockerignore
