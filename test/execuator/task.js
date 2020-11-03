const should = require('chai').should();
const Task = require('../../lib/execuator/task');

describe('class::Task', () => {
    const initialState = {
        _payload: 'whoisyourdaddy',
        tag: 1,
        _fail: 0,
        _errList: [],
        _data: undefined,
        _done: false,
    };
    describe('init', () => {
        it('constructor', () => {
            const task = new Task('whoisyourdaddy', 1);
            task.should.deep.eq(initialState);
        });
    })

    
    describe('function', () => {
        let task;
        beforeEach(() => {
            task = new Task('whoisyourdaddy', 1);
        })
        it('attr payload getter & setter', () => {
            task.payload = 2;
            task.payload.should.eq(2);
        });
    
        it('#valueOf()', () => {
            task.valueOf().should.deep.eq({
                payload: 'whoisyourdaddy',
                tag: 1,
                errList: [],
                data: undefined,
                done: false,
            })
        });
    
        it('#fail()', () => {
            const err2 = new Error('error 2');
            task.fail(new Error('error 1'));
            task.fail(err2);
            const { errList } = task.valueOf();
            errList.length.should.eq(2);
            errList[1].should.eq(err2);
        });

        it('count', () => {
            task.fail();
            task.fail();
            task.fail();
            task.count.should.eq(3);
        });

        it('#done()', () => {
            task.valueOf().done.should.eq(false);
            task.done('sessionid');
            const val = task.valueOf();
            val.done.should.eq(true);
            val.data.should.eq('sessionid');
        });

        it('#reset()', () => {
            task.fail();
            task.fail();
            task.fail();
            task.done('sessionid');
            task.reset();
            task.should.deep.eq(initialState);
        });
    })
});
