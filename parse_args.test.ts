import mock_console from 'jest-mock-console';
import {parse_args, default_args, usage, Args} from "./parse_args";

const script_name = 'js';
const ARGS = ['version', 'stream', 'help', 'handler'];

describe('usage', () => {
    it('shows usage instructions for the application', () => {
        const restore_console = mock_console();
        usage();
        expect(console.error).toHaveBeenCalled();
        restore_console();
    });
});

describe('default_args', () => {
    it('returns the default arguments', () => {
        const args: Args = default_args();
        expect(Object.keys(args)).toEqual(ARGS);
        expect(args.stream).toBe(false);
        expect(args.help).toBe(false);
        expect(args.version).toBe(false);
        expect(args.handler).toBe('console.log(this)');
    });
});

describe('parse_args', () => {
    beforeEach(() => {
        process.argv = [script_name];
    });
    it('parses process.argv and returns an Args struct', () => {
        const args: Args = parse_args();
        expect(Object.keys(args)).toEqual(ARGS);
        expect(args.stream).toBe(false);
        expect(args.help).toBe(false);
    });
    it('parses stream argument, -s or --stream', () => {
        let args: Args = parse_args();
        expect(args.stream).toBe(false);
        process.argv = [script_name, '-s'];
        args = parse_args();
        expect(args.stream).toBe(true);
        process.argv = [script_name, '--stream'];
        args = parse_args();
        expect(args.stream).toBe(true);
    });
    it('parses help argument, -h or --help', () => {
        let args: Args = parse_args();
        expect(args.help).toBe(false);
        process.argv = [script_name, '-h'];
        args = parse_args();
        expect(args.help).toBe(true);
        process.argv = [script_name, '--help'];
        args = parse_args();
        expect(args.help).toBe(true);
    });
    it('parses version argument, -v or --version', () => {
        let args: Args = parse_args();
        expect(args.version).toBe(false);
        process.argv = [script_name, '-v'];
        args = parse_args();
        expect(args.version).toBe(true);
        process.argv = [script_name, '--version'];
        args = parse_args();
        expect(args.version).toBe(true);
    });
    it('handles compound flags i.e. -sh', () => {
        process.argv.push('-sjh');
        const args = parse_args();
        expect(args.stream).toBe(true);
        expect(args.help).toBe(true);
        expect(args.help).toBe(true);
    });
    it('parses handler argument', () => {
        let args: Args = parse_args();
        const test_handler = 'this.split("\n").map(Number)';
        expect(args.handler).toBe(default_args().handler);

        process.argv = [script_name, test_handler];
        args = parse_args();
        expect(args.handler).toBe(test_handler);

        process.argv = [script_name, '-s', test_handler];
        args = parse_args();
        expect(args.handler).toBe(test_handler);

        process.argv = [script_name, '-s', test_handler, '-h'];
        args = parse_args();
        expect(args.handler).toBe(test_handler);

        process.argv = [script_name, test_handler, '-s', '-h'];
        args = parse_args();
        expect(args.handler).toBe(test_handler);
    });
});