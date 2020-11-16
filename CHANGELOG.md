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