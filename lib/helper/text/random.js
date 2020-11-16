/**
 * @description some random functions
 * @author sessionid
 */

/* random float */
const randFloat = (ceil, floor = 0) => Math.random() * (ceil - floor) + floor;

/* get random integer */
const randInt = (ceil, floor = 0) => Math.floor(randFloat(ceil, floor));

/* random item of List */
const randAround = (list = []) => list[randInt(list.length)];

/* get random natural */
const randNatural = (ceil) => Math.floor(Math.random() * ceil);

module.exports = {
    randFloat,
    randNatural,
    randInt,
    randAround,
}
