var express = require('express');
var router = express.Router();
let http = require('http');

/** POST COMPILE REQUEST
 * PIPES THE REQUEST TO THE COMPILE INSTANCE
 */
router.post('/', function(req, res, next){
    const options = {
        hostname: 'localhost',
        port: 1338,
        path: '/compile',
        method: 'POST',
        headers: req.headers
    };
    const compreq = http.request(options, (compres) => {
        console.log(`statusCode: ${compres.statusCode}`)
        compres.pipe(res);
    });
    compreq.on('error', (error) => {
        console.error(error)
    })
    // console.log(req.body);
    compreq.write(JSON.stringify(req.body))
    compreq.end()
});

router.get('/', function(req, res, next){
    res.write('test');
    res.write('test2');
    res.end();
});

module.exports = router;