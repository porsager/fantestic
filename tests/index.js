import t from '../fantestic.js'

t('Equality works', () => [1, 1])

t('longer timeout works', {
  timeout: 1
}, async() =>
  [1, await new Promise(r => setTimeout(r, 800, 1))]
)
