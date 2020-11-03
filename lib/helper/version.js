/**
 * @description use for version comparison
 * @author sessionid
 */

const _v = (v1, v2, fn) => {
    let v1List = v1.split('.').map(v => Number(v));
    let v2List = v2.split('.').map(v => Number(v));
    for(let i = 0, ln = v1List.length; i < ln; i += 1) {
        if (v1List[i] === v2List[i] && i < ln - 1) continue;
        return fn(v1List[i], v2List[i]) ? true : false;
    }
    return false;
}

const gt = (v1, v2) => _v(v1, v2, (a, b) => a > b);
const geq = (v1, v2) => _v(v1, v2, (a, b) => a >= b);
const lt = (v1, v2) => gt(v2, v1);
const leq = (v1, v2) => geq(v2, v1);
const eq = (v1, v2) => _v(v1, v2, (a, b) => a === b);
const neq = (v1, v2) => !eq(v1, v2);

const v = {
    gt, geq, lt, leq, eq, neq,
};

/* compare with the version of node */
Object.keys(v).reduce((v, fname) => {
    const fn = v[fname];
    v[`${fname}c`] = v => fn(v, process.version.slice(1));
    return v;
}, v);

module.exports = v;