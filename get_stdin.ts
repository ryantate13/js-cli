export function get_stdin(){
    const {stdin} = process;
    stdin.setEncoding('utf8');
    const input: string[] = [];
    return new Promise<string>((resolve, reject) => {
        stdin.on('readable', () => {
            let chunk;
            while ((chunk = stdin.read()))
                input.push(chunk);
        });
        stdin.on('end', () => {
            resolve(input.join(''));
        });
        stdin.on('error', reject);
    });
}
