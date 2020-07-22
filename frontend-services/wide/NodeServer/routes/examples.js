let fs = require('fs');
let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let path = require('path');

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res) {
    res.end();
});

router.post('/', function (req, res) {
    let examplepath = path.join(__dirname, '../../WIDE_OLD/WIDE/examples/');
    let response = [];
    if(req.body.PSPUType === "all"){
        let pspus = fs.readdirSync(examplepath);
        let languages = ['C','LogIC','VHDL','Arduino'];
        pspus = pspus.filter((pspu) => pspu !== ".DS_Store");
        pspus.forEach((pspu) => {
            languages.forEach((language) => {
                let files = fs.readdirSync(examplepath + pspu + '/' + language + '/');
                response = response.concat(files.map((file) => {
                    return ({name: file, PSPUType: pspu, language: language});
                }));
            });
        });
    } else {
        let files = [];
        let filenames = [];
        req.body.languages.forEach((language) => {
            filenames = fs.readdirSync(examplepath + req.body.PSPUType + '/' + language.name + '/');
            filenames.forEach((filename) => {
                files = files.concat({name: filename, language: language.name});
            });
        });
        response = response.concat(files.map((file) => {
            return ({name: file.name, PSPUType: req.body.PSPUType, language: file.language});
        }));
    }
    res.send(response);
    res.end();
});

module.exports = router;
