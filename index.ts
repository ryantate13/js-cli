import colorize from 'json-colorizer';
import {Args, parse_args, usage} from './parse_args';
import {get_stdin_stream} from './get_stdin_stream';
import {get_stdin} from './get_stdin';
import {code_evaluator} from './code_evaluator';
import {version} from './package.json';

export {get_stdin_stream};
export {get_stdin};
export {code_evaluator};

export function maybe_log(return_value: unknown) {
    // if a promise gets returned then resolve it before logging
    const resolved = Promise.resolve(return_value);
    if(resolved === return_value)
        resolved.then(maybe_log);
    else if (return_value == undefined)
        return;
    else if (typeof return_value === 'object'){
        const json = JSON.stringify(return_value, null, 4);
        return console.log(process.stdout.isTTY ? colorize(json, {pretty: true}) : json);
    }
    else
        console.log(return_value);
}

export async function main() {
    const args: Args = parse_args();
    if (args.help)
        return usage();
    if(args.version)
        return console.log(version);
    if (args.stream)
        await get_stdin_stream(line => maybe_log(code_evaluator(line, args.handler)));
    else
        maybe_log(code_evaluator(await get_stdin(), args.handler));
}