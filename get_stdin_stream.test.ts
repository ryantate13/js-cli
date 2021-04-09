import {get_stdin_stream} from './get_stdin_stream';

describe('get_stdin_stream', () => {
    jest.setTimeout(30 * 1000);
    it(`calls its handler function with each line of input received on stdin`, async () => {
        const num_expected = 100,
            expected = 'TEST\n',
            handler = jest.fn(f => f),
            p = get_stdin_stream(handler);

        for (let i = 0; i < num_expected; ++i)
            process.stdin.emit('data', expected);
        process.stdin.emit('end');
        await p;
        expect(handler.mock.calls.every(call => call[0] === 'TEST')).toBe(true);
        expect(handler.mock.calls.length).toEqual(num_expected);
    });
});