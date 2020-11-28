/**
 * @description Execuator for processing limited number of similar tasks
 * @author sessionid
 */
const EventEmitter = require('events');
const { ArrayList } = require('../list');
const Peon = require('./peon');
const Task = require('./task');

/**
 * event: task, data, error, finish
 */
class Execuator extends EventEmitter {
    constructor(processor, { thread = 1, retryLimit = 1, shuffle = false } = {}) {

        if (!(processor instanceof Function)) throw new Error('processor should be executable function');
        
        super();
        this._doneTaskListener = this._doneTaskListener.bind(this);
        this._errorTaskListener = this._errorTaskListener.bind(this);

        this.processor = processor;
        this.shuffle = shuffle;
        this.thread = thread;
        this.retryLimit = retryLimit;
        /* flag */
        this._running = false;

        /* tasklist */
        this.taskList = new ArrayList();
        this._cancelTaskSet = new Set([]);
        this.blockCount = 0;

        /* initial peonlist */
        this._peonList = [];
        this._sleepPeonList = [];
        this._createPeonList(thread);
    }

    awake() {
        this._peonList.forEach(peon => this._awake(peon))
        this._sleepPeonList.splice(0);
    }

    _createPeonList(amount) {
        const { _peonList, _peonList: { length: startId }, processor } = this;
        for (let i = 0; i < amount; i += 1) {
            _peonList.push(this._createPeon(startId + i, processor));
        }
    }

    _awake(peon) {
        const { _peonList, _sleepPeonList } = this;
        /* peon is dead or sleepy */
        if (!peon.isAlive || peon.isAsleep) {
            peon.isAsleep && _sleepPeonList.push(peon);
            /* remove the dead peon */
            if (!peon.isAlive) {
                _peonList.splice(_peonList.findIndex(p => p.id === peon.id), 1);
            }
            this._statistics();
            return;
        }

        if (this.listenerCount('task')) {
            const { _sleepPeonList: { length: sleep }, _peonList: { length: all }, taskList, blockCount: total } = this;
            this.emit('task', {
                peon: { total: all, sleep },
                task: { total, done: total - taskList.count() },
            });
        }

        const { _cancelTaskSet, taskList } = this;
        let task = taskList.dequeue();

        /* pass the canceled task */
        while(task && _cancelTaskSet.has(task.tag)) {
            _cancelTaskSet.delete(task.tag);
            this.emit('skip', task);
            task = this.taskList.dequeue();
        }

        if (task) {
            peon.awake(task);
            this._running = true;
        } else {
            peon.sleep();
            this._sleepPeonList.push(peon);
            this._statistics();
        }
    }

    _doneTaskListener(task, data, peon) {
        this._running = false;
        task.done(data);
        this.emit('data', task);
        this._awake(peon);
    }

    _errorTaskListener(task, e, peon) {
        this._running = false;
        const { taskList, retryLimit } = this;
        task.fail(e);
        if (task.count < retryLimit) {
            taskList.enqueue([task]);
            this.emit('onceerr', task.tag);
        } else {
            /* task failed over retry-limitation then throw  */
            this.emit('error', task);
        }
        this._awake(peon);
    }

    
    adjustPeonAmount() {
        
    }
    
    _createPeon(peonId, processor) {
        const { _doneTaskListener, _errorTaskListener } = this;
        const peon = new Peon(peonId, processor);
        peon.on('finish', _doneTaskListener);
        peon.on('error', _errorTaskListener);
        return peon;
    }
    
    _statistics() {
        const { _peonList, _sleepPeonList, taskList } = this;
        if (taskList.count() === 0 && _sleepPeonList.length === _peonList.length) {
            this.emit('finish');
        } else if (_peonList.length === 0) {
            /* all the peons has been killed */
            this.emit('interrupt', taskList.valueOf());
        } else if (_peonList.length === _sleepPeonList.length) {
            /* some peons been killed, others sleepy */
            this.emit('sleep');
        } else {
            this.adjustPeonAmount();
        }
    }

    sleep() {
        this._peonList.forEach(peon => peon.sleep());
    }

    /* terminate one peon */
    _killPeon(peonId) {
        const { _peonList } = this;
        if (peonId instanceof Peon) {
            peonId.die();
        } else {
            const idx = _peonList.findIndex(v => v.id === peonId);
            const peon = _peonList[idx];
            peon.die();
        }
    }

    /* terminate all the peon */
    kill() {
        const { _peonList } = this;
        _peonList.forEach(peon => peon.die());
    }

    /* generate id for task */
    _id() {
        this.blockCount += 1;
        return this.blockCount - 1;
    }

    /* add new tasks */
    addTask(tasks) {
        const { taskList, shuffle } = this;
        const idList = [];
        /**
         * two conditions:
         * 1. feedback task from error event; 
         * 2. new task 
         * */
        taskList.enqueue(tasks.map(task => {
            let _task;
            if (task instanceof Task) {
                task.reset();
                idList.push(task.id);
                _task = task;
            } else {
                const id = this._id();
                idList.push(id);
                _task = new Task(task, id);
            }
            return _task;
        }));
        /* shuffle the tasks */
        shuffle && taskList.shuffle();
        return idList;
    }

    /* cancel tasks */
    cancelTask(taskIdList) {
        const { _cancelTaskSet } = this;
        taskIdList.forEach(id => {
            if (!_cancelTaskSet.has(id)) _cancelTaskSet.add(id);
        })
    }
};

module.exports = Execuator;
