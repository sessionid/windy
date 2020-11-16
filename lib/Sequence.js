/**
 * @description combine a serial of functions into an sequence
 * @author sessionid
 */
class Sequence {
    constructor(name) {
        this.name = name;
        this.midwareList = [];
    }
    /* `midware` can be an array of function or just one single function */
    step(midware) {
        this.midwareList.push(midware);
        return this;
    }
    
    run(midware, task) {
        /* the midware can be function or an instance of Sequence */
        return midware instanceof Sequence
            ? midware.exec(task)
            : midware(task);
    }

    async exec(initial) {
        const { midwareList, run } = this;
        let task = initial;
        
        for(let midware of midwareList) {
            if (Array.isArray(midware)) {
                /* if midware is instance of sequence, you can refer to the result by its name */
                const nameList = midware.map((m, idx) => {
                    return 'name' in m ? m.name : idx;
                });
                task = (await Promise.all(midware.map((m)=>run(m, task))))
                    .reduce((ret, val, idx) => {
                        /* sequence can refer by name and index, function can ony refer by index */
                        ret[nameList[idx]] = val;
                        ret[idx] = val;
                        return ret;
                    }, {});
            } else {
                task = await run(midware, task);
            } 
        }
        return task;
    }
}

module.exports = Sequence;
