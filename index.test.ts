import colorize from 'json-colorizer';
import mock_console from 'jest-mock-console';
import {colors, main, maybe_log} from './index';
import {version} from './package.json';

let restore_console: () => void;

beforeAll(() => restore_console = mock_console());
afterAll(() => restore_console());

describe('maybe_log', () => {
    const obj = {test: 'test'},
        json = JSON.stringify(obj, null, 4);

    it('calls console.log when it receives a value that is not undefined or null', () => {
        maybe_log(undefined);
        expect((console.log as any).mock.calls.length).toEqual(0);
        maybe_log(null);
        expect((console.log as any).mock.calls.length).toEqual(0);
        maybe_log(json);
        expect((console.log as any).mock.calls.length).toEqual(1);
        maybe_log(2);
        expect((console.log as any).mock.calls.length).toEqual(2);
        maybe_log(obj);
        expect((console.log as any).mock.calls.length).toEqual(3);
        maybe_log(NaN);
        expect((console.log as any).mock.calls.length).toEqual(4);
        maybe_log('');
        expect((console.log as any).mock.calls.length).toEqual(5);
        maybe_log(false);
        expect((console.log as any).mock.calls.length).toEqual(6);
    });
    it('calls JSON.stringify when logging objects', () => {
        process.stdout.isTTY = false;
        maybe_log(obj);
        expect((console.log as any).mock.calls[0][0]).toBe(json);
    });
    it('colorizes JSON when logging to a TTY', () => {
        process.stdout.isTTY = true;
        maybe_log(obj);
        expect((console.log as any).mock.calls[0][0]).toBe(colorize(json, {pretty: true, colors}));
    });
    it('resolves promises and then logs them', async () => {
        const f = jest.fn(() => 1),
            p = Promise.resolve().then(f);
        maybe_log(p);
        await new Promise(process.nextTick);
        expect(f).toHaveBeenCalled();
        expect((console.log as any).mock.calls[0][0]).toBe(1);
    });
});

