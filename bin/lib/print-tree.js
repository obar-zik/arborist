const { inspect } = require('util')
const { quiet } = require('./options.js')
const log = require('./logging.js')

module.exports = quiet ? () => {}
  : tree => log.info(inspect(tree.toJSON(), { depth: Infinity }))
