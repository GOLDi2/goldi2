shortcut.add("Shift+Alt+E",function() {
    $('[data-i18n]').i18n();
});
shortcut.add("Ctrl+Shift+A",function() {
    if (document.getElementById('resolution').style.display == 'none') {
        document.getElementById('resolution').style.display = '';
    } else {
        document.getElementById('resolution').style.display = 'none';
    }
});
shortcut.add("Enter",function() {
    if(Controller.getTab() == 9){
        forwardbtn.click();
    }
});




//Sp�ter rausnehmen
    window.onresize = dynamicResizer;
    dynamicResizer();
    function dynamicResizer() {
        document.getElementById('resolution').innerHTML = window.innerWidth + " x " + window.innerHeight;
        GUI_paraMachines.refreshMachineTable();
    }

