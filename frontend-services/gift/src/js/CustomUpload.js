/**
 * Created by Bastian on 05.06.2015.
 */
function load_machine_from_upload(data_load) {

    LoadBackup(data_load);
    var converter = new GraphConverter();
    converter.convertToGraph(machine, checkCompleteness.createOutputForStateGraph(machine), checkConsistency.createOutputForStateGraph(machine), undefined);
    converter.drawGraph();
}

