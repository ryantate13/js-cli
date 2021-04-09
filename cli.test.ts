import {main} from '.';

jest.mock('.');
(main as jest.Mock<Promise<void>>).mockImplementation(() => Promise.resolve(undefined));

describe('cli', () => {
    it('runs main', async () => {
        await import('./cli');
        expect(main).toHaveBeenCalled();
    });
});
