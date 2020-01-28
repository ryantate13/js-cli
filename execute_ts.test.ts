import {execute_ts} from "./execute_ts";

const expected = 'TEST';

describe('execute_ts', () => {
    it('takes in typescript code as a string, executes it with ts-node and returns the result', async () => {
        const actual = await execute_ts(`console.log('${expected}');`);
        expect(actual).toBe(expected);
    });
    it('takes in typescript code as a string[], executes it with ts-node and returns the result', async () => {
        const actual = await execute_ts(Array(2).fill(`console.log('${expected}');`));
        expect(actual).toEqual([expected, expected].join('\n'));
    });
    it('takes stdin argument and passes it to child process', async () => {
        const actual = await execute_ts([
            'import {get_stdin} from "./get_stdin"',
            'get_stdin().then(console.log)'
        ], expected);
        expect(actual).toBe(expected);
    });
    it('trims the result of its output', async () => {
        const actual = await execute_ts(`console.log('${expected}               ');`);
        expect(actual).toBe(expected);
    });
});