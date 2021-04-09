<p align="center">
<img src="https://flat.badgen.net/badge/JS/CLI/blue?icon=terminal&scale=15" alt="logo"/>
</p>

![CI Status](https://github.com/ryantate13/js-cli/actions/workflows/cd.yaml/badge.svg) [![codecov](https://codecov.io/gh/ryantate13/js-cli/branch/master/graph/badge.svg?token=Y0ML1BR16Z)](https://codecov.io/gh/ryantate13/js-cli)


# js-cli

Command line script to transform stdout from shell scripts using a JS lambda or expression. Inspired by [fx](https://github.com/antonmedv/fx) but meant to be more general for parsing either raw text or JSON. [YAML support](https://www.npmjs.com/package/yaml) is provided in the scope of the lambda or expression by the global variable `YAML`.

## Installation

```shell script
npm i -g @ryantate/js-cli
```

## Usage

```shell script
js (-s | -h | -v) 'handler_code'
    -s | --stream - Streaming mode, handle input line by line
    -h | --help - Show this help message and quit
    -v | --version Show the version number and quit
```

Pipe data in to `js` and supply a lambda or expression to parse it with. The invoked expression or lambda will have `this` bound to either all of stdin when processing line by line, or the individual line when in streaming mode. The value returned from a lambda or the result of an inline expression will be logged to the console. Undefined or null values will not be logged. Promises returned will be resolved and then logged. 

Packages installed either globally or in the current working directory are accessible via `require` in this scope (see examples below).

## Examples

#### Working with YAML

```bash
# single document
cat file.yaml | js 'JSON.stringify(YAML.parse(this), null, 4)'
# multi-document
cat multi.yaml | js 'YAML.parseAllDocuments(this).map(doc => doc.toJSON())'
```

#### Sum all numbers in a file

```bash
js 'this.trim().split(/\s/+).map(Number).reduce((a,b) => a+b, 0)' < file_of_numbers.txt
```

#### Curl-like

```bash
npm i -g node-fetch
cat urls.txt | js --stream 'require("node-fetch")(this).then(res => res.json())'
```

#### HTML Parsing

```bash
npm i -g cheerio
curl https://some_website.org | js 'html => require("cheerio").load(html).find("p").length'
```

#### Largest number per line in a CSV file

```bash
cat data.csv | js --stream 'line => Math.max(...line.split(",").map(val => Number(val) || -Infinity))'
```

#### Create a directory index

```bash
find . -type f | sort | js 'JSON.stringify(this.split("\n").filter(Boolean), null, 2)' > index.json
```

#### Update all dependencies in package.json

```bash
cat package.json | js 'Object.keys(JSON.parse(this).dependecies).forEach(d => console.log(d))' | xargs npm install
```

#### Concatenate MP3 files with ffmpeg

```bash
ffmpeg \
	-i \
	concat:$(find . -type f -name '*.mp3' | js 'this.split("\n").sort().join("|")') \
	-codec:a libmp3lame \
	concatenated.mp3
```
