let fs = require('fs');
let express = require('express');
let router = express.Router();
let bodyParser = require('body-parser');
let path = require('path');
const fsextra = require('fs-extra');
const exec = require('child_process').exec;

let supportedBoards;
let arduinoPath = path.join(__dirname, '../makefiles/arduino-cli/');

/**
 * gets a list of all installed boards and saves them in supportedBoards as a JSON object
 */
function getBoards() {
    exec("./arduino-cli board listall --format json", {cwd: arduinoPath} , function (error, stdout, stderr) {
        if (error) {
            throw (stderr);
        } else {
            supportedBoards = JSON.parse(stdout)["boards"];
            supportedBoards.forEach((board) => {
                getBoardOptions(board.fqbn);
            });
        }
    });
}

/**
 * gets the option for the given board
 * @param fqbn - the fully qualified board name
 */
function getBoardOptions(fqbn) {
    exec("./arduino-cli board details -b " + fqbn + " --format json", {cwd: arduinoPath} , function (error, stdout, stderr) {
        if (error) {
            throw (stderr);
        } else {
            let config_options = JSON.parse(stdout)["config_options"];
            if (config_options !== undefined) {
                config_options.forEach((config_option) => {
                    config_option.values.forEach((value) => {
                        delete value.selected;
                    });
                });
                supportedBoards.find((board) => board.fqbn === fqbn).config_options = config_options;
            }
        }
    });
}

/**
 * updates the index of the arduino-cli
 */
function updateIndex() {
    exec("./arduino-cli core update-index", {cwd: arduinoPath} , function (error, stdout, stderr) {
        if (error) {
            throw (stderr);
        } else {
            copyGOLDi();
        }
    });
}

/**
 * copies the goldi folder to its correct position inside the arduino-cli data folder
 */
function copyGOLDi() {
    fsextra.copySync(path.join(arduinoPath, "goldi"), path.join(arduinoPath, "data/packages/goldi"));
    getBoards();
}

/**
 * check if arduino-cli has already been initialized if so get the installed boards and if not initialize arduino-cli
 */
if (fs.existsSync(path.join(arduinoPath, "arduino-cli.yaml"))) {
    getBoards();
} else {
    let config_template = fs.readFileSync(path.join(arduinoPath, "arduino-cli-template.yaml"), "utf8");
    let config_content = config_template.replace(/placeholder-/g, arduinoPath);
    fs.writeFileSync(path.join(arduinoPath, "arduino-cli.yaml"), config_content);
    updateIndex();
}

// parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
router.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res) {
    res.end();
});

router.post('/', function (req, res) {
    res.send(supportedBoards);
    res.end();
});

module.exports = {
    router: router
};