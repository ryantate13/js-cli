import {main} from '.';
jest.mock('.');
(main as any).mockImplementation(() => Promise.resolve(undefined));

describe('cli', () => {
    it('runs main', async () => {
        await import('./cli');
        expect(main).toHaveBeenCalled();
    });
});
