/* eslint no-console: 0 */

const util = typeof require !== 'undefined'
  ? require('util')
  : ({ inspect: x => x })

let done = 0
let onlySome = false
let ignored = 0
let promise = Promise.resolve()
let count = 0
const tests = []

const not = () => ignored++
const test = (...rest) => run(false, ...rest)
const only = (...rest) => (onlySome = true, run(true, ...rest))

test.timeout = 500
module.exports = { not, only, test, n: not, o: only, t: test }

async function run(o, name, options, fn) {
  typeof options !== 'object' && (fn = options, options = {})

  const id = count++
  const line = new Error().stack.split('\n')[4].split(':')[1]
  await 1

  if (onlySome && !o)
    return

  tests[id] = { fn, line, name }
  promise = promise
    .then(() =>
      Promise.race([
        new Promise((resolve, reject) =>
          fn.timer = setTimeout(() => reject('Timed out'), options.timeout || test.timeout)
        ),
        typeof fn === 'function' ? fn() : fn
      ])
    )
    .then(async(x) => {
      if (!Array.isArray(x))
        throw new Error('Test should return result array')

      const [expected, got, cleanup] = x

      typeof cleanup === 'function' && await cleanup()

      if (expected !== got)
        throw new Error(expected + ' != ' + util.inspect(got))

      tests[id].succeeded = true
      process
        ? process.stdout.write('✅')
        : console.log('✅')
    })
    .catch(err => {
      tests[id].failed = true
      tests[id].error = err instanceof Error ? err : new Error(util.inspect(err))
    })
    .then(() => {
      ++done === Object.keys(tests).length && finished()
    })
}

process.on('exit', finished)
process.on('SIGINT', finished)

function finished() {
  process && process.removeAllListeners('exit')
  let success = true
  Object.values(tests).forEach((x) => {
    if (!x.succeeded) {
      success = false
      x.cleanup
        ? console.error('⛔️', x.name + ' at line', x.line, 'cleanup failed', '\n', util.inspect(x.cleanup))
        : console.error('⛔️', x.name + ' at line', x.line, x.failed
          ? 'failed'
          : 'never finished', '\n', util.inspect(x.error)
        )
    }
  })

  ignored && console.error('⚠️', ignored, 'ignored test' + (ignored === 1 ? '' : 's', '\n'))
  !onlySome && success && !ignored
    ? console.log('🎉')
    : (typeof process !== 'undefined') && process.exit(1) // eslint-disable-line
}
