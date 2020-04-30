async function compile (task) {
    task.resStream.write('Task arrived at Languagemodule.js (test)');
    return new Promise(resolve => {
        let interv = setInterval(() => {
            task.estimate -= 1;
            console.log('still working. task id: ' + task.id);
        }, 1000);
        setTimeout(() => {
            console.log('finished in test/Languageclient.js');
            clearInterval(interv);
            resolve();
        }, task.estimate * 1000);
    }).catch((error) => {
        task.resStream.sendStdout(error);
    })
}
module.exports = compile;
