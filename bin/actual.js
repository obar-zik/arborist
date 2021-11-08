const Arborist = require('../')
const print = require('./lib/print-tree.js')
const options = require('./lib/options.js')
const log = require('./lib/logging.js')
require('./lib/timers.js')

const start = process.hrtime()
module.exports = new Arborist(options).loadActual(options).then(async tree => {
  const end = process.hrtime(start)
  if (!process.argv.includes('--quiet')) {
    print(tree)
  }

  const output = `read ${tree.inventory.size} deps in ${end[0] * 1000 + end[1] / 1e6}ms`

  if (options.save) {
    await tree.meta.save()
  }
  if (options.saveHidden) {
    tree.meta.hiddenLockfile = true
    tree.meta.filename = options.path + '/node_modules/.package-lock.json'
    await tree.meta.save()
  }

  return output
}).catch(er => {
  log.error(er)
  throw er
})
