const should = require('chai').should();
const Peon = require('../../lib/execuator/peon');
const Task = require('../../lib/execuator/task');

describe('class::Peon', () => {
    describe('init', () => {
        it('constructor', () => {
            const processor = () => {};
            const peon = new Peon(1, processor);
            peon._processor.should.eq(processor);
            peon.id.should.eq(1);
            peon._alive.should.eq(true);
            peon.busy.should.eq(false);
        });
    });

    describe('function', () => {
        const testData = 'testdata';
        const testError = new Error('testerror');
        const processor = () => { return testData };
        let peon;
        beforeEach(() => {
            peon = new Peon(1, processor);
        });

        describe('#awake()', () => {
            it('awake when finish', (done) => {
                const task = new Task(123, 1);
                peon.on('finish', (task, data, _peon) => {
                    task.should.eq(task);
                    data.should.eq(testData);
                    _peon.should.eq(peon);
                    done();
                });
                peon.awake(task);
            });
    
            it('awake when error', (done) => {
                const task = new Task(123, 1);
                peon._processor = () => { throw testError };
                peon.on('error', (task, e, _peon) => {
                    task.should.eq(task);
                    e.should.eq(testError);
                    _peon.should.eq(peon);
                    done();
                });
                peon.awake(task);
            });

            it('awake when is dead', (done) => {
                const task = new Task(123, 1);
                peon._alive = false;
                peon.on('error', (task, e, _peon) => {
                    e.message.should.eq(`peon ${_peon.id} was dead`);
                    done();
                });
                peon.awake(task);
            });
        });

        it('#die()', () => {
            peon._alive.should.eq(true);
            peon.die();
            peon._alive.should.eq(false);
        });

        it('prop isAlive', () => {
            peon.isAlive.should.eq(true);
            peon.die();
            peon.isAlive.should.eq(false);
        })
    })
})