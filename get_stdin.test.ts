import stdin from './stdin';

jest.mock('./stdin', () => ({
    __esModule: true,
    default: jest.requireActual('mock-stdin').stdin(),
}));

const expected = 'TEST';

describe('get_stdin', () => {
    it('returns a Promise<string> which resolves to the stdin of the current process', async () => {
        stdin.on = jest.fn((_, handler) => handler(expected)) as any;
        const {get_stdin} = await import('./get_stdin');
        expect(typeof get_stdin).toBe('function');
        const actual = await get_stdin();
        expect(stdin.on).toHaveBeenCalled();
        expect(actual).toBe(expected);
        (stdin.on as any).mockReset();
    });
    it('rejects if stdin has an error', async () => {
        stdin.on = jest.fn((type, handler) => type === 'error' && handler(new Error)) as any;
        const {get_stdin} = await import('./get_stdin');
        try {
            await get_stdin();
        } catch (error) {
            expect(stdin.on).toHaveBeenCalled();
            expect(error).toBeInstanceOf(Error);
        }
    });
});