/**
 * Language never "ends" the response!
 * cancel compiling if task.on('connectionEnded') triggers, call reject at the end
 */

module.exports.compile = async function(task) {
    const { language, content, parameters, resHandler, upload, _estimate } = task;
    console.log('task arrived at languagemodule')
    resHandler.stdout('Task arrived at Languagemodule.js (test)');
    return new Promise((resolve, reject) => {
        task.on('connectionEnded', () => {
            // abort compilation here
            clearInterval(interv);
            clearTimeout(timeout);
            reject('compilation got aborted');
        });
        task.removeFromQueue();
        //just for testing purposes
        let interv = setInterval(() => {
            console.log("working on a task, id: " + task._id)
            resHandler.setEstimate(task.getEstimate() - 1);
        }, 1000);
        let timeout = setTimeout(() => {
            console.log('finished in test/Languageclient.js');
            clearInterval(interv);
            // resHandler.end('done');
            resolve();
        }, _estimate * 1000);

    }).catch(function(error) {
        console.log(error);
        resHandler.error(error);
    })
}

module.exports.getVersion = function () {
    let version = Number;
    version = 0.1;
    return version;
}

module.exports.isAvailableOnHost = function() {
    let isAvailable = Boolean;
    isAvailable = true;
    return isAvailable;
}