/**
 * Created by Bastian on 06.06.2015. RE
 */



function machine_export() {
    var export_data = SaveBackup();
    //document.getElementById('exportlink').setAttribute('href', 'data:text/json,' + encodeURIComponent(export_data));
    var data = "text/json;charset=utf-8," + encodeURIComponent(export_data);
    var e = document.getElementById('Download_File_Input');

    document.getElementById('exportlink').href = 'data:' + data;
    document.getElementById('exportlink').setAttribute('onclick',"$('#L_Download_File').modal('hide');");
    if (e.value=='') {
        document.getElementById('exportlink').download = 'FSM-exported-machine.gift';
    } else {
        document.getElementById('exportlink').download = e.value + '.gift';
    }
}


