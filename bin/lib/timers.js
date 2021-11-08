const timers = Object.create(null)
const { format } = require('util')
const options = require('./options.js')
const log = require('./logging.js')

process.on('time', name => {
  if (timers[name]) {
    throw new Error('conflicting timer! ' + name)
  }
  timers[name] = process.hrtime()
})

process.on('timeEnd', name => {
  if (!timers[name]) {
    throw new Error('timer not started! ' + name)
  }
  const res = process.hrtime(timers[name])
  delete timers[name]
  const msg = format(`${name}`, res[0] * 1e3 + res[1] / 1e6)
  if (options.timers !== false) {
    log.info('timeEnd', msg)
  }
})

process.on('exit', () => {
  for (const name of Object.keys(timers)) {
    log.error('timeError', 'Dangling timer:', name)
    process.exitCode = 1
  }
})
