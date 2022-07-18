/**
 * Created by Bastian on 27.04.2015.
 */
function change(tab) {
    $("#E_Automaten").removeClass("selectedInput");
    $("#E_Trans").removeClass("selectedInput");
    L_Input_mode = tab;
    if(tab===1) {
        $("#E_Trans").addClass("selectedInput");
        document.getElementById('L_Modus_Text').innerHTML = 'Automatentabelle/Z-Gleichungen';
        $("#L_E_Automatengraph :input").attr("disabled", true);
        $("#L_E_Transitionsmatrix :input").attr("disabled", true);
        $("#L_E_Automatentabelle :input").attr("disabled", false);
        $("#L_E_ZGleichungen :input").attr("disabled", false);
        document.getElementById('L_E_TAB_Automatentabelle').click();
    } else {
        $("#E_Automaten").addClass("selectedInput");
        document.getElementById('L_Modus_Text').innerHTML = 'Automatengraph/Transitionsmatrix';
        $("#L_E_Automatengraph :input").attr("disabled", false);
        $("#L_E_Transitionsmatrix :input").attr("disabled", false);
        $("#L_E_Automatentabelle :input").attr("disabled", true);
        $("#L_E_ZGleichungen :input").attr("disabled", true);
        document.getElementById('L_E_TAB_Automatengraph').click();
    }
}

function swapInputMode() {
    if (L_Input_mode==1) {
        editable = true;
        change(0);
    } else {
        editable = false;
        change(1);
    }
}

$('#User_defined_input').on('hidden.bs.collapse', function () {
    $("#SettingsResetButtonInputVariables").fadeOut();
});
$('#User_defined_input').on('shown.bs.collapse', function () {
    $("#SettingsResetButtonInputVariables").fadeIn();
});
$('#User_defined_output').on('hidden.bs.collapse', function () {
    $("#SettingsResetButtonOutputVariables").fadeOut();
});
$('#User_defined_output').on('shown.bs.collapse', function () {
    $("#SettingsResetButtonOutputVariables").fadeIn();
});

$('#User_defined_input_new').on('hidden.bs.collapse', function () {
    $("#SettingsResetButtonInputVariablesNewMachine").fadeOut();
});
$('#User_defined_input_new').on('shown.bs.collapse', function () {
    $("#SettingsResetButtonInputVariablesNewMachine").fadeIn();
});
$('#User_defined_output_new').on('hidden.bs.collapse', function () {
    $("#SettingsResetButtonOutputVariablesNewMachine").fadeOut();
});
$('#User_defined_output_new').on('shown.bs.collapse', function () {
    $("#SettingsResetButtonOutputVariablesNewMachine").fadeIn();
});

function L_save_settings()   {
    L_refresh_values();
}

function L_reset_settings() {
    Controller.reloadUserdefinedNames();
}

function loadlocalstorage() {

}

function CompareLocalStorage() {
    if (LocalStorage_Language != localStorage.locale) {
        i18n.setLng(localStorage.locale, function() { $('[data-i18n]').i18n(); });
    }
    LocalStorage_Language = localStorage.locale;
}

function L_GUI_pick(a) {
    var IdDivdisplay;
    $('.L_Help_Topics_GUI_Select').hide();
    switch (a.value) {
        case 'Eingabeleiste':
            document.getElementById('L_Help_Topics_Eingabeleiste').style.display = 'block';
            break;
        case 'Eingabemodus':
            document.getElementById('L_Help_Topics_Eingabemodus').style.display = 'block';
            break;
        case 'Ausgabeleiste':
            document.getElementById('L_Help_Topics_Ausgabeleiste').style.display = 'block';
            break;
        case 'Menueleiste':
            document.getElementById('L_Help_Topics_Menuleiste').style.display = 'block';
            break;
    }
}

function change_Language(a) {
    switch (a) {
        case '1':
            i18n.setLng('de_DE', function() { $('[data-i18n]').i18n(); });
            localStorage.locale = 'de_DE';
            break;
        case '0':
            i18n.setLng('en_US', function() { $('[data-i18n]').i18n(); });
            localStorage.locale = 'en_US';
            break;
    }
    $('.transitiondesc').hide();
    $('.statedesc').hide();
}

function renderSelectpicker() {
    if (i18n.detectLanguage() == 'en_US') {
        $('#L_GUI_Lang').val('0');
        $('#L_GUI_Lang2').val('0');
    } else if (i18n.detectLanguage() == 'de_DE') {
        $('#L_GUI_Lang').val('1');
        $('#L_GUI_Lang2').val('1');
    } else {
        $('#L_GUI_Lang').val('0');
        $('#L_GUI_Lang2').val('0');
    }
    $('.selectpicker').selectpicker();
}

function L_refresh_values(tab,alt) {
    Tab_Alt = alt;
    var graphConverter  = new GraphConverter();
    TabChanging();
    $('li.dropdown.mega-dropdown a').unbind('click');
    $('body').unbind('click');
    $('li.dropdown.mega-dropdown a').on('click', function (event) {
        $(this).parent().toggleClass("open");
    });

    $('body').on('click', function (e) {
        if (!($('li.dropdown.mega-dropdown').is(e.target) || e.target.className=='glyphicon glyphicon-pencil')
            && $('li.dropdown.mega-dropdown').has(e.target).length === 0
            && $('.open').has(e.target).length === 0
        ) {
            $('li.dropdown.mega-dropdown').removeClass('open');
        }
    });
    switch (tab) {
        case 1: //L_E_Automatengraph
            Controller.transformToGraphInputside();
            if(L_Input_mode == 0) {
                editable = true;
            }else{
                editable = false;
            }
            if (L_Input_mode==1) {
                $("#L_E_Automatengraph :input").attr("disabled", true);
            } else {
                $("#L_E_Automatengraph :input").attr("disabled", false);
            }
            $("#reposition").prop('disabled', false);
            break;
        case 2: //L_E_Transitionsmatrix
            Controller.transformToTTableInputside();
            break;
        case 3: //L_E_Automatentabelle
            Controller.transformToMTableInputside();
            break;
        case 4: //L_E_ZGleichungen
            Controller.transformToEquationInputside();
            break;
        case 5: //L_A_Automatengraph
            Controller.transformToGraphOutputside();
            editable = false;
            $("#L_E_Automatengraph :input").attr("disabled", true);
            $("#reposition").prop('disabled', false);
            break;
        case 6: //L_A_Transitionsmatrix
            Controller.transformToTTableOutputside();
            break;
        case 7: //L_A_Automatentabelle
            Controller.transformToMTableOutputside();
            break;
        case 8: //L_A_ZGleichungen
            Controller.transformToEquationOutputside();
            break;
        case 9: //L_Simulation
            Controller.activateSimulation();
            break;
        case 10: //L_F_F_modal
            Controller.activateFlipFlop();
            break;
    }
    try{
        $('[data-i18n]').i18n();
    }
    catch(e){}
}
function L_TabDisable() {
    $(".L_Tabs_Input").removeClass("active");
    $(".L_Tabs_Output").removeClass("active");
    $(".L_Tabs_Simulation").removeClass("active");
}