describe('main', () => {
    afterEach(() => ['data', 'end', 'error'].forEach(e => process.stdin.removeAllListeners(e)));
    beforeEach(() => {
        (console.log as any).mockClear();
        (console.error as any).mockClear();
    });
    it('supplies usage information when called with -h or --help', async () => {
        process.argv = ['node', 'js', '-h'];
        await main();
        expect((console.error as any).mock.calls.length).toBe(1);
        process.argv = ['node', 'js', '--help'];
        await main();
        expect((console.error as any).mock.calls.length).toBe(2);
    });
    it('logs the package version when called with -v or --version', async () => {
        process.argv = ['node', 'js', '-v'];
        await main();
        expect((console.log as any).mock.calls.length).toBe(1);
        process.argv = ['node', 'js', '--version'];
        await main();
        expect((console.log as any).mock.calls.length).toBe(2);
        expect((console.log as any).mock.calls.map((c: string[]) => c[0])
            .every((arg: string) => arg === version)).toBe(true);
    });
    it('calls passed in handler', async () => {
        process.argv = ['node', 'js', 'console.log("TEST")'];
        const main_promise = main();
        process.stdin.emit('end');
        await main_promise;
        expect((console.log as any).mock.calls[0][0]).toBe('TEST');
    });
    it('defaults to handler of console.log(this) when none is supplied', async () => {
        process.argv = ['node', 'js'];
        const main_promise = main(),
            num_expected = 100;
        for (let i = 0; i < num_expected; ++i)
            process.stdin.emit('data', 'TEST');
        process.stdin.emit('end');
        await main_promise;
        const output: string = (console.log as any).mock.calls[0][0],
            match = output.match(/TEST/g);
        expect(match).toBeTruthy();
        expect(match && match.length).toBe(num_expected);
    });
    it('supports yaml parsing via global YAML', async () => {
        process.argv = ['node', 'js', 'YAML.parse(this).foo'];
        const main_promise = main();
        process.stdin.emit('data', `foo: TEST`);
        process.stdin.emit('end');
        await main_promise;
        expect((console.log as jest.Mock<void>).mock.calls[0][0]).toEqual('TEST');
    });
    it('supports parsing yaml with multiple documents', async () => {
        process.argv = ['node', 'js', 'YAML.parseAllDocuments(this).map(d => d.toJSON().foo).join("-")'];
        const main_promise = main();
        process.stdin.emit('data', `foo: TEST\n---\nfoo: TEST`);
        process.stdin.emit('end');
        await main_promise;
        expect((console.log as jest.Mock<void>).mock.calls[0][0]).toEqual('TEST-TEST');
    });
    it('can parse csv data', async () => {
        process.argv = ['node', 'js', 'CSV.parse(this)'];
        process.stdout.isTTY = false;
        const main_promise = main();
        process.stdin.emit('data', 'foo,bar\n1,2');
        process.stdin.emit('end');
        await main_promise;
        expect(JSON.parse((console.log as jest.Mock<void>).mock.calls[0][0])).toEqual([{foo: 1, bar: 2}]);
    });
    it('can stringify csv data', async () => {
        process.argv = ['node', 'js', 'CSV.stringify(JSON.parse(this))'];
        const main_promise = main();
        process.stdin.emit('data', JSON.stringify([[1, 2], [3, 4]]));
        process.stdin.emit('end');
        await main_promise;
        expect((console.log as jest.Mock<void>).mock.calls[0][0]).toEqual('1,2\r\n3,4');
    });
    it('can parse toml data', async () => {
        process.argv = ['node', 'js', 'TOML.parse(this)'];
        process.stdout.isTTY = false;
        const main_promise = main();
        process.stdin.emit('data', [
            '[package]',
            'name = "hello-world"',
            'version = "0.1.0"',
            'authors = ["Ryan Tate"]',
            'edition = "2018"',
        ].join('\n'));
        process.stdin.emit('end');
        await main_promise;
        expect(JSON.parse((console.log as jest.Mock<void>).mock.calls[0][0])).toEqual({
            package: {
                name: 'hello-world',
                version: '0.1.0',
                authors: ['Ryan Tate'],
                edition: '2018',
            },
        });
    });
    it('can stringify toml data', async () => {
        process.argv = ['node', 'js', 'TOML.stringify(JSON.parse(this), {newline: "\\n"})'];
        const main_promise = main();
        process.stdin.emit('data', JSON.stringify({foo: 'bar', bar: 'baz'}));
        process.stdin.emit('end');
        await main_promise;
        expect((console.log as jest.Mock<void>).mock.calls[0][0].trim()).toEqual(`foo = 'bar'\nbar = 'baz'`);
    });
    it('passes entire stdin as string when not in streaming mode', async () => {
        process.argv = ['node', 'js', 'this.split(/\\s+/).reduce((a, c) => a + Number(c), 0)'];
        const main_promise = main();
        let sum = 0;
        for (let i = 1; i < 100; ++i) {
            sum += i;
            process.stdin.emit('data', `${i}${i % 2 ? ' ' : '\n'}`);
        }
        process.stdin.emit('end');
        await main_promise;
        expect(Number((console.log as any).mock.calls[0][0])).toEqual(sum);
    });
    it('passes stdin line by line to handler function when in stream mode', async () => {
        process.argv = ['node', 'js', '-s', 'i => Math.pow(Number(i), 2)'];
        const main_promise = main();
        let expected_calls = 100,
            nums: number[] = [];
        for (let i = 1; i < expected_calls; ++i) {
            nums.push(Math.pow(i, 2));
            process.stdin.emit('data', `${i}\n`);
        }
        process.stdin.emit('end');
        await main_promise;

        for (let i = 0; i < expected_calls - 1; ++i) {
            const expected = nums[i],
                actual = (console.log as any).mock.calls[i][0];
            expect(expected).toEqual(actual);
        }
    });
});
