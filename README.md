# el-windy
toolkit for crawler

## structure

- Class::Execuator
    - Class::Execuator
        - [x] shuffle
    - [x] Class::Peon
    - [x] Class::Task
- [ ] class Sequence
- Module::Helper
    - module::fs
        - [x] `sizeOf(path)`
        - [x] `rm(path)`
        - [x] `copy(src, dest)`
        - [x] `combine(srcList, destination)`
        - [x] `createEmptyFile(path, size = 0)`
        - [x] `isFile(path)`
        - [x] `isDir(path)`
        - [x] `isExist(path)`
        - [x] `isReadable(path)`
        - [x] `isWritale(path)`
        - [x] `isExcutable(path)`
    - module::version
        - [x] `gt(v1, v2)`
        - [x] `geq(v1, v2)`
        - [x] `lt(v1, v2)`
        - [x] `leq(v1, v2)`
        - [x] `eq(v1, v2)`
        - [x] `neq(v1, v2)`
        - [x] `gtc(v)`
        - [x] `geqc(v)`
        - [x] `ltc(v)`
        - [x] `leqc(v)`
        - [x] `eqc(v)`
        - [x] `neqc(v)`
    - module::text
        - [ ] jsonp
            - [ ] `toJSON(jsonp)`
            - [ ] `parse(jsonp)`
            - [ ] `stringify(data, callback)`
        - [x] `shuffle(list, inplace = false)`
        - [x] `randomFloat(ceil, floor = 0)`
        - [x] `randInt(ceil, floor = 0)`
        - [x] `randAround(list = [])`
        - [x] `randNatural(ceil)`
- Module::List
    - [x] Class::InfiniteList
    - [x] Class::List
