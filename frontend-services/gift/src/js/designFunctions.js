/**
 * Created by Bastian on 31.05.2015.
 */
/**
 * Contains classes for the representation.
 * @module Layout
 *
 */
/**
 * Contains functions for the javascript-based Design.
 * @Class Design functions
 */
$('#L_h_stern').on('shown.bs.modal', function () {
    $('#L_h_stern_input').focus()
});
$('#bot_fixed_navbar').on('show.bs.collapse', function() {
    $('.nav-pills').addClass('nav-stacked');
});

//Unstack menu when not collapsed
$('#bot_fixed_navbar').on('hide.bs.collapse', function() {
    $('.nav-pills').removeClass('nav-stacked');
});

/**
 * Change the value of a Progressbar with the id=$id.
 * @param {string} id id of the progressbar
 * @param {integer} Value of the progressbar.
*/

//var DoWhileTexts = new ProgressbarTextChanger();
//var ProgressbarTextTimer = new Interval(function () {DoWhileTexts.run()}, 3000);
var ProgressValue = 0;
var Prev_Time = new WaitingTime('Prev_Time_Waiting','Rest_Time_Waiting');
var ProgressbarPrevTimer = new Interval(function () {Prev_Time.run()}, 1000);
var Refresh_Timer = new RefreshProgressbar();
var ProgressbarRefreshTimer = new Interval(function () {Refresh_Timer.run()}, 300);
var opened = false;
function changeProgressbarValue (id,value) {
    this.trulyChange = function (id,value) {
        if (document.getElementById(id)) {
            if (document.getElementById(id).className.indexOf("progress-bar") != -1) {
                document.getElementById(id).style.width = value + "%";
                document.getElementById(id).innerHTML = value.toFixed(2) + "%";
                $('#' + id).attr('aria-valuenow', value);
                return true;
            } else {
                throw "The element with the id=" + id + " is not a progressbar.";
            }
        } else {
            throw "There exists no element with the id=" + id + ".";
        }
    };

    value = value || 0;
    if ( !isNaN( parseFloat(value) ) ) { // ist eine Zahl
        if (value > 100) {
            value = 100;
        } else if (value < 0) {
            value = 0;
        }

        if (!(ProgressbarPrevTimer.isRunning())) {
            //ProgressbarTextTimer.start();
            ProgressbarPrevTimer.start();
        }

        if (opened == false)  {
            opened = true;
            $("#L_progressbar_modal").modal({backdrop: 'static'});
        }
        this.trulyChange(id,value);
    } else if (value=='#'){
        ProgressbarPrevTimer.stop();
        ProgressbarRefreshTimer.stop();
        Prev_Time.stop();
        opened = false;
        $("#L_progressbar_modal").modal("hide");
        this.trulyChange(id,0);
        $('[data-i18n]').i18n();
    } else {
        //throw "The value '" + value + "' is not a number.";
        console.log("The value '" + value + "' is not a number.");
    }
}

/**
 * Create a Progressbar with the value=value, id=id.
 * @param {string} id id of the progressbar
 * @param {integer} Value of the progressbar.
 */
function createProgressbar(id,value) {
    value = value || 0;
    if ( !isNaN( parseFloat(value) ) ) { // ist eine Zahl
        if (value>100) {
            value = 100;
        } else if (value < 0) {
            value = 0;
        }

        var ProgressbarObject = document.createElement("div");
        var ProgressbarContainer = document.createElement("div");
        ProgressbarContainer.setAttribute('class', 'progress');
        ProgressbarObject.id = id;
        ProgressbarObject.setAttribute('class', 'progress-bar progress-bar-striped active');
        ProgressbarObject.setAttribute('role', 'progressbar');
        ProgressbarObject.setAttribute('aria-valuenow', value);
        ProgressbarObject.setAttribute('aria-valuemin', '0');
        ProgressbarObject.setAttribute('aria-valuemax', '100');
        ProgressbarObject.style.minWidth = "3em";
        ProgressbarObject.style.width = value + "%";
        //ProgressbarObject.innerHTML = value + "%";
        ProgressbarContainer.appendChild(ProgressbarObject);
        document.getElementById('L_progressbar_content').appendChild(ProgressbarContainer);
    } else {
        throw "The value '" + value + "' is not a number.";
    }
}

