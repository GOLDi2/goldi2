async function test1 () {
    return new Promise(resolve => {
        setTimeout(async() => {
            console.log(1)
            await tester();
            resolve();
        }, 1000);
    })
}

function tester() {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('test');
            resolve();
        }, 1000);
    })
}

async function test2 () {
    console.log(2)
}

let obj = {
    'string' : 'text',
    'string2' : 'text2',
    'string3' : 'text3'
}

for(item in obj) {
    console.log(item);
}
if (obj.hasOwnProperty('string') ){
    console.log('yo');
}