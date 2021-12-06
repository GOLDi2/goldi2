let runningProcesses = [];
// wenn nicht global lesen kann, dann in file schreiben, welche durchgeht
  find =function(itemToFind,callback) {
     let pos = -1;
     runningProcesses.forEach(function (item, index, array) {
         if (item == itemToFind) {
             pos = index;
         }
     });
      return pos;
 };
module.exports = {
    getNumberRunningProcesses: function(){
       return runningProcesses.length;
    },
    addProcess : function(element){
        runningProcesses.push(element);
    },
    findProcess : function(itemToFind){
        let pos = -1;
        runningProcesses.forEach(function(item, index, array) {
            if(item==itemToFind){
                pos = index;
            }
            return pos;
        })
    },
    removeProcess : function(Process){
       let pos = find(Process);
       // TODO Prüfen ob pos >=0
        if (pos >=0) {
            runningProcesses.splice(pos, 1);
        }
    },
    checkIfProcessIsIn : function(Process){
        let pos = find(Process);
        if (pos >=0){
            return true
        }else{
            return false
        }
    },
    getProcess : function(number){
        if (number<runningProcesses.length){
            return runningProcesses[number];
        }else{
            let error = "outOfBounds";
            return error;
        }

    }
};