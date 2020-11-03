/**
 * @description operations for file
 * @author sessionid
 */

const { promises: { writeFile } } = require('fs');

/* 创建空白文件 */
const createEmptyFile = (path, size = 0) => {
    return writeFile(path, Buffer.allocUnsafe(size).fill(0));
};

module.exports = { createEmptyFile };
