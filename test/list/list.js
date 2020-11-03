require('chai').should();
const { ArrayList, InfiniteList } = require('../../lib/list');

describe('Lib::List', () => {
    describe('class::ArrayList', () => {
        it('constructor', () => {
            const data = [1,2,3,4,5];
            const list = new ArrayList(data);
            list._dataList.should.deep.eq(data);
            (() => new ArrayList(123)).should.throw('param `items` should be array', 'not throw error when pass in non-array argument');
        });

        it('#enqueue()', () => {
            const data = [1,2,3,4,5];
            const list = new ArrayList(data);

            list.enqueue();
            list._dataList.should.deep.eq(data, 'not work when enqueue nothing');

            list.enqueue.bind(list, 123).should.throw('param `items` should be array', 'not throw error when pass in non-array argument');

            list.enqueue([6,7,8]);
            list._dataList.should.deep.eq([...data, 6, 7, 8], 'not work when enqueue something');
        });

        it('#dequeue()', () => {
            const data = [1,2,3,4,5];
            const list = new ArrayList(data);
            list.dequeue();
            list._dataList.should.deep.eq(data.slice(1), 'not work when passing nothing');
            list.dequeue(3);
            list._dataList.should.deep.eq([5]);
        });

        it('#front()', () => {
            const data = [1,2,3,4,5];
            const list = new ArrayList(data);
            list.front().should.eq(1);
        });

        it('#back()', () => {
            const data = [1,2,3,4,5];
            const list = new ArrayList(data);
            list.back().should.eq(5);
        });

        it('#empty()', () => {
            const data = [1,2,3,4,5];
            const list = new ArrayList(data);
            list.empty().valueOf().should.deep.eq([]);
        });

        it('#count()', () => {
            const data = [1,2,3,4,5];
            const list = new ArrayList(data);
            list.count().should.eq(5);
        });

        it('#valueOf()', () => {
            const data = [1,2,3,4,5];
            const list = new ArrayList(data);
            list.valueOf().should.deep.eq(data);
        });
    });

    describe('class::InfiniteList', () => {
        let counter = 0;
        const source = async (listSizeLimit) => { 
            if (counter < 3) {
                counter += 1;
                return Array.apply(null, { length: listSizeLimit }).map((v, idx) => idx);
            } else {
                counter = 0;
                return [];
            }
        };
        it('InfiniteList constructor', async () => {
            (() => new InfiniteList()).should.throw('argument `source` should be function');
            new InfiniteList(source, { fetchSize: 2, listSizeLimit: 10 });
        });

        it('#warmup()', async () => {
            const lc = new InfiniteList(source, { fetchSize: 2, listSizeLimit: 10 });
            await lc.warmup();
            lc.list.count().should.eq(10, '`listSizeLimit` not work');
        })

        it('#dequeue() single once', async () => {
            const lc = new InfiniteList(source, { fetchSize: 1, listSizeLimit: 10 });
            for(let i = 0; i < 10; i += 1) {
                (await lc.dequeue()).should.eq(i);
            }
        });

        it('#dequeue() serval once', async () => {
            const lc = new InfiniteList(source, { fetchSize: 2, listSizeLimit: 10 });
            for(let i = 0; i < 5; i += 2) {
                (await lc.dequeue()).should.deep.eq([i, i + 1]);
            }
        });

        it('`for await...of` to iterate the list', async () => {
            const lc = new InfiniteList(source, { fetchSize: 1, listSizeLimit: 10 });
            let count = 0;
            for await(let m of lc) {
                count += 1;
            }
            count.should.eq(30, 'iterate list fail');
        });

        it('feedback when dequeue', async () => {
            const lc = new InfiniteList(source, { fetchSize: 1, listSizeLimit: 10 });
            for(let i = 0; i < 9; i += 1) {
                (await lc.dequeue()).should.eq(i);
            }
            lc.dequeue([13, 14]);
            (await lc.dequeue()).should.eq(13, 'feedback fail');
            (await lc.dequeue()).should.eq(14, 'feedback fail');
        });
        
    })
})