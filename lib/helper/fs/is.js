/**
 * @description Use to simplify judge
 * @author sessionid
 */

const {constants, promises: { access, stat }} = require('fs');

const isFile = async (path) => {
    try {
        let stats = await stat(path);
        return stats.isFile();
    } catch {
        return false;
    }
};

const isDir = async (path) => {
    try {
        let stats = await stat(path);
        return stats.isDirectory();
    } catch {
        return false;
    }
};

const isExist = async (path, mode = constants.F_OK) => {
    try {
        await access(path, mode);
        return true;
    } catch(e) {
        return false;
    }
}
const isReadable = path => isExist(path, constants.R_OK);
const isWritale = path => isExist(path, constants.W_OK);
const isExcutable = path => isExist(path, constants.X_OK);

module.exports = {
    isFile,
    isDir,
    isExist,
    isReadable,
    isWritale,
    isExcutable,
}
