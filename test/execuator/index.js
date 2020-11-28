const should = require('chai').should();
const Execuator = require('../../lib/execuator');
const Peon = require('../../lib/execuator/peon');

describe('class::Execuator', () => {
    const taskList = [0, 1, 2, 3, 4, 5];
    const processor = task => task;
    const thread = 3;
    let execuator;
    beforeEach(() => {
        execuator = new Execuator(processor, {thread});
        execuator.addTask(taskList);
    })
    describe('init', () => {
        it('#constructor()', () => {
            execuator._peonList.length.should.eq(thread);
            execuator.taskList.count().should.eq(taskList.length);
            execuator._running.should.eq(false);
            execuator._peonList.every(peon => peon instanceof Peon).should.eq(true);
        });
    });

    describe('function', () => {
        it('#awake()', (done) => {
            const resultList = [];
            execuator.on('finish', () => {
                resultList.should.deep.eq(taskList);
                done();
            });
            execuator.on('data', (task) => {
                resultList[task.tag] = task.valueOf().data;
            });
            execuator.awake();
        });

        it('#kill()', () => {
            execuator.kill();
            execuator.awake();
            execuator._running.should.eq(false);
            execuator.on('interrupt', () => {
                execuator._peonList.length.should.eq(0);
            })
        });

        it('#sleep()', () => {
            execuator.sleep();
           execuator.on('sleep', () => {
            execuator._sleepPeonList.length.should.eq(thread);
           })
        });

        it('#addTask()', (done) => {
            const resultList = [];
            execuator.addTask([6, 7]).should.deep.eq([6, 7]);
            execuator.on('finish', () => {
                resultList.should.deep.eq([...taskList, 6, 7]);
                done();
            });
            execuator.on('data', (task) => {
                resultList[task.tag] = task.valueOf().data;
            });
            execuator.awake();
        });

        it('#cancelTask()', (done) => {
            const resultList = [];
            const skipList = [];
            execuator.cancelTask([1,2]);
            execuator.on('finish', () => {
                resultList.should.deep.eq(taskList.slice(0, 1).concat(taskList.slice(3)));
                skipList.should.deep.eq([1, 2]);
                done();
            });

            execuator.on('skip', (task) => {
                skipList.push(task.tag);
            });

            execuator.on('data', (task) => {
                resultList.push(task.valueOf().data);
            });
            execuator.awake();
        });
    });

    describe('mixed', () => {
        it('throw error while over retry limitation', (done) => {
            const err = new Error('test error');
            const processor = () => { throw err };
            let errList = [];
            const execuator = new Execuator(processor, { retryLimit: 3 });
            execuator.addTask([0]);
            execuator.on('finish', () => {
                errList.should.deep.eq([err, err, err]);
                done();
            });
            execuator.on('error', (task) => {
                errList = task.valueOf().errList;
            });
            execuator.awake();
        });

        it('async execuator', (done) => {
            const processor = async v => v;
            const taskList = [0,1,2,3,4,6,7,8,11,23,43,124];
            const execuator = new Execuator(processor, { thread: 3, retryLimit: 3 });
            execuator.addTask(taskList);
            const resultList = [];
            execuator.on('finish', () => {
                resultList.sort((a, b) => a - b);
                resultList.should.deep.eq(taskList);
                done();
            });
            execuator.on('data', (task) => {
                resultList[task.tag] = task.valueOf().data;
            });
            execuator.awake();
        })
    })
});