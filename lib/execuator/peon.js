/**
 * @description Instance that execuate task
 * @author sessionid
 */
const EventEmitter = require('events');

class Peon extends EventEmitter {

    constructor(id, processor) {
        super();
        this.id = id;
        this._processor = processor;
        this.busy = false;
        this._alive = true;
        this._sleep = false;
    }

    async awake(task) {
        if (this._alive) {
            this.busy = true;
            this._sleep = false;
            let data;
            try {
                data = await this._processor(task.payload);
            } catch (e) {
                return this.emit('error', task, e, this);
            }

            this.busy = false;
            this.emit('finish', task, data, this);
        } else {
            this.emit('error', task, new Error(`peon ${this.id} was dead`), this);
        }
        return this;        
    }

    die() {
        this._alive = false;
        return this;
    }

    get isAlive() {
        return this._alive;
    }

    sleep() {
        this._sleep = true;
        return this;
    }

    get isAsleep() {
        return this._sleep;
    }
}

module.exports = Peon;
