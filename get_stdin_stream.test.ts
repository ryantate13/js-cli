import stdin from './stdin';
import {get_stdin_stream} from './get_stdin_stream';

jest.mock('./stdin', () => ({
    __esModule: true,
    default: jest.requireActual('mock-stdin').stdin(),
}));

describe('get_stdin_stream', () => {
    it(`calls its handler function with each line of input received on stdin`, async () => {
        const num_expected = 100,
            expected = 'TEST\n',
            handler = jest.fn(f => f),
            p = get_stdin_stream(handler);

        for (let i = 0; i < num_expected; ++i)
            stdin.emit('data', expected);
        stdin.emit('end');
        await p;
        expect(handler.mock.calls.every(call => call[0] === 'TEST')).toBe(true);
        expect(handler.mock.calls.length).toEqual(num_expected);
    });
});