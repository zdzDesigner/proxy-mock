const {getSource, sendStaticSource} = require('./static-source.js')
const warn = require('./warn.js')

// console.log(getSource, sendStaticSource)
module.exports = {
    getSource,
    sendStaticSource,
    warn
}