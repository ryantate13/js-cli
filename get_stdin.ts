import stdin from './stdin';

export function get_stdin() {
    const input: string[] = [];
    return new Promise<string>((resolve, reject) => {
        stdin.on('data', d => input.push(d.toString()));
        stdin.on('end', () => {
            resolve(input.join(''));
        });
        stdin.on('error', reject);
    });
}
