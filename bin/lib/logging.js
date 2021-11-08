const options = require('./options.js')
const { quiet = false, logfile = null, path } = options
const { loglevel = quiet ? 'warn' : 'silly' } = options
const log = require('proc-log')
const fsm = require('fs-minipass')
const { resolve } = require('path')
const os = require('os')
const { inspect, format } = require('util')

const levels = [
  'silly',
  'verbose',
  'info',
  'timing',
  'http',
  'notice',
  'warn',
  'error',
  'silent',
]

const levelMap = new Map(levels.reduce((set, level, index) => {
  set.push([level, index], [index, level])
  return set
}, []))

if (loglevel !== 'silent') {
  const colors = process.stderr.isTTY
  const magenta = colors ? msg => `\x1B[35m${msg}\x1B[39m` : m => m
  const dim = colors ? msg => `\x1B[2m${msg}\x1B[22m` : m => m
  const red = colors ? msg => `\x1B[31m${msg}\x1B[39m` : m => m

  process.on('log', (level, ...args) => {
    if (levelMap.get(level) < levelMap.get(loglevel)) {
      return
    }
    const pref = `${process.pid} ${magenta(level)} `
    if (level === 'warn' && args[0] === 'ERESOLVE') {
      args[2] = inspect(args[2], { depth: 10, colors })
    } else if (level === 'info' && args[0] === 'timeEnd') {
      args[1] = dim(args[1])
    } else if (level === 'error' && args[0] === 'timeError') {
      args[1] = red(args[1])
    } else {
      args = args.map(a => {
        return typeof a === 'string' ? a
          : inspect(a, { depth: 10, colors })
      })
    }
    const msg = pref + format(...args).trim().split('\n').join(`\n${pref}`)
    console.error(msg)
  })
}

if (logfile) {
  const logfileName = resolve(path, typeof logfile === 'string' ? logfile : Date.now() + '.log')
  const logStream = new fsm.WriteStreamSync(logfileName, { flags: 'a' })

  process.on('log', (level, ...args) => {
    const pref = `${process.pid} ${level} `
    if (level === 'warn' && args[0] === 'ERESOLVE') {
      args[2] = inspect(args[2], { depth: 10 })
    } else {
      args = args.map(a => {
        return typeof a === 'string' ? a
          : inspect(a, { depth: 10 })
      })
    }
    const msg = pref +
      format(...args).trim().split('\n').join(`${os.EOL}${pref}`) +
      os.EOL
    logStream.write(msg)
  })
}

module.exports = log