$(function () {
    $('[data-toggle="popover"]').popover()
});

function Interval(fn, time) {
    var timer = false;
    this.start = function () {
        if (!this.isRunning()) {
            timer = setInterval(fn, time);
        }

    };
    this.stop = function () {
        clearInterval(timer);
        timer = false;
    };
    this.isRunning = function () {
        return timer !== false;
    };
}

function ProgressbarTextChanger() {
    var min = 1;
    var max = 14;
    var a = Math.floor(Math.random() * (max - min)) + min;

    this.run = function () {
        var Newtext;
        switch (a) {
            case 1:
                Newtext = 'Zeiche Automatentabelle...';
                break;
            case 2:
                Newtext = 'Zeiche Transitionsmatrix...';
                break;
            case 3:
                Newtext = 'Berechne Transitionen...';
                break;
            case 4:
                Newtext = 'Zeiche Graph...';
                break;
            case 5:
                Newtext = 'Spitze Beilstift...';
                break;
            case 6:
                Newtext = 'Motiviere Softwaretester...';
                break;
            case 7:
                Newtext = 'Minimiere Gleichungen...';
                break;
            case 8:
                Newtext = 'Teile durch 0...';
                break;
            case 9:
                Newtext = 'Teste Unvollst&auml;ndigkeit...';
                break;
            case 10:
                Newtext = 'F&uuml;lle Transitionsmatrix...';
                break;
            case 11:
                Newtext = 'F&uuml;lle Automatentabelle...';
                break;
            case 12:
                Newtext = 'L&ouml;se NP-Vollst&auml;ndige Probleme...';
                break;
            default:
                Newtext = 'Teste auf Widersp&uuml;che...';
                break;
        }
        a++;
        if (a>max) a=0;
        document.getElementById('progressbar1').innerHTML = Newtext;
    };
}

function RefreshProgressbar() {
    this.run = function () {
        changeProgressbarValue("progressbar1",ProgressValue);
    };
}

function WaitingTime(prev_id,rest_id) {
    var a = 1;
    var Pid = prev_id;
    var Rid = rest_id;

    this.timeCalc = function (sec) {
        var s = sec % 60;
        if (s<10) s = '0' + s;
        var m = Math.floor(sec/60);
        if (m<10) m = '0' + m;
        return  m + ':' + s;
    };

    this.run = function () {
        a++;
        document.getElementById(Pid).innerHTML = this.timeCalc(a);
        document.getElementById(Rid).innerHTML = this.timeCalc((Math.round((100/ProgressValue)*a)) - a);
    };

    this.stop = function () {
        a=1;
        document.getElementById(Pid).innerHTML = this.timeCalc(a);
        document.getElementById(Rid).innerHTML = this.timeCalc(a);
    };
}

function ThrowExpInModal(title,text) {
    document.getElementById('L_Attention_modal_title').innerHTML = title;
    document.getElementById('L_Attention_modal_text').innerHTML = text;
    $('#L_Attention_modal').modal('show');
}

function Para_TextEdit_Dropdown(e,i) {
    if(event.keyCode === 13){
        GUI_paraMachines.set_Name(i,e.value)
    }

    return false;
}

function RenameDownloadFile(e,event) {
    if (e.value=='') {
        document.getElementById('exportlink').download = 'FSM-exported-machine.gift';
    } else {
        document.getElementById('exportlink').download = e.value + '.gift';
    }
}


function click_Para_yEquation() {
    Controller.activateYEquation();
    $('li.dropdown.mega-dropdown').removeClass('open');
}

function SubmitRenameWithEnter(e) {
    if(e.keyCode === 13){
       document.getElementById('exportlink').click();
        $('#L_Download_File').modal('hide');
    }
}

var GUI_paraMachines = new GUI_para_machines(0,'L_parallel_machines_dropdown_navbar','GUI_paraMachines');
