//@author faethto
//This will write the Z and Y variables into local storage to import them into the ecp
var ecp_export = (function()
{
    var ecp_export_prepare = false;
    var ecp_minimize_workers = 0;
    var ecp_y_equations;
    var ecp_z_equations;
    var start = function()
    {
        //refresh the equations
        if(localStorage == undefined)
        {
            BootstrapDialog.show({
                title: 'Export fehlgeschlagen',
                message: 'Ihr Browser unterstuetzt leider die Local Storage funktionen nicht. Ein Export ist nicht moeglich.\n Bitte versuchen sie es mit einem aktuellen Firefox-Browser erneut',
                cssClass: 'export-dialog',
                buttons: [{
                    label: 'OK',
                    cssClass: 'btn-primary',
                    action: function(dialog){
                        dialog.close();
                    }
                }]
            });
        }
        Controller.prepareECPExport();
        ecp_export_prepare = true;
    };
    var finish = function(){
        if(ecp_export_prepare){
            Controller.transformToView(8);
            ecp_z_equations = outputMachine.getAllZEquation(false);
            ecp_y_equations = outputMachine.getAllYEquation(false);
            var isnotzero = false;
            for(var i = 0; i < ecp_z_equations.length; i++)
            {
                if(ecp_z_equations[i] != undefined && ecp_z_equations[i] != "0")
                {
                    isnotzero = true;
                    Worker.qmcExec(ecp_z_equations[i], "0", i,100,false);
                    ecp_minimize_workers++;
                }

            }
            for(var i = 0; i < ecp_y_equations.length; i++)
            {
                if(ecp_y_equations[i] != undefined && ecp_y_equations[i] != "0")
                {
                    isnotzero = false;
                    Worker.qmcExec(ecp_y_equations[i], "0", i,101,false);
                    ecp_minimize_workers++;
                }

            }
            if(isnotzero)
            {
                writeLocalStorage();
            }
            ecp_export_prepare = false;
        }
    };

    var writeLocalStorage = function(){
        const ECP = {};
        var numZEquations = 0;
        var numYEquations = 0;
        for(i=0;i<ecp_z_equations.length;i++)
        {
            if(ecp_z_equations[i] != undefined)
            {
                ECP["A0Z"+i] = outputMachine.NormalEquationToEquation(ecp_z_equations[i]);
                numZEquations++;
            }
        }
        for(i=0;i<ecp_y_equations.length;i++)
        {
            if(ecp_y_equations[i] != undefined)
                ECP["Y"+i] = outputMachine.NormalEquationToEquation(ecp_y_equations[i]);
            numYEquations++;
        }

        ecp_minimize_workers = 0;
        ECP["numZEquations"] = numZEquations;
        ECP["numYEquations"] = numYEquations;

        localStorage.setItem("GIFTToECPExport",JSON.stringify(ECP));
        BootstrapDialog.show({
            title: 'Export erfolgreich',
            message: 'Der Export in den Local Storage des Browsers war erfolgreich.\n Sie koennen den Automaten nun innerhalb dieser Domain in einen belibigen FSM Interpreter eines ECP importieren.',
            cssClass: 'export-dialog',
            buttons: [{
                label: 'OK',
                cssClass: 'btn-primary',
                action: function(dialog){
                    dialog.close();
                }
            }]
        });
    };

    var finish_minimized = function(result,i,mode)
    {
        switch(mode)
        {
            case 100:
                ecp_z_equations[i] = result;
                break;
            case 101:
                ecp_y_equations[i] = result;
                break;
            default:
                return;
        }
        ecp_minimize_workers--;
        if(ecp_minimize_workers == 0)
        {
          writeLocalStorage();
        }
    };

    return{
        start:start,
        finish:finish,
        finish_minimized:finish_minimized,
    };
})();




