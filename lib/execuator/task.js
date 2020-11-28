/**
 * @description Define the task style for class::Execuator
 * @author sessionid
 */

class Task {
    constructor(payload, tag) {
        this._payload = payload;
        this.tag = tag;
        this._fail = 0;
        this._errList = [];
        this._data = undefined;
        this._done = false;
    }
    /**
     * get the payload of a task
     */
    get payload() {
        return this._payload;
    }

    /**
     * set the payload of a task
     */
    set payload(payload) {
        this._payload = payload;
    }

    /**
     * fetch data of task for using
     */
    valueOf() {
        const { _payload: payload, tag, _errList: errList, _data: data, _done: done } = this;
        return { payload, tag, errList, data, done };
    }

    /**
     * get the number of failures
     */
    get count() {
        return this._fail;
    }

    /**
     * call when the task finish
     * @param {Any} data the result of this task
     */
    done(data) {
        this._data = data;
        this._done = true;
    }

    /**
     * call when the task fail
     * @param {Error} e error when task fail
     */
    fail(e) {
        if (this._done) {
            console.warn('state of task is done when you set it fail');
        }
        this._fail += 1;
        this._errList.push(e);
        return this;
    }

    /**
     * reset the task back to the initial state
     */
    reset() {
        this._fail = 0;
        this._errList.splice(0);
        this._data = undefined;
        this._done = false;
        return this;
    }

    get data() {
        return this._data;
    }
}

module.exports = Task;
