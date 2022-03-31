# 🎉 Fantestic

```js
import { test, not, only } from 'fantestic'
```

If you like short names Fantestic also exports `test` as `t`, `not` as `n` and `only` as `o`.

```js
const { t, n, o } = require('fantestic')
```

Tests are run either using `test` or `only`, while `not` is simply a quick replacement to disable a test temporarily.

The test functions take a name as the first parameter, an optional options object, and a test run function as the last parameter.

```js
test(name, options?, run)
```

A test run function should return/resolve to an array of the shape:
```js
[
    result,
    expected,
    cleanup
]
```

Fantestic does strict equality checks on `expected` and `result`. This means it's up to the user to handle other type of ecuality checks, but it means you can use any assertion library you would like, or none at all.

`cleanup` is optional and can be done inline or as a function.


### Sample
```js
const { test, not, only } = require('fantestic')

test('Addition works', () => [
  4,
  2 + 2
])
```
