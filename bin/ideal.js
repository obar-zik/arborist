const Arborist = require('../')

const { inspect } = require('util')
const options = require('./lib/options.js')
const print = require('./lib/print-tree.js')
const log = require('./lib/logging.js')
require('./lib/timers.js')

const start = process.hrtime()
module.exports = new Arborist(options).buildIdealTree(options).then(async tree => {
  const end = process.hrtime(start)
  print(tree)
  const output = `resolved ${tree.inventory.size} deps in ${end[0] + end[1] / 10e9}s`
  log.info(output)
  if (tree.meta && options.save) {
    await tree.meta.save()
  }
  return output
}).catch(er => {
  const opt = { depth: Infinity, color: true }
  log.error(er.code === 'ERESOLVE' ? inspect(er, opt) : er)
  throw er
})
