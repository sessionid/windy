/**
 * @description expansion of internal module `fs`
 * @author sessionid
 */

const { promises: { readdir, stat, rmdir, unlink, mkdir }, createReadStream, createWriteStream } = require('fs');
const { promisify } = require('util');
const { join, dirname } = require('path');
const Stream = require('stream');
const pipeline = promisify(Stream.pipeline);
const version = require('../version');
const { isFile, isDir } = require('./is');

const _sizeOfDir = async (path) => {
    let size = 0;
    const dirList = [];
    const fileList = await readdir(path);
    for (let file of fileList) {
        const filePath = join(path, file);
        const stats = await stat(filePath);
        if (stats.isDirectory()) {
            dirList.push(filePath);
        } else {
            size += stats.size;
        }
    }
    return { size, dirList }
};

/* get size of file or directory */
const sizeOf = async (path) => {
    const stats = await stat(path);
    if (stats.isFile()) {
        return stats.size;
    }
    const list = [];
    let file = path, totalSize = 0;
    do {
        const { size, dirList } = await _sizeOfDir(file);
        totalSize += size;
        list.push(...dirList);
    } while (file = list.pop());
    return totalSize;
};

const _rmDir = async (path) => {
    // 文件
    if (!(await isDir(path))) {
        unlink(path);
        return [];
    }
    // 目录
    const dir = await readdir(path);
    if (dir.length) {
        // 实体目录
        const dirList = [path];
        for (let file of dir) {
            let filePath = join(path, file);
            if (await isDir(filePath)) {
                dirList.push(filePath);
            } else {
                await unlink(filePath);
            }
        }
        return dirList;
    } else {
        // 空目录
        await rmdir(path);
        return [];
    }
};

const _rm = async (path) => {
    if (await isFile(path)) return unlink(path);
    const list = [];
    let file = path;
    do {
        list.push(...await _rmDir(file));
    } while (file = list.pop());
};

/* remove directory or file */
const rm = version.gtc('12.0.0') ? path => rmdir(path, { recursive: true }) : _rm;

/* copy file */
const copy = async (src, dest) => {
    await mkdir(dirname(dest), { recursive: true });
    return pipeline(
        createReadStream(src),
        createWriteStream(dest),
    );
};

/* combine files to single one */
const combine = async (srcList, dest) => {
    await mkdir(dirname(dest), { recursive: true });
    console.log(srcList)
    for (src of srcList) {
        await pipeline(
            createReadStream(src),
            createWriteStream(dest, { flags: 'a' }),
        );
    }
    return dest;
};


module.exports = {
    sizeOf,
    rm,
    copy,
    combine,
};
