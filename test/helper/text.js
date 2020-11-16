const text = require('../../lib/helper/text');
const should = require('chai').should();

describe('random', () => {
    
    it('#randInt(floor, ceil)', () => {
        const ceil = Math.random() * 100;
        const floor = ceil - 100;
        const result = text.randInt(floor, ceil);
        Number.isInteger(result).should.eq(true);
        result.should.not.below(floor);
        result.should.below(ceil);
    });

    it('#randFloat()', () => {
        const ceil = Math.random() * 100;
        const floor = ceil - 100;
        const result = text.randFloat(floor, ceil);
        result.should.not.below(floor);
        result.should.below(ceil);
    });

    it('#randAround()', () => {
        const list = Array.apply(null, { length: 10 }).map(() => Math.round(Math.random() * 100));
        list.map(() => text.randAround(list)).every(v => list.includes(v)).should.eq(true);
    });

    describe('#shuffle()', () => {
        it('inplace', () => {
            const list = Array.apply(null, { length: 10 }).map(() => Math.round(Math.random() * 100));
            const copy = list.slice(0);
            const ret = text.shuffle(copy, true);
            ret.every((item, idx) => item === list[idx]).should.eq(false);
            ret.should.eq(copy);
        });

        it('not inplace', () => {
            const list = Array.apply(null, { length: 10 }).map(() => Math.round(Math.random() * 100));
            const copy = list.slice(0);
            const ret = text.shuffle(copy);
            ret.every((item, idx) => item === list[idx]).should.eq(false);
            ret.should.not.eq(copy);
        });
        
    })
})
