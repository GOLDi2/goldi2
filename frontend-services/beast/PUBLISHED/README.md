## BEAST - Blockdiagram Editing And Simulating Tool

### Fork of simcir.js

BEAST was forked from simcir.js on 25-04-2017
at commit b388cc287c63eb4e2bdf41e1e22b5b5bb9973381 .
The original repositiory is available under:
https://github.com/kazuhikoarase/simcirjs
The old README.txt is included as README_SIMCIR.txt

Most of the old simcir codebase will be located in 
`js/simcir` and refactored as needed.

For copyright information, consult the LICENSE file.

### Setting up the project with node and npm

run:

    npm install

###  Building the Documentation
run:

    npm start

### Building the Documentation without npm

A typedoc installation is required. If typedoc is installed, run:

    typedoc --theme default --name BEAST --target ES6 --mode file --out /dist/docs/ .


### Developed by:

Maximilian Engelhardt

Jonas Knüpper

Markus Seeber

Dario Götze

Dorian Müller

Paul Lindner

Alexander Zenkner

Niels Andrä

Based on the implementation of simcir.js by Kazuhiko Arase
