export function code_evaluator(arg: string, code: string): unknown {
    const f: unknown = eval(`function f() { return ${code} }

    f`).call(arg);
    return typeof f === 'function' ? f(arg) : f;
}