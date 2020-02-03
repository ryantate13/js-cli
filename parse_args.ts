export type Args = {
    stream: boolean;
    help: boolean;
    handler: string;
};

export function usage(){
    console.error(`Usage: js (-s|-h) 'handler_code'
    -s | --stream - Streaming mode, handle input line by line
    -h | --help - Show this help message and quit
    handler_code - String of JavaScript to process stdin with. If a lambda, it will be called with stdin as 'this' arg
        when not in streaming mode or with each line applied as 'this' while in streaming mode. If the handler evaluates
        to a value other than undefined, the value will be logged to the console. 

    Examples:
        cat file_of_numbers.txt | js 'this.trim().split(/\\s/+).map(Number).reduce((a,b) => a+b, 0)'
        curl https://some_website.org | js 'html => require("cheerio").load(html).find("p").length'
        cat data.csv | js --stream 'line => Math.max(...line.split(",").map(Number))'`);
}

export function default_args(): Args {
    return {
        stream: false,
        help: false,
        handler: 'console.log(this)',
    };
}

export function parse_args(): Args {
    const args = process.argv.slice(1),
        collected = [];

    for (const arg of args) {
        const h1 = arg[0] === '-',
            h2 = arg[1] === '-';
        if (h1 && h2)
            collected.push(arg.slice(2));
        else if (h1)
            collected.push(...arg.slice(1).split(''));
        else
            collected.push(arg);
    }

    let flags = default_args();

    for (const c of collected) {
        if (c === 's' || c === 'stream')
            flags.stream = true;
        else if (c === 'h' || c === 'help')
            flags.help = true;
        else
            flags.handler = c;
    }

    return flags;
}