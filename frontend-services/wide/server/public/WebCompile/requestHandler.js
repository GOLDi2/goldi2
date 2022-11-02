var util = require('util');


module.exports = {
    print : function(req, res, next){
        console.log(req.body);
        next();
    },
    elwsReqParser : function(req, res, next){
        req.body.makefile = 'elws';
        next();
    },
    elwsFileParser : function(req, res, next){
        for(var i = 0; i < req.body.files.length; i++){
            if(req.body.files[i].name.slice(-2) === '.c'){
                var str = req.body.files[i].name;
                req.body.files[i].name = str.substring(0, str.length-2) + '.elws';
            }
        }
        next();
    }
}