const Shrinkwrap = require('../lib/shrinkwrap.js')
const options = require('./lib/options.js')
const log = require('./lib/logging.js')
require('./lib/timers.js')

module.exports = Shrinkwrap.load(options)
  .then(s => {
    const output = JSON.stringify(s.commit(), 0, 2)
    log.info(output)
    return output
  })
  .catch(er => {
    log.error('shrinkwrap load failure', er)
    throw er
  })
