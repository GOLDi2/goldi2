
function SaveBackup(){
    var converter = new GraphConverter();
    var tab = Controller.getTab();
    if(tab == 1 ) {
        machine = converter.convertToDataTyp(machine);
    }else if(tab == 5) {
        outputMachine = converter.convertToDataTyp(outputMachine);
    }


    giftInput.InputMode = L_Input_mode;
    giftInput.CurrentTab = tab;

    var backup = new Backup(machine, outputMachine ,Simulator.createObject(), giftInput, giftOutput);

    var export_data = JSON.stringify(backup);
    return export_data;
}

function LoadBackup(backup){
    var backup = JSON.parse(backup);
    var tab;

    var machinedata = backup.machine;

    giftInput = new GiftState();
    var giftInputdata = backup.giftstateinput;
    giftInput.createOnData(giftInputdata);

    giftOutput = new GiftState();
    var giftOutputdata = backup.giftstateoutput;
    giftOutput.createOnData(giftOutputdata);

    machine = new TTable(2,2,2,0,giftInput);
    machine.createOnData(machinedata);


    tab = giftInput.CurrentTab;


    machinedata = backup.outputmachine;

    Controller.changeStructSetAll(true, machine);

    outputMachine = new TTable(2, 2, 2,0,giftOutput);


    outputMachine.createOnData(machinedata);

    changeInputMode(giftInput.InputMode);
    changeTab(tab);
    if(tab == 1){
        loadAndDrawInputGraph();
    }else if(tab == 5){
        loadAndDrawOutputGraph();
    }
    
    Simulator.loadObject(backup.simulation,machine);
    GUI_paraMachines.refreshMachineTable();
    GUI_paraMachines.refresh_GUI();
    L_refresh_values(tab);
  

}

function changeInputMode(inputmode){

        if(inputmode ==  0){
            $('#L_E_TAB_Automatengraph').tab('show');
            $("#L_E_Automatengraph :input").attr("disabled", false);
            $("#L_E_Transitionsmatrix :input").attr("disabled", false);
            $("#L_E_Automatentabelle :input").attr("disabled", true);
            $("#L_E_ZGleichungen :input").attr("disabled", true);
            Controller.setTab(1);
            $('#L_Modus_Text').attr('data-i18n','navbar.inputMode_Graph_trans');
            L_Input_mode = 0;
        }
        else{
            $('#L_E_TAB_Automatentabelle').tab('show');
            $("#L_E_Automatengraph :input").attr("disabled", true);
            $("#L_E_Transitionsmatrix :input").attr("disabled", true);
            $("#L_E_Automatentabelle :input").attr("disabled", false);
            $("#L_E_ZGleichungen :input").attr("disabled", false);
            Controller.setTab(3);
            $('#L_Modus_Text').attr('data-i18n','navbar.inputMode_Machine_equations');
            L_Input_mode = 1;
        }
        try {
            $('[data-i18n]').i18n();
        }catch(ex){

        }
        Controller.setPreviousMode(L_Input_mode);
        Controller.changeStructSetAll(true,machine);
        Controller.transformToView(Controller.getTab());
}
function changeTab(tab){
    Controller.setTab(tab);
    machine.CurrentTab = tab;

    switch (tab){
        case 1:
            $('#L_E_TAB_Automatengraph').tab('show');
            break;
        case 2:
            $('#TAB_on_E_Transitionsmatrix2').tab('show');
            break;
        case 3:
            $('#L_E_TAB_Automatentabelle').tab('show');
            break;
        case 4:
            $('#TAB_on_E_ZGleichungen2').tab('show');
            break;
        case 5:
            $('#TAB_on_A_Automatengraph2').tab('show');
            break;
        case 6:
            $('#TAB_on_A_Transtionsmatrix2').tab('show');
            break;
        case 7:
            $('#TAB_on_A_Automatentabelle2').tab('show');
            break;
        case 8:
            $('#TAB_on_A_ZGleichungen2').tab('show');
            break;
        case 9:
            $('#TAB_on_Simulation2').tab('show');
            break;
        case 10:
            $('#TAB_on_FF2').tab('show');
            break;
    }
    Controller.transformToView(Controller.getTab());


}