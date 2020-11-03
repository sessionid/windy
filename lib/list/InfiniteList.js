/**
 * @description a simple Task Manager to dispatch tasks to task processors, using `for await...of` to iterate
 * @author sessionid
 */

const { ArrayList } = require('./list');

class InfiniteList{

    constructor(source, {
        listSizeLimit = 100,
        fetchSize = 1,
    } = {}) {
        if (!(source instanceof Function)) throw new Error('argument `source` should be function');
        this.source = source;
        this.list = new ArrayList();
        this.listSizeLimit = listSizeLimit;
        this.fetchSize = fetchSize;
        this.iterator = this[Symbol.asyncIterator]();
    }

    async *[Symbol.asyncIterator]() {
        const { source, list, listSizeLimit, fetchSize } = this;
        while(true) {
            list.enqueue(await source(listSizeLimit));
            // if 0 after fetching data from source, it means that the source is done
            if (!list.count()) break;
            while(list.count()) {
                // using next to pass the enqueue result
                let itemList = yield list.dequeue(fetchSize);
                list.enqueue(itemList);
            }
        }
    }

    async dequeue(feedback = []) {
        const { value } = await this.iterator.next(feedback);
        return value;
    }

    /**
     * fetch data before dequeue, aim to speed up the first time dequeue speed
     */
    async warmup() {
        const { list, listSizeLimit, source } = this;
        const size = listSizeLimit - list.count();
        if (size > 0) list.enqueue(await source(size));
        return size;
    }
    
}

module.exports = InfiniteList;
