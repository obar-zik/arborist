const Arborist = require('../')

const print = require('./lib/print-tree.js')
const options = require('./lib/options.js')
require('./lib/timers.js')
const log = require('./lib/logging.js')

const Vuln = require('../lib/vuln.js')
const printReport = report => {
  for (const vuln of report.values()) {
    log.info(printVuln(vuln))
  }
  if (report.topVulns.size) {
    log.info('\n# top-level vulnerabilities')
    for (const vuln of report.topVulns.values()) {
      log.info(printVuln(vuln))
    }
  }
}

const printVuln = vuln => {
  return {
    __proto__: { constructor: Vuln },
    name: vuln.name,
    issues: [...vuln.advisories].map(a => printAdvisory(a)),
    range: vuln.simpleRange,
    nodes: [...vuln.nodes].map(node => `${node.name} ${node.location || '#ROOT'}`),
    ...(vuln.topNodes.size === 0 ? {} : {
      topNodes: [...vuln.topNodes].map(node => `${node.location || '#ROOT'}`),
    }),
  }
}

const printAdvisory = a => `${a.title}${a.url ? ' ' + a.url : ''}`

const start = process.hrtime()
process.emit('time', 'audit script')
const arb = new Arborist(options)
module.exports = arb.audit(options).then(async tree => {
  process.emit('timeEnd', 'audit script')
  const end = process.hrtime(start)
  if (options.fix) {
    print(tree)
  }
  if (!options.quiet) {
    printReport(arb.auditReport)
  }
  let msg
  if (options.fix) {
    msg = `resolved ${tree.inventory.size} deps in ${end[0] + end[1] / 1e9}s`
    log.info(msg)
  }
  if (tree.meta && options.save) {
    await tree.meta.save()
  }
  return msg
}).catch(er => {
  log.error(er)
  throw er
})
