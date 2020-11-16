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
    constructor(processor, { thread = 1, retryLimit = 1, shuffle = false }) {

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
        this._sleepPeonList.splice(0);
        this._peonList.forEach(peon => this._awake(peon));
    }

    _createPeonList(amount) {
        const { _peonList, _peonList: { length: startId }, processor } = this;
        for (let i = 0; i < amount; i += 1) {
            _peonList.push(this._createPeon(startId + i, processor));
        }
    }

    _awake(peon) {
        /* peon is dead or sleepy */
        if (!peon.isAlive && this._isPeonAsleep(peon.id)) return;

        if (this.listenerCount('task')) {
            const { _sleepPeonList: { length: sleep }, _peonList: { length: all }, taskList: { length: todo }, blockCount: total } = this;
            this.emit('task', {
                peon: { total: all, sleep },
                task: { total, done: total - todo },
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
            this._sleepPeon(peon.id);
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
    
    _sleepPeon(peonId) {
        this._sleepPeonList.push(peonId);
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

    _isPeonAsleep(peonId) {
        return this._sleepPeonList.includes[peonId];
    }

    sleep() {
        this._sleepPeonList = this._peonList.map(peon => peon.id);
    }

    /* terminate one peon */
    _killPeon(peonId) {
        const { _peonList } = this;
        let idx = peonId instanceof Peon ? peonId.id : peonId;
        idx = _peonList.findIndex(v => v.id === idx);
        const peon = _peonList[idx];
        if (peon.isAlive) {
            _peonList.splice(_peonList.findIndex(v => v.id === peonId), 1);
            peon.die();
        }
    }

    /* terminate all the peon */
    kill() {
        const { _peonList } = this;
        _peonList.map(peon => peon.id).forEach(peon => this._killPeon(peon));
    }

    /* generate id for task */
    _id() {
        this.blockCount += 1;
        return this.blockCount;
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
