$(function (){
    $.contextMenu( 'destroy', '#Ausgabe_Automaten' );
    $.contextMenu({
        selector: '#Ausgabe_Automaten',
        callback: function(key, options) {
            if (key==='quit') {
                window.location.reload();
            } else {
                displayOnOff(key);
            }
        },
        items: {
            "Ausgabe_Automaten_Automatengraph": {name: "Automatengraph", icon: haken('Ausgabe_Automaten_Automatengraph')},
            "Ausgabe_Automaten_Automatentabelle": {name: "Automatentabelle", icon: haken('Ausgabe_Automaten_Automatentabelle')},
            "Ausgabe_Automaten_ZGleichungen": {name: "Z-Gleichungen", icon: haken('Ausgabe_Automaten_ZGleichungen')},
            "Ausgabe_Automaten_Transitionsmatrix": {name: "Transitionsmatrix", icon: haken('Ausgabe_Automaten_Transitionsmatrix')},
            "sep1": "---------",
            "quit": {name: "Ausgangspositionen", icon: "quit"}
        }
    });
});