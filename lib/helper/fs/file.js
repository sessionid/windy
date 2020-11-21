/**
 * @description operations for file
 * @author sessionid
 */

const { promises: { writeFile } } = require('fs');
const { isFile } = require('./is');
const readline = require("readline");
const { createReadStream } = require("fs");

/* create new empty file */
const createEmptyFile = (path, size = 0) => {
    return writeFile(path, Buffer.allocUnsafe(size).fill(0));
};

const readLine = async (path, processor, encoding="utf8") => {
    if (!(await isFile(path))) throw new Error('target not a file');
    if (!(processor instanceof Function)) throw new Error(`processor should be function`);

    const result = [];
    let idx = 0;

    const rl = readline.createInterface({
        input: createReadStream(path, { encoding })
    });

    rl.on('line', line => {
        result.push(processor(line, idx++));
    });

    return new Promise((res, rej) => {
        rl.on('error', rej);
        rl.on('close', res.bind(null, result));
    });
}

module.exports = { createEmptyFile, readLine };
