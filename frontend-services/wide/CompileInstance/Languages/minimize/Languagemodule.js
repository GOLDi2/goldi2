module.exports.compile = async function(task) {
    const { language, content, parameters, resHandler, upload } = task;

    return new Promise(resolve => {
        //implementation for compiler

    }).catch((error) => {
        resHandler.error(error);
    })
}

module.exports.getVersion = function () {
    let version;

    return version;
}

module.exports.isAvailableOnHost = function() {
    let isAvailable = Boolean;

    return isAvailable;
}