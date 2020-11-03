const EventEmitter = require('events');
const { ArrayList } = require('../list');
const Peon = require('./peon');
const Task = require('./task');

// task, data, error, finish
class Execuator extends EventEmitter {
    constructor(processor, thread = 1, retryLimit = 1) {

        if (!(processor instanceof Function)) throw new Error('processor should be executable function');
        
        super();
        this._doneTaskListener = this._doneTaskListener.bind(this);
        this._errorTaskListener = this._errorTaskListener.bind(this);

        this.processor = processor;
        // 标识
        this._running = false;

        // 初始化队列
        this.taskList = new ArrayList();
        this._cancelTaskSet = new Set([]);
        this.blockCount = 0;

        // 创建并初始化苦工队列
        this._peonList = [];
        this._sleepPeonList = [];
        this._createPeonList(thread);
        this.retryLimit = retryLimit;
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
        // peon 已死或者是处于休眠状态
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

        // 跳过被取消的任务
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
            // 如果任务不可复原，就将其抛出
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
            // 全部被 kill
            this.emit('interrupt', taskList.valueOf());
        } else if (_peonList.length === _sleepPeonList.length) {
            // 部分被 kill，部分 asleep
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

    // 杀灭苦工以达到限制进程数量，控制速度
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

    // 终结所有的 peon
    kill() {
        const { _peonList } = this;
        _peonList.map(peon => peon.id).forEach(peon => this._killPeon(peon));
    }

    // 任务 id 生成器
    _id() {
        this.blockCount += 1;
        return this.blockCount;
    }

    // 添加任务
    addTask(tasks) {
        const { taskList } = this;
        const idList = [];
        // 对应于两种情况：错误之后再次返回的任务；新创建的任务
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
        return idList;
    }

    // 取消任务
    cancelTask(taskIdList) {
        const { _cancelTaskSet } = this;
        taskIdList.forEach(id => {
            if (!_cancelTaskSet.has(id)) _cancelTaskSet.add(id);
        })
    }
};

module.exports = Execuator;