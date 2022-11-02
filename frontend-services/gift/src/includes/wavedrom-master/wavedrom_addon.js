/**
 *  requires wavedrom module
 * TODO:
 * choice of inital state --> still in init function with state zero
 * possibility to add more vectors
 *
 */

/**
* Contains functions for Simulationprocess.
* @author Lennart Planz
* @module Simulator
*
*/

/**
 *  expand the WaveDrom Script to use the waveforms interactive.
 *
 *  @Class Simulator
 */

var forwardbtn;
var Simulator = (function () {
    'use strict';
    var inputNumber, outputNumber, stateNumber, andOP, orOP, notOP, returnWithNames, stateBits,backupedMachine, machineCounter, currentMachine;
    var inputNames = [];
    var outputNames = [];
    var xNames = [];
    var yNames = [];
    var zNames = [];
    var xString = [];   //every array-item is a single bit
    var xArray = [];    //every array-item is a complete Waveform
    var yString = [];
    var yArray = [];
    var zString = [];
    var zArray = [];
    var xArrayLoaded = [];
    var yArrayLoaded = [];
    var zArrayLoaded = [];
    var yEquations = [];
    var zEquations = [];
    var stateString = "";
    var scale;
    var counter;        //stores the current position
    var i, j, k;

    var getStates = function(){
        var array = [];
        var bin, i, j, k;
        var nextStateBin = [];
        if(counter == undefined){
            return [undefined,undefined];
        }
        createNames(false);
        bin = getZValues(counter);
        bin = parseInt(bin.join(""),2);
        array[0] = bin;
        var xOldInputs = getXValues(counter);
        var zOldInputs = getZValues(counter);
        var boolean = false;
        for(i = 0; i < zEquations.length; i++) {
            var x = Logic.evaluateExpression(zEquations[i]);
            var inputCalculate = [];
            for (j = 0; j < xNames.length; j++){
                if(xOldInputs[j] === "x"){
                    boolean = true;
                }
                inputCalculate[j] = xNames[j] + ":" + xOldInputs[j];
            }
            for (k = 0 ; k < zNames.length ; j++, k++){
                if(zOldInputs[k] === "x"){
                    boolean = true;
                }
                inputCalculate[j] = zNames[k] + ":" + zOldInputs[k];
            }
            if(boolean === false) {
                nextStateBin[i] = Number(x.computearray(inputCalculate));
            }
        }
        if(nextStateBin.length === 0){
            array[1] = undefined;
        }
        else{
            array[1] = parseInt(nextStateBin.reverse().join(""),2);
        }
        return array;
    };

    var createParallelNames = function(){
        var i, j;
        var k = xNames.length;
        for(i = 0; i <= machineCounter; i++){
            var thisMachine = machine.GiftState.getMachine(i);
            var machinezcount = thisMachine.StateBits;
            if(i != currentMachine){
                for (j = 0; j < machinezcount; j++){
                    xNames[k] = "a" + i + "z" + j;
                    k++;
                }
            }
        }
    };

    var createNames = function (returnWithNames) {
        var index;
        xNames.length = 0;
        for (i = 0; i < inputNumber; i++){
            xNames[i] = "x" + i;
        }
        yNames.length = 0;
        for (i = 0; i < outputNumber; i++){
            yNames[i] = "y" + i;
        }
        if(returnWithNames) {
            for (k = 0; k < inputNames.length; k++) {
                i = inputNames[k].search("x");
                i = inputNames[k].slice(i + 1, i + 2);
                index = inputNames[k].search(":");
                xNames[i] = inputNames[k].slice(index + 1);
            }
            for (k = 0; k < outputNames.length; k++) {
                i = outputNames[k].search("y");
                i = outputNames[k].slice(i + 1, i + 2);
                index = outputNames[k].search(":");
                yNames[i] = outputNames[k].slice(index + 1);
            }
        }
        zNames.length = 0;
        for (i = 0; i < stateBits; i++){
            zNames[i] = "z" + i;
        }
        createParallelNames();
        zNames.reverse();
    };
    /**
     * Checks if the input is an array or not.
     * @method isArray
     * @param {array} myArray
     * @returns {boolean}
     */
    var isArray = function(myArray) {
        return myArray.constructor.toString().indexOf("Array") > -1;
    };

    /**
     * Replaces every "." with the correspond "h" or "l" in an Array <br>
     * Supports one- and two-dimensional Arrays
     * @method replacePointsWithLetter
     * @param {array} myArray
     * @returns {array} myArray
     * @example
     *      ["h", ".", ".", "l", ".", "h", "."] -> ["h", "h", "h", "l", "l", "h", "h"]
     */
    var replacePointsWithLetter = function (myArray){
        var firstLength, secondLength, j;
        if(isArray(myArray)){
            firstLength = myArray.length-1;
        }
        else{
            throw new Error("Parameter " + myArray + " is not an Array!");
        }
        for (j = 0; j <= firstLength; j++) {
            if(isArray(myArray[j])){
                secondLength = myArray[j].length-1;
                for (k = 0; k <= secondLength; k++) {    //replace every "." with the correspond "h" or "l"
                    if (myArray[j][k] === '.') {
                        myArray[j][k] = myArray[j][k - 1];
                    }
                }
            }
            else{
                if (myArray[j] === '.') {
                    myArray[j] = myArray[j - 1];
                }
            }
        }
        return myArray;
    };

    /**
     * Replaces multiple "h" or "l" with "." in an Array <br>
     * Supports one- and two-dimensional Array
     * @method replaceLetterWithPoints
     * @param {array} myArray
     * @returns {array} myArray
     * @example
     *      ["h", "h", "h", "l", "l", "h", "h"] -> ["h", ".", ".", "l", ".", "h", "."]
     */
    var replaceLetterWithPoints = function (myArray){
        var firstLength, secondLength;
        if(isArray(myArray)){
            firstLength = myArray.length-1;
        }
        else{
            throw new Error("Parameter " + myArray + " is not an Array!");
        }
        for (j = firstLength; j >= 0; j--) {
            if(isArray(myArray[j])){
                secondLength = myArray[j].length-1;
                for (k = secondLength; k >= 0; k--) {    //replace every "." with the correspond "h" or "l"
                    if (myArray[j][k] === ',') {
                        continue;
                    }
                    else if (myArray[j][k] === myArray[j][k - 1]) {
                        myArray[j][k] = '.';
                    }
                }
            }
            else{
                if (myArray[j] === ',') {
                    continue;
                }
                else if (myArray[j] === myArray[j - 1]) {
                    myArray[j] = '.';
                }
            }
        }
        return myArray;
    };

    /**
     * Replace 0/1 to "h"/"l" <br>
     * Supports one- and two-dimensional Arrays <br>
     * executes {{#crossLink "Simulator/replacePointsWithLetter:method"}}replacePointsWithLetter{{/crossLink}} at beginning
     * @method parseToLetter
     * @param {array} myArray
     * @returns {array} myArray
     */
    var parseToLetter = function(myArray){
        replacePointsWithLetter(myArray);
        var firstLength, secondLength;
        if(isArray(myArray)){
            firstLength = myArray.length-1;
        }
        else{
            throw new Error("Parameter " + myArray + " is not an Array!");
        }
        for (j = firstLength; j >= 0; j--) {
            if(isArray(myArray[j])){
                secondLength = myArray[j].length-1;
                for (k = secondLength; k >= 0; k--) {    //replace every "." with the correspond "h" or "l"
                    if (myArray[j][k] === 0) {
                        myArray[j][k] = "l";
                    }
                    else if (myArray[j][k] === 1) {
                        myArray[j][k] = "h";
                    }
                }
            }
            else{
                if (myArray[j] === 0) {
                    myArray[j] = "l";
                }
                else if (myArray[j] === 1) {
                    myArray[j] = "h";
                }
            }
        }
        return myArray;
    };

    /**
     * Replace "h"/"l" to 0/1 <br>
     * Supports one- and two-dimensional Arrays <br>
     * executes {{#crossLink "Simulator/replacePointsWithLetter:method"}}replacePointsWithLetter{{/crossLink}} at beginning
     * @method parseToNumber
     * @param {array} myArray
     * @returns {array} myArray
     */
    var parseToNumber = function(myArray){
        replacePointsWithLetter(myArray);
        var firstLength, secondLength;
        if(isArray(myArray)){
            firstLength = myArray.length-1;
        }
        else{
            throw new Error("Parameter " + myArray + " is not an Array!");
        }
        for (j = firstLength; j >= 0; j--) {
            if(isArray(myArray[j])){
                secondLength = myArray[j].length-1;
                for (k = secondLength; k >= 0; k--) {    //replace every "." with the correspond "h" or "l"
                    if (myArray[j][k] === "l") {
                        myArray[j][k] = 0;
                    }
                    else if (myArray[j][k] === "h") {
                        myArray[j][k] = 1;
                    }
                }
            }
            else{
                if (myArray[j] === "l") {
                    myArray[j] = 0;
                }
                else if (myArray[j] === "h") {
                    myArray[j] = 1;
                }
            }
        }
        return myArray;
    };

    /**
     * Convert the content from xArray/yArray/zArray and displays it in WaveDrom. <br>
     * Executes <code>WaveDrom.EditorRefresh()</code> at the end.
     * @method update
     */
    var update = function (){
        /**
         * Converts Name-Array and Data-Array into WaveDrom-compatible script.
         * Writes WaveDrom-compatible script into <code>data</code>
         * Join Data-Array into Data-String
         * @method fillDataString
         * @param {array} Data-Array
         * @param {string} Data-String
         * @param {array} Name-Array
         * @returns {string} Data-String
         */
        var fillDataString = function(myArray, myString, myNames){
            for (i = 0; i < myArray.length; i++) {
                myString[i] = myArray[i].join("");
                line[i] = '{ name: "' + myNames[i] + '", wave: "' + myString[i] + '" }, \n ';
                data = data + line[i];
            }
            return myString;
        };

        /**
         * Converts State-Data-Array into WaveDrom-compatible script.
         * Writes WaveDrom-compatible script into <code>data</code>g
         * @method fillStateString
         * @param {array} Data-Array
         * @param {string} Data-String
         * @param {array} Name-Array
         * @returns {string} Data-String
         */
        var fillStateString = function(zArray, myString){
            var tempState, i, j;
            var tempStates = "";
            var temp;
            var wave = "";
            for (i = 0; i < zArray[0].length; i++) {
                temp = "";
                tempState = createVector(zArray,i);
                tempState = tempState.join("");
                if(tempState.search("x") > -1) {
                    tempState = "x";
                }
                else{
                    tempState = parseInt(tempState, 2);
                    tempState += "";
                    tempState = tempState.split("");
                    for(j = 0; j < tempState.length; j++){
                        temp +=  "\\u208" + tempState[j];
                    }
                    //tempState = temp;
                    //Tiefer Stellen der Zahlen nach Z (funktioniert nicht in mobiler Version)
                }
                tempStates += "Z" + tempState + " ";
                wave += "3";
            }
            stateString = '{ name: "Z\u2093" , wave: "' + wave + '" , data: "' + tempStates + '" }, \n' ;
            data += stateString;
            replaceLetterWithPoints(zArray);
            return myString
        };

        var fillClockString = function(){
            var clockStringData = "";
            var clockStringPraefix = '{name: "clk  " , wave: "' ;
            for (i = 0; i < zArray[0].length; i++){
                clockStringData += "P";
            }
            var clockString = clockStringPraefix + clockStringData + '" }, \n ';
            data += clockString;
        }

        var tempScrollTop = $(window).scrollTop();
        var praefix = "{ signal : [ \n ";   //praefix for the WaveDrom script
        var suffix = " ]}";                 //suffix for the WaveDrom script
        var line = [];                      //stores a line of the WaveDrom script --> every Waveform is one line
        var data;                           //stores the complete script
        var xDisplayNames = new Array(inputNumber);
        var yDisplayNames = new Array(outputNumber);


        for (var m = 0; m < xNames.length; m++) {
            if (inputNames[m] == undefined) {
                xDisplayNames[m] = xNames[m];
            } else {
                xDisplayNames[m] = inputNames[m].substring(3);
            }
        }
        for (var m = 0; m < outputNumber; m++) {
            if (outputNames[m] == undefined) {
                yDisplayNames[m] = yNames[m];
            } else {
                yDisplayNames[m] = outputNames[m].substring(3);
            }
        }

        data = praefix;
        xArray = parseToLetter(xArray);
        xArray = replaceLetterWithPoints(xArray);
        yArray = parseToLetter(yArray);
        yArray = replaceLetterWithPoints(yArray);
        zArray = parseToLetter(zArray);
        zArray = replaceLetterWithPoints(zArray);
        //fills the data string with the line/waveform informations
        fillClockString();
        data = data + "{}, \n";
        xString = fillDataString(xArray, xString, xDisplayNames);
        data = data + "{}, \n"; //insert a blank line
        yString = fillDataString(yArray, yString, yDisplayNames);
        data = data + "{}, \n";
        stateString = fillStateString(zArray,stateString);
        zString = fillDataString(zArray, zString, zNames);
        data = data + suffix;
        document.getElementById('InputJSON_0').innerHTML = data; //insert the script in the HTML-file
        WaveDrom.EditorRefresh();   //refresh the WaveDrom script
        setMarker(counter);
        $(window).scrollTop(tempScrollTop);
    };

    /**
     * Initialize xArray/yArray/zArray with ","(undefined) [length = 10] <br>
     * Executes {{#crossLink "Simulator/update:method"}}update(){{/crossLink}} at the end.
     * @method init
     */
    var createScript = function (){
        var divContainer = document.getElementById("L_Simulation");

        var container = document.createElement("div");
        container.style.background = "#495766";
        container.className = "container mobileContainer";

        var script = document.createElement("script");
        script.innerHTML = "{ signal : [{},]}";
        script.type = "WaveDrom";

        var script2 = document.createElement("script");
        script2.innerHTML = "{ signal : [{},]}";
        script2.type = "WaveDrom";

        var panelDiv = document.createElement('div');
        panelDiv.className = "panel panel-default MachineTable";
        var panelBody = document.createElement('div');
        panelBody.className = "panel-body MachineTable";
        var panelHeader = document.createElement('div');
        panelHeader.className = "panel-heading MachineTable";
        var heading = document.createElement('h3');
        heading.className = "panel-title pull left";
        heading.innerHTML = "Simulation";
        var buttonGroup1 = document.createElement('div');
        buttonGroup1.className = "btn-group";
        buttonGroup1.style.paddingLeft = "10px";
        buttonGroup1.style.paddingRight = "10px";
        var buttonGroup2 = document.createElement('div');
        buttonGroup2.className = "btn-group";
        buttonGroup1.style.paddingLeft = "10px";
        buttonGroup1.style.paddingRight = "10px";
        forwardbtn = document.createElement("button");
        forwardbtn.className = "btn btn-default btn-s";
        forwardbtn.onclick = function(){step();}
        var runbtn = document.createElement("button");
        runbtn.className = "btn btn-default btn-s";
        runbtn.onclick = function(){run();}
        var resetbtn = document.createElement("button");
        resetbtn.className = "btn btn-default btn-s";
        resetbtn.onclick = function(){initLanes();}
        var forwardbtnGlyphicon = document.createElement('a');
        forwardbtnGlyphicon.className = "glyphicon glyphicon-forward MachineTable";
        var runbtnGlyphicon = document.createElement('a');
        runbtnGlyphicon.className = "glyphicon glyphicon-fast-forward MachineTable";
        var resetbtnGlyphicon = document.createElement('a');
        resetbtnGlyphicon.className = "glyphicon glyphicon-repeat MachineTable";

        var errorBox = document.createElement('div');
        errorBox.className = "alert fade in bg-danger";
        errorBox.id = "ErrorBox";
        errorBox.style.visibility = "hidden";
        var closeButton = document.createElement('button');
        closeButton.type = "button";
        closeButton.className = "close";
        closeButton.onclick = function () {
            document.getElementById("ErrorBox").style.visibility = "hidden";
        };
        var icon = document.createElement('a');
        icon.className = "glyphicon glyphicon-remove";
        closeButton.appendChild(icon);
        var errorParagraph = document.createElement('p');
        errorParagraph.id = "ErrorText";
        errorParagraph.style.color = "black";
        errorBox.appendChild(closeButton);
        errorBox.appendChild(errorParagraph);

        container.appendChild(panelDiv);
        panelDiv.appendChild(panelHeader);
        panelDiv.appendChild(panelBody);
        panelBody.appendChild(buttonGroup1);
        panelBody.appendChild(buttonGroup2);
        panelHeader.appendChild(heading);
        buttonGroup1.appendChild(forwardbtn);
        buttonGroup1.appendChild(runbtn);
        buttonGroup2.appendChild(resetbtn);
        forwardbtn.appendChild(forwardbtnGlyphicon);
        runbtn.appendChild(runbtnGlyphicon);
        resetbtn.appendChild(resetbtnGlyphicon);
        container.appendChild(script);
        container.appendChild(script2);
        container.appendChild(errorBox);
        if (divContainer.childNodes[0]) {
            divContainer.replaceChild(container, divContainer.childNodes[0]);
        } else {
            divContainer.appendChild(container);
        }
        scale = $(container).width();
        WaveDrom.ProcessAll();
    };
    var createObject = function (){
        var object = {
            xArray : xArray,
            yArray : yArray,
            zArray : zArray,
            zEquations : zEquations,
            yEquations : yEquations,
            counter : counter
        }
        return object;
    };
    var loadObject = function(object,machine){
        xArray = object.xArray;
        yArray = object.yArray;
        zArray = object.zArray;
        backupedMachine = machine;
        counter = object.counter;
    };
    var init = function (machine,ZEquations,YEquations) {
        var i;
        if(machine.ChangeStruct.SimFlops[0] === true) {
            inputNumber = machine.InputNumber;
            outputNumber = machine.OutputNumber;
            inputNames = machine.Inputnames;
            outputNames = machine.Outputnames;
            stateNumber = machine.StateNumber;
            andOP = machine.OperatorsList[0];
            orOP = machine.OperatorsList[1];
            notOP = machine.OperatorsList[2];
            returnWithNames = true;
            stateBits = machine.StateBits;
            machineCounter = giftInput.getHighestMachineNumber();
            currentMachine = machine.MachineNumber;
            createNames(returnWithNames);
            zEquations = ZEquations;
            yEquations = YEquations;

            createScript();
            var replacer = function(key, value) {
                if (key == "graphStorage" || key == "changed" || key == "changearray" || key == "returnWithNames") {
                    return undefined;
                }
                return value;
            };
            if(JSON.stringify(backupedMachine,replacer) ==  JSON.stringify(machine,replacer)){
                update();
            }
            else {
                initLanes();
                backupedMachine = machine;
            }
            machine.ChangeStruct.SimFlops[0] = false;

        }
    };
    /**
     * Fills an two-dimensonal array in the second dimension with 10 ",".
     * @method initFill
     * @param {array} Array
     * @param {array} Name-Array
     * @returns {array} Array
     */
    var initFill = function (myArray, myNames){
        var i,j;
        myArray.length = 0;
        for (i = 0; i < myNames.length; i++) {//fill every Waveform with "," --> undefined
            myArray[i] = [];
            myArray[i][0] = "l";
            for(j = 1; j < Math.ceil(scale/50)-1; j++){
                myArray[i][j] = ",";
            }
        }
        return myArray;
    };
    var initLanes = function(){
        xArray = initFill(xArray, xNames);
        yArray = initFill(yArray, yNames);
        zArray = initFill(zArray, zNames);
        counter = 0;
        update();
    };
    /**
     * Changes the 'bit' between 0 and 1 of the onclick-Element. <br>
     * Is the onclick event of the waveforms. <br>
     * It can change only the x/z-Waveforms. <br>
     * Executes {{#crossLink "Simulator/replacePointsWithLetter:method"}}replacePointsWithLetter{{/crossLink}} at the beginning.
     * @method click
     * @param {integer} Waveform-Element
     * @param {integer} Waveform
     * @param {integer} index
     */
    var click =function (i, j, index) {
        document.getElementById("ErrorBox").style.visibility = "hidden";
        if(i < 2*counter){
            return;
        }
        if(j < 2){
            return;
        }
        else if((xNames.length+2) < j && j < (xNames.length + yNames.length + 5)){
            return;
        }
        if ((i % 2) === 0) {        //each bit contains of two svg-objects
            i = i / 2;
        }
        else {
            i = (i - 1) / 2;
        }
        if(1 < j && j < (xNames.length+2) ) {
            j = j - 2;
            xArray[j] = replacePointsWithLetter(xArray[j]);
            if (xArray[j][i] === "h") {     // change the bit
                xArray[j][i] = "l";
            }
            else {
                xArray[j][i] = "h";
            }
        }
        else{
            j = j - xNames.length - yNames.length - 5;
            zArray[j] = replacePointsWithLetter(zArray[j]);
            if (zArray[j][i] === "h") {     // change the bit
                zArray[j][i] = "l";
            }
            else {
                zArray[j][i] = "h";
            }
        }
        if(counter >= i) {
            calculateY(i);
        }
        update();
    };

    /**
     * Performs the next step in the simulation. <br>
     * -Executes {{#crossLink "Simulator/setMarker:method"}}setMarker(0){{/crossLink}} if Simulation is at the end. <br>
     * -Executes {{#crossLink "Simulator/calculateZ:method"}}calculateZ{{/crossLink}} <br>
     * @method step
     */
    var step = function() {

        counter += 1;
        if(counter === zArray[0].length){
            addElement();
            calculateZ(counter);
        }
        else{
            calculateZ(counter);
        }



    };
    var run = function(){
        var i;
        while(counter < zArray[0].length-1){
            step();
        }
    };
    var addElement = function(){
        var i;
        var currentLength = zArray[0].length-1;
        for(i = 0; i < xArray.length; i++){
            xArray[i].push(xArray[i][currentLength]);
        }
        for(i = 0; i < yArray.length; i++){
            yArray[i].push(yArray[i][currentLength]);
        }
        for(i = 0; i < zArray.length; i++){
            zArray[i].push(zArray[i][currentLength]);
        }
        update();
    };
    /**
     * Sets the Marker on the specific position. <br>
     * If paramter is "hidden" the marker disappear.
     * @method setMarker
     * @param {integer/string} pos Position of the marker.
     */
    var setMarker = function(pos){
        if(!document.getElementById("gmark_marker")) {
            var svgns = 'http://www.w3.org/2000/svg';
            var gmark = document.getElementById("gmarks_0");
            var newMarker = document.createElementNS(svgns,'path');
            newMarker.id = "gmark_marker";
            newMarker.style.stroke = "#5E7389";
            newMarker.style.strokeWidth = "40px";
            gmark.appendChild(newMarker);
        }
        if (pos === "hidden"){
            document.getElementById("gmark_marker").style.visibility = "hidden";
        }
        else{
            document.getElementById("gmark_marker").style.visibility = "visible";
            document.getElementById("gmark_marker").setAttribute("d", "m " + ((pos * 40) + 40) + ",0 0, 10000");
        }
    };

    /**
     * Creates an Array which contains the states (0/1/x) from the current position.
     * @method createVector
     * @param {array} myArray Array to create the Vector
     * @param {integer} counter Current position
     * @returns {Array} Vector
     */
    var createVector = function (myArray, counter){
        var i;
        var myVector = [];
        for(i = 0; i < myArray.length; i++){
            myArray = replacePointsWithLetter(myArray);
            if(myArray[i][counter] === "h"){
                myVector[i] = "1";
            }
            else if (myArray[i][counter] === "l") {
                myVector[i] = "0";
            }
            else {
                myVector[i] = "x";
            }
        }
        return myVector;
    };

    /**
     * Executes {{#crossLink "Simulator/createVector:method"}}createVector{{/crossLink}} on the xArray.
     * @method getXValues
     * @param {integer} counter current Position
     * @returns {Array} Vector
     */
    var getXValues = function(counter){
        var xVector = createVector(xArray, counter);
        return xVector;
    };

    /**
     * Executes {{#crossLink "createVector:method"}}createVector{{/crossLink}} on the yArray.
     * @method getYValues
     * @param {integer} counter current Position
     * @returns {Array} Vector
     */
    var getYValues = function(counter){
        var yVector = createVector(yArray, counter);
        return yVector;
    };

    /**
     * Executes {{#crossLink "createVector:method"}}createVector{{/crossLink}} on the zArray. <br>
     * If it is the first step (counter = -1) the method return the initalState.
     * @method getZValues
     * @param {integer} counter current Position
     * @returns {Array} Vector
     */
    var getZValues = function(counter) {
        var zVector = [];
        zVector = createVector(zArray, counter);
        return zVector;
    };
    /**
     * Executes {{#crossLink "createVector:method"}}createVector{{/crossLink}} on the zArray. <br>
     * If it is the first step (counter = -1) the method return the initalState.
     * @method setXValues
     * @param {integer} counter current Position
     * @returns {Array} Vector
     */
    var setXValues = function(counter, xVector) {
        var i;
        var tempVector = [];
        for (i = 0; i < xVector.length; i++){
            if(xVector[i] == 1){
                tempVector[i] = "h";
            }
            else if (xVector[i] == 0){
                tempVector[i] = "l";
            }
            else{
                tempVector[i] = ",";
            }
            xArray[i][counter] = tempVector[i];
        }
    };

    /**
     * Calculates z-Equations for the current position. <br>
     * Uses {{#crossLink "Simulator/getXValues:method"}}getXValues{{/crossLink}} , {{#crossLink "Simulator/getYValues:method"}}getYValues{{/crossLink}} , {{#crossLink "Simulator/getZValues:method"}}getZValues{{/crossLink}} at the begin. <br>
     * Uses {{#crossLink "Logic/evaluateExpression:method"}}evaluateExpression{{/crossLink}} Logic module to evaluate the equations. <br>
     * Executes {{#crossLink "Simulator/update:method"}}update{{/crossLink}} at the end.
     * @method calculate
     * @param {integer} counter current position
     */
    var calculateZ = function(counter){
        createNames(false);
        var xOldInputs = getXValues(counter-1);
        var zOldInputs = getZValues(counter-1);
        var xNewInputs = getXValues(counter);
        for(i = 0; i < xOldInputs.length; i++){
            if(!(xNewInputs[i] == "1" || xNewInputs[i] == "0")){
                xNewInputs[i] = xOldInputs[i];
            }
        }
        setXValues(counter,xNewInputs);
        var boolean = false;
        for(i = 0; i < zEquations.length; i++) {
            var x = Logic.evaluateExpression(zEquations[i]);
            var inputCalculate = [];
            for (j = 0; j < xNames.length; j++){
                if(xOldInputs[j] === "x"){
                    boolean = true;
                }
                inputCalculate[j] = xNames[j] + ":" + xOldInputs[j];
            }
            for (k = 0 ; k < zNames.length ; j++, k++){
                if(zOldInputs[k] === "x"){
                    boolean = true;
                }
                inputCalculate[j] = zNames[k] + ":" + zOldInputs[k];
            }
            if(boolean === false) {
                zArray[zArray.length-1-i][counter] = Number(x.computearray(inputCalculate));
            }
            else{
                zArray[zArray.length-1-i][counter] = ",";
                document.getElementById("ErrorBox").style.visibility = "visible";
                document.getElementById("ErrorText").innerHTML = "Warnung! Nicht alle ben&ouml;tigten z-Parameter sind gesetzt. Es konnten keine Zustands&uuml;berf&uuml;hrungsgleichungen berechnet werden.";
            }
        }
        parseToLetter(zArray);
        calculateY(counter);
    }
    /**
     * Calculates y-Equations for the current position. <br>
     * Uses {{#crossLink "Simulator/getXValues:method"}}getXValues{{/crossLink}} , {{#crossLink "Simulator/getYValues:method"}}getYValues{{/crossLink}} , {{#crossLink "Simulator/getZValues:method"}}getZValues{{/crossLink}} at the begin. <br>
     * Uses {{#crossLink "Logic/evaluateExpression:method"}}evaluateExpression{{/crossLink}} Logic module to evaluate the equations. <br>
     * Executes {{#crossLink "Simulator/update:method"}}update{{/crossLink}} at the end.
     * @method calculate
     * @param {integer} counter current position
     */
    var calculateY = function(counter){
        createNames(false);
        replacePointsWithLetter(yArray);
        var xNewInputs = getXValues(counter);
        var zNewInputs = getZValues(counter);
        var boolean = false;
        for(i = 0; i < yEquations.length; i++) {
            var x = Logic.evaluateExpression(yEquations[i]);
            var inputCalculate = [];
            for (j = 0; j < xNames.length; j++){
                if(xNewInputs[j] === "x"){
                    boolean = true;
                }
                inputCalculate[j] = xNames[j] + ":" + xNewInputs[j];
            }
            for (k = 0 ; k < zNames.length ; j++, k++){
                if(xNewInputs[j] === "x"){
                    boolean = true;
                }
                inputCalculate[j] = zNames[k] + ":" + zNewInputs[k];
            }
            if(boolean === false) {
                yArray[i][counter] = Number(x.computearray(inputCalculate));
            }
            else{
                yArray[i][counter] = ",";
                document.getElementById("ErrorBox").style.visibility = "visible";
                document.getElementById("ErrorText").innerHTML = "Warnung! Nicht alle ben&ouml;tigten y-Parameter sind gesetzt. Es konnten keine Ausgabegleichungen berechnet werden.";
            }
        }
        update();
    };
    return{
        init: init,
        click: click,
        getXValues: getXValues,
        getYValues: getYValues,
        getZValues: getZValues,
        step: step,
        run: run,
        loadObject: loadObject,
        createObject: createObject,
        getStates: getStates
    };
})();