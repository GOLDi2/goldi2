var fs = require('fs')
var path = require('path');

module.exports = {
    saveTemp: function (req, res, next) {

        //fetch session id
        //var id = req.body.sid
        //var tmpDirName = 'tmp_' + req.body.sid

        //create tmp Dir.
        fs.mkdir('tmp', function (err) {
            if (err) {
                if (err.code === 'EEXIST') {

                    console.log('tmp Dir already exists');
                } else {
                    next(err)
                }
            }
        });

        //create file to tmp Dir
        for (var i = 0; i < req.body.files.length; i++) {
            var path = 'tmp/' + req.body.files[i].name;
            console.log(path);

            fs.writeFile('tmp/' + req.body.files[i].name, req.body.files[i].content, function (err) {
                if (err) {
                    console.log(err)
                }
            })
        }

        next()
    }
};