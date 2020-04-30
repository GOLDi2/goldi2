const http = require('http');

let req = http.get('http://localhost:3000/availableLanguages/', (res) => {
    res.on('data', (data) => {
        console.log(data.toString());
    })
    res.on('end', (data) => {
        console.log('end');
    })
})

let req2 = http.get('http://localhost:3000/currentLoad/', (res) => {
    res.on('data', (data) => {
        console.log(data.toString());
    })
    res.on('end', (data) => {
        console.log('end');
    })
})