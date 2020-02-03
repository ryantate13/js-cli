import readline from 'readline';

export function get_stdin_stream(handler: (line: string) => unknown): Promise<void> {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            terminal: false,
        });
        rl.on('line', handler);
        rl.on('close', resolve);
    });
}