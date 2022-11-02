const uuidv4 = require('uuid/v4');
const express = require('express');
const router = express.Router();
const runningProcesses = require('../public/WebCompile/runningProcesses');


router.use(express.json({limit: '100mb'})); //TODO Confirm usage of middleware

// parse application/x-www-form-urlencoded
router.use(express.urlencoded({limit: '100mb', extended: true}));  //TODO Confirm usage of middleware

/* GET home page. */
router.get('/', function (req, res) {
    res.end();
});

router.post('/', function (req, res) {
    if (req.body.sessionId === "") {
        req.body.sessionId = uuidv4();
    }
    runningProcesses.removeProcess(req.body.sessionId);
    res.send({sessionId:  req.body.sessionId});
});
module.exports = router;