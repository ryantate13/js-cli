import stdin from './stdin';

describe('stdin', () => {
    it('exports process.stdin', () => {
        expect(stdin).toEqual(process.stdin);
    });
});