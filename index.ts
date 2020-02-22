import {Args, parse_args, usage} from './parse_args';
import {get_stdin_stream} from './get_stdin_stream';
import {get_stdin} from './get_stdin';
import {code_evaluator} from './code_evaluator';

export {get_stdin_stream};
export {get_stdin};
export {code_evaluator};

export function maybe_log(return_value: unknown) {
    if (return_value == undefined)
        return;
    if (typeof return_value === 'object')
        return console.log(JSON.stringify(return_value, null, 4));
    console.log(return_value);
}

export async function main() {
    const args: Args = parse_args();
    if (args.help)
        return usage();
    if (args.stream)
        await get_stdin_stream(line => maybe_log(code_evaluator(line, args.handler)));
    else
        maybe_log(code_evaluator(await get_stdin(), args.handler));
}