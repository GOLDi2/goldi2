async function compile (task) {
    task.resStream.write('Task arrived at Languagemodule.js');
    return new Promise(resolve => {

    })
}
module.exports = compile;

