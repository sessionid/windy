/**
 * Using Array to implement the List
 */
class ArrayList {
    constructor(items = []) {
        if (!Array.isArray(items)) throw new Error('param `items` should be array');
        this._dataList = [...items];
    }

    enqueue(items = []) {
        if (!Array.isArray(items)) throw new Error('param `items` should be array');
        return this._dataList.push(...items);
    }

    dequeue(size = 1) {
        return size === 1 ? this._dataList.shift() : this._dataList.splice(0, size);
    }

    front() {
        return this._dataList[0];
    }

    back() {
        return this._dataList[this._dataList.length - 1];
    }

    empty() {
        this._dataList.length = 0;
        return this;
    }

    count() {
        return this._dataList.length;
    }

    valueOf() {
        return this._dataList.slice(0);
    }
};

module.exports = { ArrayList };
