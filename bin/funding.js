const options = require('./lib/options.js')
const log = require('./lib/logging.js')
require('./lib/timers.js')

const Arborist = require('../')
const a = new Arborist(options)
const query = options._.shift()
const start = process.hrtime()
module.exports = a.loadVirtual().then(tree => {
  // only load the actual tree if the virtual one doesn't have modern metadata
  if (!tree.meta || !(tree.meta.originalLockfileVersion >= 2)) {
    log.error('old metadata, load actual')
    throw 'load actual'
  } else {
    log.error('meta ok, return virtual tree')
    return tree
  }
}).catch(() => a.loadActual()).then(tree => {
  const end = process.hrtime(start)
  if (!query) {
    for (const node of tree.inventory.values()) {
      if (node.package.funding) {
        log.info(node.name, node.location, node.package.funding)
      }
    }
  } else {
    for (const node of tree.inventory.query('name', query)) {
      if (node.package.funding) {
        log.info(node.name, node.location, node.package.funding)
      }
    }
  }
  const msg = `read ${tree.inventory.size} deps in ${end[0] * 1000 + end[1] / 1e6}ms`
  log.info(msg)
  return msg
}).catch(er => {
  log.error(er)
  throw er
})
