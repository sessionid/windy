/**
 * @description test for `fs` part of lib helper
 * @author sessionid
 */

const { promises: { mkdtemp, stat, unlink, rmdir, mkdir, access, readFile, writeFile } } = require('fs');
const { join, dirname } = require('path');
const chai = require('chai');
chai.should();
chai.use(require('chai-as-promised'));
const { 
    createEmptyFile, 
    /* is */
    isFile,
    isDir,
    isExist,
    /* directory */
    sizeOf,
    rm,
    copy,
    combine,
} = require('../../lib/helper/fs');


describe('module::helper.fs', () => {
    describe('part::file', () => {
        it('#createEmptyFile()', async () => {
            const directory = await mkdtemp('miku-');
            const file = join(directory, 'tmp400');
            await createEmptyFile(file, 400);
            const stats = await stat(file);
            stats.isFile().should.eq(true);
            stats.size.should.eq(400);
            await unlink(file);
            await rmdir(directory);
        });
    });

    describe('part::is', () => {
        let directory;
        let file;

        beforeEach(async () => {
            directory = await mkdtemp('miku-');
            file = join(directory, 'tmp400');
            await createEmptyFile(file, 400);
        });

        afterEach(async () => {
            await unlink(file);
            await rm(directory);
        });
        it('#isFile()', async () => {
            (await isFile(file)).should.eq(true);
            (await isFile(directory)).should.eq(false);
        });

        it('#isDir()', async () => {
            (await isDir(file)).should.eq(false);
            (await isDir(directory)).should.eq(true);
        });

        it('#isExist()', async () => {
            (await isExist(file)).should.eq(true);
            (await isExist(join(directory, 'iofsvgs'))).should.eq(false);
        });
    });

    describe('part::directory', () => {
        let directory;
        let total;

        beforeEach(async () => {
            directory = await mkdtemp('miku-');
            const fileList = [{file: 'foo/123', size: 400 }, { file: 'foo/bar/baz/234', size: 565 }, { file: '567', size: 343 }, { file: 'foo/456', size: 2333 }];
            total = 0;
            for({ file, size } of fileList) {
                const dir = join(directory, file);
                await mkdir(dirname(dir), { recursive: true });
                await createEmptyFile(dir, size);
                total += size;
            }
        });

        afterEach(async () => {
            try {
                await rm(directory, { recursive: true });
            } catch {}
        });

        it('#sizeOf()', async () => {
            (await sizeOf(directory)).should.eq(total);
            await rmdir(directory, { recursive: true });
        });

        it('#rm()', async () => {
            await rm(directory);
            return access(directory).should.be.rejectedWith('ENOENT: no such file or directory');
        });

        it('#copy()', async () => {
            const content = 'lorem';
            const src = join(directory, 'src');
            const dest = join(directory, 'copy');
            await writeFile(src, content);
            await copy(src, dest);
            (await readFile(dest, { encoding: 'utf8' })).should.eq(content);
        });

        it('#combine()', async () => {
            const fileList = [{ n: 'hello', c: 'foo' }, { n: 'bawr', c: 'sfsf' }, { n: 'sdsf', c: 'aewrwr' }];
            const pathList = [];
            let content = '';
            for(let { n, c } of fileList) {
                const src = join(directory, n);
                await writeFile(src, c);
                pathList.push(src);
                content += c;
            }

            const combineFile = join(directory, 'miku');
            await combine(pathList, combineFile);
            (await readFile(combineFile, { encoding: 'utf8' })).should.eq(content);
        });
    })
});