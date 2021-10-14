<p align="center">
<img src="https://flat.badgen.net/badge/JS/CLI/blue?icon=terminal&scale=15" alt="logo"/>
</p>

![CI Status](https://github.com/ryantate13/js-cli/actions/workflows/cd.yaml/badge.svg) [![codecov](https://codecov.io/gh/ryantate13/js-cli/branch/master/graph/badge.svg?token=Y0ML1BR16Z)](https://codecov.io/gh/ryantate13/js-cli)


# js-cli

Command line script to transform stdout from shell scripts using a JS lambda or expression. Inspired by [fx](https://github.com/antonmedv/fx) but meant to be more general for parsing either raw text or JSON. [CSV, TOML and YAML support](#working-with-csv-toml-or-yaml-data) is provided in the scope of the lambda or expression by the corresponding global variables `CSV`, `TOML` and `YAML`, each offering a similar parse/stringify interface as that of the native `JSON` (with some caveats, refer to example code below to see where parse or stringify might accept a second `options` argument for a given data type).

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

#### Working with CSV, TOML or YAML data

Powered by the [Papa Parse](https://www.papaparse.com/), [@ltd/j-toml](https://www.npmjs.com/package/@ltd/j-toml) and [yaml](https://www.npmjs.com/package/yaml) libraries respectively. Refer to external documentation for specifics as to their functionality. Each library is available to handler functions as the global variables `CSV`, `TOML` and `YAML`. The `CSV` global is actually a wrapper around Papa Parse to enable header parsing by default for csv data and to offer a `stringify` function (vs. the upstream `unparse`), bringing it in line with the interface available in `JSON` and the other supported data formats.

```bash
# csv with header row
cat file.csv | js 'CSV.parse(this)'
# csv without headers
cat file.csv | js 'CSV.parse(this, {headers: false})'
# output csv data
cat array_of_objects.json | js 'CSV.stringify(JSON.parse(this))' > out.csv # keys of first object become header row
cat array_of_arrays.json | js 'CSV.stringify(JSON.parse(this))' > out.csv # no headers in output csv

# reading TOML data
cat Cargo.toml | js 'TOML.parse(this)'
# outputting TOML
curl my.api | js 'TOML.stringify(JSON.parse(this), {newline: "\n"})' # note that it is necessary to specify newline character

# single yaml document
cat file.yaml | js 'YAML.parse(this)'
# multi-document yaml
cat multi.yaml | js 'YAML.parseAllDocuments(this).map(doc => doc.toJSON())'
# outputting YAML
cat data.csv | js 'YAML.stringify(CSV.parse(this))'
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

#### Convert CSV to JSON

```bash
cat data.csv | js 'JSON.stringify(CSV.parse(this))'
```
