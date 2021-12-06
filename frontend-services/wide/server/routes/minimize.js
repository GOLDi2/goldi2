let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
const elws = require('../public/WebCompile/elws');

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res) {
    res.end();
});

router.post('/', function (req, res) {
    elws.minimizeEquation(req, res);
});

module.exports = router;
