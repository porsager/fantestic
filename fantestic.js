/* eslint no-console: 0 */

const test = (...rest) => run(false, ...rest)

export default test

let done = 0
  , onlySome = false
  , ignored = 0
  , promise = Promise.resolve()
  , count = 0

const tests = []
const noop = () => { /* noop */ }
const proc = typeof process === 'undefined'
  ? { exit: noop, stdout: { write: console.log } }
  : process

test.timeout = 0.5
test.not = test.nt = test.n = () => ignored++
test.only = test.ot = test.o = (...rest) => (onlySome = true, run(true, ...rest))

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
          fn.timer = setTimeout(() => reject('Timed out'), 1000 * options.timeout || test.timeout)
        ),
        typeof fn === 'function' ? fn() : fn
      ])
    )
    .then(async(x) => {
      if (!Array.isArray(x))
        throw new Error('Tests should return result array [expected, got]')

      const [expected, got, cleanup] = x

      typeof cleanup === 'function' && await cleanup()

      if (expected !== got)
        throw new Error(expected + ' != ' + got)

      tests[id].succeeded = true
      proc.stdout.write('✅')
    })
    .catch(err => {
      tests[id].failed = true
      tests[id].error = err instanceof Error ? err : new Error(err)
    })
    .then(() => {
      ++done === Object.keys(tests).length && finished()
    })
}

function finished() {
  let success = true
  Object.values(tests).forEach((x) => {
    if (!x.succeeded) {
      success = false
      x.cleanup
        ? console.error('⛔️', x.name + ' at line', x.line, 'cleanup failed', '\n', util.inspect(x.cleanup))
        : console.error('⛔️', x.name + ' at line', x.line, x.failed
          ? 'failed'
          : 'never finished', '\n', x.error
        )
    }
  })

  ignored && console.error('⚠️', ignored, 'ignored test' + (ignored === 1 ? '' : 's', '\n'))
  !onlySome && success && !ignored
    ? console.log('🎉')
    : proc.exit(1) // eslint-disable-line
}
