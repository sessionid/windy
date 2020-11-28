## v1.0.1(2020-11-16)

changes:

- new module helper::text that focuses on math, order and text, including:
    - `#shuffle()`
    - `#randFloat()`
    - `#randNatural()`
    - `#randInt()`
    - `#randAround()`
    - `jsonp`
        - `#toJSON()`
        - `#parse()`
        - `#stringify()`
- new method `#shuffle()` for list
- upgrade the class::Execuator
    - signature of constructor from `(processor, thread = 1, retryLimit = 1)` to `(processor, { thread = 1, retryLimit = 1, shuffle = false })`
    - new configure option `shuffle` for execuator, make it possible shuffle the order of the crawler tasks for hiding the tracks and intentions
- helper.fs
    - use `copyFile` for `copy` when above version 8.5.0
    - use `recursive` option in rmdir when above version 12.10.0
    - upgrade `#combine()` to speed up the combination
- new class `Sequence`
- changes of test files for the update and new codes above
- update comments(update and from chinese to english)

## v1.0.2(2020-11-21)

### helper.fs

- rename `#rm()` to `#rmdir()`
- `#combine()`
    - check if `dest` file exists and truncate it before create readstream.
    - fixed the bug that bind too much event listener on one event linstener.
- new method `readline()`

### adjust style of arguments of constructor

from `(processor, thread = 1, retryLimit = 1, shuffle = false)` to `(processor, { thread = 1, retryLimit = 1, shuffle = false } = {})`

## v1.0.3(2020-11-28)

fixed the bug of `class::Execuator` and update the test code.