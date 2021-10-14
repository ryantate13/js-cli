import CSV from './csv';

const csv_data = 'foo,bar\r\n1,2\r\n3,4\r\nfalse,true\r\nfoo,bar',
    expected = [
        {foo: 1, bar: 2},
        {foo: 3, bar: 4},
        {foo: false, bar: true},
        {foo: 'foo', bar: 'bar'},
    ];

describe('CSV', () => {
    it('exposes Papa Parse via a parse/stringify interface to match JSON, YAML and TOML', () => {
        expect(CSV.parse(csv_data)).toEqual(expected);
        expect(CSV.stringify(expected)).toEqual(csv_data);
    });
    it('supports passing a custom parsing config', () => {
        const expected = [['a', 'b'], ['c', 'd']];
        expect(CSV.parse(expected.map(a => a.join(',')).join('\n'), {header: false})).toEqual(expected);
    });
});