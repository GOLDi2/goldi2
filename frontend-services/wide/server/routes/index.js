var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res) {
    res.end();
});

router.post('/', function (req, res) {
    console.log(req.body);
    res.end();
})

module.exports = router;
