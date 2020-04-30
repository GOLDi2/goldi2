async function compile (task,cb) {
    task.resStream.write('Task arrived at Languagemodule.js (test)');
    return new Promise(resolve => {
        let interv = setInterval(() => {
            task.Qvalue -= 1;
            console.log('still working. task id: ' + task.id);
            task.resStream.write('working on your task, remaining Qvalue: ' + task.Qvalue);
        }, 1000);
        setTimeout(() => {
            console.log('finished in test/Languageclient.js');
            clearInterval(interv);
            cb();
            resolve;
        }, task.Qvalue * 1000);
    })
}
module.exports = compile;
