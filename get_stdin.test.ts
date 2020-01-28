const expected = 'TEST';

type VoidFn = () => void;
type EventType = 'readable' | 'end';
type ListenerMap = {
    [k in EventType]: VoidFn;
};

describe('get_stdin', () => {
    it('returns a Promise<string> which resolves to the stdin of the current process', async () => {
        let read_calls = 0,
            handlers: ListenerMap = {
                readable(){},
                end(){}
            };

        Object.assign(process.stdin, {
            on: jest.fn((event_type: EventType, handler: VoidFn) => {
                handlers[event_type] = handler;
                handlers.readable();
                handlers.end();
            }),
            read: jest.fn(() => {
                if(read_calls === 0){
                    ++read_calls;
                    return expected;
                }
                return null;
            })
        } as any);

        const {get_stdin} = await import('./get_stdin');
        expect(typeof get_stdin).toBe('function');

        const actual = await get_stdin();
        expect(actual).toBe(expected);
        expect(process.stdin.on).toHaveBeenCalled();
        expect(process.stdin.read).toHaveBeenCalled();
    });
});