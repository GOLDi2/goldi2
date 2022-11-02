/**
 * Created by Bastian on 27.04.2015.
 */
/**
 * Created by Bastian on 27.04.2015.
 */
function displayOnOff(id) {
    if ( document.getElementById(id).style.display == 'none') {
        document.getElementById(id).style.display = '';
    } else {
        document.getElementById(id).style.display = 'none';
    }
    refreshLayoutValues();
}
function haken(id) {
    if ( document.getElementById(id).style.display == 'none') {
        return 'delete';
    } else {
        return 'edit';
    }
}
