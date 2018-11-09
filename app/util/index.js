const {getSource, sendStaticSource} = require('./static-source.js')
const warn = require('./warn.js')
const clearComment = require('./clear-comment.js')

// console.log(getSource, sendStaticSource)
const res = {
    getSource,
    sendStaticSource,
    warn,
    clearComment
}


module.exports = res