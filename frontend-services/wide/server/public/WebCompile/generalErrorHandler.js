var fs = require('fs')
var path = require('path')

module.exports = {
    errorHandler: function (err, req, res, next) {
        res.status(500)
        res.send({error: err})
    }
}