const Arborist = require('../')

const print = require('./lib/print-tree.js')
const options = require('./lib/options.js')
const log = require('./lib/logging.js')
require('./lib/timers.js')

const start = process.hrtime()
module.exports = new Arborist(options).loadVirtual().then(tree => {
  const end = process.hrtime(start)
  if (!options.quiet) {
    print(tree)
  }
  if (options.save) {
    tree.meta.save()
  }
  const output = `read ${tree.inventory.size} deps in ${end[0] * 1000 + end[1] / 1e6}ms`
  log.info(output)
  return output
}).catch(er => {
  log.error(er)
  throw er
})
