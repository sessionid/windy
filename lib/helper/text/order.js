/**
 * @description functions for list sorting and shuffle
 * @author sessionid
 */

const { randNatural } = require('./random');

const _shuffle = (list) => {
    let i = list.length;
    while(i) {
        const rand = randNatural(i--);
        [list[i], list[rand]] = [list[rand], list[i]];
    }
    return list;
}

const shuffle = (list, inplace = false) => _shuffle(inplace ? list : list.slice());

module.exports = {
    shuffle,
}
