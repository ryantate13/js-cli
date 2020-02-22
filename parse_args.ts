export type Args = {
    version: boolean;
    stream: boolean;
    help: boolean;
    handler: string;
};

export function usage(){
    console.error(`Usage: js (-s | -h | -v) 'handler_code'
    -s | --stream - Streaming mode, handle input line by line
    -h | --help - Show this help message and quit
    -v | --version Show the version number and quit
    handler_code - String of JavaScript to process stdin with. If a lambda, 'this' will evaluate to the entire captured
        stdin of the process when not in streaming mode or with each line applied as 'this' while in streaming mode.
        Handler code can be a lambda or an expression. If a lambda, stdin will be passed as the first argument of the
        function, all lines of stdin when not in streaming mode of line by line when in streaming mode. If a handler
        expression or return of supplied lambda evaluates to a value other than null or undefined, the value will be
        logged to the console. 

    Examples:
        cat file_of_numbers.txt | js 'this.trim().split(/\\s/+).map(Number).reduce((a,b) => a+b, 0)'
        curl https://some_website.org | js 'html => require("cheerio").load(html).find("p").length'
        cat data.csv | js --stream 'line => Math.max(...line.split(",").map(Number))'`);
}

export function default_args(): Args {
    return {
        version: false,
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
        else if (c === 'v' || c === 'version')
            flags.version = true;
        else
            flags.handler = c;
    }

    return flags;
}