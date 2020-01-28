import {spawn} from "child_process";

export function execute_ts(code: string | string[], stdin: string = ''): Promise<string> {
    return new Promise((resolve, reject) => {
        const script = Array.isArray(code) ? code.join('; ') : code,
            ts_node = spawn('node', ['node_modules/.bin/ts-node', '-e', script]);
        let output: string = '';
        ts_node.stdout.on('data', (chunk: string) => output += chunk);
        ts_node.stdin.write(stdin);
        ts_node.stdin.end();
        ts_node.on('close', () => resolve(output.trim()));
        ts_node.on('error', reject);
    });
}