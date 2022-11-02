/**
 * Created by Bastian on 20.11.2015.
 */

function GUI_para_machines(number,id,var_name){
    var para_number = number;
    var list_id = id;
    var del=false;
    var varName=var_name;

    this.set_number = function(i) {
        para_number = i;
        this.refresh_GUI();
    };

    this.get_number = function() {
        return para_number;
    };

    this.set_Name = function(i,a) {
        if (a !== '') {
            giftInput.getMachine(i).MachineName = a;
            if(machine.MachineNumber == giftInput.getMachine(i).MachineNumber){
                machine.MachineName = a;
            }
        }
        this.refresh_GUI();
    };

    this.get_Name = function(i) {
        return giftInput.getMachine(i).MachineName;
    };

    this.refresh_GUI = function() {
        var i;
        var list = document.getElementById(list_id);

        list.innerHTML = "";
        var length = giftInput.getHighestMachineNumber();
        if(length == -1){
            length = 0;
        }

        for (i = 0; i <= length; i++) {
            if (this.get_Name(i)==null) {
                var ParaMachineTranslationSpan = document.createElement("span");
                ParaMachineTranslationSpan.setAttribute('data-i18n','navbar.para_machine');
                var numberSpan = document.createElement("span");
                numberSpan.innerHTML = ' ' + i + '&nbsp;';
            } else {
                var ParaMachineTranslationSpan = document.createElement("span");
                ParaMachineTranslationSpan.innerHTML = this.get_Name(i);
                var numberSpan = document.createElement("span");
                numberSpan.innerHTML = '';
            }
            var newA = document.createElement("a");
            ParaMachineTranslationSpan.setAttribute('onclick',varName + '.swapToParaNumber(' + i +')');
            ParaMachineTranslationSpan.id = 'Span_Para_Li' + i;
            numberSpan.setAttribute('onclick',varName + '.swapToParaNumber(' + i +')');

            var editButton = document.createElement("span");
            editButton.setAttribute('aria-hidden','true');
            editButton.className = "glyphicon glyphicon-pencil";
            editButton.setAttribute('onclick',varName + '.editNameOfPara(' + i +')');
            editButton.setAttribute('style','text-align:right;float:right;');
            editButton.innerHTML = '&nbsp';

            var closeButton = document.createElement("span");
            closeButton.className = "glyphicon glyphicon-remove-sign";
            closeButton.setAttribute('data-toggle','modal');
            closeButton.setAttribute('data-target','#L_Delete_Para');
            closeButton.setAttribute('style','text-align:right;float:right;');

            var placeholderButton = document.createElement("span");
            placeholderButton.className = "glyphicon glyphicon-none";
            placeholderButton.style.width = '14px';
            placeholderButton.setAttribute('style','text-align:right;float:right;');

            var newLI = document.createElement("li");
            newLI.id = 'Para_Li' + i ;
            newA.appendChild(ParaMachineTranslationSpan);
            newA.appendChild(numberSpan);
            if ((i==giftInput.getHighestMachineNumber()) && (i!=0)) {
                newA.appendChild(closeButton);
            } else {
                newA.appendChild(placeholderButton);
            }
            newA.appendChild(editButton);
            newLI.appendChild(newA);
            list.appendChild(newLI);
        }
        var newLI = document.createElement("li");
        newLI.className = "divider";
        list.appendChild(newLI);
        var ParaMachineTranslationSpan = document.createElement("span");
        ParaMachineTranslationSpan.setAttribute('data-i18n','navbar.add_para_machine');
        var newA = document.createElement("a");
        newA.setAttribute('onclick',varName + '.add_para_machine();');
        var newLI = document.createElement("li");
        newA.appendChild(ParaMachineTranslationSpan);
        newLI.appendChild(newA);
        list.appendChild(newLI);
        var ParaMachineOutput = document.createElement("span");
        ParaMachineOutput.setAttribute('data-i18n','global.yEquation');
        var newA = document.createElement("a");
        newA.setAttribute('data-toggle','modal');
        newA.setAttribute('data-target','#L_Para_yEquation');
        newA.setAttribute('onclick','click_Para_yEquation()');
        var newLI = document.createElement("li");
        newA.appendChild(ParaMachineOutput);
        newLI.appendChild(newA);
        list.appendChild(newLI);
        document.getElementById('GUI_para_number_span').innerHTML = '(' + (machine.MachineNumber) + ')';
        try {
            $('[data-i18n]').i18n();
        }
        catch(e){}
    };

    this.add_para_machine = function() {
        SaveOldMachine(machine.MachineNumber);
        if(L_Input_mode) {
            Controller.forceTabSwitch(4);
        }
        else{
            Controller.forceTabSwitch(1);
        }
        Controller.addMachine();
        para_number++;
        Controller.switchMachine(giftInput.getHighestMachineNumber());
        giftInput.CurrentGraphTab = giftInput.getHighestMachineNumber();
        this.refresh_GUI();
    };

    this.refreshMachineTable = function() {
        if (giftInput.getHighestMachineNumber()>=1 ) {
            $('#TAB_on_E_Automatentabelle').hide();
            $('#TAB_on_A_Automatentabelle').hide();
            $('#TAB_on_A_Automatentabelle2').hide();
            $('#TAB_on_A_Automatentabelle3').hide();
            $('#TAB_on_A_Automatentabelle4').hide();
            $('#nav-pills_id').addClass("hide-machine-table");
            $('#nav-pills_id2').addClass("hide-machine-table");
            if (giftInput.getHighestMachineNumber()==1) {
                Controller.forceTabSwitch(0);
            }
        } else {
            $('#TAB_on_E_Automatentabelle').show();
            $('#TAB_on_A_Automatentabelle').show();
            $('#TAB_on_A_Automatentabelle2').show();
            $('#TAB_on_A_Automatentabelle3').show();
            $('#TAB_on_A_Automatentabelle4').show();
            $('#nav-pills_id').removeClass("hide-machine-table");
            $('#nav-pills_id2').removeClass("hide-machine-table");
        }
    };

    this.del_para_machine = function () {
        del=true;
        Controller.deleteHighestMachine();
        //para_number --;
        //giftInput.CurrentGraphTab = para_number;
        //Controller.switchMachine(para_number);
        this.refresh_GUI();
    };

    this.swapToParaNumber = function(i) {
        SaveOldMachine(machine.MachineNumber);
        //if (del==false) {
            Controller.switchMachine(i);
        //}
        para_number = i;
        giftInput.CurrentGraphTab = machine.MachineNumber;
        del=false;
        this.refresh_GUI();
    };

    this.editNameOfPara = function(i) {
        this.refresh_GUI();
        document.getElementById('Para_Li' + i).innerHTML = '<a><input type="text"  id="temp_focus" name="txt" value="' + ((this.get_Name(i) == null) ? "" : this.get_Name(i)) + '" onblur="Para_TextEdit_Dropdown(this,' + i +')"  onkeydown="Para_TextEdit_Dropdown(this,' + i +')" maxlength="12" size="15" style="color: #000000;text-align: center;"/></a>';
        document.getElementById("temp_focus").focus();
        document.getElementById('Para_dropdown').className = 'dropdown mega-dropdown open';
    }

}