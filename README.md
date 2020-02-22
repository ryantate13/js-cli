# js-cli

Command line script to transform stdout from shell scripts using a JS lambda or expression. Inspired by [fx](https://github.com/antonmedv/fx) but meant to be more general for parsing either raw text or JSON.

## Installation

```shell script
npm i -g @ryantate/js-cli
```

## Usage

```shell script
js (-s | -h) 'handler_code'
    -s | --stream - Streaming mode, handle input line by line
    -h | --help - Show this help message and quit
```

Pipe data in to `js` and supply a lambda or expression to parse it with. The invoked expression or lambda will have `this` bound to either all of stdin or when processing line by line, the individual line. Values returned from a lambda or the result of the expression will be logged to the console. Undefined or null values will not be logged. Promises returned will be resolved and then logged. 

Packages installed globally or in the current working directory will be accessible via `require`.

## Examples

#### Sum all numbers in a file

```shell script
js 'this.trim().split(/\s/+).map(Number).reduce((a,b) => a+b, 0)' < file_of_numbers.txt
```

#### Curl-like

```shell script
npm i -g node-fetch
cat urls.txt | js --stream 'fetch(this).then(res => res.json())'
```

#### HTML Parsing

```shell script
npm i -g cheerio
curl https://some_website.org | js 'html => require("cheerio").load(html).find("p").length'
```

#### Largest number per line in a CSV file

```shell script
cat data.csv | js --stream 'line => Math.max(...line.split(",").map(val => Number(val) || -Infinity))'
```

#### Create a directory index

```shell script
find . -type f | sort | js 'JSON.stringify(this.split("\n").filter(Boolean), null, 2)' > index.json
```

#### Update all dependencies in package.json

```shell script
cat package.json | js 'Object.keys(JSON.parse(this).dependecies).forEach(d => console.log(d))' | xargs npm install
```

#### Concatenate MP3 files with ffmpeg

```shell script
ffmpeg \
	-i \
	concat:$(find . -type f -name '*.mp3' | js 'this.split("\n").sort().join("|")') \
	-codec:a libmp3lame \
	concatenated.mp3
```