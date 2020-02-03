import {code_evaluator} from './code_evaluator';

describe('code_evaluator', () => {
    it('evaluates a string as a function', () => {
        expect(code_evaluator('1,2,3,4', 'nums => nums.split(",").map(Number).reduce((a,b) => a+b, 0)'))
            .toEqual(10);
    });
    it('evaluates a string as an expression', () => {
        expect(code_evaluator('', '"TEST"'))
            .toEqual('TEST');
    });
    it('this in function is bound to string argument', () => {
        expect(code_evaluator('1,2,3,4', '() => this.split(",").map(Number).reduce((a,b) => a+b, 0)'))
            .toEqual(10);
    });
    it('this in expression context is bound to string argument', () => {
        expect(code_evaluator('1,2,3,4', 'this.split(",").map(Number).reduce((a,b) => a+b, 0)'))
            .toEqual(10);
    });
});