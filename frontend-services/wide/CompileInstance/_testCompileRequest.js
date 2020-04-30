const http = require('http');

// modified version of: https://nodejs.org/api/http.html#http_http_get_url_options_callback
// and: https://nodejs.dev/making-http-requests-with-nodejs

let data = JSON.stringify({
    files: {
        "1.cpp" : "test text",
        "2.cpp" : "zweiter test text" 
    },
    parameters: "testParam",
    templates: "none",
    language: "test",
    id: 0
});

let options = {
    hostname: 'localhost',
    port: 3000,
    path: '/compile',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Language' : 'test',
        'Type' : 'compRequest' //TODO remove later when testing is done and actual routing is implemented
    }
};

const req = http.request(options, (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
            `Status Code: ${statusCode}`);
    } 
    if (error) {
        console.error(error.message);
        // Consume response data to free up memory
        res.resume();
        return;
    }

    let rawData = '';
    res.on('data', (chunk) => {
        console.log('DATA: ' + chunk.toString());
        rawData += chunk;
    })
    // res.on('end', () => {
    //     try {
    //         console.log(rawData.toString());
    //     } catch (e) {
    //         console.error(e.message);
    //     }
    // });
});

req.on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});

req.end(data);